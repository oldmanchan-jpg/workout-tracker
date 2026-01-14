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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0b' }}>
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0b' }}>
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ backgroundColor: '#0a0a0b', borderBottom: '1px solid #27272a' }}>
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: '#a1a1aa' }}
          >
            <ArrowLeft size={24} />
          </motion.button>
          
          <h1 className="text-xl font-bold text-white">Settings</h1>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
            style={{
              background: hasChanges ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : '#27272a',
              color: hasChanges ? 'white' : '#71717a',
              boxShadow: hasChanges ? '0 0 20px rgba(249, 115, 22, 0.3)' : 'none'
            }}
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
          className="rounded-2xl p-5"
          style={{ backgroundColor: '#141416', border: '1px solid #27272a' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#22c55e20' }}
            >
              <Timer size={20} style={{ color: '#4ade80' }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Default Rest Timer</h2>
              <p className="text-sm" style={{ color: '#71717a' }}>Set your preferred rest duration</p>
            </div>
          </div>

          {/* Preset buttons */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {REST_TIMER_PRESETS.map((seconds) => (
              <motion.button
                key={seconds}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTimerPreset(seconds)}
                className="py-3 rounded-xl font-semibold text-sm transition-all"
                style={{
                  backgroundColor: localPrefs.restTimerDefault === seconds && !customTimer
                    ? '#22c55e'
                    : '#1c1c1f',
                  color: localPrefs.restTimerDefault === seconds && !customTimer
                    ? '#0a0a0b'
                    : '#a1a1aa',
                  border: '1px solid',
                  borderColor: localPrefs.restTimerDefault === seconds && !customTimer
                    ? '#22c55e'
                    : '#27272a'
                }}
              >
                {seconds < 60 ? `${seconds}s` : `${seconds / 60}m`}
              </motion.button>
            ))}
          </div>

          {/* Custom input */}
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: '#71717a' }}>Custom:</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="seconds"
              value={customTimer}
              onChange={(e) => handleCustomTimer(e.target.value)}
              className="flex-1 h-12 px-4 rounded-xl text-center font-semibold outline-none transition-all"
              style={{
                backgroundColor: '#1c1c1f',
                border: '1px solid',
                borderColor: customTimer ? '#22c55e' : '#27272a',
                color: '#fafafa'
              }}
              min={1}
              max={600}
            />
            <span className="text-sm" style={{ color: '#71717a' }}>sec</span>
          </div>
        </motion.div>

        {/* Weight Unit Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5"
          style={{ backgroundColor: '#141416', border: '1px solid #27272a' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#3b82f620' }}
            >
              <Scale size={20} style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Weight Unit</h2>
              <p className="text-sm" style={{ color: '#71717a' }}>Choose your preferred unit</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(['kg', 'lbs'] as const).map((unit) => (
              <motion.button
                key={unit}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLocalPrefs(prev => ({ ...prev, weightUnit: unit }))}
                className="py-4 rounded-xl font-semibold text-lg transition-all"
                style={{
                  backgroundColor: localPrefs.weightUnit === unit ? '#3b82f6' : '#1c1c1f',
                  color: localPrefs.weightUnit === unit ? 'white' : '#a1a1aa',
                  border: '1px solid',
                  borderColor: localPrefs.weightUnit === unit ? '#3b82f6' : '#27272a',
                  boxShadow: localPrefs.weightUnit === unit ? '0 0 20px rgba(59, 130, 246, 0.3)' : 'none'
                }}
              >
                {unit === 'kg' ? 'Kilograms (kg)' : 'Pounds (lbs)'}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Theme Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-5"
          style={{ backgroundColor: '#141416', border: '1px solid #27272a' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#a855f720' }}
            >
              <Palette size={20} style={{ color: '#c084fc' }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Theme</h2>
              <p className="text-sm" style={{ color: '#71717a' }}>Customize your appearance</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(['dark', 'light'] as const).map((theme) => (
              <motion.button
                key={theme}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLocalPrefs(prev => ({ ...prev, theme }))}
                className="py-4 rounded-xl font-semibold text-lg transition-all relative overflow-hidden"
                style={{
                  backgroundColor: localPrefs.theme === theme 
                    ? (theme === 'dark' ? '#1c1c1f' : '#f4f4f5') 
                    : '#1c1c1f',
                  color: localPrefs.theme === theme 
                    ? (theme === 'dark' ? '#fafafa' : '#18181b')
                    : '#71717a',
                  border: '2px solid',
                  borderColor: localPrefs.theme === theme ? '#a855f7' : '#27272a',
                  boxShadow: localPrefs.theme === theme ? '0 0 20px rgba(168, 85, 247, 0.3)' : 'none'
                }}
              >
                {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                {theme === 'light' && (
                  <span 
                    className="absolute bottom-1 left-0 right-0 text-xs"
                    style={{ color: '#a1a1aa' }}
                  >
                    Coming soon
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-4"
          style={{ color: '#52525b' }}
        >
          <p className="text-sm">Settings are synced to your account</p>
        </motion.div>
      </main>
    </div>
  )
}
