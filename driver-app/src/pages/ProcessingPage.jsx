import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const STEPS = [
  { label: 'Uploading photos...', icon: '↑' },
  { label: 'Reading number plates...', icon: '🔍' },
  { label: 'Assessing damage...', icon: '🔧' },
  { label: 'Preparing your claim...', icon: '📋' },
]

export default function ProcessingPage({ formData, updateFormData }) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const timers = STEPS.map((_, i) =>
      setTimeout(() => {
        setCurrentStep(i)
        if (i === STEPS.length - 1) {
          setTimeout(() => {
            updateFormData({
              otherVehicleRego: 'XYZ 789',
              otherVehicleColor: 'Silver',
              incidentType: 'collision',
              description: 'Front-end collision at intersection. Visible damage to bumper and headlight assembly.',
            })
            setDone(true)
          }, 800)
        }
      }, 800 * (i + 1))
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => navigate('/details'), 1000)
      return () => clearTimeout(t)
    }
  }, [done, navigate])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col items-center justify-center px-6 min-h-[100dvh] bg-gradient-to-b from-navy via-navy-light to-navy"
    >
      <div className="relative mb-10">
        {formData.photos[0] ? (
          <div className="w-40 h-40 rounded-3xl overflow-hidden border-2 border-brand/30 shadow-2xl shadow-brand/20">
            <img src={formData.photos[0]} alt="Processing" className="w-full h-full object-cover" />
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              <div className="absolute left-0 right-0 h-0.5 bg-brand shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-scan-line" />
            </div>
            <div className="absolute inset-0 bg-brand/10 rounded-3xl" />
          </div>
        ) : (
          <div className="w-40 h-40 rounded-3xl bg-white/5 border-2 border-brand/30 flex items-center justify-center">
            <svg className="w-16 h-16 text-brand/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5" />
            </svg>
          </div>
        )}
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white text-xl font-bold mb-2"
      >
        {done ? 'All done!' : 'Processing your photos...'}
      </motion.h2>
      <p className="text-white/40 text-sm mb-10">
        {done ? 'Taking you to your claim...' : 'This will only take a moment'}
      </p>

      <div className="w-full max-w-xs space-y-3">
        {STEPS.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: i <= currentStep ? 1 : 0.3,
              x: 0,
            }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 transition-all duration-500 ${
              i < currentStep
                ? 'bg-severity-minor text-white'
                : i === currentStep
                ? 'bg-brand text-white animate-pulse'
                : 'bg-white/10 text-white/30'
            }`}>
              {i < currentStep ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <span>{step.icon}</span>
              )}
            </div>
            <span className={`text-sm font-medium transition-colors duration-500 ${
              i <= currentStep ? 'text-white' : 'text-white/30'
            }`}>
              {step.label}
            </span>
          </motion.div>
        ))}
      </div>

      {done && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="mt-8 w-16 h-16 bg-severity-minor rounded-full flex items-center justify-center shadow-lg shadow-severity-minor/30"
        >
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  )
}
