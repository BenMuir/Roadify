import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function ConfirmationPage({ resetForm }) {
  const navigate = useNavigate()
  const refNumber = `RD-${Date.now().toString(36).toUpperCase().slice(-6)}`

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

      <div className="flex flex-col items-center gap-6">
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
    </motion.div>
  )
}
