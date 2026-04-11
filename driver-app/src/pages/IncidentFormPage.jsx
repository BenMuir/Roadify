import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const INCIDENT_TYPES = [
  { value: '', label: 'Select type...' },
  { value: 'collision', label: 'Collision' },
  { value: 'rollover', label: 'Rollover' },
  { value: 'breakdown', label: 'Breakdown' },
  { value: 'hit-and-run', label: 'Hit & Run' },
  { value: 'weather-damage', label: 'Weather Damage' },
  { value: 'other', label: 'Other' },
]

function Field({ label, children, prefilled }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <label className="text-sm font-medium text-white/70">{label}</label>
        {prefilled && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-severity-minor/15 text-severity-minor font-medium">
            Auto-filled
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all'

export default function IncidentFormPage({ formData, updateFormData, userProfile }) {
  const navigate = useNavigate()
  const v = userProfile.vehicle

  const canProceed = formData.vehicleRego.trim() && formData.incidentType

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
          onClick={() => navigate('/camera')}
          className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/15 transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest">Step 3</p>
          <p className="text-white font-semibold text-sm">Confirm Details</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-5 pb-5 overflow-y-auto">
        {/* Your vehicle — from profile, read-only look */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Your Vehicle</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50 font-medium">From profile</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand/15 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{v.year} {v.make} {v.model}</p>
              <p className="text-white/40 text-xs">{v.color} &middot; {v.rego}</p>
            </div>
          </div>
        </motion.div>

        {/* Other vehicle — detected from photos */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 mb-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Other Vehicle</p>
            {formData.otherVehicleRego && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-severity-minor/15 text-severity-minor font-medium">Auto-filled</span>
            )}
          </div>
          <Field label="Number Plate" prefilled={!!formData.otherVehicleRego}>
            <input
              type="text"
              value={formData.otherVehicleRego}
              onChange={(e) => updateFormData({ otherVehicleRego: e.target.value.toUpperCase() })}
              placeholder="e.g. XYZ 789"
              className={`${inputClass} uppercase`}
            />
          </Field>
          <Field label="Vehicle Color" prefilled={!!formData.otherVehicleColor}>
            <input
              type="text"
              value={formData.otherVehicleColor}
              onChange={(e) => updateFormData({ otherVehicleColor: e.target.value })}
              placeholder="e.g. Silver"
              className={inputClass}
            />
          </Field>
          <Field label="Vehicle Make" prefilled={!!formData.otherVehicleMake}>
            <input
              type="text"
              value={formData.otherVehicleMake}
              onChange={(e) => updateFormData({ otherVehicleMake: e.target.value })}
              placeholder="e.g. Ford"
              className={inputClass}
            />
          </Field>
          <Field label="Vehicle Model" prefilled={!!formData.otherVehicleModel}>
            <input
              type="text"
              value={formData.otherVehicleModel}
              onChange={(e) => updateFormData({ otherVehicleModel: e.target.value })}
              placeholder="e.g. Ranger"
              className={inputClass}
            />
          </Field>
        </motion.div>

        {/* Incident details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 mb-4 space-y-4"
        >
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Incident</p>
          <Field label="Incident Type" prefilled={!!formData.incidentType}>
            <select
              value={formData.incidentType}
              onChange={(e) => updateFormData({ incidentType: e.target.value })}
              className={`${inputClass} bg-navy`}
            >
              {INCIDENT_TYPES.map((type) => (
                <option key={type.value} value={type.value} disabled={!type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Description" prefilled={!!formData.description}>
            <textarea
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              placeholder="Describe what happened..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </Field>
        </motion.div>

        {/* Driver details — from profile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 mb-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Your Details</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50 font-medium">From profile</span>
          </div>
          <Field label="Full Name">
            <input
              type="text"
              value={formData.driverName}
              onChange={(e) => updateFormData({ driverName: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Phone Number">
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              className={inputClass}
            />
          </Field>
        </motion.div>

        <div className="pt-2 pb-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => canProceed && navigate('/review')}
            disabled={!canProceed}
            className={`w-full font-bold py-4 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-lg ${
              canProceed
                ? 'bg-brand text-white shadow-brand/25 hover:bg-brand-dark'
                : 'bg-white/5 text-white/30 cursor-not-allowed shadow-none'
            }`}
          >
            Review Claim
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
