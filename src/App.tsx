
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import TemplatesPage from '@/pages/Templates'
import History from '@/pages/History'

import ExerciseMediaManager from '@/components/ExerciseMediaManager'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />

      <Route path="/admin/media" element={<ProtectedRoute><ExerciseMediaManager /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}
