import React, { useEffect, useMemo, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/state/AuthContext'
import type { Template, Workout } from '@/types'
import {
  listWorkouts,
  saveWorkout,
} from '@/lib/firestore'
import { 
  Dumbbell, 
  BarChart3, 
  Settings, 
  Play, 
  CheckCircle2, 
  Calendar,
  TrendingUp,
  Target
} from 'lucide-react'
import { 
  TemplateSelect, 
  ActionsDropdown, 
  HelpTooltip,
  PageTransition,
  StaggeredContainer,
  StaggeredItem,
  FadeIn,
  ScaleIn
} from '@/components/ui'

import WorkoutTracker from '@/components/WorkoutTracker'
import ProgressChart from '@/components/ProgressChart'
import { useToast, toast } from '@/components/Toaster'
import { validateWorkoutForm } from '@/lib/validation'
import { workoutTemplates } from '@/data/workoutTemplates'

type DraftSet = { reps: number; weight?: number }
type DraftExercise = { name: string; sets: DraftSet[] }

export default function Dashboard() {
  const { user } = useAuth()
  const uid = user!.uid
  const { addToast } = useToast()

  const [templates] = useState<Template[]>(workoutTemplates)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [draftExercises, setDraftExercises] = useState<DraftExercise[]>([])
  const [notes, setNotes] = useState('')

  // Workout tracker state
  const [isWorkoutTrackerOpen, setIsWorkoutTrackerOpen] = useState(false)

  // Refs for keyboard navigation
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([])
  const saveButtonRef = useRef<HTMLButtonElement>(null)

  const selectedTemplate = useMemo(
    () => templates.find(t => t.id === selectedTemplateId),
    [templates, selectedTemplateId]
  )

  useEffect(() => {
    if (!selectedTemplate) return
    const next: DraftExercise[] = selectedTemplate.exercises.map(ex => ({
      name: ex.name,
      sets: Array.from({ length: ex.sets }).map(() => ({ reps: ex.reps, weight: undefined })),
    }))
    setDraftExercises(next)
  }, [selectedTemplateId, selectedTemplate])

  useEffect(() => {
    (async () => {
      setLoading(true)
      // Set default template
      setSelectedTemplateId(templates[0]?.id ?? '')
      const ws = await listWorkouts(uid)
      setWorkouts(ws)
      setLoading(false)
    })()
  }, [uid, templates])

  const refreshWorkouts = async () => {
    try {
      setLoading(true)
      const workoutList = await listWorkouts(uid)
      setWorkouts(workoutList)
    } catch (error) {
      console.error('Failed to load workouts:', error)
      addToast(toast.error('Load Failed', 'Failed to load workouts. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const onChangeSet = (exIdx: number, setIdx: number, field: 'reps' | 'weight', val: string) => {
    setDraftExercises(prev => {
      const copy = prev.map(e => ({ ...e, sets: e.sets.map(s => ({ ...s })) }))
      let num = Number(val)
      
      if (Number.isNaN(num)) {
        num = field === 'reps' ? 0 : undefined
      } else {
        // Clamp values
        if (field === 'reps') {
          num = Math.max(0, Math.min(1000, num)) // Clamp reps between 0-1000
        } else {
          num = Math.max(0, Math.min(1000, num)) // Clamp weight between 0-1000
        }
      }
      
      copy[exIdx].sets[setIdx][field] = num
      return copy
    })
  }

  const onStartWorkout = () => {
    if (!selectedTemplate) return
    setIsWorkoutTrackerOpen(true)
  }

  const onFinishWorkout = async (workout: Workout) => {
    try {
      setSaving(true)
      await saveWorkout(uid, workout)
      await refreshWorkouts()
      setIsWorkoutTrackerOpen(false)
      addToast(toast.success('Workout Saved', 'Great job! Your workout has been saved.'))
    } catch (error) {
      console.error('Failed to save workout:', error)
      addToast(toast.error('Save Failed', 'Failed to save workout. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  const onCloseWorkoutTracker = () => {
    setIsWorkoutTrackerOpen(false)
  }

  return (
    <div className="min-h-screen app-container">
      {/* Modern Header */}
      <div className="sticky top-0 z-20 bg-dark shadow-soft border-b border-purple backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-soft-hover transition-all duration-300 hover:scale-110">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div className="font-display text-xl text-dark">Workout App</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-secondary px-3 py-1 bg-secondary-light rounded-lg animate-fade-in">
              Welcome back!
            </div>
            <Link to="/templates" className="text-sm font-medium text-white hover:text-primary transition-all duration-200 hover:scale-105 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Templates
            </Link>
            <Link to="/history" className="text-sm font-medium text-white hover:text-primary transition-all duration-200 hover:scale-105 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Progress
            </Link>
          </div>
        </div>
      </div>

      <PageTransition>
        <main id="main-content" className="max-w-7xl mx-auto p-4 space-y-6 pb-24 md:pb-6">
          {/* Welcome Section */}
          <FadeIn delay={0.1}>
            <div className="card p-6 shadow-soft-hover transition-all duration-300 hover:transform hover:scale-[1.02]">
              <div className="text-center">
                <h1 className="text-3xl font-display text-white mb-2">
                  Ready to crush your workout?
                </h1>
                <p className="text-secondary text-lg font-body">Choose a template and start logging your progress</p>
              </div>
            </div>
          </FadeIn>

          {/* Template Selection & Start Workout */}
          <FadeIn delay={0.2}>
            <div className="card p-6 shadow-soft-hover transition-all duration-300 hover:transform hover:scale-[1.01]">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
                <h2 className="text-2xl font-display text-white flex items-center gap-3">
                  <Target className="w-6 h-6 text-primary" />
                  Select Template
                </h2>
                <div className="flex items-center gap-3">
                  <TemplateSelect
                    value={selectedTemplateId}
                    onValueChange={setSelectedTemplateId}
                    templates={templates}
                    size="md"
                  />
                  <Link to="/templates" className="text-sm font-medium text-white hover:text-primary transition-all duration-200 hover:scale-105 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Manage Templates
                  </Link>
                </div>
              </div>

              {loading && (
                <div className="text-center py-12 animate-fade-in">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <div className="text-secondary font-body">Loading your workout template...</div>
                </div>
              )}

              {!loading && selectedTemplate && (
                <div className="space-y-6">
                  {/* Template Preview */}
                  <div className="bg-secondary rounded-lg p-6 border border-accent shadow-soft-hover transition-all duration-300 hover:transform hover:scale-[1.02]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-display text-white">
                        {selectedTemplate.name}
                      </h3>
                      <ActionsDropdown
                        onEdit={() => {/* TODO: Implement edit */}}
                        onCopy={() => {/* TODO: Implement copy */}}
                        onDelete={() => {/* TODO: Implement delete */}}
                        size="sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                      {selectedTemplate.exercises.map((ex, idx) => (
                        <div key={idx} className="text-sm text-white font-body bg-primary/20 rounded-lg p-3 transition-all duration-200 hover:bg-primary/30 border border-accent/30">
                          <span className="font-semibold text-white">{idx + 1}.</span> {ex.name} - {ex.sets} sets × {ex.reps} reps
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={onStartWorkout}
                        className="bg-primary text-white px-8 py-3 rounded-lg font-medium text-lg transition-all duration-300 hover:scale-110 hover:bg-primary-light flex items-center gap-3"
                      >
                        <Play className="w-5 h-5" />
                        Start Workout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Weekly Workout Completion */}
          <FadeIn delay={0.3}>
            <div className="card p-6 shadow-soft-hover transition-all duration-300 hover:transform hover:scale-[1.01]">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-8">
                <h3 className="text-2xl font-display text-white flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  Weekly Progress
                  <HelpTooltip helpText="Track your weekly workout completion and performance metrics">
                    <span></span>
                  </HelpTooltip>
                </h3>
                <div className="text-sm text-secondary font-body animate-fade-in flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
              
              {/* Weekly Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white">Weekly Goal Progress</span>
                  <span className="text-sm text-secondary">
                    {workouts.filter(w => {
                      const workoutDate = new Date(w.date)
                      const today = new Date()
                      const weekStart = new Date(today)
                      weekStart.setDate(today.getDate() - today.getDay() + 1)
                      const weekEnd = new Date(weekStart)
                      weekEnd.setDate(weekStart.getDate() + 6)
                      return workoutDate >= weekStart && workoutDate <= weekEnd
                    }).length}/7 workouts
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-700 ease-out rounded-full"
                    style={{ 
                      width: `${(workouts.filter(w => {
                        const workoutDate = new Date(w.date)
                        const today = new Date()
                        const weekStart = new Date(today)
                        weekStart.setDate(today.getDate() - today.getDay() + 1)
                        const weekEnd = new Date(weekStart)
                        weekEnd.setDate(weekStart.getDate() + 6)
                        return workoutDate >= weekStart && workoutDate <= weekEnd
                      }).length / 7) * 100}%` 
                    }}
                  />
                </div>
              </div>
              
              {/* Weekly Progress - Visual Day Indicators */}
              <div className="flex justify-center mb-8">
                <StaggeredContainer className="grid grid-cols-7 gap-6 w-full max-w-3xl">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
                    const dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index]
                    const today = new Date()
                    const dayOfWeek = today.getDay()
                    const isToday = dayOfWeek === (index === 0 ? 1 : index === 6 ? 0 : index + 1)
                    
                    // Calculate completion based on workouts for this day
                    const dayWorkouts = workouts.filter(w => {
                      const workoutDate = new Date(w.date)
                      return workoutDate.getDay() === (index === 0 ? 1 : index === 6 ? 0 : index + 1)
                    })
                    
                    const hasWorkout = dayWorkouts.length > 0
                    
                    return (
                      <StaggeredItem key={day} delay={index * 0.1}>
                        <div className="flex flex-col items-center justify-center">
                          <div className={`relative w-16 h-16 mb-3 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-soft ${
                            hasWorkout 
                              ? 'bg-gradient-to-br from-primary to-primary-light' 
                              : 'bg-gray-700 border-2 border-gray-500'
                          } ${isToday ? 'ring-4 ring-primary ring-opacity-30' : ''}`}>
                            <span className={`text-lg font-bold ${
                              hasWorkout ? 'text-white' : 'text-gray-300'
                            }`}>
                              {day}
                            </span>
                            {hasWorkout && (
                              <div className="absolute -top-2 -right-2 w-5 h-5 bg-secondary rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                <CheckCircle2 className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <span className={`text-sm font-medium text-center ${
                            hasWorkout ? 'text-white' : 'text-secondary'
                          }`}>
                            {dayName.slice(0, 3)}
                          </span>
                        </div>
                      </StaggeredItem>
                    )
                  })}
                </StaggeredContainer>
              </div>
            </div>
          </FadeIn>

          {/* Professional Weekly Performance Charts */}
          <FadeIn delay={0.4}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weekly Weight Progress Chart */}
              <ProgressChart
                type="bar"
                title="Weekly Weight Progress"
                height={300}
                data={{
                  labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                  datasets: [{
                    label: 'Weight (kg)',
                    data: ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
                      return workouts.filter(w => {
                        const workoutDate = new Date(w.date)
                        return workoutDate.getDay() === (index === 0 ? 1 : index === 6 ? 0 : index + 1)
                      }).reduce((total, w) => total + w.exercises.reduce((exTotal, ex) => exTotal + ex.sets.reduce((setTotal, set) => setTotal + (set.reps * (set.weight || 0)), 0), 0), 0)
                    }),
                    backgroundColor: 'rgba(147, 51, 234, 0.8)',
                    borderColor: 'rgba(147, 51, 234, 1)',
                    borderWidth: 2,
                  }]
                }}
              />
              
              {/* Weekly Sets Progress Chart */}
              <ProgressChart
                type="line"
                title="Weekly Sets Progress"
                height={300}
                data={{
                  labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                  datasets: [{
                    label: 'Sets',
                    data: ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
                      return workouts.filter(w => {
                        const workoutDate = new Date(w.date)
                        return workoutDate.getDay() === (index === 0 ? 1 : index === 6 ? 0 : index + 1)
                      }).reduce((total, w) => total + w.exercises.reduce((exTotal, ex) => exTotal + ex.sets.length, 0), 0)
                    }),
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                    pointBorderColor: '#ffffff',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                  }]
                }}
              />
            </div>
          </FadeIn>
        </main>
      </PageTransition>

      {/* Workout Tracker Modal */}
      {isWorkoutTrackerOpen && selectedTemplate && (
        <WorkoutTracker
          template={selectedTemplate}
          uid={uid}
          onFinish={onFinishWorkout}
          onClose={onCloseWorkoutTracker}
        />
      )}
    </div>
  )
}

