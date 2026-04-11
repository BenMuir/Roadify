const API_KEY = import.meta.env.VITE_OPENAI_API_KEY

const MAX_DIMENSION = 1024

function resizeForVision(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height))
      width = Math.round(width * scale)
      height = Math.round(height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.src = dataUrl
  })
}

function buildPrompt(vehicle, incidentContext) {
  const ctx = incidentContext || {}
  const thirdParty = ctx.thirdPartyInvolved
  const hitAndRun = ctx.hitAndRun
  const parkedWhenHit = ctx.parkedWhenHit
  const collisionObject = ctx.collisionObject

  let contextBlock = ''
  if (thirdParty === true) {
    contextBlock += '\nINCIDENT CONTEXT: Another vehicle was involved.'
    if (hitAndRun) {
      contextBlock += ' This was a HIT AND RUN — the other driver left the scene.'
      if (parkedWhenHit) {
        contextBlock += ' The claimant\'s vehicle was PARKED when it was hit.'
      }
      contextBlock += ' Try to identify the other vehicle from any photos that may have captured it before it left, or from paint transfer / debris.'
    } else {
      contextBlock += ' The other driver is present at the scene.'
    }
  } else if (thirdParty === false) {
    contextBlock += `\nINCIDENT CONTEXT: No other vehicle was involved. This is a single-vehicle incident.`
    if (collisionObject) {
      contextBlock += ` The vehicle collided with: ${collisionObject}.`
    }
    contextBlock += ' Do NOT look for another vehicle — focus on the damage to the claimant\'s vehicle and the object/environment involved.'
  }

  const otherVehicleInstructions = thirdParty
    ? `1. **Other Vehicle Rego**: Look for number plates that are NOT "${vehicle.rego}". Read the plate text exactly as shown.
2. **Other Vehicle Color**: The body color of the other vehicle (not the claimant's ${vehicle.color} ${vehicle.make}).
3. **Other Vehicle Make**: The manufacturer of the other vehicle (e.g. Toyota, Ford, Hyundai). Use visible badges, grille design, or body shape.
4. **Other Vehicle Model**: The specific model if identifiable (e.g. Corolla, Ranger, i30).`
    : `1-4. Set otherVehicleRego, otherVehicleColor, otherVehicleMake, otherVehicleModel to empty strings (no other vehicle involved).`

  return `You are an AI assistant analyzing photos from a vehicle incident for an insurance claim.

The claimant drives a **${vehicle.color} ${vehicle.year} ${vehicle.make} ${vehicle.model}** with registration plate **${vehicle.rego}**.
${contextBlock}

Carefully analyze ALL provided photos and extract the following:

${otherVehicleInstructions}
5. **Incident Type**: Classify as exactly one of: collision, rollover, breakdown, hit-and-run, weather-damage, other
6. **Description**: A brief 1-2 sentence factual description of the incident based on visible damage, vehicle positions, and scene context.

IMPORTANT:
- The claimant's vehicle is the ${vehicle.color} ${vehicle.make} ${vehicle.model} — do NOT report its details as the "other" vehicle.
- Photos may show EACH vehicle SEPARATELY — the user may have taken close-ups of their own car in some photos and the other vehicle in different photos. Analyze ALL photos collectively to build a complete picture, not each photo in isolation.
- A photo showing only one vehicle does NOT mean there is no other vehicle involved — check other photos in the set.
- Each photo may have a label like [Photo: Front] or [Photo: Close-up]. These are SUGGESTED slots the user chose — they are approximate guidelines, not strict descriptions. The user may not fill all slots, and the actual photo content may not perfectly match the label. Always rely on what you SEE in the image, not just the label.
- If you cannot determine a field, return an empty string for that field.
- For the rego plate, only include it if you can read it with reasonable confidence.
${thirdParty === false ? '- This is a single-vehicle incident. The description should focus on the object hit and resulting damage.\n' : ''}
Respond with ONLY valid JSON, no markdown fences:
{
  "otherVehicleRego": "",
  "otherVehicleColor": "",
  "otherVehicleMake": "",
  "otherVehicleModel": "",
  "incidentType": "",
  "description": ""
}`
}

export async function generateIncidentReport(formData) {
  if (!API_KEY) return null

  const damage = (formData.damagePredictions || [])
    .map((d) => `- ${(d.label || 'unknown').replace(/_/g, ' ')}: ${d.confidence}% confidence`)
    .join('\n')

  const ctx = {
    thirdParty: formData.thirdPartyInvolved,
    hitAndRun: formData.hitAndRun,
    parkedWhenHit: formData.parkedWhenHit,
    collisionObject: formData.collisionObject,
    atFault: formData.atFault,
    vehicleSpeed: formData.vehicleSpeed,
    roadCondition: formData.roadCondition,
  }

  const contextLines = []
  if (ctx.thirdParty === true) contextLines.push('Third party vehicle involved')
  if (ctx.thirdParty === false) contextLines.push('Single vehicle incident')
  if (ctx.hitAndRun) contextLines.push('Hit and run — other driver fled')
  if (ctx.parkedWhenHit) contextLines.push('Claimant vehicle was parked when hit')
  if (ctx.collisionObject) contextLines.push(`Collided with: ${ctx.collisionObject}`)
  if (ctx.atFault === true) contextLines.push('Claimant is at fault')
  else if (ctx.atFault === false) contextLines.push('Claimant is NOT at fault')
  if (ctx.vehicleSpeed) contextLines.push(`Reported speed: ${ctx.vehicleSpeed}`)
  if (ctx.roadCondition) contextLines.push(`Road condition: ${ctx.roadCondition}`)

  const photoSlots = formData.photoSlots || {}
  const slotKeys = Object.keys(photoSlots)
  const photoCount = slotKeys.length

  const prompt = `You are a senior motor-claims analyst AND fraud investigator. Analyse this claim and produce a professional incident report as JSON.

--- CLAIM DATA ---
Claimant Vehicle: ${[formData.vehicleYear, formData.vehicleColor, formData.vehicleMake, formData.vehicleModel].filter(Boolean).join(' ')} (Plate: ${formData.vehicleRego || 'Unknown'})
${ctx.thirdParty ? `Other Vehicle: ${[formData.otherVehicleColor, formData.otherVehicleMake, formData.otherVehicleModel].filter(Boolean).join(' ') || 'Unknown'} (Plate: ${formData.otherVehicleRego || 'Unknown'})` : ''}
Location: ${formData.location?.address || 'Unknown'}
Incident Context: ${contextLines.join('; ') || 'None'}
AI Description: ${formData.description || 'None'}
Photos submitted: ${photoCount} of 6 slots used (slots: ${slotKeys.join(', ') || 'none'})
ML Damage Detections:
${damage || 'No detections'}
--- END ---

${photoCount > 0 ? `I am also attaching ${Math.min(photoCount, 3)} original photos from the claim. Examine them carefully for the fraud analysis.` : ''}

Respond ONLY with valid JSON using ALL these keys:
{
  "severity_narrative": "2-3 sentence professional severity assessment",
  "visible_damage_notes": "Specific damage observations from ML detections",
  "recommended_actions": ["array of recommended next steps for claims team"],
  "risk_level": "low | medium | high | critical",
  "data_quality": "Brief note on completeness of submitted data",
  "liability_assessment": "Brief preliminary liability opinion",
  "estimated_repair_class": "minor_cosmetic | moderate_panel | major_structural | total_loss",
  "fraud_analysis": {
    "risk_score": "integer 1-10 (1=very low risk, 10=almost certainly fraudulent)",
    "risk_level": "low | medium | high",
    "environment_consistency": {
      "flag": false,
      "note": "Are the backgrounds, lighting, road surface, and surroundings consistent across all photos? Does the scene look like the same location and time? If only 1 photo, note that consistency cannot be verified."
    },
    "damage_vs_scene": {
      "flag": false,
      "note": "Does the environment match the damage severity? E.g. major collision but clean road with no debris or skid marks? Parked-car hit but the car is in the middle of a road? Does the damage orientation make physical sense for the described incident?"
    },
    "damage_plausibility": {
      "flag": false,
      "note": "Does the type and pattern of damage match the reported incident type? E.g. rear-end collision but only side damage? Pole collision but wide spread damage?"
    },
    "photo_coverage": {
      "photos_submitted": ${photoCount},
      "flag": false,
      "note": "How thoroughly was the incident documented? More photos = more verifiable. 1 photo limits what can be assessed. This is not suspicious on its own, just a data point."
    },
    "claim_coherence": {
      "flag": false,
      "note": "Do all the claim details tell a coherent story? Vehicle types, fault admission, incident context, and AI description all align?"
    },
    "indicators": ["array of specific observations — only include genuine concerns, leave empty if nothing suspicious"]
  }
}

FRAUD ANALYSIS GUIDELINES:
- Set flag=true ONLY when something is genuinely inconsistent, not merely incomplete.
- Having few photos is a data gap, not fraud. Note it factually without assuming bad intent.
- Close-up photos are normal and expected — not suspicious.
- Focus on: Does the ENVIRONMENT match the DAMAGE? Does the STORY match the EVIDENCE?
- Consider reported speed vs damage severity. A "stationary" claim with major structural damage is inconsistent unless parked-hit scenario.
- Check road conditions vs scene: wet road claim but dry pavement in photos? Gravel claimed but sealed road visible?
- Does damage pattern match reported speed? Low speed should mean minor damage; high speed with only a small dent is suspicious.
- Be fair and evidence-based. Most claims are legitimate. Only flag real inconsistencies.`

  const messages = [
    { role: 'system', content: 'You are a fleet/motor-claims analyst and fraud investigator. Respond ONLY with valid JSON.' },
    { role: 'user', content: [] },
  ]

  messages[1].content.push({ type: 'text', text: prompt })

  // Attach up to 3 original photos for visual fraud analysis
  const photosToAttach = slotKeys.slice(0, 3)
  for (const slot of photosToAttach) {
    if (photoSlots[slot]) {
      const resized = await resizeForVision(photoSlots[slot])
      messages[1].content.push({
        type: 'image_url',
        image_url: { url: resized, detail: 'low' },
      })
    }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 2000,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages,
      }),
    })

    if (!response.ok) return null
    const result = await response.json()
    const content = result.choices?.[0]?.message?.content
    if (!content) return null
    return JSON.parse(content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
  } catch (e) {
    console.error('[OpenAI] Report generation failed:', e)
    return null
  }
}

export async function analyzeIncidentPhotos(photos, vehicle, incidentContext, photoLabels) {
  if (!API_KEY) {
    console.warn('[OpenAI] No API key configured, skipping analysis')
    return null
  }

  const toProcess = photos.slice(0, 6)
  const labels = photoLabels ? photoLabels.slice(0, 6) : []
  const resizedPhotos = await Promise.all(toProcess.map(resizeForVision))

  const imageMessages = []
  resizedPhotos.forEach((dataUrl, i) => {
    if (labels[i]) {
      imageMessages.push({ type: 'text', text: `[Photo: ${labels[i]}]` })
    }
    imageMessages.push({
      type: 'image_url',
      image_url: { url: dataUrl, detail: 'high' },
    })
  })

  const body = {
    model: 'gpt-4o',
    max_tokens: 500,
    temperature: 0.1,
    messages: [
      {
        role: 'system',
        content: 'You are a vehicle incident analyst. You respond only with valid JSON.',
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: buildPrompt(vehicle, incidentContext) },
          ...imageMessages,
        ],
      },
    ],
  }

  console.log('[OpenAI] Sending analysis request with', resizedPhotos.length, 'photos')

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    console.error('[OpenAI] Error:', text.slice(0, 300))
    throw new Error(`OpenAI API error ${response.status}`)
  }

  const result = await response.json()
  const content = result.choices?.[0]?.message?.content

  if (!content) {
    console.error('[OpenAI] Empty response')
    return null
  }

  console.log('[OpenAI] Raw response:', content)

  try {
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch (e) {
    console.error('[OpenAI] Failed to parse JSON:', e)
    return null
  }
}
