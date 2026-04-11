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

function buildPrompt(vehicle) {
  return `You are an AI assistant analyzing photos from a vehicle incident for an insurance claim.

The claimant drives a **${vehicle.color} ${vehicle.year} ${vehicle.make} ${vehicle.model}** with registration plate **${vehicle.rego}**.

Carefully analyze ALL provided photos and extract the following:

1. **Other Vehicle Rego**: Look for number plates that are NOT "${vehicle.rego}". Read the plate text exactly as shown. If multiple other vehicles, pick the one most likely involved in the incident.
2. **Other Vehicle Color**: The body color of the other vehicle (not the claimant's ${vehicle.color} ${vehicle.make}).
3. **Other Vehicle Make**: The manufacturer of the other vehicle (e.g. Toyota, Ford, Hyundai). Use visible badges, grille design, or body shape to identify.
4. **Other Vehicle Model**: The specific model if identifiable (e.g. Corolla, Ranger, i30).
5. **Incident Type**: Classify as exactly one of: collision, rollover, breakdown, hit-and-run, weather-damage, other
6. **Description**: A brief 1-2 sentence factual description of the incident based on visible damage, vehicle positions, and scene context.

IMPORTANT:
- The claimant's vehicle is the ${vehicle.color} ${vehicle.make} ${vehicle.model} — do NOT report its details as the "other" vehicle.
- If you cannot determine a field, return an empty string for that field.
- For the rego plate, only include it if you can read it with reasonable confidence.

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

export async function analyzeIncidentPhotos(photos, vehicle) {
  if (!API_KEY) {
    console.warn('[OpenAI] No API key configured, skipping analysis')
    return null
  }

  const resizedPhotos = await Promise.all(photos.slice(0, 4).map(resizeForVision))

  const imageMessages = resizedPhotos.map((dataUrl) => ({
    type: 'image_url',
    image_url: { url: dataUrl, detail: 'high' },
  }))

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
          { type: 'text', text: buildPrompt(vehicle) },
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
