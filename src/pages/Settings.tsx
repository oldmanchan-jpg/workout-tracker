import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Timer, Scale, Palette, Check, Loader2 } from 'lucide-react'
import { useSettings, type UserPreferences } from '../hooks/useSettings'

const REST_TIMER_PRESETS = [30, 60, 90, 120, 180]

export default function Settings() {
  const navigate = useNavigate()
  const { preferences, loading, saving, updatePreferences } = useSettings()
  
  // Local state for editing
  const [localPrefs, setLocalPrefs] = useState<UserPreferences>(preferences)
  const [customTimer, setCustomTimer] = useState('')
  const [showSaved, setShowSaved] = useState(false)
  
  // Sync local state when preferences load
  useEffect(() => {
    setLocalPrefs(preferences)
    // Check if current timer is a custom value
    if (!REST_TIMER_PRESETS.includes(preferences.restTimerDefault)) {
      setCustomTimer(String(preferences.restTimerDefault))
    }
  }, [preferences])

  const handleSave = async () => {
    const { error } = await updatePreferences(localPrefs)
    if (!error) {
      setShowSaved(true)
      setTimeout(() => setShowSaved(false), 2000)
    }
  }

  const handleTimerPreset = (seconds: number) => {
    setLocalPrefs(prev => ({ ...prev, restTimerDefault: seconds }))
    setCustomTimer('')
  }

  const handleCustomTimer = (value: string) => {
    setCustomTimer(value)
    const seconds = parseInt(value)
    if (!isNaN(seconds) && seconds > 0 && seconds <= 600) {
      setLocalPrefs(prev => ({ ...prev, restTimerDefault: seconds }))
    }
  }

  const hasChanges = JSON.stringify(localPrefs) !== JSON.stringify(preferences)

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#29e33c]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1c1c1f] text-[#9a9fa4] hover:text-white transition-colors border border-white/5"
          >
            <ArrowLeft size={20} />
          </motion.button>
          
          <h1 className="text-xl font-bold text-white">Settings</h1>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`px-4 py-2 rounded-[10px] font-semibold transition-all disabled:opacity-50 ${
              hasChanges 
                ? 'bg-[#29e33c] text-black' 
                : 'bg-[#1c1c1f] text-[#9a9fa4] border border-white/5'
            }`}
            style={hasChanges ? { boxShadow: '0 0 20px rgba(41, 227, 60, 0.3)' } : {}}
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : showSaved ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1"
              >
                <Check size={18} />
                Saved
              </motion.div>
            ) : (
              'Save'
            )}
          </motion.button>
        </div>
      </div>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        {/* Rest Timer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#141416] rounded-[21px] p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-full bg-[#29e33c]/20 flex items-center justify-center"
            >
              <Timer size={20} className="text-[#29e33c]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Default Rest Timer</h2>
              <p className="text-sm text-[#9a9fa4]">Set your preferred rest duration</p>
            </div>
          </div>

          {/* Preset buttons */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {REST_TIMER_PRESETS.map((seconds) => {
              const isSelected = localPrefs.restTimerDefault === seconds && !customTimer
              return (
                <motion.button
                  key={seconds}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTimerPreset(seconds)}
                  className={`py-3 rounded-[10px] font-semibold text-sm transition-all border ${
                    isSelected
                      ? 'bg-[#29e33c] text-black border-[#29e33c]'
                      : 'bg-[#1c1c1f] text-[#9a9fa4] border-white/5 hover:border-[#29e33c]/50'
                  }`}
                  style={isSelected ? { boxShadow: '0 0 15px rgba(41, 227, 60, 0.3)' } : {}}
                >
                  {seconds < 60 ? `${seconds}s` : `${seconds / 60}m`}
                </motion.button>
              )
            })}
          </div>

          {/* Custom input */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#9a9fa4]">Custom:</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="seconds"
              value={customTimer}
              onChange={(e) => handleCustomTimer(e.target.value)}
              className={`flex-1 h-12 px-4 rounded-[10px] text-center font-semibold outline-none transition-all bg-[#1c1c1f] text-white border ${
                customTimer ? 'border-[#29e33c]' : 'border-white/5'
              } focus:border-[#29e33c]`}
              min={1}
              max={600}
            />
            <span className="text-sm text-[#9a9fa4]">sec</span>
          </div>
        </motion.div>

        {/* Weight Unit Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#141416] rounded-[21px] p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center"
            >
              <Scale size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Weight Unit</h2>
              <p className="text-sm text-[#9a9fa4]">Choose your preferred unit</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(['kg', 'lbs'] as const).map((unit) => {
              const isSelected = localPrefs.weightUnit === unit
              return (
                <motion.button
                  key={unit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLocalPrefs(prev => ({ ...prev, weightUnit: unit }))}
                  className={`py-4 rounded-[12px] font-semibold text-lg transition-all border ${
                    isSelected
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-[#1c1c1f] text-[#9a9fa4] border-white/5 hover:border-blue-500/50'
                  }`}
                  style={isSelected ? { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' } : {}}
                >
                  {unit === 'kg' ? 'Kilograms (kg)' : 'Pounds (lbs)'}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Theme Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#141416] rounded-[21px] p-5 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center"
            >
              <Palette size={20} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Theme</h2>
              <p className="text-sm text-[#9a9fa4]">Customize your appearance</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(['dark', 'light'] as const).map((theme) => {
              const isSelected = localPrefs.theme === theme
              return (
                <motion.button
                  key={theme}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLocalPrefs(prev => ({ ...prev, theme }))}
                  className={`py-4 rounded-[12px] font-semibold text-lg transition-all relative overflow-hidden border ${
                    isSelected 
                      ? 'border-purple-500' 
                      : 'border-white/5'
                  } ${
                    isSelected 
                      ? (theme === 'dark' ? 'bg-[#1c1c1f] text-white' : 'bg-[#f4f4f5] text-[#18181b]')
                      : 'bg-[#1c1c1f] text-[#9a9fa4]'
                  }`}
                  style={isSelected ? { boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' } : {}}
                >
                  {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                  {theme === 'light' && (
                    <span className="absolute bottom-1 left-0 right-0 text-xs text-[#9a9fa4]">
                      Coming soon
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-4"
        >
          <p className="text-sm text-[#9a9fa4]">Settings are synced to your account</p>
        </motion.div>
      </main>
    </div>
  )
}
