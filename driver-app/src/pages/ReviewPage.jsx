import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { submitClaim } from '../services/claimService'
import AppHeader from '../components/AppHeader'

function getSeverity(predictions) {
  if (!predictions?.length) return { label: 'Unknown', color: 'bg-white/20 text-white/60' }
  const maxConf = Math.max(...predictions.map((p) => p.confidence || 0))
  const hasStructural = predictions.some((p) =>
    /crush|structural|frame|deploy|airbag/i.test(p.label),
  )
  if (hasStructural || maxConf >= 90) return { label: 'HIGH', color: 'bg-severity-major/20 text-severity-major' }
  if (maxConf >= 60) return { label: 'MEDIUM', color: 'bg-severity-medium/20 text-severity-medium' }
  return { label: 'LOW', color: 'bg-severity-minor/20 text-severity-minor' }
}

function InfoRow({ label, value, badge }) {
  return (
    <div className="flex justify-between items-center py-2.5">
      <span className="text-white/40 text-sm">{label}</span>
      {badge ? (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${badge.color}`}>{badge.text}</span>
      ) : (
        <span className="text-white text-sm font-medium text-right max-w-[60%]">{value || '—'}</span>
      )}
    </div>
  )
}

export default function ReviewPage({ formData, updateFormData, userProfile }) {
  const navigate = useNavigate()
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState('')
  const [submitError, setSubmitError] = useState(null)
  const v = userProfile.vehicle

  const damageItems = formData.damagePredictions?.length > 0
    ? formData.damagePredictions
    : []

  const severity = getSeverity(damageItems)

  const allGalleryImages = [
    ...formData.photos.map((src, i) => ({ src, label: `Photo ${i + 1}` })),
    ...(formData.annotatedImages || []).map((src, i) => ({ src, label: `AI Annotation ${i + 1}` })),
  ]

  const coverPhoto = formData.photos[0]
  const photoSlots = formData.photoSlots || {}
  const firstSlotKey = Object.keys(photoSlots)[0]
  const slotLabels = {
    front: 'Front of Vehicle', rear: 'Rear of Vehicle', closeup: 'Damage Close-Up',
    plate: 'Number Plate', wide: 'Wide Scene Shot', other: 'Other Angle',
  }
  const coverLabel = slotLabels[firstSlotKey] || 'Photo'

  const date = new Date(formData.timestamp)
  const dateStr = date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()
  const timeStr = date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })

  const handleGalleryPrev = () => setGalleryIndex((i) => Math.max(0, i - 1))
  const handleGalleryNext = () => setGalleryIndex((i) => Math.min(allGalleryImages.length - 1, i + 1))

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col min-h-[100dvh] bg-navy"
    >
      <AppHeader backTo="/details" />
      <div className="px-6 pb-3">
        <p className="text-brand-light/60 text-xs font-semibold uppercase tracking-widest mb-1">Step 3 of 3</p>
        <h2 className="text-2xl font-extrabold text-white">Final Incident Report</h2>
      </div>

      <div className="flex-1 px-5 pb-5 overflow-y-auto space-y-4">
        {/* Cover image */}
        {coverPhoto && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => { setGalleryIndex(0); setGalleryOpen(true) }}
            className="w-full relative rounded-2xl overflow-hidden cursor-pointer group"
          >
            <img src={coverPhoto} alt="Cover" className="w-full aspect-[16/10] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              <span className="text-white/90 text-[10px] font-semibold uppercase tracking-wider">{coverLabel}</span>
            </div>
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-lg">
              <span className="text-white/70 text-[10px] font-medium">{allGalleryImages.length} photos</span>
            </div>
          </motion.button>
        )}

        {/* Other vehicle badge */}
        {formData.thirdPartyInvolved && (
          <div className="flex">
            <span className="text-xs font-semibold text-white/60 uppercase tracking-widest bg-white/[0.06] px-3 py-1.5 rounded-lg border border-white/10">
              Other Vehicle
            </span>
          </div>
        )}

        {/* Severity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-xs font-semibold uppercase tracking-widest">Severity:</span>
            <span className={`text-xs font-bold px-3 py-1 rounded-lg ${severity.color}`}>{severity.label}</span>
          </div>
          {damageItems.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {damageItems.slice(0, 3).map((tag, idx) => (
                <span
                  key={`${tag.label}-${idx}`}
                  className="px-3 py-1.5 bg-white/[0.06] border border-white/10 text-white/80 text-xs font-medium rounded-full flex items-center gap-1.5"
                >
                  {tag.label}
                  {tag.confidence > 0 && (
                    <span className="text-white/40 text-[10px]">{tag.confidence}%</span>
                  )}
                </span>
              ))}
              {damageItems.length > 3 && (
                <span className="px-3 py-1.5 text-white/30 text-xs font-medium">...</span>
              )}
            </div>
          )}
        </motion.div>

        {/* Liability */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-between pt-1"
        >
          <span className="text-white/50 text-xs font-semibold uppercase tracking-widest">Liability:</span>
          {formData.atFault === false ? (
            <span className="text-xs font-bold px-3 py-1 rounded-lg bg-severity-minor/20 text-severity-minor">NOT AT FAULT</span>
          ) : formData.atFault === true ? (
            <span className="text-xs font-bold px-3 py-1 rounded-lg bg-severity-major/20 text-severity-major">AT FAULT</span>
          ) : (
            <span className="text-xs font-bold px-3 py-1 rounded-lg bg-white/10 text-white/50">UNSURE</span>
          )}
        </motion.div>

        <div className="border-t border-white/5" />

        {/* Vehicles */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Vehicles</p>
          <div className="space-y-1">
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="text-white/40 text-xs">Your Vehicle</p>
                <p className="text-white font-semibold text-sm">{v.make} {v.model} {v.year}</p>
              </div>
              <span className="text-[11px] font-bold text-brand-light bg-brand/15 px-2.5 py-1 rounded-lg tracking-wide">{formData.vehicleRego}</span>
            </div>
            {formData.thirdPartyInvolved && (formData.otherVehicleMake || formData.otherVehicleColor || formData.otherVehicleRego) && (
              <>
                <div className="border-t border-white/5" />
                <div className="flex justify-between items-center py-2">
                  <div>
                    <p className="text-white/40 text-xs">Other Vehicle</p>
                    <p className="text-white font-semibold text-sm">
                      {[formData.otherVehicleColor, formData.otherVehicleMake, formData.otherVehicleModel].filter(Boolean).join(' ') || 'Unknown'}
                    </p>
                  </div>
                  {formData.otherVehicleRego && (
                    <span className="text-[11px] font-bold text-brand-light bg-brand/15 px-2.5 py-1 rounded-lg tracking-wide">{formData.otherVehicleRego}</span>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>

        <div className="border-t border-white/5" />

        {/* Incident info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Incident</p>
          <InfoRow label="Date" value={dateStr} />
          <InfoRow label="Time" value={timeStr} />
          {formData.location.lat && (
            <InfoRow label="Location" value={`${formData.location.lat.toFixed(4)}, ${formData.location.lng.toFixed(4)}`} />
          )}
        </motion.div>

        {/* Submit */}
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
                ? 'bg-brand/50 text-white/70 cursor-wait'
                : 'bg-brand hover:bg-brand-dark text-white shadow-brand/25'
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
              'Submit Claim'
            )}
          </motion.button>
          <p className="text-white/30 text-[11px] text-center">
            By submitting, I confirm the details above are accurate.
          </p>
        </div>
      </div>

      {/* Fullscreen swipeable gallery */}
      <AnimatePresence>
        {galleryOpen && allGalleryImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col"
          >
            {/* Close + counter */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <span className="text-white/50 text-sm font-medium">
                {galleryIndex + 1} / {allGalleryImages.length}
              </span>
              <button
                onClick={() => setGalleryOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center cursor-pointer"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center px-4 relative">
              {galleryIndex > 0 && (
                <button
                  onClick={handleGalleryPrev}
                  className="absolute left-2 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
              )}

              <AnimatePresence mode="wait">
                <motion.img
                  key={galleryIndex}
                  src={allGalleryImages[galleryIndex].src}
                  alt={allGalleryImages[galleryIndex].label}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-full max-h-[70vh] rounded-2xl object-contain"
                />
              </AnimatePresence>

              {galleryIndex < allGalleryImages.length - 1 && (
                <button
                  onClick={handleGalleryNext}
                  className="absolute right-2 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              )}
            </div>

            {/* Label + dots */}
            <div className="px-5 pb-6 pt-4 text-center space-y-3">
              <p className="text-white/70 text-sm font-medium">{allGalleryImages[galleryIndex].label}</p>
              <div className="flex items-center justify-center gap-1.5">
                {allGalleryImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setGalleryIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      i === galleryIndex ? 'bg-brand w-4' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
