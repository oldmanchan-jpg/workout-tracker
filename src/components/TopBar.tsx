import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Dumbbell, TrendingUp, Shield, Settings, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useProfile } from '@/hooks/useProfile'

const tabs = [
  { path: '/dashboard', label: 'Dashboard', icon: Dumbbell, adminOnly: false },
  { path: '/progress', label: 'Progress', icon: TrendingUp, adminOnly: false },
  { path: '/admin', label: 'Admin', icon: Shield, adminOnly: true },
  { path: '/settings', label: 'Settings', icon: Settings, adminOnly: false },
] as const

export default function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAdmin } = useProfile?.() ?? ({ isAdmin: false } as any)
  const [signingOut, setSigningOut] = useState(false)

  const currentPath = location.pathname

  const visibleTabs = tabs.filter(t => !t.adminOnly || isAdmin)

  const onSignOut = async () => {
    try {
      setSigningOut(true)
      await supabase.auth.signOut()
      navigate('/')
    } finally {
      setSigningOut(false)
    }
  }

  // If app uses '/' as dashboard, treat it as dashboard for active styling
  const isActive = (path: string) => {
    if (path === '/dashboard' && currentPath === '/') return true
    return currentPath === path
  }

  return (
    <div className="sticky top-0 z-20 bg-black/20 backdrop-blur-md">
      <div className="max-w-[420px] mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-full bg-[#29e33c]/20 flex items-center justify-center hp-glow-soft"
          >
            <Dumbbell className="w-5 h-5 text-hp-accent" />
          </div>
          <div>
            <p className="text-hp-primary font-semibold leading-tight">Workout Tracker</p>
            <p className="text-hp-muted text-[11px] leading-tight">HealthPulse style</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onSignOut}
          disabled={signingOut}
          className="h-9 px-3 rounded-full bg-white/5 border border-white/6 text-hp-muted hover:text-hp-primary transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-medium">Logout</span>
        </motion.button>
      </div>

      <div className="max-w-[420px] mx-auto px-4 pb-3">
        <div className="w-full h-[58px] rounded-full bg-white/5 border border-white/6 px-6 flex items-center justify-between">
          {visibleTabs.map(t => {
            const Icon = t.icon
            const active = isActive(t.path)
            return (
              <button
                key={t.path}
                type="button"
                onClick={() => navigate(t.path)}
                className={
                  active
                    ? 'flex flex-col items-center gap-1 text-hp-accent'
                    : 'flex flex-col items-center gap-1 text-hp-muted hover:text-hp-primary transition-colors'
                }
                aria-label={t.label}
              >
                <Icon className="w-5 h-5" />
                {active ? <span className="h-1 w-6 rounded-full bg-hp-accent hp-glow-soft" /> : <span className="h-1 w-6" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
