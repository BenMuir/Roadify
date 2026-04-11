import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { runWorkflowOnPhotos, extractPredictions } from '../services/roboflow'
import { analyzeIncidentPhotos } from '../services/openai'

const STEPS = [
  { label: 'Uploading photos...', icon: '↑' },
  { label: 'Detecting damage...', icon: '🔍' },
  { label: 'Reading plates & vehicles...', icon: '🚗' },
  { label: 'Generating annotations...', icon: '🔧' },
  { label: 'Preparing your claim...', icon: '📋' },
]

export default function ProcessingPage({ formData, updateFormData, userProfile }) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    async function processPhotos() {
      try {
        setCurrentStep(0)
        await delay(600)

        setCurrentStep(1)
        const roboflowPromise = runWorkflowOnPhotos(formData.photos, (completed, total) => {
          if (completed === total) setCurrentStep(2)
        })

        setCurrentStep(2)
        const incidentContext = {
          thirdPartyInvolved: formData.thirdPartyInvolved,
          hitAndRun: formData.hitAndRun,
          parkedWhenHit: formData.parkedWhenHit,
          collisionObject: formData.collisionObject,
        }
        const vehicleForAI = {
          rego: formData.vehicleRego,
          make: formData.vehicleMake,
          model: formData.vehicleModel,
          year: formData.vehicleYear,
          color: formData.vehicleColor,
        }
        const slotLabels = {
          front: 'Front', rear: 'Rear', left: 'Left Side',
          right: 'Right Side', closeup: 'Close-up', wide: 'Wide Shot',
        }
        const photoSlots = formData.photoSlots || {}
        const slotKeys = Object.keys(photoSlots)
        const photoLabels = slotKeys.map((k) => slotLabels[k] || k)

        const openaiPromise = analyzeIncidentPhotos(formData.photos, vehicleForAI, incidentContext, photoLabels)

        const [results, openaiResult] = await Promise.all([roboflowPromise, openaiPromise])

        setCurrentStep(3)
        await delay(400)

        const { predictions, annotatedImages } = extractPredictions(results)

        const formUpdate = {
          roboflowResults: results,
          damagePredictions: predictions,
          annotatedImages,
        }

        if (openaiResult) {
          if (openaiResult.otherVehicleRego) formUpdate.otherVehicleRego = openaiResult.otherVehicleRego
          if (openaiResult.otherVehicleColor) formUpdate.otherVehicleColor = openaiResult.otherVehicleColor
          if (openaiResult.otherVehicleMake) formUpdate.otherVehicleMake = openaiResult.otherVehicleMake
          if (openaiResult.otherVehicleModel) formUpdate.otherVehicleModel = openaiResult.otherVehicleModel
          if (openaiResult.incidentType) formUpdate.incidentType = openaiResult.incidentType
          if (openaiResult.description) formUpdate.description = openaiResult.description
        } else {
          formUpdate.incidentType = predictions.length > 0 ? 'collision' : ''
          formUpdate.description = predictions.length > 0
            ? `Detected damage: ${predictions.map((p) => p.label).join(', ')}.`
            : ''
        }

        setCurrentStep(4)
        updateFormData(formUpdate)

        await delay(600)
        setDone(true)
      } catch (err) {
        console.error('Processing failed:', err)
        setError(err.message)
      }
    }

    processPhotos()
  }, [])

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => navigate('/details'), 1000)
      return () => clearTimeout(t)
    }
  }, [done, navigate])

  const handleRetry = () => {
    setError(null)
    hasStarted.current = false
    setCurrentStep(0)
    setDone(false)
  }

  const handleSkip = () => {
    updateFormData({
      roboflowResults: null,
      damagePredictions: [],
      annotatedImages: [],
      incidentType: 'collision',
      description: 'Photos uploaded — AI analysis was skipped.',
    })
    navigate('/details')
  }

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
            {!done && !error && (
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                <div className="absolute left-0 right-0 h-0.5 bg-brand shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-scan-line" />
              </div>
            )}
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
        {error ? 'Something went wrong' : done ? 'All done!' : 'Analysing your photos...'}
      </motion.h2>
      <p className="text-white/40 text-sm mb-10">
        {error
          ? "The AI model couldn\u2019t process your photos"
          : done
          ? 'Taking you to your claim...'
          : `Processing ${formData.photos.length} photo${formData.photos.length !== 1 ? 's' : ''}`}
      </p>

      {error ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xs space-y-3"
        >
          <p className="text-red-400/80 text-xs text-center bg-red-400/10 rounded-xl px-4 py-3 border border-red-400/20">
            {error}
          </p>
          <button
            onClick={handleRetry}
            className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-brand/25 transition-all cursor-pointer"
          >
            Retry
          </button>
          <button
            onClick={handleSkip}
            className="w-full text-white/40 font-medium py-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer text-sm"
          >
            Skip AI Analysis
          </button>
        </motion.div>
      ) : (
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
      )}

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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
