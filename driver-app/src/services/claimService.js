const API_URL = import.meta.env.VITE_API_URL

export async function submitClaim(formData, onProgress) {
  const claimId = crypto.randomUUID()
  onProgress?.('Preparing claim...')

  const photoSlots = formData.photoSlots || {}
  const slotKeys = Object.keys(photoSlots)
  const annotatedImages = formData.annotatedImages || []

  const photoRecords = []
  for (const slot of slotKeys) {
    if (photoSlots[slot]) {
      photoRecords.push({ slot, type: 'original', dataUrl: photoSlots[slot] })
    }
  }
  for (let i = 0; i < annotatedImages.length; i++) {
    if (annotatedImages[i]) {
      const slot = slotKeys[i] || `annotated-${i}`
      photoRecords.push({ slot, type: 'annotated', dataUrl: annotatedImages[i] })
    }
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
