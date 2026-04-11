import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function ConfirmationPage({ resetForm, formData }) {
  const navigate = useNavigate()
  const refNumber = formData?.claimId
    ? formData.claimId.slice(0, 8).toUpperCase()
    : `RD-${Date.now().toString(36).toUpperCase().slice(-6)}`
  const [copied, setCopied] = useState(false)

  const handleDone = () => {
    resetForm()
    navigate('/')
  }

  const handleAnother = () => {
    resetForm()
    navigate('/camera')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(refNumber).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
          <div className="w-24 h-24 bg-brand/20 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-brand/30 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          </div>
          <div className="absolute -inset-4 bg-brand/10 rounded-full animate-pulse-ring -z-10" />
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
          className="bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-4 w-full flex items-center justify-between"
        >
          <div>
            <p className="text-brand-light text-[10px] font-semibold uppercase tracking-widest mb-0.5">Reference Number</p>
            <p className="text-xl font-bold text-white font-mono tracking-wider">#{refNumber}</p>
          </div>
          <button
            onClick={handleCopy}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
          >
            {copied ? (
              <svg className="w-5 h-5 text-severity-minor" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
            )}
          </button>
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
          Back To Home
        </button>
        <button
          onClick={handleAnother}
          className="w-full text-white/40 font-semibold py-3 hover:text-white/60 transition-colors cursor-pointer text-xs uppercase tracking-widest"
        >
          Report Another Incident
        </button>
      </motion.div>

    </motion.div>
  )
}
