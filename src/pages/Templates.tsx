import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Template } from '@/types'
import { getExerciseMedia, defaultExerciseImage } from '@/data/exerciseMedia'
import { workoutTemplates } from '@/data/workoutTemplates'

export default function Templates() {
  const [templates] = useState<Template[]>(workoutTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  // Calculate template stats
  const getTemplateStats = (template: Template) => {
    const totalExercises = template.exercises.length
    const totalSets = template.exercises.reduce((sum, exercise) => sum + exercise.sets, 0)
    const estimatedDuration = Math.ceil(totalSets * 2.5) // Rough estimate: 2.5 minutes per set
    
    return { totalExercises, totalSets, estimatedDuration }
  }

  // Get difficulty level based on exercise count and sets
  const getDifficultyLevel = (template: Template) => {
    const { totalExercises, totalSets } = getTemplateStats(template)
    const complexity = totalExercises * totalSets
    
    if (complexity <= 8) return { level: 'Beginner', color: 'bg-green-500', bg: 'bg-green-100', text: 'text-green-700' }
    if (complexity <= 15) return { level: 'Intermediate', color: 'bg-yellow-500', bg: 'bg-yellow-100', text: 'text-yellow-700' }
    return { level: 'Advanced', color: 'bg-red-500', bg: 'bg-red-100', text: 'text-red-700' }
  }

  // Get workout focus area
  const getWorkoutFocus = (template: Template) => {
    const exerciseNames = template.exercises.map(ex => ex.name.toLowerCase())
    
    if (exerciseNames.some(name => name.includes('push') || name.includes('chest') || name.includes('shoulder') || name.includes('tricep'))) {
      return { focus: 'Push', icon: '💪', color: 'bg-blue-500', bg: 'bg-blue-100', text: 'text-blue-700' }
    }
    if (exerciseNames.some(name => name.includes('pull') || name.includes('back') || name.includes('bicep'))) {
      return { focus: 'Pull', icon: '🏋️', color: 'bg-green-500', bg: 'bg-green-100', text: 'text-green-700' }
    }
    if (exerciseNames.some(name => name.includes('leg') || name.includes('squat') || name.includes('deadlift') || name.includes('calf'))) {
      return { focus: 'Legs', icon: '🦵', color: 'bg-purple-500', bg: 'bg-purple-100', text: 'text-purple-700' }
    }
    if (exerciseNames.some(name => name.includes('core') || name.includes('abs') || name.includes('plank'))) {
      return { focus: 'Core', icon: '🔥', color: 'bg-orange-500', bg: 'bg-orange-100', text: 'text-orange-700' }
    }
    return { focus: 'Full Body', icon: '⚡', color: 'bg-gray-500', bg: 'bg-gray-100', text: 'text-gray-700' }
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      {/* Modern Header */}
      <div className="sticky top-0 z-20 bg-dark shadow-soft border-b border-purple">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📋</span>
            </div>
            <div className="font-bold text-xl text-dark">Workout Templates</div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/app" className="btn btn-outline btn-sm">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display text-white mb-4">Pre-Loaded Workout Templates</h1>
          <p className="text-secondary text-lg">
            Ready-to-use workout templates with proper exercise images and rep ranges
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {templates.map((template, index) => {
            const stats = getTemplateStats(template)
            const difficulty = getDifficultyLevel(template)
            const focus = getWorkoutFocus(template)
            
            return (
              <div key={template.id} className="card-dark p-6 hover:shadow-soft-hover transition-all duration-200 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                {/* Template Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{focus.icon}</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold text-lg">{template.name}</div>
                      <div className="text-secondary-light text-sm">
                        {template.exercises.length} exercises
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Menu */}
                  <div className="relative">
                    <Link
                      to={`/app?template=${template.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Use Template
                    </Link>
                  </div>
                </div>

                {/* Template Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-white font-bold text-lg">{stats.totalExercises}</div>
                    <div className="text-secondary-light text-xs">Exercises</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-white font-bold text-lg">{stats.totalSets}</div>
                    <div className="text-secondary-light text-xs">Sets</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-white font-bold text-lg">{stats.estimatedDuration}</div>
                    <div className="text-secondary-light text-xs">Minutes</div>
                  </div>
                </div>

                {/* Difficulty & Focus */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`${difficulty.bg} ${difficulty.text} px-3 py-1 rounded-full text-xs font-medium`}>
                    {difficulty.level}
                  </div>
                  <div className={`${focus.bg} ${focus.text} px-3 py-1 rounded-full text-xs font-medium`}>
                    {focus.focus}
                  </div>
                </div>

                {/* Exercise List */}
                <div className="space-y-3 mb-4">
                  {template.exercises.slice(0, 3).map((exercise, index) => {
                    const exerciseMedia = getExerciseMedia(exercise.name) || defaultExerciseImage
                    return (
                      <div key={index} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                        {/* Exercise Image - Smaller Thumbnail */}
                        <div 
                          className="w-8 h-8 bg-cover bg-center rounded-lg flex-shrink-0"
                          style={{ backgroundImage: `url(${exerciseMedia.url})` }}
                          title={exerciseMedia.altText}
                        />
                        
                        {/* Exercise Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-white font-medium">{exercise.name}</span>
                            <span className="text-secondary-light">
                              ({exercise.sets} sets × {exercise.targetReps || exercise.reps} reps)
                            </span>
                          </div>
                          <div className="text-secondary-light text-xs mt-1">
                            {exercise.intensity && <span className="mr-2">Intensity: {exercise.intensity}</span>}
                            {exercise.weight && exercise.weight > 0 && <span>Weight: {exercise.weight}kg</span>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {template.exercises.length > 3 && (
                    <div className="text-secondary-light text-sm text-center pt-2">
                      +{template.exercises.length - 3} more exercises
                    </div>
                  )}
                </div>

                {/* Use Template Button */}
                <div className="text-center">
                  <Link
                    to={`/app?template=${template.id}`}
                    className="btn btn-primary w-full"
                  >
                    Start {template.name} Workout
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
