import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Home, TrendingUp, Dumbbell, Settings, ShieldCheck, Plus } from 'lucide-react'
import { useProfile } from '../hooks/useProfile'
import NotesModal from './NotesModal'

/**
 * Get localStorage key for notes
 * Format: workout_notes::<date>::<workoutId>
 * Falls back to route + date if workoutId not available
 */
function getNotesKey(): string {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const location = window.location.pathname
  // Use route as workoutId fallback (e.g., '/workout' or '/dashboard')
  const workoutId = location === '/workout' ? 'workout' : location.replace('/', '') || 'general'
  return `workout_notes::${today}::${workoutId}`
}

export default function BottomNav() {
  const { isAdmin } = useProfile()
  const location = useLocation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasNotes, setHasNotes] = useState(false)

  const tabs = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/progress', label: 'Progress', icon: TrendingUp },
    { path: '/workout', label: 'Workout', icon: Dumbbell },
    { path: '/settings', label: 'Settings', icon: Settings },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: ShieldCheck }] : []),
  ]

  // Check if notes exist for current route/date
  useEffect(() => {
    const key = getNotesKey()
    const saved = localStorage.getItem(key)
    setHasNotes(!!saved && saved.trim().length > 0)
  }, [location.pathname, isModalOpen])

  const isDashboardAlias = (tabPath: string) =>
    tabPath === '/dashboard' && location.pathname === '/'

  // Split tabs to insert "+" button in the center
  const tabsBeforeCenter = tabs.slice(0, Math.floor(tabs.length / 2))
  const tabsAfterCenter = tabs.slice(Math.floor(tabs.length / 2))

  return (
    <>
      {/* Bottom scrim - fades page content into bottom area */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-[240px] bg-gradient-to-t from-[#0b0d10] via-[#0b0d10]/95 to-transparent"
      />
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 min-h-[88px] pt-3 w-full max-w-[420px] mx-auto px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]"
        aria-label="Bottom navigation"
      >
        {/* Glass pill wrapper */}
        <div className="rounded-[28px] bg-[rgba(11,13,16,0.985)] backdrop-blur-2xl backdrop-saturate-150 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.03)_inset] px-3 py-3">
        {/* Hard guarantee: always horizontal even if Admin appears/disappears */}
        <div className="grid grid-flow-col auto-cols-fr items-center">
          {/* Tabs before center */}
          {tabsBeforeCenter.map((tab) => {
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

          {/* Centered "+" button */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#29e33c] text-[#0b0d10] hover:bg-[#22c55e] transition-all shadow-[0_4px_12px_rgba(41,227,60,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29e33c]/50 focus-visible:ring-offset-2"
              aria-label="Add workout notes"
            >
              {hasNotes && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#f87171] border-2 border-[#0b0d10]" />
              )}
              <Plus size={24} strokeWidth={2.5} />
            </button>
          </div>

          {/* Tabs after center */}
          {tabsAfterCenter.map((tab) => {
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
    <NotesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
