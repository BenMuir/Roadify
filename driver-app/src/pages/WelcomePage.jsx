import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import LocationMap from '../components/LocationMap'
import BottomNav from '../components/BottomNav'

export default function WelcomePage({ userProfile, geo, onEditName }) {
  const navigate = useNavigate()
  const v = userProfile.vehicle

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col min-h-[100dvh] bg-navy"
    >
      <div className="flex-1 flex flex-col px-6 pt-6 pb-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-start justify-between mb-1">
            <button onClick={onEditName} className="text-left cursor-pointer group">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Welcome back</p>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-extrabold text-white">Hi, {userProfile.name.split(' ')[0]}</h1>
                <svg className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                </svg>
              </div>
            </button>
            <img src="/Roadify_Logo.svg" alt="Roadify" className="h-12 mt-1" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.04] rounded-2xl p-4 border border-white/5 mb-4"
        >
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-3 bg-white/10 rounded-full px-3 py-1 w-fit">Your Vehicle</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-lg">{v.make} {v.model} {v.year}</p>
              <p className="text-white/40 text-sm">{v.color} &middot; {v.rego}</p>
            </div>
            <div className="w-12 h-12 bg-brand/15 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Map card */}
        {geo.status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl overflow-hidden border border-white/10 mb-4 h-[160px]"
          >
            <LocationMap lat={geo.lat} lng={geo.lng} address={geo.address} />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.04] rounded-2xl p-4 border border-white/5 mb-3 flex items-start gap-3"
        >
          <div className="w-10 h-10 bg-severity-minor/15 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-severity-minor" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Secure Submission</p>
            <p className="text-white/40 text-xs leading-relaxed mt-0.5">Your data is encrypted and processed securely.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white/[0.04] rounded-2xl p-4 border border-white/5 mb-5 flex items-start gap-3"
        >
          <div className="w-10 h-10 bg-brand/15 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">24/7 Roadside</p>
            <p className="text-white/40 text-xs leading-relaxed mt-0.5">Immediate assistance is available for towing or emergency recovery.</p>
          </div>
        </motion.div>

        <div className="flex-1" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <button
            onClick={() => navigate('/fault')}
            className="w-full bg-brand hover:bg-brand-dark active:scale-[0.97] text-white font-bold py-4 rounded-2xl shadow-xl shadow-brand/25 transition-all text-lg cursor-pointer"
          >
            Start Claim
          </button>
          <p className="text-white/30 text-xs text-center">Report an incident in under 3 minutes</p>
        </motion.div>
      </div>

      <BottomNav />
    </motion.div>
  )
}
