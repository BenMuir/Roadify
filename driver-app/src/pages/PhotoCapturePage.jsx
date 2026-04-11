import { useNavigate } from 'react-router-dom'
import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { evaluatePhotoCoverage } from '../services/openai'
import AppHeader from '../components/AppHeader'

const PHOTO_SLOTS = [
  { key: 'front', label: 'Front of Vehicle' },
  { key: 'rear', label: 'Rear of Vehicle' },
  { key: 'closeup', label: 'Damage Close-Up' },
  { key: 'plate', label: 'Number Plate' },
  { key: 'wide', label: 'Wide Scene Shot' },
  { key: 'other', label: 'Other Angle' },
]

export default function PhotoCapturePage({ formData, updateFormData, userProfile }) {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [activeSlot, setActiveSlot] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const abortRef = useRef(null)

  const photoSlots = formData.photoSlots || {}
  const filledCount = Object.keys(photoSlots).length

  const vehicle = userProfile?.vehicle || {
    rego: formData.vehicleRego,
    make: formData.vehicleMake,
    model: formData.vehicleModel,
    year: formData.vehicleYear,
    color: formData.vehicleColor,
  }

  const runCoverageCheck = useCallback((updatedSlots) => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    evaluatePhotoCoverage(
      Object.values(updatedSlots),
      vehicle,
      { thirdPartyInvolved: formData.thirdPartyInvolved },
      controller.signal,
    ).then((result) => {
      if (!controller.signal.aborted && result) {
        setFeedback(result)
      }
    }).catch(() => {})
  }, [vehicle, formData.thirdPartyInvolved])

  const handleSlotTap = (slotKey) => {
    setActiveSlot(slotKey)
    setTimeout(() => fileInputRef.current?.click(), 50)
  }

  const handleCapture = (e) => {
    const file = e.target.files?.[0]
    if (!file || !activeSlot) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const updated = { ...photoSlots, [activeSlot]: event.target.result }
      updateFormData({
        photoSlots: updated,
        photos: Object.values(updated),
      })
      runCoverageCheck(updated)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
    setActiveSlot(null)
  }

  const removePhoto = (slotKey) => {
    const updated = { ...photoSlots }
    delete updated[slotKey]
    updateFormData({
      photoSlots: updated,
      photos: Object.values(updated),
    })
    setFeedback(null)
  }

  const handleUpload = () => {
    if (feedback && feedback.coverageScore < 3 && filledCount < 4) {
      setShowConfirm(true)
    } else {
      navigate('/processing')
    }
  }

  const canProceed = filledCount >= 1

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col min-h-[100dvh] bg-navy"
    >
      <AppHeader backTo="/fault" />
      <div className="px-6 pb-2">
        <p className="text-brand-light/60 text-xs font-semibold uppercase tracking-widest mb-1">Step 1 of 3</p>
        <h2 className="text-2xl font-extrabold text-white mb-1">Capture Damage</h2>
        <p className="text-white/40 text-xs leading-relaxed">
          Please provide clear photos from multiple angles. This ensures the fastest possible processing of your claim.
        </p>
      </div>

      <div className="flex-1 px-5 pb-5 flex flex-col gap-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          {PHOTO_SLOTS.map((slot) => {
            const photo = photoSlots[slot.key]

            if (photo) {
              return (
                <motion.div
                  key={slot.key}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative aspect-[4/3] rounded-2xl overflow-hidden"
                >
                  <img src={photo} alt={slot.label} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(slot.key)}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                    <p className="text-[10px] text-white/90 font-semibold uppercase tracking-wider">{slot.label}</p>
                  </div>
                </motion.div>
              )
            }

            return (
              <button
                key={slot.key}
                onClick={() => handleSlotTap(slot.key)}
                className="aspect-[4/3] rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <span className="text-[10px] font-semibold text-center px-2 leading-tight text-white/40 uppercase tracking-wider">
                  {slot.label}
                </span>
              </button>
            )
          })}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleCapture}
          className="hidden"
        />

        <AnimatePresence>
          {feedback?.topSuggestion && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-3 rounded-xl bg-brand/10 border border-brand/20">
                <div className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                  <div className="min-w-0">
                    <motion.p
                      key={feedback.topSuggestion}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.25 }}
                      className="text-white/80 text-xs leading-relaxed"
                    >
                      {feedback.topSuggestion}
                    </motion.p>
                    {feedback.additionalTips?.filter(Boolean).map((tip, i) => (
                      <motion.p
                        key={tip}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25, delay: 0.1 }}
                        className="text-white/45 text-[10px] mt-1 leading-relaxed"
                      >
                        • {tip}
                      </motion.p>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => navigate('/fault')}
            className="px-5 py-3.5 rounded-2xl text-sm font-semibold text-white/50 hover:bg-white/5 transition-colors cursor-pointer"
          >
            Save Draft
          </button>
          <button
            onClick={handleUpload}
            disabled={!canProceed}
            className={`flex-1 font-bold py-3.5 rounded-2xl shadow-lg transition-all text-base cursor-pointer ${
              canProceed
                ? 'bg-brand text-white shadow-brand/25 hover:bg-brand-dark'
                : 'bg-white/5 text-white/30 cursor-not-allowed shadow-none'
            }`}
          >
            Next
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-4"
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-[#1a1f3d] rounded-2xl p-5 w-full max-w-md border border-white/10"
            >
              <p className="text-white font-semibold mb-2">A few more photos could help your claim</p>
              <p className="text-white/60 text-sm mb-1">{feedback?.topSuggestion}</p>
              {feedback?.additionalTips?.filter(Boolean).map((tip, i) => (
                <p key={i} className="text-white/45 text-xs mt-0.5">• {tip}</p>
              ))}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3.5 rounded-xl bg-brand text-white font-semibold text-sm cursor-pointer hover:bg-brand-dark transition-colors"
                >
                  Take More Photos
                </button>
                <button
                  onClick={() => navigate('/processing')}
                  className="flex-1 py-3.5 rounded-xl bg-white/10 text-white/70 font-semibold text-sm cursor-pointer hover:bg-white/15 transition-colors"
                >
                  Upload Anyway
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
