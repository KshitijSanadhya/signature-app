import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/auth'
import { getInitials } from '../utils/helpers'

const NAV = [
  { to: '/dashboard', icon: '📋', label: 'Dashboard' },
  { to: '/upload',    icon: '⬆️', label: 'Upload' },
  { to: '/audit',     icon: '📜', label: 'Audit Log', disabled: true },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[220px] min-w-[220px] bg-surface border-r border-border flex flex-col py-6">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 pb-5 border-b border-border mb-4">
          <div className="w-7 h-7 bg-gold rounded-md flex items-center justify-center text-sm">✍️</div>
          <span className="font-display font-bold text-cream text-lg tracking-tight">SignFlow</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 px-2">
          {NAV.map(({ to, icon, label, disabled }) =>
            disabled ? null : (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gold/10 text-gold'
                      : 'text-muted hover:text-cream hover:bg-surface2'
                  }`
                }
              >
                <span className="text-base w-5 text-center">{icon}</span>
                {label}
              </NavLink>
            )
          )}
        </nav>

        {/* User */}
        <div className="mt-auto px-3 pt-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-surface2 transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">
              {getInitials(user?.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-cream truncate">{user?.full_name}</div>
              <div className="text-xs text-muted truncate">{user?.email}</div>
            </div>
            <span className="text-muted text-xs opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
