import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Template } from '@/types'
import { 
  Play, 
  Target
} from 'lucide-react'
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
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Ready to crush your workout?
            </h1>
            <p className="text-gray-600 text-lg">Choose a template and start logging your progress</p>
          </div>
        </div>

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
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Target className="w-6 h-6 text-blue-600" />
              Select Template
            </h2>
            <div className="flex items-center gap-3">
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedTemplate && (
            <div className="space-y-6">
              {/* Template Preview */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {selectedTemplate.name}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                  {selectedTemplate.exercises.map((ex, idx) => (
                    <div key={idx} className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200">
                      <span className="font-semibold text-gray-800">{idx + 1}.</span> {ex.name} - {ex.sets} sets × {ex.reps} reps
                    </div>
                  ))}
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={onStartWorkout}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors flex items-center gap-3"
                  >
                    <Play className="w-5 h-5" />
                    Start Workout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

