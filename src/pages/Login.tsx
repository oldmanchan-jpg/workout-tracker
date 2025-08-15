
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

  if (user) return <Navigate to="/app" replace />

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-soft p-6">
        <h1 className="text-2xl font-semibold mb-2">Welcome</h1>
        <p className="text-gray-500 mb-6">Sign in to start logging your workouts.</p>

        <button onClick={onGoogle} className="w-full rounded-xl border py-2 mb-4">
          {loading ? '...' : 'Continue with Google'}
        </button>

        <div className="relative my-4 text-center">
          <span className="bg-white px-2 text-gray-400">or</span>
          <div className="absolute inset-0 border-t" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full border rounded-xl px-3 py-2" placeholder="Email" type="email"
            value={email} onChange={e=>setEmail(e.target.value)} required />
          <input className="w-full border rounded-xl px-3 py-2" placeholder="Password" type="password"
            value={password} onChange={e=>setPassword(e.target.value)} required />
          {err && <div className="text-red-600 text-sm">{err}</div>}
          <button className="w-full bg-brand.green text-white rounded-xl py-2">{mode==='signin'?'Sign in':'Create account'}</button>
        </form>

        <div className="text-sm text-gray-600 mt-4">
          {mode==='signin' ? (
            <span>New here? <button className="text-brand.green" onClick={()=>setMode('signup')}>Create an account</button></span>
          ) : (
            <span>Have an account? <button className="text-brand.green" onClick={()=>setMode('signin')}>Sign in</button></span>
          )}
        </div>
      </div>
    </div>
  )
}
