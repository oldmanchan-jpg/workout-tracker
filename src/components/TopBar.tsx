import { useLocation, useNavigate } from 'react-router-dom'
import { Home, TrendingUp, Shield, LogOut, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'

export default function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut, user } = useAuth()
  const { isAdmin } = useProfile()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  // Define navigation items
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/progress', icon: TrendingUp, label: 'Progress' },
    ...(isAdmin ? [{ path: '/admin', icon: Shield, label: 'Admin' }] : []),
  ]

  return (
    <>
      {/* Top Header - Minimal */}
      <header className="sticky top-0 z-30 bg-black/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#29e33c] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">W</span>
            </div>
            <span className="text-white font-semibold">Workout</span>
          </div>

          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#282a2c] flex items-center justify-center border-2 border-[#29e33c]/30">
              <User className="w-4 h-4 text-[#9a9fa4]" />
            </div>

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className="w-8 h-8 rounded-full bg-[#282a2c] flex items-center justify-center text-[#9a9fa4] hover:text-white hover:bg-[#29e33c]/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Navigation - Like Figma Design */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#282a2c] border-t border-white/5 safe-area-bottom">
        <div className="max-w-lg mx-auto px-6 py-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const active = isActive(item.path)
              const Icon = item.icon

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="relative flex flex-col items-center py-2 px-4 min-w-[64px]"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      active 
                        ? 'bg-[#29e33c]/20' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <Icon 
                      className={`w-5 h-5 transition-colors ${
                        active ? 'text-[#29e33c]' : 'text-[#9a9fa4]'
                      }`} 
                    />
                  </motion.div>
                  
                  <span className={`text-xs mt-1 transition-colors ${
                    active ? 'text-[#29e33c]' : 'text-[#9a9fa4]'
                  }`}>
                    {item.label}
                  </span>

                  {/* Active Indicator */}
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-1 bg-[#29e33c] rounded-b-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Bottom Spacer for Fixed Nav */}
      <div className="h-20" />
    </>
  )
}
