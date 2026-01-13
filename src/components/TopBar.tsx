
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut } from 'lucide-react'

export default function TopBar() {
  const location = useLocation()
  const { signOut } = useAuth()
  
  const isActive = (path: string) => location.pathname === path

  return (
    <div className="sticky top-0 z-10 bg-dark border-b border-accent shadow-soft">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
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
        
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-secondary hover:text-primary hover:bg-white/10"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  )
}
