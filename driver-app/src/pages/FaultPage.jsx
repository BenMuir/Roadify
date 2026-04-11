import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function FaultPage({ formData, updateFormData }) {
  const navigate = useNavigate()

  const handleSelect = (value) => {
    updateFormData({ atFault: value })
  }

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
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/15 transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest">Step 1</p>
          <p className="text-white font-semibold text-sm">Liability</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-white">Were you at fault?</h2>
          <p className="text-white/40 text-sm mt-2">This helps us process your claim faster</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full space-y-3"
        >
          <button
            onClick={() => handleSelect(false)}
            className={`w-full py-5 rounded-2xl font-semibold text-base transition-all cursor-pointer border-2 flex items-center justify-center gap-3 ${
              formData.atFault === false
                ? 'bg-severity-minor/15 border-severity-minor text-severity-minor shadow-lg shadow-severity-minor/10'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Not at fault
          </button>

          <button
            onClick={() => handleSelect(true)}
            className={`w-full py-5 rounded-2xl font-semibold text-base transition-all cursor-pointer border-2 flex items-center justify-center gap-3 ${
              formData.atFault === true
                ? 'bg-severity-major/15 border-severity-major text-severity-major shadow-lg shadow-severity-major/10'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
            </svg>
            At fault
          </button>

          <button
            onClick={() => handleSelect(null)}
            className={`w-full py-4 rounded-2xl font-medium text-sm transition-all cursor-pointer border-2 ${
              formData.atFault === null
                ? 'bg-white/10 border-white/20 text-white/70'
                : 'bg-white/[0.02] border-white/5 text-white/30 hover:bg-white/5'
            }`}
          >
            I'm not sure
          </button>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/camera')}
          className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-4 rounded-2xl shadow-xl shadow-brand/25 transition-all text-lg cursor-pointer flex items-center justify-center gap-3 mt-2"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
          Next: Take Photos
        </motion.button>
      </div>
    </motion.div>
  )
}
