import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Template } from '@/types'
import { Play, Target, Dumbbell, ChevronRight } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <TopBar />
      
      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Welcome Section - IMPROVED MOBILE */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-6 sm:p-8 shadow-2xl border-2 border-orange-100"
        >
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              >
                <Dumbbell className="w-10 h-10 text-orange-500" />
              </motion.div>
              <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Let's Workout!
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-gray-700 text-base sm:text-lg font-medium"
            >
              Choose your template and start crushing your goals 💪
            </motion.p>
          </div>
        </motion.div>

        {/* Template Selection - IMPROVED LAYOUT */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border-2 border-gray-100"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Target className="w-7 h-7 text-orange-600" />
              Select Workout
            </h2>
          </div>

          {/* Template Dropdown - LARGER & MORE PROMINENT */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              Choose Template
            </label>
            <motion.select
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full px-5 py-4 text-base sm:text-lg font-semibold border-3 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/50 focus:border-orange-500 transition-all bg-white shadow-sm"
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </motion.select>
          </div>

          {selectedTemplate && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Template Preview - BETTER CARDS */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 sm:p-6 border-2 border-gray-200">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-between mb-5"
                >
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {selectedTemplate.name}
                  </h3>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">
                    {selectedTemplate.exercises.length} exercises
                  </span>
                </motion.div>

                {/* Exercise List - IMPROVED MOBILE CARDS */}
                <div className="grid grid-cols-1 gap-3 mb-6">
                  {selectedTemplate.exercises.map((ex, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + (idx * 0.05), duration: 0.3 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="text-base bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-orange-400 transition-all shadow-sm hover:shadow-md flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{ex.name}</p>
                        <p className="text-sm text-gray-600">
                          {ex.sets} sets × {ex.reps} reps
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </motion.div>
                  ))}
                </div>

                {/* Start Button - MUCH MORE PROMINENT */}
                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(249, 115, 22, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onStartWorkout}
                    className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-10 py-5 rounded-xl font-bold text-lg sm:text-xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-orange-500/40"
                  >
                    <Play className="w-6 h-6" fill="white" />
                    Start Workout Now
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Quick Tips - NEW SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-2xl"
        >
          <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
            💡 Quick Tip
          </h3>
          <p className="text-white/90 text-base leading-relaxed">
            Track your RPE (Rate of Perceived Exertion) on a scale of 1-10 for each set. 
            This helps you monitor intensity and avoid overtraining!
          </p>
        </motion.div>
      </main>
    </div>
  )
}
