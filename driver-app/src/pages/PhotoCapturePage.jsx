import { useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

const PHOTO_SLOTS = [
  { key: 'front', label: 'Front' },
  { key: 'rear', label: 'Rear' },
  { key: 'left', label: 'Left Side' },
  { key: 'right', label: 'Right Side' },
  { key: 'closeup', label: 'Close-up' },
  { key: 'wide', label: 'Wide Shot' },
]

export default function PhotoCapturePage({ formData, updateFormData }) {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [activeSlot, setActiveSlot] = useState(null)

  const photoSlots = formData.photoSlots || {}
  const filledCount = Object.keys(photoSlots).length

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
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/fault')}
          className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/15 transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest">Step 2</p>
          <p className="text-white font-semibold text-sm">Capture Photos</p>
        </div>
        <div className="w-10" />
      </div>

      <p className="px-5 text-white/40 text-xs text-center mb-3">
        Tap any slot to take a photo — these are suggestions, take what you can
      </p>

      <div className="flex-1 px-5 pb-5 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2.5 flex-1">
          {PHOTO_SLOTS.map((slot) => {
            const photo = photoSlots[slot.key]

            if (photo) {
              return (
                <motion.div
                  key={slot.key}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative aspect-square rounded-2xl overflow-hidden"
                >
                  <img src={photo} alt={slot.label} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(slot.key)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleSlotTap(slot.key)}
                    className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 cursor-pointer"
                  >
                    <p className="text-[10px] text-white/90 font-medium">{slot.label}</p>
                  </button>
                </motion.div>
              )
            }

            return (
              <button
                key={slot.key}
                onClick={() => handleSlotTap(slot.key)}
                className="aspect-square rounded-2xl border-2 border-dashed border-brand/40 bg-brand/5 hover:bg-brand/15 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <svg className="w-6 h-6 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
                <span className="text-[10px] font-medium text-center px-1 leading-tight text-brand-light">
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
          capture="environment"
          onChange={handleCapture}
          className="hidden"
        />

        <div className="flex items-center justify-center gap-1.5">
          {PHOTO_SLOTS.map((slot) => (
            <div
              key={slot.key}
              className={`w-2 h-2 rounded-full transition-all ${
                photoSlots[slot.key] ? 'bg-brand' : 'bg-white/15'
              }`}
            />
          ))}
          <span className="text-white/30 text-xs ml-2">{filledCount}/{PHOTO_SLOTS.length}</span>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => canProceed && navigate('/processing')}
          disabled={!canProceed}
          className={`w-full font-bold py-4 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-lg ${
            canProceed
              ? 'bg-brand text-white shadow-brand/25 hover:bg-brand-dark'
              : 'bg-white/5 text-white/30 cursor-not-allowed shadow-none'
          }`}
        >
          Upload
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  )
}
