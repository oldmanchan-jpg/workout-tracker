
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import Progress from '@/pages/Progress'
import Library from '@/pages/Library'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/library" element={<Library />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
