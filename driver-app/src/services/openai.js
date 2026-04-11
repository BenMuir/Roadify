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
- Photos are numbered (Photo 1, Photo 2, etc.) but have NO meaningful labels. The user took them in random order. Rely ONLY on what you SEE in each image.
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
${damage || 'No ML detections — the automated damage detection model did NOT identify any damage. This does NOT necessarily mean there is no damage; rely on your own visual analysis of the photos. However, if you also see no obvious damage in the photos, note this discrepancy with the claim.'}
--- END ---

${photoCount > 0 ? `I am attaching ${Math.min(photoCount, 3)} original photos from the claim, numbered Photo 1, Photo 2, etc. Photos are in no particular order. You MUST examine EVERY photo carefully. When making observations, reference the photo number (e.g. "Photo 1", "Photo 3").` : ''}

CRITICAL — PER-PHOTO ANALYSIS:
Analyse EACH photo individually AND then collectively. For each photo, note:
1. What vehicle(s) appear — colour, make, damage visible
2. The BACKGROUND of each photo — road surface, weather, lighting, surroundings, time of day
3. Whether the backgrounds across different photos are CONSISTENT with each other

KEY RULES FOR MULTI-PHOTO CLAIMS:
- Different photos may show DIFFERENT vehicles from the SAME incident. Photo 1 might show the claimant's car, Photo 2 might show the other car. This is NORMAL — do not treat separate cars in separate photos as "no second vehicle".
- "second_vehicle_visible" should be true if ANY photo shows a vehicle other than the claimant's.
- Compare backgrounds across ALL photos. If Photo 1 shows a dry sunny road and Photo 2 shows snow/ice on the ground, that is a MAJOR inconsistency — these photos were likely taken at different times/places.
- Look at the ENTIRE frame of each photo, not just the car. The background, ground, sky, and surroundings are critical evidence.

WEATHER CROSS-CHECK:
Local weather was recorded at the GPS location when the claim was submitted.
- Local weather: ${weather ? weather.condition + ', ' + weather.temperature + '°C, wind ' + weather.windSpeed + ' km/h' : 'unavailable'}
- Compare this CAREFULLY against what you see in EACH photo.
- If local weather says "clear, 20°C" but a photo shows snow on the road, ice, or heavy rain — set weather_match=false and explain the discrepancy.
- If photos show different weather conditions from each other (e.g. one dry, one snowy), that is HIGHLY suspicious regardless of the API data.

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
    "inferred_road_surface": "Describe the road surface visible across photos. If it differs between photos, note that explicitly.",
    "inferred_weather_visible": "Describe weather/conditions visible in the photos. If different photos show different conditions, flag this.",
    "weather_api": "${weather ? weather.condition + ', ' + weather.temperature + '°C' : 'unavailable'}",
    "weather_match": true,
    "weather_match_note": "Compare local weather data vs EVERY photo. If ANY photo contradicts the weather (e.g. snow visible but weather says clear), set weather_match to false and explain.",
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
      "note": "Compare the BACKGROUND of every photo — road surface, lighting, weather, surroundings, time of day. Are they consistent? If one photo shows dry sunny road and another shows snow or rain, flag=true. If backgrounds differ (different locations, different times), flag=true."
    },
    "damage_vs_scene": {
      "flag": false,
      "note": "Does the environment match the damage severity? Major collision but clean road with no debris or skid marks? Does the damage orientation make physical sense? Does inferred speed match damage extent?"
    },
    "damage_plausibility": {
      "flag": false,
      "note": "Does the type and pattern of damage match the reported incident type and inferred speed?"
    },
    "photo_coverage": {
      "photos_submitted": ${photoCount},
      "flag": false,
      "note": "How thoroughly was the incident documented? More photos = more verifiable. 1 photo limits what can be assessed. Not suspicious on its own."
    },
    "claim_coherence": {
      "flag": false,
      "note": "Do all details tell a coherent story? Does weather API match the scene? If claimant says third party involved and other driver left, it is reasonable for the other car not to be in photos. But if backgrounds differ between photos, that undermines coherence."
    },
    "indicators": ["array of specific observations — only include genuine concerns, leave empty if nothing suspicious"]
  },
  "photo_references": [
    {
      "photo": "Photo 1",
      "observation": "What you observed in this specific photo that is noteworthy — damage, background detail, weather inconsistency, etc.",
      "type": "damage | fraud_concern | scene_context | weather_mismatch"
    }
  ]
}

PHOTO REFERENCES:
- Include a photo_references entry ONLY when you have a specific noteworthy observation about a particular photo.
- Do NOT reference every photo — only when there is something important to highlight (e.g. visible damage, weather inconsistency, suspicious background, key evidence).
- Use the "type" field to categorise: "damage" for damage observations, "fraud_concern" for inconsistencies, "scene_context" for useful scene details, "weather_mismatch" for weather discrepancies.
- The dashboard will display the referenced photo inline next to the observation so the claims agent can see exactly what you mean.

INLINE PHOTO MENTIONS:
- When writing text fields (severity_narrative, visible_damage_notes, liability_assessment, scene_assessment notes, fraud_analysis notes), MENTION the specific photo by its label (e.g. "Photo 1", "Photo 3") whenever you describe something visible in a particular image.
- Example: "The front bumper of the Kia is severely crushed (Photo 2), while Photo 1 shows minor scraping on the Toyota's passenger side."
- This lets the dashboard create clickable photo links inline within the report text.
- Every photo mentioned inline should also have a corresponding entry in photo_references.

FRAUD ANALYSIS GUIDELINES:
- Set flag=true when something is genuinely INCONSISTENT across photos or between photos and claim data.
- BACKGROUND ANALYSIS IS CRITICAL: Snow in one photo + dry road in another = flag. Different locations across photos = flag. Different lighting/time of day = flag.
- Weather cross-check: If local weather says clear/warm but photos show snow, ice, or heavy rain — that MUST be flagged in both weather_match AND environment_consistency.
- Having few photos is a data gap, not fraud. Note factually.
- Close-up photos are normal — not suspicious.
- Different vehicles in different photos is NORMAL in multi-vehicle incidents. Each photo may show a different car.
- Infer speed from damage: scratches = low, crumpled panels = moderate, structural = high. Does the scene match?
- Be fair and evidence-based. Most claims are legitimate. But be THOROUGH with background analysis.

SINGLE-VEHICLE / NO THIRD PARTY CONTEXT:
- When the claimant reports NO other vehicle was involved, the incident may have occurred in a garage, driveway, carpark, or private property — NOT necessarily on a public road.
- Indoor or covered locations (garage, carport, underground parking) are completely normal for single-vehicle incidents (e.g. scraping a pillar, reversing into a wall).
- Do NOT flag a non-street background as suspicious when no third party is involved. The location only becomes suspicious if it contradicts other claim details.
- Focus fraud analysis on damage plausibility and consistency, not on whether the scene "looks like a road".`

  const inputContent = []
  inputContent.push({ type: 'input_text', text: prompt })

  const photosToAttach = slotKeys.slice(0, 3)
  for (let i = 0; i < photosToAttach.length; i++) {
    const slot = photosToAttach[i]
    if (photoSlots[slot]) {
      inputContent.push({ type: 'input_text', text: `[Photo ${i + 1}]` })
      const resized = await resizeForVision(photoSlots[slot])
      inputContent.push({
        type: 'input_image',
        image_url: resized,
        detail: 'auto',
      })
    }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-5.4',
        instructions: 'You are a fleet/motor-claims analyst and fraud investigator. Respond ONLY with valid JSON.',
        input: [{ role: 'user', content: inputContent }],
        text: { format: { type: 'json_object' } },
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('[OpenAI] Report error:', errText.slice(0, 300))
      return null
    }
    const result = await response.json()
    const content = result.output?.find(o => o.type === 'message')?.content?.find(c => c.type === 'output_text')?.text
    if (!content) return null
    return JSON.parse(content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
  } catch (e) {
    console.error('[OpenAI] Report generation failed:', e)
    return null
  }
}

export async function evaluatePhotoCoverage(photoDataUrls, vehicle, incidentContext, signal) {
  if (!API_KEY || photoDataUrls.length === 0) return null

  const resized = await Promise.all(photoDataUrls.map(resizeForVision))

  const ctx = incidentContext || {}
  const thirdParty = ctx.thirdPartyInvolved

  const prompt = `You are a photo coach helping a driver document a vehicle incident for insurance. Help them capture thorough evidence so their claim goes smoothly.

Vehicle: ${vehicle.color} ${vehicle.year} ${vehicle.make} ${vehicle.model} (plate: ${vehicle.rego})
${thirdParty ? 'Another vehicle is involved.' : 'Single-vehicle incident.'}

The driver has taken ${photoDataUrls.length} photo(s) so far (max 6). Evaluate coverage and suggest what's missing.

Check for:
- Wide/scene shot showing the road, surroundings, and context (NOT just the car close-up)
- Front of vehicle
- Rear of vehicle
- Side view(s)
- Close-up of specific damage
- License plate(s) clearly readable
${thirdParty ? '- Other vehicle captured\n- Both vehicles in one frame showing relative positions' : '- What was hit (pole, barrier, kerb, object, etc.)'}

Return ONLY JSON:
{
  "captured": ["short labels of what is covered"],
  "topSuggestion": "Single friendly sentence — the MOST important photo to take next. Empty string if coverage looks solid.",
  "additionalTips": ["0-2 more optional suggestions"],
  "coverageScore": 3
}
coverageScore: 1=very incomplete, 2=missing key angles, 3=decent but could improve, 4=good coverage, 5=excellent/thorough.`

  const inputContent = [{ type: 'input_text', text: prompt }]
  resized.forEach((url, i) => {
    inputContent.push({ type: 'input_text', text: `[Photo ${i + 1}]` })
    inputContent.push({ type: 'input_image', image_url: url, detail: 'low' })
  })

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        input: [{ role: 'user', content: inputContent }],
        text: { format: { type: 'json_object' } },
      }),
      signal,
    })

    if (!response.ok) return null
    const result = await response.json()
    const text = result.output?.find((o) => o.type === 'message')
      ?.content?.find((c) => c.type === 'output_text')?.text
    if (!text) return null
    return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
  } catch (e) {
    if (e.name === 'AbortError') return null
    console.error('[OpenAI] Coverage check failed:', e)
    return null
  }
}

export async function analyzeIncidentPhotos(photos, vehicle, incidentContext, photoLabels) {
  if (!API_KEY) {
    console.warn('[OpenAI] No API key configured, skipping analysis')
    return null
  }

  const toProcess = photos.slice(0, 6)
  const resizedPhotos = await Promise.all(toProcess.map(resizeForVision))

  const inputContent = [
    { type: 'input_text', text: buildPrompt(vehicle, incidentContext) },
  ]
  resizedPhotos.forEach((dataUrl, i) => {
    inputContent.push({ type: 'input_text', text: `[Photo ${i + 1}]` })
    inputContent.push({
      type: 'input_image',
      image_url: dataUrl,
      detail: 'auto',
    })
  })

  console.log('[OpenAI] Sending analysis request with', resizedPhotos.length, 'photos')

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      instructions: 'You are a vehicle incident analyst. You respond only with valid JSON.',
      input: [{ role: 'user', content: inputContent }],
      text: { format: { type: 'json_object' } },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    console.error('[OpenAI] Error:', text.slice(0, 300))
    throw new Error(`OpenAI API error ${response.status}`)
  }

  const result = await response.json()
  const content = result.output?.find(o => o.type === 'message')?.content?.find(c => c.type === 'output_text')?.text

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
