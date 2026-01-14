import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Template } from '@/types'
import { Play, ChevronRight, Dumbbell } from 'lucide-react'
import { motion } from 'framer-motion'
import { workoutTemplates } from '@/data/workoutTemplates'
import TopBar from '@/components/TopBar'

export default function Dashboard() {
  const [templates] = useState<Template[]>(workoutTemplates)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '')
  const navigate = useNavigate()

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

  const onStartWorkout = () => {
    if (!selectedTemplate) return
    navigate('/workout', { state: { template: selectedTemplate } })
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0b' }}>
      <TopBar />
      
      <main className="max-w-lg mx-auto p-4 space-y-6">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-8"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ 
              background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
              boxShadow: '0 0 40px rgba(34, 211, 238, 0.3)'
            }}
          >
            <Dumbbell className="w-8 h-8" style={{ color: '#0a0a0b' }} />
          </motion.div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#fafafa' }}>
            Ready to train?
          </h1>
          <p style={{ color: '#a1a1aa' }}>
            Select a workout and crush your goals
          </p>
        </motion.div>

        {/* Template Selection Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl p-5"
          style={{ backgroundColor: '#141416', border: '1px solid #27272a' }}
        >
          {/* Dropdown */}
          <label className="block text-sm font-medium mb-2" style={{ color: '#52525b' }}>
            WORKOUT TEMPLATE
          </label>
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="w-full h-14 px-4 rounded-xl font-semibold text-lg appearance-none cursor-pointer outline-none transition-all"
            style={{ 
              backgroundColor: '#1c1c1f', 
              border: '1px solid #3f3f46',
              color: '#fafafa',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2352525b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '24px'
            }}
          >
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Template Preview */}
        {selectedTemplate && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#141416', border: '1px solid #27272a' }}
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid #27272a' }}>
              <h2 className="font-semibold" style={{ color: '#fafafa' }}>
                {selectedTemplate.name}
              </h2>
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)', color: '#22d3ee' }}
              >
                {selectedTemplate.exercises.length} exercises
              </span>
            </div>

            {/* Exercise List */}
            <div className="p-2">
              {selectedTemplate.exercises.map((ex, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (idx * 0.05), duration: 0.3 }}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{ backgroundColor: 'transparent' }}
                >
                  <span 
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: '#1c1c1f', color: '#22d3ee' }}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: '#fafafa' }}>
                      {ex.name}
                    </p>
                    <p className="text-sm" style={{ color: '#52525b' }}>
                      {ex.sets} sets × {ex.reps} reps
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: '#3f3f46' }} />
                </motion.div>
              ))}
            </div>

            {/* Start Button */}
            <div className="p-4" style={{ borderTop: '1px solid #27272a' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStartWorkout}
                className="w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all"
                style={{ 
                  background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                  color: '#0a0a0b',
                  boxShadow: '0 0 30px rgba(34, 211, 238, 0.3)'
                }}
              >
                <Play className="w-5 h-5" fill="currentColor" />
                Start Workout
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Quick Stats or Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="rounded-2xl p-4"
          style={{ 
            background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
            border: '1px solid rgba(34, 211, 238, 0.2)'
          }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-medium mb-1" style={{ color: '#22d3ee' }}>Pro Tip</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#a1a1aa' }}>
                Track your RPE (Rate of Perceived Exertion) on a scale of 1-10 for each set. 
                This helps you monitor intensity and optimize recovery.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
