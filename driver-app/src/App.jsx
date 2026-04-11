import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import WelcomePage from './pages/WelcomePage'
import FaultPage from './pages/FaultPage'
import PhotoCapturePage from './pages/PhotoCapturePage'
import ProcessingPage from './pages/ProcessingPage'
import IncidentFormPage from './pages/IncidentFormPage'
import ReviewPage from './pages/ReviewPage'
import ConfirmationPage from './pages/ConfirmationPage'
import { useState, useEffect } from 'react'
import useGeolocation from './hooks/useGeolocation'

const USER_PROFILE = {
  name: 'Geoffrey Ludlow',
  phone: '0412 345 678',
  vehicle: {
    rego: 'ABC 123',
    make: 'Toyota',
    model: 'HiLux',
    year: '2022',
    color: 'Silver',
  },
  policyNumber: 'NTI-FL-00482917',
}

const initialFormData = {
  driverName: USER_PROFILE.name,
  phone: USER_PROFILE.phone,
  vehicleRego: USER_PROFILE.vehicle.rego,
  vehicleMake: USER_PROFILE.vehicle.make,
  vehicleModel: USER_PROFILE.vehicle.model,
  vehicleYear: USER_PROFILE.vehicle.year,
  vehicleColor: USER_PROFILE.vehicle.color,
  policyNumber: USER_PROFILE.policyNumber,
  otherVehicleRego: '',
  otherVehicleColor: '',
  otherVehicleMake: '',
  otherVehicleModel: '',
  atFault: null,
  thirdPartyInvolved: null,
  hitAndRun: null,
  parkedWhenHit: null,
  collisionObject: '',
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

export default function App() {
  const [formData, setFormData] = useState(initialFormData)
  const location = useLocation()
  const geo = useGeolocation()

  useEffect(() => {
    if (geo.status === 'success') {
      setFormData((prev) => ({
        ...prev,
        location: { lat: geo.lat, lng: geo.lng, address: geo.address },
      }))
    }
  }, [geo.status, geo.lat, geo.lng, geo.address])

  const updateFormData = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }))
  }

  const resetForm = () => {
    setFormData({ ...initialFormData, timestamp: new Date().toISOString() })
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-navy max-w-md mx-auto relative overflow-hidden">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<WelcomePage userProfile={USER_PROFILE} geo={geo} />} />
          <Route
            path="/fault"
            element={<FaultPage formData={formData} updateFormData={updateFormData} userProfile={USER_PROFILE} />}
          />
          <Route
            path="/camera"
            element={<PhotoCapturePage formData={formData} updateFormData={updateFormData} />}
          />
          <Route
            path="/processing"
            element={<ProcessingPage formData={formData} updateFormData={updateFormData} userProfile={USER_PROFILE} />}
          />
          <Route
            path="/details"
            element={<IncidentFormPage formData={formData} updateFormData={updateFormData} userProfile={USER_PROFILE} />}
          />
          <Route
            path="/review"
            element={<ReviewPage formData={formData} updateFormData={updateFormData} userProfile={USER_PROFILE} />}
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
