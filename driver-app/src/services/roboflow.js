const API_KEY = '7IYJYzXg7R3qVg8C4zO1'
const WORKFLOW_URL = 'https://detect.roboflow.com/infer/workflows/guardrail-refinement/car-damage-detection-pipeline-1775872991910'

const MAX_DIMENSION = 1024

function resizeImage(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
        return
      }
      const scale = MAX_DIMENSION / Math.max(width, height)
      width = Math.round(width * scale)
      height = Math.round(height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.src = dataUrl
  })
}

function stripDataUrlPrefix(dataUrl) {
  const idx = dataUrl.indexOf(',')
  return idx !== -1 ? dataUrl.slice(idx + 1) : dataUrl
}

export async function runWorkflow(imageDataUrl) {
  const resized = await resizeImage(imageDataUrl)
  const base64 = stripDataUrlPrefix(resized)

  console.log('[Roboflow] Sending request:', {
    url: WORKFLOW_URL,
    base64Length: base64.length,
    startsWithJPEG: base64.startsWith('/9j/'),
  })

  const response = await fetch(WORKFLOW_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: API_KEY,
      inputs: {
        image: { type: 'base64', value: base64 },
      },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    console.error('[Roboflow] Error response:', text.slice(0, 300))
    throw new Error(`Roboflow API error ${response.status}: ${text}`)
  }

  const result = await response.json()
  console.log('[Roboflow] Success! Response keys:', Object.keys(result))
  return result
}

export async function runWorkflowOnPhotos(photos, onProgress) {
  const results = []

  for (let i = 0; i < photos.length; i++) {
    try {
      const result = await runWorkflow(photos[i])
      results.push({ index: i, success: true, data: result })
    } catch (err) {
      console.error(`Roboflow error on photo ${i}:`, err)
      results.push({ index: i, success: false, error: err.message })
    }
    onProgress?.(i + 1, photos.length)
  }

  return results
}

export function extractPredictions(workflowResults) {
  const predictions = []
  const annotatedImages = []

  for (const result of workflowResults) {
    if (!result.success || !result.data) continue

    const data = result.data
    const outputs = data.outputs || (Array.isArray(data) ? data : [data])

    for (const output of outputs) {
      if (output.predictions) {
        const preds = Array.isArray(output.predictions)
          ? output.predictions
          : output.predictions?.predictions || []

        for (const pred of preds) {
          predictions.push({
            label: pred.class || pred.label || 'Unknown',
            confidence: Math.round((pred.confidence || 0) * 100),
          })
        }
      }

      for (const key of Object.keys(output)) {
        const val = output[key]
        if (!val || key === 'predictions') continue

        if (
          key === 'visualization' ||
          key === 'annotated_image' ||
          key.includes('visualization') ||
          key.includes('annotated')
        ) {
          let imgSrc = typeof val === 'object' && val.value ? val.value : val
          if (typeof imgSrc === 'string' && !imgSrc.startsWith('data:')) {
            imgSrc = `data:image/jpeg;base64,${imgSrc}`
          }
          annotatedImages.push(imgSrc)
        }
      }
    }
  }

  const uniquePredictions = Array.from(
    predictions.reduce((map, p) => {
      const existing = map.get(p.label)
      if (!existing || p.confidence > existing.confidence) {
        map.set(p.label, p)
      }
      return map
    }, new Map()).values()
  ).sort((a, b) => b.confidence - a.confidence)

  return { predictions: uniquePredictions, annotatedImages }
}
