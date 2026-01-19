import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Play, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Template } from '../types'
import { fetchTemplatesForCurrentUserFromSupabase } from '../services/workoutService'
import BottomNav from '../components/BottomNav'
import { WorkoutShell } from '../workout/components/WorkoutShell'

// Template Picker Component - handles template selection UI
function TemplatePicker({ 
  templates, 
  templatesLoading,
  templatesError,
  selectedTemplateId, 
  onTemplateChange, 
  onStartWorkout 
}: { 
  templates: Template[]
  templatesLoading: boolean
  templatesError?: string | null
  selectedTemplateId: string
  onTemplateChange: (id: string) => void
  onStartWorkout: (template: Template) => void
}) {
  const navigate = useNavigate()
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

  return (
    <div className="min-h-screen hp-bg page-container p-4">
      <div className="mx-auto w-full max-w-[420px] pt-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 flex items-center justify-center rounded-full hp-pill text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="hp-title text-lg font-semibold flex-1 text-center">Start Workout</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Template Selection Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hp-card p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="hp-title font-semibold text-lg">Select Template</h2>
            <span className="hp-muted text-sm">{templates.length} available</span>
          </div>

          {/* Template Dropdown */}
          {templatesLoading ? (
            <div className="ui-input w-full px-4 py-4 font-medium text-base bg-black/20 border-white/10 text-white/80">
              Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="ui-input w-full px-4 py-4 bg-black/20 border-white/10 text-center">
              <div className="hp-title font-semibold">No templates assigned yet</div>
              <div className="hp-muted text-sm mt-1">Contact your coach to get started</div>
              {templatesError ? (
                <div className="hp-muted text-xs mt-2 opacity-70">{templatesError}</div>
              ) : null}
            </div>
          ) : (
            <div className="relative">
              <select
                value={selectedTemplateId}
                onChange={(e) => onTemplateChange(e.target.value)}
                className="ui-input w-full px-4 py-4 appearance-none font-medium text-base cursor-pointer bg-black/20 border-white/10 text-white"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id} className="bg-[#141416]">
                    {t.name}
                  </option>
                ))}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#29e33c] rotate-90 pointer-events-none" />
            </div>
          )}

          {/* Start Workout Button */}
          {selectedTemplate && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStartWorkout(selectedTemplate)}
              className="w-full h-14 bg-[#29e33c] text-black font-bold text-lg rounded-full flex items-center justify-center gap-3 hp-glow-soft"
            >
              <Play className="w-6 h-6" fill="currentColor" />
              Start Workout
            </motion.button>
          )}
        </motion.div>
      </div>
      <BottomNav />
    </div>
  )
}

// Main component - only manages state and renders appropriate child
export default function ActiveWorkout() {
  const location = useLocation()
  const templateFromState = location.state?.template as Template | undefined

  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [activeTemplate, setActiveTemplate] = useState<Template | undefined>(templateFromState)
  const [templatesLoading, setTemplatesLoading] = useState<boolean>(true)
  const [templatesError, setTemplatesError] = useState<string | null>(null)

  // Load templates on mount (RLS-filtered)
  useEffect(() => {
    let cancelled = false

    const loadTemplates = async () => {
      setTemplatesLoading(true)
      setTemplatesError(null)
      try {
        const list = await fetchTemplatesForCurrentUserFromSupabase()
        if (cancelled) return

        setTemplates(list)

        // Preserve existing selection behavior (keep if valid, otherwise fall back)
        setSelectedTemplateId(prev => {
          if (list.length === 0) return ''
          if (!prev || !list.find(t => t.id === prev)) {
            return list[0].id
          }
          return prev
        })
      } catch (err) {
        console.error('Failed to load templates from Supabase:', err)
        if (cancelled) return
        setTemplates([])
        setSelectedTemplateId('')
        setTemplatesError('Failed to load templates')
      } finally {
        if (!cancelled) setTemplatesLoading(false)
      }
    }

    loadTemplates()
    return () => {
      cancelled = true
    }
  }, [])

  // Render template picker if no template selected, otherwise render workout session
  if (!activeTemplate) {
    return (
      <TemplatePicker
        templates={templates}
        templatesLoading={templatesLoading}
        templatesError={templatesError}
        selectedTemplateId={selectedTemplateId}
        onTemplateChange={setSelectedTemplateId}
        onStartWorkout={setActiveTemplate}
      />
    )
  }

  return (
    <div className="min-h-screen hp-bg page-container">
      <WorkoutShell template={activeTemplate} />
      <BottomNav />
    </div>
  )
}
