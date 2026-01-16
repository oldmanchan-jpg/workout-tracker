import { NavLink, useLocation } from 'react-router-dom'
import { Home, TrendingUp, Dumbbell, Settings, Shield } from 'lucide-react'
import { useProfile } from '../hooks/useProfile'

export default function BottomNav() {
  const { isAdmin } = useProfile()
  const location = useLocation()

  const tabs = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/progress', label: 'Progress', icon: TrendingUp },
    { path: '/workout', label: 'Workout', icon: Dumbbell },
    { path: '/settings', label: 'Settings', icon: Settings },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: Shield }] : []),
  ]

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-50 px-4 pb-4 safe-area-bottom"
      aria-label="Bottom navigation"
    >
      <div
        className="rounded-[24px] px-2 py-2 flex items-center justify-around"
        style={{
          background: 'rgba(20, 22, 26, 0.72)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path !== '/dashboard'}
              className={({ isActive }) => {
                // Handle '/' as dashboard
                const active = isActive || (tab.path === '/dashboard' && location.pathname === '/')
                return `flex flex-col items-center justify-center gap-1 min-h-[44px] px-3 py-2 rounded-xl transition-all duration-200 active:scale-95 hover:scale-105 ${
                  active ? 'text-[#29e33c]' : 'text-white/65 hover:text-white/80'
                }`
              }}
            >
              {({ isActive }) => {
                // Handle '/' as dashboard
                const active = isActive || (tab.path === '/dashboard' && location.pathname === '/')
                return (
                  <>
                    <div
                      className="relative flex items-center justify-center"
                      style={{
                        filter: active
                          ? 'drop-shadow(0 0 8px rgba(41, 227, 60, 0.6)) drop-shadow(0 0 4px rgba(41, 227, 60, 0.4))'
                          : 'none',
                      }}
                    >
                      <Icon
                        size={22}
                        strokeWidth={active ? 2.5 : 2}
                        className={active ? 'text-[#29e33c]' : 'text-white/65'}
                      />
                      {active && (
                        <div
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                          style={{
                            background: '#29e33c',
                            boxShadow: '0 0 6px rgba(41, 227, 60, 0.8)',
                          }}
                        />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-medium transition-colors ${
                        active ? 'text-[#29e33c]' : 'text-white/55'
                      }`}
                    >
                      {tab.label}
                    </span>
                  </>
                )
              }}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
