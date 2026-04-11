import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import WelcomePage from './pages/WelcomePage'
import FaultPage from './pages/FaultPage'
import PhotoCapturePage from './pages/PhotoCapturePage'
import ProcessingPage from './pages/ProcessingPage'
import IncidentFormPage from './pages/IncidentFormPage'
import ReviewPage from './pages/ReviewPage'
import ConfirmationPage from './pages/ConfirmationPage'
import { useState, useEffect } from 'react'
import useGeolocation from './hooks/useGeolocation'

const BASE_PROFILE = {
  phone: '0412 345 678',
  vehicle: {
    rego: 'ABC 123',
    make: 'Toyota',
    model: 'Camry',
    year: '2010',
    color: 'Red',
  },
  policyNumber: 'NTI-FL-00482917',
}

function getSavedVehicle() {
  try {
    const saved = localStorage.getItem('roadify_user_vehicle')
    if (saved) return JSON.parse(saved)
  } catch {}
  return BASE_PROFILE.vehicle
}

function buildInitialFormData(name) {
  const v = getSavedVehicle()
  return {
  driverName: name,
  phone: BASE_PROFILE.phone,
  vehicleRego: v.rego,
  vehicleMake: v.make,
  vehicleModel: v.model,
  vehicleYear: v.year,
  vehicleColor: v.color,
  policyNumber: BASE_PROFILE.policyNumber,
  otherVehicleRego: '',
  otherVehicleColor: '',
  otherVehicleMake: '',
  otherVehicleModel: '',
  atFault: null,
  thirdPartyInvolved: null,
  otherPartyPresent: null,
  weather: null,
  incidentType: '',
  description: '',
  photos: [],
  photoSlots: {},
  roboflowResults: null,
  annotatedImages: [],
  damagePredictions: [],
  location: { lat: null, lng: null, address: null },
  timestamp: new Date().toISOString(),
  }
}

function weatherCodeToLabel(code) {
  if (code <= 3) return 'clear'
  if (code <= 49) return 'fog'
  if (code <= 69) return 'rain'
  if (code <= 79) return 'snow'
  if (code <= 84) return 'rain'
  if (code <= 86) return 'snow'
  if (code <= 99) return 'storm'
  return 'unknown'
}

function SplashScreen({ onFinish }) {
  useEffect(() => {
    const t = setTimeout(onFinish, 2500)
    return () => clearTimeout(t)
  }, [onFinish])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] bg-navy flex flex-col items-center justify-center gap-5"
    >
      <motion.img
        src="/logo.svg"
        alt="Roadify"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.2 }}
        className="w-24 h-24"
      />
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="text-center"
      >
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Roadify</h1>
        <p className="text-brand-light text-base mt-1.5 font-medium">Incident reporting, simplified.</p>
      </motion.div>
    </motion.div>
  )
}

function NameEntryModal({ onSave, initialName }) {
  const [name, setName] = useState(initialName || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed) onSave(trimmed)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6"
    >
      <motion.form
        onSubmit={handleSubmit}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-[#1a1f3d] rounded-2xl p-6 w-full max-w-sm border border-white/10"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-brand/15 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{initialName ? 'Edit Your Name' : 'Welcome to Roadify'}</h3>
            <p className="text-white/40 text-xs">{initialName ? 'Update your display name' : 'Enter your name to get started'}</p>
          </div>
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          autoFocus
          className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/30 transition-all"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className={`w-full mt-4 py-3.5 rounded-xl font-bold text-sm transition-all ${
            name.trim()
              ? 'bg-brand text-white hover:bg-brand-dark cursor-pointer'
              : 'bg-white/5 text-white/30 cursor-not-allowed'
          }`}
        >
          {initialName ? 'Save' : 'Continue'}
        </button>
      </motion.form>
    </motion.div>
  )
}

export default function App() {
  const [userName, setUserName] = useState(() => localStorage.getItem('roadify_user_name') || '')
  const [showNameModal, setShowNameModal] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [formData, setFormData] = useState(() => buildInitialFormData(userName || BASE_PROFILE.phone))
  const location = useLocation()
  const geo = useGeolocation()

  const userProfile = {
    ...BASE_PROFILE,
    name: userName || 'Driver',
    vehicle: {
      rego: formData.vehicleRego, make: formData.vehicleMake,
      model: formData.vehicleModel, year: formData.vehicleYear, color: formData.vehicleColor,
    },
  }

  const handleNameSave = (name) => {
    localStorage.setItem('roadify_user_name', name)
    setUserName(name)
    setShowNameModal(false)
    setFormData((prev) => ({ ...prev, driverName: name }))
  }

  const handleEditName = () => setShowNameModal(true)

  useEffect(() => {
    if (geo.status === 'success') {
      setFormData((prev) => ({
        ...prev,
        location: { lat: geo.lat, lng: geo.lng, address: geo.address },
      }))

      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lng}&current_weather=true`)
        .then((r) => r.json())
        .then((data) => {
          if (data.current_weather) {
            setFormData((prev) => ({
              ...prev,
              weather: {
                temperature: data.current_weather.temperature,
                windSpeed: data.current_weather.windspeed,
                weatherCode: data.current_weather.weathercode,
                condition: weatherCodeToLabel(data.current_weather.weathercode),
              },
            }))
          }
        })
        .catch(() => {})
    }
  }, [geo.status, geo.lat, geo.lng, geo.address])

  const vehicleKeys = ['vehicleRego', 'vehicleMake', 'vehicleModel', 'vehicleYear', 'vehicleColor']

  const updateFormData = (fields) => {
    setFormData((prev) => {
      const next = { ...prev, ...fields }
      if (vehicleKeys.some((k) => k in fields)) {
        localStorage.setItem('roadify_user_vehicle', JSON.stringify({
          rego: next.vehicleRego, make: next.vehicleMake, model: next.vehicleModel,
          year: next.vehicleYear, color: next.vehicleColor,
        }))
      }
      return next
    })
  }

  const resetForm = () => {
    setFormData({ ...buildInitialFormData(userName || 'Driver'), timestamp: new Date().toISOString() })
  }

  const handleSplashFinish = () => {
    setShowSplash(false)
    if (!userName) setShowNameModal(true)
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-navy max-w-md mx-auto relative overflow-hidden">
      <AnimatePresence>
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      </AnimatePresence>
      <AnimatePresence>
        {showNameModal && (
          <NameEntryModal
            onSave={handleNameSave}
            initialName={userName || ''}
          />
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<WelcomePage userProfile={userProfile} geo={geo} onEditName={handleEditName} />} />
          <Route
            path="/fault"
            element={<FaultPage formData={formData} updateFormData={updateFormData} userProfile={userProfile} />}
          />
          <Route
            path="/camera"
            element={<PhotoCapturePage formData={formData} updateFormData={updateFormData} userProfile={userProfile} />}
          />
          <Route
            path="/processing"
            element={<ProcessingPage formData={formData} updateFormData={updateFormData} userProfile={userProfile} />}
          />
          <Route
            path="/details"
            element={<IncidentFormPage formData={formData} updateFormData={updateFormData} userProfile={userProfile} />}
          />
          <Route
            path="/review"
            element={<ReviewPage formData={formData} updateFormData={updateFormData} userProfile={userProfile} />}
          />
          <Route
            path="/confirmation"
            element={<ConfirmationPage resetForm={resetForm} formData={formData} />}
          />
        </Routes>
      </AnimatePresence>
    </div>
  )
}
