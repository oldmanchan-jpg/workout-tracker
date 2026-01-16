import { motion } from 'framer-motion'
import { Mail, Clock, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function PendingApproval(props: any) {
  const onSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-[24px] bg-[#141416] border border-white/5 p-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#29e33c]/20 flex items-center justify-center">
            <Clock className="w-6 h-6 text-[#29e33c]" />
          </div>
          <div>
            <h1 className="text-white text-xl font-semibold">Pending approval</h1>
            <p className="text-[#9a9fa4] text-sm">Your account is awaiting activation.</p>
          </div>
        </div>

        <div className="mt-5 rounded-[16px] bg-black/30 border border-white/5 p-4">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-white/60 mt-0.5" />
            <p className="text-white/70 text-sm leading-relaxed">
              Please contact your coach/admin to activate your profile. Once activated, refresh the page and you’ll be able to log workouts.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex-1 h-11 rounded-[14px] bg-[#1c1c1f] border border-white/5 text-white/80 hover:text-white transition-colors"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="h-11 px-4 rounded-[14px] bg-[#29e33c] text-black font-semibold flex items-center gap-2"
            style={{ boxShadow: '0 0 22px rgba(41,227,60,0.25)' }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </motion.div>
    </div>
  )
}
