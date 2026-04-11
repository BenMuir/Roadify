import { useLocation, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  {
    key: 'home',
    label: 'HOME',
    path: '/',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
  {
    key: 'claim',
    label: 'CLAIM',
    path: '/fault',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'history',
    label: 'HISTORY',
    path: '/',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'support',
    label: 'SUPPORT',
    path: '/',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="border-t border-white/10 bg-navy px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const active = item.key === 'home' && location.pathname === '/'
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors cursor-pointer ${
                active
                  ? 'text-brand-light bg-brand/10'
                  : 'text-white/30 hover:text-white/50'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-semibold tracking-wider">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
