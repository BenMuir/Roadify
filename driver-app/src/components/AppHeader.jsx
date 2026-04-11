import { useNavigate } from 'react-router-dom'

export default function AppHeader({ backTo, onBack }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) onBack()
    else if (backTo) navigate(backTo)
  }

  return (
    <div className="px-5 pt-4 pb-2 flex items-center justify-between">
      {backTo || onBack ? (
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center cursor-pointer -ml-2"
        >
          <svg className="w-6 h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      ) : (
        <div className="w-10" />
      )}
      <img src="/Roadify_Logo.svg" alt="Roadify" className="h-5" />
      <button className="w-10 h-10 flex items-center justify-center -mr-2">
        <svg className="w-5 h-5 text-white/50" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
    </div>
  )
}
