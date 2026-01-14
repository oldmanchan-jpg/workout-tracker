import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Template } from '@/types'
import { Play, Dumbbell, ChevronRight, Clock, Flame, Target } from 'lucide-react'
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

  // Calculate estimated workout time (rough estimate: 3 min per set)
  const estimatedTime = selectedTemplate 
    ? selectedTemplate.exercises.reduce((acc, ex) => acc + ex.sets * 3, 0)
    : 0

  return (
    <div className="min-h-screen bg-black">
      <TopBar />
      
      <main className="max-w-lg mx-auto px-4 pb-8 space-y-6">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-4"
        >
          <p className="text-[#9a9fa4] text-sm font-medium">Welcome back</p>
          <h1 className="text-white text-2xl font-semibold mt-1">
            Ready to <span className="text-[#29e33c]">Train</span>?
          </h1>
          <p className="text-[#9a9fa4] text-sm mt-2">
            Select a workout and crush your goals
          </p>
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-[#282a2c] rounded-[21px] p-4"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#29e33c]/20 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-[#29e33c]" />
              </div>
              <div>
                <p className="text-[#9a9fa4] text-xs">This Week</p>
                <p className="text-white font-semibold text-lg">3 Workouts</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[#9a9fa4] text-xs">Volume</p>
              <p className="text-[#29e33c] font-semibold text-lg">12,450 kg</p>
            </div>
          </div>
        </motion.div>

        {/* Template Selection */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-lg">Workout Template</h2>
            <span className="text-[#9a9fa4] text-sm">{templates.length} available</span>
          </div>

          {/* Template Dropdown */}
          <div className="relative">
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full px-4 py-4 bg-[#282a2c] border border-[#29e33c]/30 rounded-[16px] text-white font-medium text-base appearance-none focus:outline-none focus:border-[#29e33c] transition-colors cursor-pointer"
            >
              {templates.map(template => (
                <option key={template.id} value={template.id} className="bg-[#282a2c]">
                  {template.name}
                </option>
              ))}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9a9fa4] rotate-90 pointer-events-none" />
          </div>
        </motion.div>

        {/* Selected Template Preview */}
        {selectedTemplate && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-[#282a2c] rounded-[21px] overflow-hidden"
          >
            {/* Template Header */}
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-xl">
                  {selectedTemplate.name}
                </h3>
                <span className="px-3 py-1 bg-[#29e33c]/20 text-[#29e33c] rounded-full text-sm font-medium">
                  {selectedTemplate.exercises.length} exercises
                </span>
              </div>
              
              {/* Meta Info */}
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-[#9a9fa4] text-sm">
                  <Clock className="w-4 h-4" />
                  <span>~{estimatedTime} min</span>
                </div>
                <div className="flex items-center gap-2 text-[#9a9fa4] text-sm">
                  <Flame className="w-4 h-4" />
                  <span>{selectedTemplate.exercises.reduce((acc, ex) => acc + ex.sets, 0)} sets</span>
                </div>
              </div>
            </div>

            {/* Exercise List */}
            <div className="p-4 space-y-2 max-h-[280px] overflow-y-auto">
              {selectedTemplate.exercises.map((ex, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-black/30 rounded-[12px] hover:bg-black/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#29e33c] flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{ex.name}</p>
                    <p className="text-[#9a9fa4] text-sm">
                      {ex.sets} sets × {ex.reps} reps
                      {ex.weight && <span className="text-[#29e33c]"> • {ex.weight}kg</span>}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#9a9fa4] flex-shrink-0" />
                </motion.div>
              ))}
            </div>

            {/* Start Button */}
            <div className="p-4 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStartWorkout}
                className="w-full py-4 bg-[#29e33c] hover:bg-[#24c934] text-black font-bold text-lg rounded-[12px] flex items-center justify-center gap-3 transition-colors shadow-lg shadow-[#29e33c]/30"
              >
                <Play className="w-6 h-6" fill="black" />
                Start Workout
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Bottom Tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-start gap-3 p-4 bg-[#282a2c] rounded-[16px] border border-[#29e33c]/20"
        >
          <div className="w-10 h-10 rounded-full bg-[#29e33c]/20 flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-[#29e33c]" />
          </div>
          <div>
            <p className="text-white font-medium text-sm">Track Your RPE</p>
            <p className="text-[#9a9fa4] text-xs mt-1">
              Rate of Perceived Exertion helps monitor your training intensity and prevent overtraining.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
