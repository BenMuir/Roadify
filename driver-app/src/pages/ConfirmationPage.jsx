import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function ConfirmationPage({ resetForm, formData }) {
  const navigate = useNavigate()
  const refNumber = `RD-${Date.now().toString(36).toUpperCase().slice(-6)}`
  const [viewerImage, setViewerImage] = useState(null)

  const annotatedImages = formData?.annotatedImages || []
  const predictions = formData?.damagePredictions || []

  const handleDone = () => {
    resetForm()
    navigate('/')
  }

  const handleAnother = () => {
    resetForm()
    navigate('/camera')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col items-center justify-between px-6 py-12 min-h-[100dvh] bg-gradient-to-b from-navy via-navy-light to-navy"
    >
      <div />

      <div className="flex flex-col items-center gap-6 w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
          className="relative"
        >
          <div className="w-24 h-24 bg-severity-minor rounded-full flex items-center justify-center shadow-2xl shadow-severity-minor/30">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div className="absolute -inset-4 bg-severity-minor/15 rounded-full animate-pulse-ring -z-10" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h2 className="text-3xl font-extrabold text-white">Claim Submitted!</h2>
          <p className="text-white/50 mt-2 leading-relaxed">
            Your incident report is being processed.<br />We'll keep you updated.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-center w-full"
        >
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Reference Number</p>
          <p className="text-2xl font-bold text-white font-mono tracking-widest">{refNumber}</p>
        </motion.div>

        {/* Annotated images from Roboflow */}
        {annotatedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4"
          >
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3">AI Damage Analysis</p>
            {predictions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {predictions.map((p, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-brand/15 text-brand-light text-[11px] font-medium rounded-full border border-brand/20"
                  >
                    {p.label} {p.confidence > 0 && `${p.confidence}%`}
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
              {annotatedImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setViewerImage(img)}
                  className="shrink-0 cursor-pointer group relative"
                >
                  <img
                    src={img}
                    alt={`Annotated ${i + 1}`}
                    className="w-24 h-24 rounded-xl object-cover border border-brand/20 group-hover:border-brand/50 transition-colors"
                  />
                  <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-white/30 text-[10px] mt-2">Tap an image to view full size</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-3 w-full"
        >
          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
              <span className="text-sm">📋</span>
            </div>
            <p className="text-white/60 text-xs leading-relaxed">
              AI damage report is being generated and sent to your insurer
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
              <span className="text-sm">🔔</span>
            </div>
            <p className="text-white/60 text-xs leading-relaxed">
              You'll receive a notification when a claims handler reviews your report
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="w-full space-y-3"
      >
        <button
          onClick={handleDone}
          className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand/25 transition-all cursor-pointer text-lg"
        >
          Done
        </button>
        <button
          onClick={handleAnother}
          className="w-full bg-white/5 text-white/50 hover:text-white/70 font-medium py-3.5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
        >
          Report Another Incident
        </button>
      </motion.div>

      {/* Fullscreen image viewer */}
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
                alt="Annotated damage"
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
