
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { LogOut } from 'lucide-react'

export default function TopBar() {
  const location = useLocation()
  const { signOut } = useAuth()
  const { isAdmin } = useProfile()
  
  // Hide on workout page - it has its own header
  if (location.pathname === '/workout') {
    return null
  }
  
  const isActive = (path: string) => location.pathname === path

  return (
    <div className="sticky top-0 z-10 bg-dark border-b border-accent shadow-soft">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3">
        {/* Mobile Layout */}
        <div className="flex sm:hidden items-center justify-between">
          <div className="font-semibold text-base text-white">
            Workout App
          </div>
          
          {/* Page Indicators for Mobile */}
          <div className="flex items-center gap-2">
            <Link to="/" className={`w-2 h-2 rounded-full transition-all ${isActive('/') ? 'bg-cyan-400 w-6' : 'bg-gray-600'}`} />
            <Link to="/progress" className={`w-2 h-2 rounded-full transition-all ${isActive('/progress') ? 'bg-cyan-400 w-6' : 'bg-gray-600'}`} />
          </div>

          <button
            onClick={signOut}
            className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="font-semibold text-lg text-white">
              Workout App
            </div>
            
            <nav className="flex items-center gap-4">
              <Link 
                to="/" 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive('/') 
                    ? 'bg-primary text-white' 
                    : 'text-secondary hover:text-primary hover:bg-white/10'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/progress" 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive('/progress') 
                    ? 'bg-primary text-white' 
                    : 'text-secondary hover:text-primary hover:bg-white/10'
                }`}
              >
                Progress
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link
                to="/admin"
                className="text-gray-300 hover:text-cyan-400 transition-colors"
              >
                Admin
              </Link>
            )}
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-secondary hover:text-primary hover:bg-white/10"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
