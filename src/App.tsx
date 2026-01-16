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
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#010101] text-white/70 p-8">
          <h1 className="text-2xl font-bold mb-4 text-white">App crashed</h1>
          <p className="mb-4 text-red-400">{this.state.error.message}</p>
          {this.state.error.stack && (
            <pre className="text-xs text-white/50 overflow-auto max-w-full max-h-96 bg-black/20 p-4 rounded">
              {this.state.error.stack}
            </pre>
          )}
        </div>
      )
    }
    return this.props.children
  }
}

function AuthWrapper() {
  const { user, loading } = useAuth()
  const { profile, loading: profileLoading, isAdmin } = useProfile()
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

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthWrapper />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
