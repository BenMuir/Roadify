import { useNavigate } from 'react-router-dom'
import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

const MAX_PHOTOS = 6

const PHOTO_PROMPTS = [
  'Front of vehicle',
  'Rear of vehicle',
  'Damage close-up',
  'Number plate',
  'Wide scene shot',
  'Other angle',
]

export default function PhotoCapturePage({ formData, updateFormData }) {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (formData.photos.length === 0) {
      const timer = setTimeout(() => fileInputRef.current?.click(), 600)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleCapture = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        updateFormData({
          photos: [...formData.photos, event.target.result].slice(0, MAX_PHOTOS),
        })
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removePhoto = (index) => {
    updateFormData({ photos: formData.photos.filter((_, i) => i !== index) })
  }

  const canProceed = formData.photos.length >= 1

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
          <p className="text-white font-semibold text-sm">Capture Damage</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-5 pb-5 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2.5 flex-1">
          {Array.from({ length: MAX_PHOTOS }).map((_, index) => {
            const photo = formData.photos[index]
            const prompt = PHOTO_PROMPTS[index]
            const isNext = index === formData.photos.length

            if (photo) {
              return (
                <motion.div
                  key={index}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative aspect-square rounded-2xl overflow-hidden"
                >
                  <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-[10px] text-white/90 font-medium">{prompt}</p>
                  </div>
                </motion.div>
              )
            }

            return (
              <button
                key={index}
                onClick={() => isNext && fileInputRef.current?.click()}
                className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isNext
                    ? 'border-brand bg-brand/10 hover:bg-brand/20'
                    : 'border-white/10 bg-white/5 opacity-40 cursor-not-allowed'
                }`}
                disabled={!isNext}
              >
                <svg className={`w-6 h-6 ${isNext ? 'text-brand-light' : 'text-white/30'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className={`text-[10px] font-medium text-center px-1 leading-tight ${isNext ? 'text-brand-light' : 'text-white/30'}`}>
                  {prompt}
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

        <div className="flex gap-3">
          {formData.photos.length < MAX_PHOTOS && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-white/10 backdrop-blur-sm text-white font-medium py-3.5 rounded-2xl border border-white/10 hover:bg-white/15 transition-all cursor-pointer flex items-center justify-center gap-2.5"
            >
              <svg className="w-5 h-5 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              Open Camera
            </motion.button>
          )}
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
