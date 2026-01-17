import { NavLink, useLocation } from 'react-router-dom'
import { Home, TrendingUp, Dumbbell, Settings, ShieldCheck } from 'lucide-react'
import { useProfile } from '../hooks/useProfile'

export default function BottomNav() {
  const { isAdmin } = useProfile()
  const location = useLocation()

  const tabs = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/progress', label: 'Progress', icon: TrendingUp },
    { path: '/workout', label: 'Workout', icon: Dumbbell },
    { path: '/settings', label: 'Settings', icon: Settings },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: ShieldCheck }] : []),
  ]

  const isDashboardAlias = (tabPath: string) =>
    tabPath === '/dashboard' && location.pathname === '/'

  return (
    <>
      {/* Bottom scrim - fades page content into bottom area */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-[180px] bg-gradient-to-t from-[#0b0d10] via-[#0b0d10]/85 to-transparent"
      />
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 h-20 w-full max-w-[420px] mx-auto px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]"
        aria-label="Bottom navigation"
      >
        {/* Glass pill wrapper */}
        <div className="rounded-[28px] bg-[rgba(11,13,16,0.95)] backdrop-blur-2xl backdrop-saturate-150 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.03)_inset] px-3 py-3">
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
                        {active && (
                          <div className="absolute inset-0 w-10 h-10 -top-2 left-1/2 -translate-x-1/2 rounded-full bg-[#29e33c]/15 blur-sm" />
                        )}
                        <Icon
                          size={24}
                          strokeWidth={active ? 2 : 1.5}
                          className={active ? 'text-[#29e33c] drop-shadow-[0_0_8px_rgba(41,227,60,0.5)]' : 'text-gray-500'}
                        />
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
    </>
  )
}
