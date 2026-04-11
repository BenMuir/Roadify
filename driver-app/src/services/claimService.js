const API_URL = import.meta.env.VITE_API_URL

function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bytes = atob(base64)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

async function uploadPhotoToBlob(uploadUrl, dataUrl) {
  const blob = dataUrlToBlob(dataUrl)
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': 'image/jpeg',
    },
    body: blob,
  })
  if (!response.ok) {
    throw new Error(`Blob upload failed: ${response.status}`)
  }
}

export async function submitClaim(formData, onProgress) {
  const claimId = crypto.randomUUID()
  onProgress?.('Preparing upload...')

  const photoSlots = formData.photoSlots || {}
  const slotKeys = Object.keys(photoSlots)
  const annotatedImages = formData.annotatedImages || []

  const photoManifest = []
  for (const slot of slotKeys) {
    photoManifest.push({ slot, type: 'original' })
  }
  for (let i = 0; i < annotatedImages.length; i++) {
    const slot = slotKeys[i] || `annotated-${i}`
    photoManifest.push({ slot, type: 'annotated' })
  }

  let tokens = []
  if (photoManifest.length > 0) {
    onProgress?.('Getting upload tokens...')
    const tokenRes = await fetch(`${API_URL}/upload-tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claimId, photos: photoManifest }),
    })
    if (!tokenRes.ok) {
      const text = await tokenRes.text()
      throw new Error(`Token request failed: ${text}`)
    }
    const tokenData = await tokenRes.json()
    tokens = tokenData.tokens
  }

  onProgress?.('Uploading photos...')
  const photoRecords = []
  let uploadIndex = 0
  const totalUploads = tokens.length

  for (const token of tokens) {
    let dataUrl
    if (token.type === 'original') {
      dataUrl = photoSlots[token.slot]
    } else {
      const annotIdx = slotKeys.indexOf(token.slot)
      dataUrl = annotIdx >= 0 ? annotatedImages[annotIdx] : annotatedImages[parseInt(token.slot.split('-')[1]) || 0]
    }

    if (dataUrl) {
      await uploadPhotoToBlob(token.uploadUrl, dataUrl)
      photoRecords.push({
        slot: token.slot,
        type: token.type,
        blobUrl: token.blobUrl,
        blobName: token.blobName,
      })
    }
    uploadIndex++
    onProgress?.(`Uploading photos (${uploadIndex}/${totalUploads})...`)
  }

  onProgress?.('Submitting claim...')
  const damageDetections = (formData.damagePredictions || []).map((p) => ({
    class: p.label,
    confidence: p.confidence,
  }))

  const claimPayload = {
    claimId,
    driverName: formData.driverName,
    phone: formData.phone,
    policyNumber: formData.policyNumber,
    vehicleRego: formData.vehicleRego,
    vehicleMake: formData.vehicleMake,
    vehicleModel: formData.vehicleModel,
    vehicleYear: formData.vehicleYear,
    vehicleColor: formData.vehicleColor,
    otherVehicleRego: formData.otherVehicleRego,
    otherVehicleColor: formData.otherVehicleColor,
    otherVehicleMake: formData.otherVehicleMake,
    otherVehicleModel: formData.otherVehicleModel,
    thirdPartyInvolved: formData.thirdPartyInvolved,
    hitAndRun: formData.hitAndRun,
    parkedWhenHit: formData.parkedWhenHit,
    collisionObject: formData.collisionObject,
    atFault: formData.atFault,
    incidentType: formData.incidentType,
    description: formData.description,
    location: formData.location,
    timestamp: formData.timestamp,
    damageDetections,
    photos: photoRecords,
  }

  const submitRes = await fetch(`${API_URL}/submit-claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(claimPayload),
  })

  if (!submitRes.ok) {
    const text = await submitRes.text()
    throw new Error(`Claim submission failed: ${text}`)
  }

  const result = await submitRes.json()
  onProgress?.('Claim submitted!')
  return result
}
