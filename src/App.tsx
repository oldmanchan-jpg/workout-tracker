import { Component, ErrorInfo, ReactNode, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { useProfile } from './hooks/useProfile'
import Login from './components/Auth/Login'
import SignUp from './components/Auth/SignUp'
import PendingApproval from './components/PendingApproval'
import SwipeablePages from './components/SwipeablePages'
import Dashboard from '@/pages/Dashboard'
import ActiveWorkout from './pages/ActiveWorkout'
import Progress from '@/pages/Progress'
import Admin from './pages/Admin'
import Settings from './pages/Settings'

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null; errorInfo: ErrorInfo | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { error: null, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.error) {
      const error = this.state.error
      return (
        <div className="min-h-screen bg-[#010101] text-white/70 p-8 overflow-auto">
          <h1 className="text-2xl font-bold mb-4 text-white">App crashed</h1>
          
          <div className="space-y-4">
            {error.message && (
              <div>
                <h2 className="text-lg font-semibold mb-2 text-white">error.message:</h2>
                <pre className="text-xs text-white/80 overflow-auto max-w-full bg-black/30 p-4 rounded border border-white/10">
                  {error.message}
                </pre>
              </div>
            )}

            {error.stack && (
              <div>
                <h2 className="text-lg font-semibold mb-2 text-white">error.stack:</h2>
                <pre className="text-xs text-white/80 overflow-auto max-w-full max-h-96 bg-black/30 p-4 rounded border border-white/10">
                  {error.stack}
                </pre>
              </div>
            )}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function AuthedApp() {
  const { profile, loading: profileLoading, isAdmin } = useProfile()

  // Check if profile is inactive (and user is not admin)
  if (!profileLoading && profile && !profile.is_active && !isAdmin) {
    return <PendingApproval />
  }

  // If logged in, show the main app
  return (
    <Router>
      <SwipeablePages>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workout" element={<ActiveWorkout />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </SwipeablePages>
    </Router>
  )
}

function AuthWrapper() {
  const { user, loading } = useAuth()
  const [showSignUp, setShowSignUp] = useState(false)

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#010101] text-white/70">
        Loading…
      </div>
    )
  }

  // If not logged in, show auth screens
  if (!user) {
    return showSignUp ? (
      <SignUp onSwitchToLogin={() => setShowSignUp(false)} />
    ) : (
      <Login onSwitchToSignUp={() => setShowSignUp(true)} />
    )
  }

  // If logged in, render AuthedApp which handles profile logic
  return <AuthedApp />
}

function App() {
  return (
    <>
      <ErrorBoundary>
        <AuthProvider>
          <AuthWrapper />
        </AuthProvider>
      </ErrorBoundary>
      <div className="fixed bottom-2 left-2 text-xs text-white/30 pointer-events-none z-50">
        Mounted OK
      </div>
    </>
  )
}

export default App
