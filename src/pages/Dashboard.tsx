import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Template } from '@/types'
import { 
  Play, 
  Target,
  Dumbbell
} from 'lucide-react'
import { motion } from 'framer-motion'
import { workoutTemplates } from '@/data/workoutTemplates'
import TopBar from '@/components/TopBar'
import { useProfile } from '../hooks/useProfile'

export default function Dashboard() {
  const [templates] = useState<Template[]>(workoutTemplates)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '')
  const navigate = useNavigate()
  const { profile, isAdmin, loading: profileLoading } = useProfile()

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

  const onStartWorkout = () => {
    if (!selectedTemplate) return
    navigate('/workout', { state: { template: selectedTemplate } })
  }

  return (
    <div className="min-h-screen bg-dark">
      <TopBar />
      
      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-6 shadow-xl"
        >
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              >
                <Dumbbell className="w-8 h-8 text-orange-500" />
              </motion.div>
              Ready to crush your workout?
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-gray-600 text-lg"
            >
              Choose a template and start logging your progress
            </motion.p>
          </div>
        </motion.div>

        {/* Temporary role test - remove later */}
        {profile && (
          <div className="bg-gray-800 p-3 rounded-lg mb-4 text-sm">
            <span className="text-gray-400">Logged in as: </span>
            <span className={isAdmin ? 'text-orange-500 font-bold' : 'text-white'}>
              {isAdmin ? '👑 ADMIN' : 'CLIENT'}
            </span>
          </div>
        )}

        {/* Template Selection */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-6 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Target className="w-6 h-6 text-orange-600" />
              Select Template
            </h2>
            <div className="flex items-center gap-3">
              <motion.select
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              >
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </motion.select>
            </div>
          </div>

          {selectedTemplate && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Template Preview */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border-2 border-gray-200">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-between mb-4"
                >
                  <h3 className="text-lg font-bold text-gray-800">
                    {selectedTemplate.name}
                  </h3>
                </motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                  {selectedTemplate.exercises.map((ex, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + (idx * 0.05), duration: 0.3 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      className="text-sm text-gray-700 bg-white rounded-lg p-3 border-2 border-gray-200 hover:border-orange-500/50 transition-all shadow-sm hover:shadow-md"
                    >
                      <span className="font-semibold text-orange-600">{idx + 1}.</span> {ex.name} - {ex.sets} sets × {ex.reps} reps
                    </motion.div>
                  ))}
                </div>
                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(249, 115, 22, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onStartWorkout}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-all flex items-center gap-3 shadow-lg shadow-orange-500/30"
                  >
                    <Play className="w-5 h-5" />
                    Start Workout
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  )
}

