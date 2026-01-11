import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { UserPlus } from 'lucide-react'

interface SignUpProps {
  onSwitchToLogin: () => void
}

export default function SignUp({ onSwitchToLogin }: SignUpProps) {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setSuccess(false)

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const { error } = await signUp(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      setTimeout(() => {
        onSwitchToLogin()
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Start tracking your workouts today</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-8 shadow-xl">
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="you@example.com"
                disabled={loading || success}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={loading || success}
              />
              <p className="text-gray-500 text-xs mt-1">At least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={loading || success}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg">
                <p className="text-green-400 text-sm">Account created! Redirecting to login...</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : success ? 'Success!' : 'Sign Up'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-orange-500 hover:text-orange-400 font-medium"
              >
                Log In
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
