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
