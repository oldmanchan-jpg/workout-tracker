import { Suspense, Component, ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { useProfile } from './hooks/useProfile'

// Pages
import Dashboard from './pages/Dashboard'
import ActiveWorkout from './pages/ActiveWorkout'
import Progress from './pages/Progress'
import Admin from './pages/Admin'
import Login from './components/Auth/Login'
import SignUp from './components/Auth/SignUp'
import PendingApproval from './components/PendingApproval'
import SwipeablePages from './components/SwipeablePages'

// ============ ERROR BOUNDARY ============
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          backgroundColor: '#111', 
          color: '#fff', 
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h1 style={{ color: '#f44', marginBottom: '1rem' }}>App crashed</h1>
          <p style={{ marginBottom: '1rem' }}>
            <strong>String(error):</strong>
          </p>
          <pre style={{ 
            background: '#222', 
            padding: '1rem', 
            borderRadius: '8px',
            overflow: 'auto',
            marginBottom: '1rem'
          }}>
            {String(this.state.error)}
          </pre>
          <p style={{ marginBottom: '1rem' }}>
            <strong>error.stack:</strong>
          </p>
          <pre style={{ 
            background: '#222', 
            padding: '1rem', 
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {this.state.error?.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

// ============ LOADING SCREEN ============
function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#111',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid #333',
          borderTopColor: '#29e33c',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <p>{message}</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ============ MOUNT INDICATOR ============
function MountIndicator() {
  return (
    <div style={{
      position: 'fixed',
      bottom: '8px',
      left: '8px',
      background: '#29e33c',
      color: '#000',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: 'bold',
      zIndex: 9999,
      fontFamily: 'system-ui, sans-serif'
    }}>
      ✓ Mounted
    </div>
  )
}

// ============ PROTECTED ROUTE ============
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const { profile, isAdmin, loading: profileLoading } = useProfile()

  // NEVER return null - always show something
  if (authLoading) {
    return <LoadingScreen message="Checking auth..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (profileLoading) {
    return <LoadingScreen message="Loading profile..." />
  }

  // Check if client is inactive (not admin)
  if (profile && !isAdmin && !profile.is_active) {
    return <PendingApproval />
  }

  return <>{children}</>
}

// ============ APP ROUTES ============
function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen message="Initializing..." />
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignUp />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <SwipeablePages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workout"
        element={
          <ProtectedRoute>
            <ActiveWorkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// ============ MAIN APP ============
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <MountIndicator />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}