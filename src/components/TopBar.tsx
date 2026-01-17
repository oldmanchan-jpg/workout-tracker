import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function TopBar() {
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  const onSignOut = async () => {
    try {
      setSigningOut(true)
      await supabase.auth.signOut()
      navigate('/')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div 
      className="sticky top-0 z-50 bg-[#0b0d10]/95 backdrop-blur-xl border-b border-white/[0.06]"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
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

    </div>
  )
}
