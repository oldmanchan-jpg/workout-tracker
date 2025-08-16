
import React, { useState } from 'react'
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, googleProvider } from '@/firebase'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/state/AuthContext'

export default function Login() {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  const onGoogle = async () => {
    setErr(null); setLoading(true)
    try { await signInWithPopup(auth, googleProvider) } 
    catch (e:any) { setErr(e.message) } 
    finally { setLoading(false) }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null); setLoading(true)
    try {
      if (mode === 'signin') await signInWithEmailAndPassword(auth, email, password)
      else await createUserWithEmailAndPassword(auth, email, password)
    } catch (e:any) {
      setErr(e.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, var(--color-green-50) 0%, var(--color-brown-50) 100%)' }}>
      <div className="card p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-primary-dark mb-2">
            {mode === 'signin' ? 'Welcome Back' : 'Get Started'}
          </h1>
          <p className="text-secondary-light">
            {mode === 'signin' ? 'Sign in to continue your fitness journey' : 'Create an account to start logging your workouts'}
          </p>
        </div>

        {/* Google Sign In */}
        <button 
          onClick={onGoogle} 
          disabled={loading}
          className="w-full btn btn-outline mb-6"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <span className="bg-white px-4 text-secondary-light text-sm font-medium">or</span>
          <div className="absolute inset-0 border-t border-green-200" />
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="form-group">
            <input 
              className="input" 
              placeholder="Email address" 
              type="email"
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <input 
              className="input" 
              placeholder="Password" 
              type="password"
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              required 
            />
          </div>
          
          {err && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {err}
            </div>
          )}
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Mode Toggle */}
        <div className="text-center mt-6">
          <p className="text-secondary-light">
            {mode === 'signin' ? (
              <span>
                New here?{' '}
                <button 
                  className="text-primary font-semibold hover:text-primary-dark transition-colors" 
                  onClick={() => setMode('signup')}
                >
                  Create an account
                </button>
              </span>
            ) : (
              <span>
                Have an account?{' '}
                <button 
                  className="text-primary font-semibold hover:text-primary-dark transition-colors" 
                  onClick={() => setMode('signin')}
                >
                  Sign in
                </button>
              </span>
            )}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-green-100 text-center">
          <p className="text-xs text-secondary-light">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
