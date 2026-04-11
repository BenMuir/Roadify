const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_DAMAGE_MODEL || 'gpt-4o-mini';

async function generateIncidentReport(claim) {
    const damage = claim.damageDetections || [];
    const desc = claim.incident?.description || '';
    const claimant = claim.claimantVehicle || {};
    const other = claim.otherVehicle || {};
    const ctx = claim.incidentContext || {};
    const photos = claim.photos || [];

    const mlReport = damage.length > 0
        ? damage.map(d => `- ${(d.class || 'unknown').replace(/_/g, ' ')}: ${d.confidence}% confidence`).join('\n')
        : 'No AI damage detections available.';

    const contextLines = [];
    if (ctx.thirdPartyInvolved === true) contextLines.push('Third party vehicle involved');
    if (ctx.thirdPartyInvolved === false) contextLines.push('Single vehicle incident');
    if (ctx.hitAndRun) contextLines.push('Hit and run — other driver fled');
    if (ctx.parkedWhenHit) contextLines.push('Claimant vehicle was parked when hit');
    if (ctx.collisionObject) contextLines.push(`Collided with: ${ctx.collisionObject}`);
    if (ctx.atFault === true) contextLines.push('Claimant is at fault');
    else if (ctx.atFault === false) contextLines.push('Claimant is NOT at fault');

    const prompt = `You are a senior motor-claims analyst at an insurance company. Analyse the following claim data and produce a professional incident report as JSON.

--- CLAIM DATA ---
Claim ID: ${claim.id}
Incident Time: ${claim.incident?.timestamp || 'Unknown'}
Location: ${claim.incident?.location?.address || 'Unknown'}

Claimant Vehicle: ${[claimant.year, claimant.color, claimant.make, claimant.model].filter(Boolean).join(' ') || 'Unknown'} (Plate: ${claimant.rego || 'Unknown'})
${ctx.thirdPartyInvolved ? `Other Vehicle: ${[other.color, other.make, other.model].filter(Boolean).join(' ') || 'Unknown'} (Plate: ${other.rego || 'Unknown'})` : ''}

Incident Context:
${contextLines.join('\n') || 'No additional context'}

AI-Generated Description: ${desc || 'None'}

ML Damage Detections:
${mlReport}

Photos submitted: ${photos.filter(p => p.type === 'original').length} original, ${photos.filter(p => p.type === 'annotated').length} annotated
--- END ---

Respond ONLY with valid JSON using these exact keys:
{
  "severity_narrative": "A 2-3 sentence professional assessment of the overall incident severity",
  "visible_damage_notes": "Specific damage observations based on the ML detections",
  "recommended_actions": ["array", "of", "recommended next steps for the claims team"],
  "risk_level": "low | medium | high | critical",
  "data_quality": "A brief note on the completeness and reliability of the submitted data",
  "liability_assessment": "Brief preliminary liability opinion based on available context",
  "estimated_repair_class": "minor_cosmetic | moderate_panel | major_structural | total_loss"
}`;

    const userContent = [{ type: 'text', text: prompt }];

    // Attach up to 2 original photos for visual analysis if available
    const originalPhotos = photos.filter(p => p.type === 'original' && p.blobUrl);
    for (const photo of originalPhotos.slice(0, 2)) {
        const blobService = require('./blobService');
        const signedUrl = blobService.generateReadUrl(photo.blobName);
        userContent.push({
            type: 'image_url',
            image_url: { url: signedUrl, detail: 'low' },
        });
    }

    const response = await client.chat.completions.create({
        model: MODEL,
        messages: [
            { role: 'system', content: 'You are a fleet/motor-claims analyst. Respond ONLY with valid JSON.' },
            { role: 'user', content: userContent },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1200,
    });

    const raw = response.choices[0].message.content;
    return JSON.parse(raw);
}

module.exports = { generateIncidentReport };
