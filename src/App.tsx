import { useState } from 'react'
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

function AuthWrapper() {
  const { user, loading } = useAuth()
  const { profile, loading: profileLoading, isAdmin } = useProfile()
  const [showSignUp, setShowSignUp] = useState(false)

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
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
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </SwipeablePages>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  )
}

export default App
