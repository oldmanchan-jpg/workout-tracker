
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '@/firebase'

export default function TopBar() {
  const location = useLocation()
  
  const isActive = (path: string) => location.pathname === path

  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <div className="font-semibold">Workout App</div>
          
          {/* Navigation Links */}
          <nav className="flex items-center gap-4">
            <Link 
              to="/app" 
              className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                isActive('/app') 
                  ? 'bg-primary text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/templates" 
              className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                isActive('/templates') 
                  ? 'bg-primary text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Templates
            </Link>
            <Link 
              to="/history" 
              className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                isActive('/history') 
                  ? 'bg-primary text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              History
            </Link>

            <Link 
              to="/admin/media" 
              className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                isActive('/admin/media') 
                  ? 'bg-primary text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Admin
            </Link>
          </nav>
        </div>
        
        <button 
          onClick={() => signOut(auth)} 
          className="text-sm px-3 py-1 rounded-lg border hover:bg-gray-50 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
