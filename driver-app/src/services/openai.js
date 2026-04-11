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
  const otherPresent = ctx.otherPartyPresent

  let contextBlock = ''
  if (thirdParty === true) {
    contextBlock += '\nINCIDENT CONTEXT: Another vehicle was involved.'
    if (otherPresent === false) {
      contextBlock += ' The other driver has LEFT the scene.'
      contextBlock += ' Try to identify the other vehicle from any photos that may have captured it, or from paint transfer / debris.'
    } else if (otherPresent === true) {
      contextBlock += ' The other driver is present at the scene.'
    }
  } else if (thirdParty === false) {
    contextBlock += `\nINCIDENT CONTEXT: No other vehicle was involved.`
    contextBlock += ' Focus on the damage to the claimant\'s vehicle and infer what was hit from the photos (object, barrier, pole, etc).'
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
    otherPartyPresent: formData.otherPartyPresent,
    atFault: formData.atFault,
  }

  const contextLines = []
  if (ctx.thirdParty === true) {
    contextLines.push('Another vehicle was involved')
    if (ctx.otherPartyPresent === true) contextLines.push('Other driver is present at scene')
    else if (ctx.otherPartyPresent === false) contextLines.push('Other driver has left the scene')
  }
  if (ctx.thirdParty === false) contextLines.push('No other vehicle involved')
  if (ctx.atFault === true) contextLines.push('Claimant says they are at fault')
  else if (ctx.atFault === false) contextLines.push('Claimant says they are NOT at fault')
  else if (ctx.atFault === 'unsure') contextLines.push('Claimant is unsure about fault')

  const weather = formData.weather
  const weatherLine = weather
    ? `Weather at time of claim: ${weather.condition}, ${weather.temperature}°C, wind ${weather.windSpeed} km/h`
    : 'Weather: not available'

  const photoSlots = formData.photoSlots || {}
  const slotKeys = Object.keys(photoSlots)
  const photoCount = slotKeys.length

  const prompt = `You are a senior motor-claims analyst AND fraud investigator. Analyse this claim and produce a professional incident report as JSON.

--- CLAIM DATA ---
Claimant Vehicle: ${[formData.vehicleYear, formData.vehicleColor, formData.vehicleMake, formData.vehicleModel].filter(Boolean).join(' ')} (Plate: ${formData.vehicleRego || 'Unknown'})
${ctx.thirdParty ? `Other Vehicle: ${[formData.otherVehicleColor, formData.otherVehicleMake, formData.otherVehicleModel].filter(Boolean).join(' ') || 'Unknown'} (Plate: ${formData.otherVehicleRego || 'Unknown'})` : ''}
Location: ${formData.location?.address || 'Unknown'}
${weatherLine}
Incident Context: ${contextLines.join('; ') || 'None'}
AI Description: ${formData.description || 'None'}
Photos submitted: ${photoCount} of 6 slots used (slots: ${slotKeys.join(', ') || 'none'})
ML Damage Detections:
${damage || 'No detections'}
--- END ---

${photoCount > 0 ? `I am also attaching ${Math.min(photoCount, 3)} original photos from the claim. Examine them carefully for BOTH the incident report AND the fraud analysis.` : ''}

IMPORTANT — INFER FROM PHOTOS:
You must examine the photos and infer the following context clues. Report these in the "scene_assessment" field:
- Road surface type (sealed, gravel, dirt, wet, dry) — visible in the photos
- Approximate impact severity from damage patterns (low-speed vs high-speed)
- Whether a second vehicle is visible in ANY of the photos
- Weather conditions visible (clear sky, overcast, rain, wet ground)
- Presence of debris, skid marks, or scene disturbance
- Whether the vehicle appears parked or was in motion (position on road, angle, surroundings)

Respond ONLY with valid JSON using ALL these keys:
{
  "severity_narrative": "2-3 sentence professional severity assessment",
  "visible_damage_notes": "Specific damage observations from ML detections",
  "recommended_actions": ["array of recommended next steps for claims team"],
  "risk_level": "low | medium | high | critical",
  "data_quality": "Brief note on completeness of submitted data",
  "liability_assessment": "Brief preliminary liability opinion",
  "estimated_repair_class": "minor_cosmetic | moderate_panel | major_structural | total_loss",
  "scene_assessment": {
    "inferred_road_surface": "What the road looks like in photos (e.g. dry sealed road, wet bitumen, gravel)",
    "inferred_weather_visible": "What the weather looks like in photos (e.g. clear, overcast, wet ground)",
    "weather_api": "${weather ? weather.condition + ', ' + weather.temperature + '°C' : 'unavailable'}",
    "weather_match": true,
    "weather_match_note": "Does the API weather match what is visible in the photos? Note any discrepancy.",
    "second_vehicle_visible": false,
    "debris_or_skid_marks": false,
    "inferred_speed_category": "low | moderate | high (based on damage patterns and scene)",
    "vehicle_position_note": "Brief note on vehicle positioning — parked, mid-road, intersection, etc."
  },
  "fraud_analysis": {
    "risk_score": "integer 1-10 (1=very low risk, 10=almost certainly fraudulent)",
    "risk_level": "low | medium | high",
    "environment_consistency": {
      "flag": false,
      "note": "Are the backgrounds, lighting, road surface, and surroundings consistent across all photos? Does the scene look like the same location and time? If only 1 photo, note that consistency cannot be verified."
    },
    "damage_vs_scene": {
      "flag": false,
      "note": "Does the environment match the damage severity? E.g. major collision but clean road with no debris or skid marks? Does the damage orientation make physical sense? Does inferred speed match damage extent?"
    },
    "damage_plausibility": {
      "flag": false,
      "note": "Does the type and pattern of damage match the reported incident type and inferred speed?"
    },
    "photo_coverage": {
      "photos_submitted": ${photoCount},
      "flag": false,
      "note": "How thoroughly was the incident documented? More photos = more verifiable. 1 photo limits what can be assessed. This is not suspicious on its own, just a data point."
    },
    "claim_coherence": {
      "flag": false,
      "note": "Do all the claim details tell a coherent story? Does the claimant say third party involved but no second car visible? Does the weather API match the scene? Do all details align?"
    },
    "indicators": ["array of specific observations — only include genuine concerns, leave empty if nothing suspicious"]
  }
}

FRAUD ANALYSIS GUIDELINES:
- Set flag=true ONLY when something is genuinely inconsistent, not merely incomplete.
- Having few photos is a data gap, not fraud. Note it factually without assuming bad intent.
- Close-up photos are normal and expected — not suspicious.
- Focus on: Does the ENVIRONMENT match the DAMAGE? Does the STORY match the EVIDENCE?
- Use the weather API data to cross-reference with visible conditions in photos. If API says rain but photos show bone-dry road and clear sky, that is notable.
- If claimant says another vehicle was involved but no second vehicle appears in ANY photo AND other driver has left, that is context not fraud — they may have left before photos.
- Infer speed from damage: minor scratches = low speed, crumpled panels = moderate, structural deformation = high speed. Does the scene show evidence consistent with that speed (debris, skid marks)?
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
