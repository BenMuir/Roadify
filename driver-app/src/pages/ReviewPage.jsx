import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const MOCK_DAMAGE = [
  { label: 'Bumper dent', confidence: 94 },
  { label: 'Headlight crack', confidence: 87 },
  { label: 'Paint scratch', confidence: 76 },
]

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-start py-2">
      <span className="text-white/40 text-sm">{label}</span>
      <span className="text-white text-sm font-medium text-right max-w-[60%]">{value || '—'}</span>
    </div>
  )
}

export default function ReviewPage({ formData, userProfile }) {
  const navigate = useNavigate()
  const v = userProfile.vehicle

  const date = new Date(formData.timestamp)
  const dateStr = date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
  const timeStr = date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })

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
          onClick={() => navigate('/details')}
          className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/15 transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest">Step 4</p>
          <p className="text-white font-semibold text-sm">Review Claim</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-5 pb-5 overflow-y-auto space-y-4">
        {/* Photo strip */}
        {formData.photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
          >
            {formData.photos.map((photo, i) => (
              <img
                key={i}
                src={photo}
                alt={`Photo ${i + 1}`}
                className="w-20 h-20 rounded-xl object-cover shrink-0 border border-white/10"
              />
            ))}
          </motion.div>
        )}

        {/* Damage detected */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.03] rounded-2xl p-4 border border-white/5"
        >
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">Damage Detected</p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-white/40">Severity:</span>
            <span className="px-3 py-1 bg-severity-medium/20 text-severity-medium text-xs font-bold rounded-full">
              Medium
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {MOCK_DAMAGE.map((tag) => (
              <span
                key={tag.label}
                className="px-2.5 py-1 bg-white/5 border border-white/10 text-white/70 text-xs rounded-full flex items-center gap-1.5"
              >
                {tag.label}
                <span className="text-brand-light text-[10px]">{tag.confidence}%</span>
              </span>
            ))}
          </div>
        </motion.div>

        {/* Fault status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/[0.03] rounded-2xl p-4 border border-white/5"
        >
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Liability</p>
          <div className="flex items-center gap-2">
            {formData.atFault === true ? (
              <span className="px-3 py-1.5 bg-severity-major/15 text-severity-major text-sm font-semibold rounded-full">
                At fault
              </span>
            ) : formData.atFault === false ? (
              <span className="px-3 py-1.5 bg-severity-minor/15 text-severity-minor text-sm font-semibold rounded-full">
                Not at fault
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-white/10 text-white/50 text-sm font-semibold rounded-full">
                Not specified
              </span>
            )}
          </div>
        </motion.div>

        {/* Vehicles */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.03] rounded-2xl p-4 border border-white/5"
        >
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">Vehicles</p>
          <InfoRow label="Your vehicle" value={`${v.color} ${v.make} ${v.model}`} />
          <InfoRow label="Your plate" value={formData.vehicleRego} />
          {formData.otherVehicleRego && (
            <>
              <div className="border-t border-white/5 my-1" />
              <InfoRow label="Other plate" value={formData.otherVehicleRego} />
              {formData.otherVehicleColor && (
                <InfoRow label="Other color" value={formData.otherVehicleColor} />
              )}
            </>
          )}
        </motion.div>

        {/* Incident info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/[0.03] rounded-2xl p-4 border border-white/5"
        >
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">Incident</p>
          <InfoRow label="Type" value={formData.incidentType} />
          <InfoRow label="Date" value={dateStr} />
          <InfoRow label="Time" value={timeStr} />
          <InfoRow label="Location" value={`${formData.location.lat.toFixed(4)}, ${formData.location.lng.toFixed(4)}`} />
          {formData.description && (
            <div className="pt-2 border-t border-white/5 mt-2">
              <p className="text-white/40 text-xs mb-1">Description</p>
              <p className="text-white/80 text-sm leading-relaxed">{formData.description}</p>
            </div>
          )}
        </motion.div>

        {/* Driver */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.03] rounded-2xl p-4 border border-white/5"
        >
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">Driver</p>
          <InfoRow label="Name" value={formData.driverName} />
          <InfoRow label="Phone" value={formData.phone} />
          <InfoRow label="Policy" value={formData.policyNumber} />
        </motion.div>

        <div className="pt-3 pb-2 space-y-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/confirmation')}
            className="w-full bg-severity-minor hover:brightness-110 text-white font-bold py-4 rounded-2xl shadow-lg shadow-severity-minor/20 transition-all cursor-pointer flex items-center justify-center gap-2 text-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Submit Claim
          </motion.button>
          <button
            onClick={() => navigate('/details')}
            className="w-full text-white/40 font-medium py-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer text-sm"
          >
            Edit Details
          </button>
        </div>
      </div>
    </motion.div>
  )
}
