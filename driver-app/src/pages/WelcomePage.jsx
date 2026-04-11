import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import LocationMap from '../components/LocationMap'

export default function WelcomePage({ userProfile, geo }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col items-center justify-between px-6 py-10 bg-gradient-to-b from-navy via-navy-light to-brand-dark min-h-[100dvh]"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 self-start"
      >
        <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center text-white font-bold text-sm">
          {userProfile.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="text-white text-sm font-medium">Hi, {userProfile.name.split(' ')[0]}</p>
          <p className="text-white/40 text-xs">Policy {userProfile.policyNumber}</p>
        </div>
      </motion.div>

      <div className="flex flex-col items-center gap-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="relative"
        >
          <div className="w-24 h-24 bg-brand rounded-3xl flex items-center justify-center shadow-2xl shadow-brand/30">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
          <div className="absolute -inset-4 bg-brand/20 rounded-[2rem] animate-pulse-ring -z-10" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Roadify</h1>
          <p className="text-brand-light text-lg mt-2 font-medium">Incident reporting, simplified.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full rounded-2xl overflow-hidden border border-white/10"
        >
          <div className="h-[200px]">
            {geo.status === 'success' ? (
              <LocationMap lat={geo.lat} lng={geo.lng} address={geo.address} />
            ) : geo.status === 'loading' ? (
              <div className="h-full bg-white/5 flex flex-col items-center justify-center gap-2 rounded-2xl">
                <div className="w-5 h-5 border-2 border-brand-light border-t-transparent rounded-full animate-spin" />
                <p className="text-white/40 text-xs">Getting your location...</p>
              </div>
            ) : (
              <div className="h-full bg-white/5 flex flex-col items-center justify-center gap-2 rounded-2xl">
                <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <p className="text-white/40 text-xs">
                  {geo.status === 'denied' ? 'Location access denied' : 'Location unavailable'}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="w-full space-y-4"
      >
        <button
          onClick={() => navigate('/fault')}
          className="w-full bg-brand hover:bg-brand-dark active:scale-[0.97] text-white font-bold py-4.5 rounded-2xl shadow-xl shadow-brand/25 transition-all text-lg cursor-pointer flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
          Start Claim
        </button>

        <div className="flex items-center justify-center gap-2 text-white/30 text-xs">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <span>Your data is encrypted and secure</span>
        </div>
      </motion.div>
    </motion.div>
  )
}
