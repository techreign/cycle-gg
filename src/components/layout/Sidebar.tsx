import { Link, useLocation } from 'react-router-dom'

const ICON = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  game: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="12" x2="10" y2="12" /><line x1="8" y1="10" x2="8" y2="14" />
      <line x1="15" y1="13" x2="15.01" y2="13" /><line x1="18" y1="11" x2="18.01" y2="11" />
      <rect x="2" y="6" width="20" height="12" rx="4" />
    </svg>
  ),
  period: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c3 4 6 8 6 12a6 6 0 0 1-12 0c0-4 3-8 6-12z" />
    </svg>
  ),
  setup: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
}

const NAV_ITEMS = [
  { to: '/dashboard',  label: 'Dashboard',   icon: ICON.dashboard },
  { to: '/log-game',   label: 'Log Game',    icon: ICON.game },
  { to: '/log-period', label: 'Log Period',  icon: ICON.period },
  { to: '/setup',      label: 'Setup',       icon: ICON.setup },
  { to: '/settings',   label: 'Settings',    icon: ICON.settings },
]

export function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 bottom-0 w-[220px] z-50 flex-col"
      style={{ backgroundColor: 'var(--color-bg-raised)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/6">
        <Link to="/" className="flex items-baseline gap-0.5">
          <span className="text-xl font-black gradient-text tracking-tight">Cycle</span>
          <span className="text-xl font-black text-white tracking-tight">.gg</span>
        </Link>
        <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>cycle × league</p>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 p-3 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 font-medium text-sm"
              style={{
                color: isActive ? '#fb7185' : 'var(--color-text-secondary)',
                backgroundColor: isActive ? 'rgba(251, 113, 133, 0.1)' : 'transparent',
                borderLeft: isActive ? '2px solid #fb7185' : '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'
                  e.currentTarget.style.color = 'var(--color-text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--color-text-secondary)'
                }
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer note */}
      <div className="px-5 py-4 border-t border-white/6">
        <p className="text-[10px]" style={{ color: 'var(--color-text-faint)' }}>
          free forever · local-only
        </p>
      </div>
    </aside>
  )
}
