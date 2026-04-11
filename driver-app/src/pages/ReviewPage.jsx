import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { submitClaim } from '../services/claimService'

const FALLBACK_DAMAGE = [
  { label: 'Damage detected', confidence: 0 },
]

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-start py-2">
      <span className="text-white/40 text-sm">{label}</span>
      <span className="text-white text-sm font-medium text-right max-w-[60%]">{value || '—'}</span>
    </div>
  )
}

export default function ReviewPage({ formData, updateFormData, userProfile }) {
  const navigate = useNavigate()
  const [viewerImage, setViewerImage] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState('')
  const [submitError, setSubmitError] = useState(null)
  const v = userProfile.vehicle
  const damageItems = formData.damagePredictions?.length > 0
    ? formData.damagePredictions
    : formData.roboflowResults ? [] : FALLBACK_DAMAGE

  const date = new Date(formData.timestamp)
  const dateStr = date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
  const timeStr = date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col min-h-[100dvh] bg-navy"
    >
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/details')}
          className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/15 transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest">Step 4</p>
          <p className="text-white font-semibold text-sm">Review Claim</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-5 pb-5 overflow-y-auto space-y-4">
        {/* Photo strip */}
        {formData.photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
          >
            {formData.photos.map((photo, i) => (
              <button key={i} onClick={() => setViewerImage(photo)} className="shrink-0 cursor-pointer">
                <img
                  src={photo}
                  alt={`Photo ${i + 1}`}
                  className="w-20 h-20 rounded-xl object-cover border border-white/10 hover:border-white/30 transition-colors"
                />
              </button>
            ))}
          </motion.div>
        )}

        {/* Damage detected */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.03] rounded-2xl p-4 border border-white/5"
        >
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">Damage Detected</p>
          {damageItems.length > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-white/40">Detections:</span>
                <span className="px-3 py-1 bg-brand/20 text-brand-light text-xs font-bold rounded-full">
                  {damageItems.length} found
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {damageItems.map((tag, idx) => (
                  <span
                    key={`${tag.label}-${idx}`}
                    className="px-2.5 py-1 bg-white/5 border border-white/10 text-white/70 text-xs rounded-full flex items-center gap-1.5"
                  >
                    {tag.label}
                    {tag.confidence > 0 && (
                      <span className="text-brand-light text-[10px]">{tag.confidence}%</span>
                    )}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-white/40 text-sm">No AI analysis available</p>
          )}
        </motion.div>

        {/* Annotated images */}
        {formData.annotatedImages?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-white/[0.03] rounded-2xl p-4 border border-white/5"
          >
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">AI Annotations</p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {formData.annotatedImages.map((img, i) => (
                <button key={i} onClick={() => setViewerImage(img)} className="shrink-0 cursor-pointer group">
                  <img
                    src={img}
                    alt={`Annotated ${i + 1}`}
                    className="w-28 h-28 rounded-xl object-cover border border-brand/20 group-hover:border-brand/50 transition-colors"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Incident context */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/[0.03] rounded-2xl p-4 border border-white/5"
        >
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Incident Context</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.thirdPartyInvolved === true ? (
              <span className="px-2.5 py-1 bg-brand/15 text-brand-light text-xs font-medium rounded-full">
                Third party involved
              </span>
            ) : formData.thirdPartyInvolved === false ? (
              <span className="px-2.5 py-1 bg-white/10 text-white/50 text-xs font-medium rounded-full">
                Single vehicle
              </span>
            ) : null}
            {formData.hitAndRun && (
              <span className="px-2.5 py-1 bg-severity-major/15 text-severity-major text-xs font-medium rounded-full">
                Hit and run
              </span>
            )}
            {formData.parkedWhenHit && (
              <span className="px-2.5 py-1 bg-white/10 text-white/50 text-xs font-medium rounded-full">
                Parked when hit
              </span>
            )}
            {formData.collisionObject && (
              <span className="px-2.5 py-1 bg-white/10 text-white/50 text-xs font-medium rounded-full capitalize">
                Hit {formData.collisionObject}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {formData.atFault === true ? (
              <span className="px-3 py-1.5 bg-severity-major/15 text-severity-major text-sm font-semibold rounded-full">
                At fault
              </span>
            ) : formData.atFault === false ? (
              <span className="px-3 py-1.5 bg-severity-minor/15 text-severity-minor text-sm font-semibold rounded-full">
                Not at fault
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-white/10 text-white/50 text-sm font-semibold rounded-full">
                Fault not specified
              </span>
            )}
          </div>
        </motion.div>

        {/* Vehicles */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.03] rounded-2xl p-4 border border-white/5"
        >
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">Vehicles</p>
          <InfoRow label="Your vehicle" value={`${v.color} ${v.make} ${v.model}`} />
          <InfoRow label="Your plate" value={formData.vehicleRego} />
          {formData.thirdPartyInvolved && (formData.otherVehicleRego || formData.otherVehicleMake || formData.otherVehicleColor) && (
            <>
              <div className="border-t border-white/5 my-1" />
              {(formData.otherVehicleMake || formData.otherVehicleColor) && (
                <InfoRow
                  label="Other vehicle"
                  value={[formData.otherVehicleColor, formData.otherVehicleMake, formData.otherVehicleModel].filter(Boolean).join(' ')}
                />
              )}
              {formData.otherVehicleRego && (
                <InfoRow label="Other plate" value={formData.otherVehicleRego} />
              )}
            </>
          )}
          {formData.thirdPartyInvolved === false && formData.collisionObject && (
            <>
              <div className="border-t border-white/5 my-1" />
              <InfoRow label="Object hit" value={formData.collisionObject} />
            </>
          )}
        </motion.div>

        {/* Incident info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/[0.03] rounded-2xl p-4 border border-white/5"
        >
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">Incident</p>
          <InfoRow label="Type" value={formData.incidentType} />
          <InfoRow label="Date" value={dateStr} />
          <InfoRow label="Time" value={timeStr} />
          {formData.location.address && (
            <InfoRow label="Location" value={formData.location.address} />
          )}
          {formData.location.lat && (
            <InfoRow label="Coordinates" value={`${formData.location.lat.toFixed(5)}, ${formData.location.lng.toFixed(5)}`} />
          )}
          {formData.description && (
            <div className="pt-2 border-t border-white/5 mt-2">
              <p className="text-white/40 text-xs mb-1">Description</p>
              <p className="text-white/80 text-sm leading-relaxed">{formData.description}</p>
            </div>
          )}
        </motion.div>

        {/* Driver */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.03] rounded-2xl p-4 border border-white/5"
        >
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">Driver</p>
          <InfoRow label="Name" value={formData.driverName} />
          <InfoRow label="Phone" value={formData.phone} />
          <InfoRow label="Policy" value={formData.policyNumber} />
        </motion.div>

        <div className="pt-3 pb-2 space-y-3">
          {submitError && (
            <div className="px-4 py-3 bg-red-400/10 border border-red-400/20 rounded-xl">
              <p className="text-red-400 text-xs">{submitError}</p>
            </div>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={async () => {
              if (submitting) return
              setSubmitting(true)
              setSubmitError(null)
              try {
                const result = await submitClaim(formData, setSubmitStatus)
                if (result?.id) {
                  updateFormData({ claimId: result.id })
                }
                navigate('/confirmation')
              } catch (err) {
                console.error('Submit failed:', err)
                setSubmitError(err.message || 'Submission failed. Please try again.')
                setSubmitting(false)
              }
            }}
            disabled={submitting}
            className={`w-full font-bold py-4 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-lg ${
              submitting
                ? 'bg-severity-minor/50 text-white/70 cursor-wait'
                : 'bg-severity-minor hover:brightness-110 text-white shadow-severity-minor/20'
            }`}
          >
            {submitting ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {submitStatus || 'Submitting...'}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Submit Claim
              </>
            )}
          </motion.button>
          <button
            onClick={() => navigate('/details')}
            disabled={submitting}
            className="w-full text-white/40 font-medium py-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer text-sm disabled:opacity-30"
          >
            Edit Details
          </button>
        </div>
      </div>

      <AnimatePresence>
        {viewerImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setViewerImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={viewerImage}
                alt="Full size"
                className="max-w-full max-h-[85vh] rounded-2xl object-contain"
              />
              <button
                onClick={() => setViewerImage(null)}
                className="absolute top-3 right-3 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-black/80 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
