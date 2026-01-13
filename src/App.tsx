import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Auth/Login'
import SignUp from './components/Auth/SignUp'
import Dashboard from '@/pages/Dashboard'
import ActiveWorkout from './pages/ActiveWorkout'
import Progress from '@/pages/Progress'

function AuthWrapper() {
  const { user, loading } = useAuth()
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

  // If logged in, show the main app
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workout" element={<ActiveWorkout />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
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
