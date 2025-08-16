
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '@/firebase'

export default function TopBar() {
  const location = useLocation()
  
  const isActive = (path: string) => location.pathname === path

  return (
    <div className="sticky top-0 z-10 bg-dark backdrop-blur border-b border-accent shadow-soft transition-all duration-300">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <div className="font-semibold text-lg text-white">
            Workout App
          </div>
          
          {/* Navigation Links */}
          <nav className="flex items-center gap-4">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                isActive('/') 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-secondary hover:text-primary hover:bg-white/10'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/library" 
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                isActive('/library') 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-secondary hover:text-primary hover:bg-white/10'
              }`}
            >
              Library
            </Link>
            <Link 
              to="/progress" 
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                isActive('/progress') 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-secondary hover:text-primary hover:bg-white/10'
              }`}
            >
              Progress
            </Link>
          </nav>
        </div>
        
        <button 
          onClick={() => signOut(auth)} 
          className="text-sm font-medium text-secondary hover:text-primary transition-all duration-200 hover:scale-105"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
