import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function SignUp(props: any) {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    // Many setups require email confirmation; still send user to login.
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-6">
          <h1 className="text-white text-3xl font-semibold">Create account</h1>
          <p className="text-[#9a9fa4] text-sm mt-2">Start tracking your workouts</p>
        </div>

        <form onSubmit={onSubmit} className="rounded-[24px] bg-[#141416] border border-white/5 p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-white/70 text-xs">Full name</label>
            <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-[14px] px-3">
              <User className="w-4 h-4 text-white/40" />
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-transparent py-3 text-white/90 outline-none"
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-white/70 text-xs">Email</label>
            <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-[14px] px-3">
              <Mail className="w-4 h-4 text-white/40" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent py-3 text-white/90 outline-none"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-white/70 text-xs">Password</label>
            <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-[14px] px-3">
              <Lock className="w-4 h-4 text-white/40" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-full bg-transparent py-3 text-white/90 outline-none"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-[14px] bg-[#29e33c] text-black font-semibold disabled:opacity-60"
            style={{ boxShadow: '0 0 22px rgba(41,227,60,0.25)' }}
          >
            {loading ? 'Creating...' : 'Sign up'}
          </button>

          <p className="text-white/50 text-sm">
            Already have an account?{' '}
            <Link to="/" className="text-[#29e33c] hover:underline">Sign in</Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
