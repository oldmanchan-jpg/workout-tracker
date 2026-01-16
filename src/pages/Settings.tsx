import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Timer, Scale, Palette, Check, Loader2 } from 'lucide-react'
import { useSettings, type UserPreferences } from '../hooks/useSettings'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <div 
        className="sticky top-0 z-10 backdrop-blur-sm"
        style={{ 
          backgroundColor: 'rgba(10, 10, 11, 0.95)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
            style={{
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
          >
            <ArrowLeft size={20} />
          </motion.button>
          
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Settings</h1>
          
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="px-4 py-2 rounded-lg"
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
          </Button>
        </div>
      </div>

      <main className="max-w-lg mx-auto p-4 pb-24 space-y-6">
        {/* Rest Timer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(41, 227, 60, 0.2)' }}
            >
              <Timer size={20} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Default Rest Timer</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Set your preferred rest duration</p>
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
                  className="py-3 rounded-lg font-semibold text-sm transition-all border"
                  style={isSelected 
                    ? { 
                        backgroundColor: 'var(--accent)',
                        color: 'var(--bg)',
                        borderColor: 'var(--accent)',
                        boxShadow: '0 0 15px rgba(41, 227, 60, 0.3)'
                      }
                    : {
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-muted)',
                        borderColor: 'var(--border-subtle)'
                      }
                  }
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'rgba(41, 227, 60, 0.5)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)'
                    }
                  }}
                >
                  {seconds < 60 ? `${seconds}s` : `${seconds / 60}m`}
                </motion.button>
              )
            })}
          </div>

          {/* Custom input */}
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Custom:</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="seconds"
              value={customTimer}
              onChange={(e) => handleCustomTimer(e.target.value)}
              className="ui-input flex-1 h-12 px-4 rounded-lg text-center font-semibold"
              style={{
                borderColor: customTimer ? 'var(--accent)' : 'var(--border-subtle)'
              }}
              min={1}
              max={600}
            />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>sec</span>
          </div>
          </Card>
        </motion.div>

        {/* Weight Unit Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center"
            >
              <Scale size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Weight Unit</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Choose your preferred unit</p>
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
                  className="py-4 rounded-xl font-semibold text-lg transition-all border"
                  style={isSelected 
                    ? { 
                        backgroundColor: '#3b82f6',
                        color: 'var(--text)',
                        borderColor: '#3b82f6',
                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
                      }
                    : {
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-muted)',
                        borderColor: 'var(--border-subtle)'
                      }
                  }
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)'
                    }
                  }}
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
        >
          <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center"
            >
              <Palette size={20} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Theme</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Customize your appearance</p>
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
                  className="py-4 rounded-xl font-semibold text-lg transition-all relative overflow-hidden border"
                  style={isSelected 
                    ? { 
                        borderColor: '#a855f7',
                        backgroundColor: theme === 'dark' ? 'var(--bg-surface)' : '#f4f4f5',
                        color: theme === 'dark' ? 'var(--text)' : '#18181b',
                        boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
                      }
                    : {
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-muted)',
                        borderColor: 'var(--border-subtle)'
                      }
                  }
                >
                  {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                  {theme === 'light' && (
                    <span className="absolute bottom-1 left-0 right-0 text-xs" style={{ color: 'var(--text-muted)' }}>
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
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Settings are synced to your account</p>
        </motion.div>
      </main>
    </div>
  )
}
