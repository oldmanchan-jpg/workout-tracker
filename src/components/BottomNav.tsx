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

  const isDashboardAlias = (tabPath: string) =>
    tabPath === '/dashboard' && location.pathname === '/'

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[420px] px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]"
      aria-label="Bottom navigation"
    >
      {/* Glass pill wrapper */}
      <div className="rounded-[24px] bg-[rgba(20,22,26,0.72)] backdrop-blur-xl border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.55)] px-2 py-2">
        {/* Hard guarantee: always horizontal even if Admin appears/disappears */}
        <div className="grid grid-flow-col auto-cols-fr items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon

            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                end={tab.path !== '/dashboard'}
                className={({ isActive }) => {
                  const active = isActive || isDashboardAlias(tab.path)

                  // Explicitly kill underline/visited-purple and enforce app-like look
                  return [
                    'no-underline',
                    'visited:no-underline',
                    active ? 'text-[#29e33c] visited:text-[#29e33c]' : 'text-white/70 visited:text-white/70 hover:text-white/85',
                    'flex flex-col items-center justify-center gap-1 min-h-[44px] py-2',
                    'select-none',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29e33c]/50 focus-visible:ring-offset-0',
                  ].join(' ')
                }}
              >
                {({ isActive }) => {
                  const active = isActive || isDashboardAlias(tab.path)
                  return (
                    <>
                      <div className="relative flex items-center justify-center">
                        <Icon
                          size={22}
                          strokeWidth={active ? 2.5 : 2}
                          className={active ? 'text-[#29e33c]' : 'text-white/70'}
                        />
                        {active && (
                          <span className="absolute -bottom-1 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-[#29e33c]" />
                        )}
                      </div>
                      <span className={active ? 'text-[10px] font-medium leading-none text-[#29e33c]' : 'text-[10px] font-medium leading-none text-white/60'}>
                        {tab.label}
                      </span>
                    </>
                  )
                }}
              </NavLink>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
