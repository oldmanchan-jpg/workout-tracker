import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface NotesModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Get localStorage key for notes
 * Format: workout_notes::<date>::<workoutId>
 * Falls back to route + date if workoutId not available
 */
function getNotesKey(): string {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const location = window.location.pathname
  // Use route as workoutId fallback (e.g., '/workout' or '/dashboard')
  const workoutId = location === '/workout' ? 'workout' : location.replace('/', '') || 'general'
  return `workout_notes::${today}::${workoutId}`
}

export default function NotesModal({ isOpen, onClose }: NotesModalProps) {
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()

  // Load notes from localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      const key = getNotesKey()
      const saved = localStorage.getItem(key)
      setNotes(saved || '')
      setIsLoading(false)
    }
  }, [isOpen, location.pathname])

  const handleSave = () => {
    const key = getNotesKey()
    if (notes.trim()) {
      localStorage.setItem(key, notes.trim())
    } else {
      // Remove empty notes
      localStorage.removeItem(key)
    }
    onClose()
  }

  const handleCancel = () => {
    // Reset to saved value
    const key = getNotesKey()
    const saved = localStorage.getItem(key)
    setNotes(saved || '')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="fixed inset-0 z-[1040] bg-black/60 backdrop-blur-sm"
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1050] max-w-[420px] mx-auto"
            style={{ marginTop: 'env(safe-area-inset-top)', marginBottom: 'env(safe-area-inset-bottom)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-[28px] bg-[rgba(11,13,16,0.985)] backdrop-blur-2xl backdrop-saturate-150 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.03)_inset] p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-hp-primary text-xl font-semibold">Workout Notes</h2>
                <button
                  onClick={handleCancel}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Textarea */}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your workout notes here..."
                disabled={isLoading}
                className="w-full min-h-[200px] max-h-[400px] px-4 py-3 rounded-[16px] bg-white/5 border border-white/[0.08] text-hp-primary placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#29e33c]/50 focus:border-[#29e33c]/30 resize-y transition-all"
                style={{
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
              />

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCancel}
                  className="flex-1 h-11 px-4 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1 h-11 px-4 rounded-full bg-[#29e33c] text-[#0b0d10] hover:bg-[#22c55e] transition-colors font-semibold text-sm shadow-[0_4px_12px_rgba(41,227,60,0.3)]"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
