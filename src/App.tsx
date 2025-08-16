
import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/state/AuthContext'
import { ToastProvider } from '@/components/Toaster'
import ErrorBoundary from '@/components/ErrorBoundary'
import LoadingSpinner from '@/components/LoadingSpinner'
import { SkipLink } from '@/components/Accessibility'
import PerformanceMonitor from '@/components/PerformanceMonitor'

// Lazy load pages for better performance
const Login = lazy(() => import('@/pages/Login'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Progress = lazy(() => import('@/pages/Progress'))
const Library = lazy(() => import('@/pages/Library'))

// Loading component for lazy-loaded pages
function PageLoader() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <LoadingSpinner size="xl" color="primary" text="Loading..." />
    </div>
  )
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <LoadingSpinner size="xl" color="primary" text="Authenticating..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/progress" element={
        <ProtectedRoute>
          <Progress />
        </ProtectedRoute>
      } />
      <Route path="/library" element={
        <ProtectedRoute>
          <Library />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <SkipLink />
            <Suspense fallback={<PageLoader />}>
              <AppRoutes />
            </Suspense>
            <PerformanceMonitor />
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
