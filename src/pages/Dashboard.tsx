import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Template } from '@/types'
import { Play, Dumbbell, ChevronRight, Clock, Flame, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import { workoutTemplates } from '@/data/workoutTemplates'
import TopBar from '@/components/TopBar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function Dashboard() {
  const [templates] = useState<Template[]>(workoutTemplates)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '')
  const navigate = useNavigate()

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

  const onStartWorkout = () => {
    if (!selectedTemplate) return
    navigate('/workout', { state: { template: selectedTemplate } })
  }

  // Calculate estimated workout time (rough estimate: 3 min per set)
  const estimatedTime = selectedTemplate 
    ? selectedTemplate.exercises.reduce((acc, ex) => acc + ex.sets * 3, 0)
    : 0

  return (
    <div className="min-h-screen page-container" style={{ backgroundColor: 'var(--bg)' }}>
      <TopBar />
      
      <main className="mx-auto w-full max-w-[420px] px-4 pb-28 pt-4 space-y-4">
        {/* Welcome Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card variant="prominent" className="p-6">
            <p className="text-hp-muted text-sm uppercase tracking-wide mb-2">Welcome back</p>
            <h1 className="text-hp-primary text-2xl font-semibold">
              Ready to <span className="text-hp-accent">Train</span>?
            </h1>
            <p className="text-hp-muted text-sm mt-2">
              Select a workout and crush your goals
            </p>
          </Card>
        </motion.div>

        {/* This Week Summary Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card className="p-5">
            <p className="text-hp-muted text-xs uppercase tracking-wide mb-4">This Week</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-hp-muted text-xs mb-1">Workouts</p>
                <p className="text-hp-primary text-xl font-semibold">3</p>
              </div>
              <div>
                <p className="text-hp-muted text-xs mb-1">Volume</p>
                <p className="text-hp-accent text-xl font-semibold">12,450 kg</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Workout Template Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-hp-primary font-semibold text-lg">Workout Template</h2>
            <span className="text-hp-muted text-sm">{templates.length} available</span>
          </div>

          {/* Template Dropdown */}
          <div className="relative">
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="ui-input w-full px-4 py-4 appearance-none font-medium text-base cursor-pointer"
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-hp-accent rotate-90 pointer-events-none" />
          </div>
          
            {selectedTemplate && (
            <div className="pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex gap-4 text-hp-muted text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>~{estimatedTime} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  <span>{selectedTemplate.exercises.reduce((acc, ex) => acc + ex.sets, 0)} sets</span>
                </div>
              </div>
            </div>
          )}
          </Card>
        </motion.div>

        {/* Exercise Preview List Card */}
        {selectedTemplate && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-hp-primary font-semibold text-lg">
                {selectedTemplate.name}
              </h3>
              <span className="text-hp-muted text-xs uppercase tracking-wide">
                {selectedTemplate.exercises.length} exercises
              </span>
            </div>
            
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {selectedTemplate.exercises.map((ex, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                  style={{ 
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-[#29e33c] flex items-center justify-center text-black font-bold text-sm flex-shrink-0 hp-glow-soft">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-hp-primary font-medium truncate">{ex.name}</p>
                    <p className="text-hp-muted text-sm">
                      {ex.sets} sets × {ex.reps} reps
                      {ex.weight && <span className="text-hp-accent"> • {ex.weight}kg</span>}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-hp-muted flex-shrink-0" />
                </motion.div>
              ))}
            </div>
            </Card>
          </motion.div>
        )}

        {/* Primary CTA - Start Workout Button */}
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={onStartWorkout}
              className="w-full h-14 text-lg rounded-full flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6" fill="currentColor" />
              Start Workout
            </Button>
          </motion.div>
        )}

        {/* Bottom Tip Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="flat" className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#29e33c]/20 flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-hp-accent" />
            </div>
            <div>
              <p className="text-hp-primary font-medium text-sm mb-1">Track Your RPE</p>
              <p className="text-hp-muted text-xs">
                Rate of Perceived Exertion helps monitor your training intensity and prevent overtraining.
              </p>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
