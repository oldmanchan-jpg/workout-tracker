import React, { useEffect, useMemo, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/state/AuthContext'
import type { Template, Workout } from '@/types'
import {
  listWorkouts,
  saveWorkout,
  deleteWorkout,
  updateWorkout,
} from '@/lib/firestore'
import WorkoutList from '@/components/WorkoutList'
import EditWorkoutModal from '@/components/EditWorkoutModal'
import WorkoutTracker from '@/components/WorkoutTracker'
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

  // Edit modal state
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

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
      console.log('=== WORKOUTS LOADED ===')
      console.log('Total workouts:', workoutList.length)
      workoutList.forEach((workout, index) => {
        console.log(`Workout ${index + 1}:`, {
          id: workout.id,
          idType: typeof workout.id,
          idLength: workout.id?.length,
          date: workout.date,
          exerciseCount: workout.exercises?.length
        })
      })
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

  const handleKeyDown = (exIdx: number, setIdx: number, field: 'reps' | 'weight', e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (field === 'reps') {
        // Move to weight input
        const nextInput = inputRefs.current[exIdx]?.[setIdx * 2 + 1]
        if (nextInput) nextInput.focus()
      } else {
        // Move to next set or next exercise
        const nextSetIdx = setIdx + 1
        if (nextSetIdx < draftExercises[exIdx].sets.length) {
          const nextInput = inputRefs.current[exIdx]?.[nextSetIdx * 2]
          if (nextInput) nextInput.focus()
        } else {
          const nextExIdx = exIdx + 1
          if (nextExIdx < draftExercises.length) {
            const nextInput = inputRefs.current[nextExIdx]?.[0]
            if (nextInput) nextInput.focus()
          } else {
            // Last input, focus save button
            saveButtonRef.current?.focus()
          }
        }
      }
    }
  }

  const onSaveWorkout = async () => {
    if (!selectedTemplate) return
    
    try {
      setSaving(true)
      const workoutData = {
        date: new Date().toISOString(),
        notes,
        exercises: draftExercises.map(ex => ({
          id: crypto.randomUUID(),
          name: ex.name,
          sets: ex.sets.map(s => ({ reps: s.reps, weight: s.weight || 0 }))
        }))
      }
      
      const validation = validateWorkoutForm(workoutData)
      if (!validation.isValid) {
        addToast(toast.error('Validation Error', validation.errors.join(', ')))
        return
      }
      
      await saveWorkout(uid, workoutData)
      await refreshWorkouts()
      
      // Reset form
      setNotes('')
      if (selectedTemplate) {
        const next: DraftExercise[] = selectedTemplate.exercises.map(ex => ({
          name: ex.name,
          sets: Array.from({ length: ex.sets }).map(() => ({ reps: ex.reps, weight: undefined })),
        }))
        setDraftExercises(next)
      }
      
      addToast(toast.success('Workout Saved!', 'Great job! Your workout has been logged.'))
    } catch (error) {
      addToast(toast.error('Save Failed', 'Failed to save workout. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  const onDeleteWorkout = async (id: string) => {
    console.log('=== DELETE WORKOUT DEBUG ===')
    console.log('Attempting to delete workout with ID:', id)
    console.log('ID type:', typeof id)
    console.log('ID length:', id.length)
    console.log('ID contains hyphens:', id.includes('-'))
    console.log('Current uid:', uid)
    
    if (!uid) {
      console.error('No user ID available for deletion')
      addToast(toast.error('Delete Failed', 'User not authenticated. Please log in again.'))
      return
    }
    
    if (!confirm('Are you sure you want to delete this workout?')) return
    
    try {
      console.log('Calling deleteWorkout with uid:', uid, 'and id:', id)
      await deleteWorkout(uid, id)
      console.log('Delete successful, refreshing workouts')
      await refreshWorkouts()
      addToast(toast.success('Workout Deleted', 'The workout has been successfully deleted.'))
    } catch (error) {
      console.error('Delete failed with error:', error)
      addToast(toast.error('Delete Failed', `Failed to delete workout: ${error instanceof Error ? error.message : 'Unknown error'}`))
    }
  }

  const onEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout)
    setIsEditModalOpen(true)
  }

  const onSaveEditedWorkout = async (updatedWorkout: Workout) => {
    try {
      await updateWorkout(uid, updatedWorkout.id, {
        date: updatedWorkout.date,
        notes: updatedWorkout.notes,
        exercises: updatedWorkout.exercises,
      })
      await refreshWorkouts()
      addToast(toast.success('Workout Updated!', 'Your workout has been successfully updated.'))
    } catch (error) {
      addToast(toast.error('Update Failed', 'Failed to update workout. Please try again.'))
    }
  }

  const onCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingWorkout(null)
  }

  const onStartWorkout = () => {
    if (selectedTemplate) {
      setIsWorkoutTrackerOpen(true)
    }
  }

  const onFinishWorkout = async (workout: Workout) => {
    try {
      // Remove the random ID since Firestore will generate one
      const { id, ...workoutData } = workout
      const firestoreId = await saveWorkout(uid, workoutData)
      
      // Create the workout with the correct Firestore ID
      const workoutWithCorrectId: Workout = {
        ...workout,
        id: firestoreId
      }
      
      await refreshWorkouts()
      setIsWorkoutTrackerOpen(false)
      addToast(toast.success('Workout Completed!', 'Great job! Your workout has been logged.'))
    } catch (error) {
      addToast(toast.error('Save Failed', 'Failed to save workout. Please try again.'))
    }
  }

  const onCloseWorkoutTracker = () => {
    setIsWorkoutTrackerOpen(false)
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      {/* Modern Header */}
      <div className="sticky top-0 z-20 bg-dark shadow-soft border-b border-purple">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-display text-lg">W</span>
            </div>
            <div className="font-display text-xl text-dark">Workout App</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-secondary px-3 py-1 bg-secondary-light rounded-lg">
              Welcome back!
            </div>
            <Link to="/templates" className="btn btn-outline btn-sm">
              Templates
            </Link>
            <Link to="/history" className="btn btn-outline btn-sm">
              History
            </Link>

          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 space-y-6 pb-24 md:pb-6">
        {/* Welcome Section */}
        <div className="card p-6">
          <div className="text-center">
            <h1 className="text-3xl font-display text-white mb-2">Ready to crush your workout?</h1>
            <p className="text-secondary text-lg font-body">Choose a template and start logging your progress</p>
          </div>
        </div>

        {/* Template Selection & Start Workout */}
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-display text-white">Select Template</h2>
            <div className="flex items-center gap-3">
              <select 
                className="input max-w-xs"
                value={selectedTemplateId}
                onChange={e => setSelectedTemplateId(e.target.value)}
              >
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <Link to="/templates" className="btn btn-secondary">
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
              <div className="bg-secondary-dark rounded-lg p-4 border border-purple">
                <h3 className="text-lg font-display text-white mb-3">{selectedTemplate.name}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedTemplate.exercises.map((ex, idx) => (
                    <div key={idx} className="text-sm text-secondary font-body">
                      {idx + 1}. {ex.name} - {ex.sets} sets × {ex.reps} reps
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={onStartWorkout}
                    className="btn btn-primary btn-lg px-8"
                  >
                    Start Workout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Workouts */}
        <WorkoutList workouts={workouts} onDelete={onDeleteWorkout} onEdit={onEditWorkout} />

        {/* Weekly Workout Completion */}
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-8">
            <h3 className="text-2xl font-display text-white">Weekly Progress</h3>
            <div className="text-sm text-secondary bg-secondary px-3 py-1 rounded-lg font-body">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>
          
          {/* Weekly Progress Rings - Styled like the screenshot */}
          <div className="flex justify-center mb-10">
            <div className="grid grid-cols-7 gap-6">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
                const dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index]
                const today = new Date()
                const dayOfWeek = today.getDay()
                const isToday = dayOfWeek === (index === 0 ? 1 : index === 6 ? 0 : index + 1)
                
                // Calculate completion percentage based on workouts for this day
                const dayWorkouts = workouts.filter(w => {
                  const workoutDate = new Date(w.date)
                  return workoutDate.getDay() === (index === 0 ? 1 : index === 6 ? 0 : index + 1)
                })
                
                const hasWorkout = dayWorkouts.length > 0
                const completionPercentage = hasWorkout ? 100 : 0
                
                return (
                  <div key={day} className="flex flex-col items-center">
                    <div className="relative w-16 h-16 mb-3">
                      {/* Background circle - dark gray */}
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#374151"
                          strokeWidth="4"
                          fill="transparent"
                        />
                        {/* Progress circle - pink when completed */}
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke={hasWorkout ? "#ec4899" : "#6b7280"}
                          strokeWidth="4"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 28}
                          strokeDashoffset={hasWorkout ? 0 : 2 * Math.PI * 28}
                          strokeLinecap="round"
                          className="transition-all duration-700 ease-out"
                        />
                      </svg>
                      
                      {/* Day letter - centered */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-lg font-bold ${isToday ? 'text-pink-400' : hasWorkout ? 'text-white' : 'text-gray-400'}`}>
                          {day}
                        </span>
                      </div>
                      
                      {/* Completion indicator - pink dot when completed */}
                      {hasWorkout && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-xs text-white font-bold">✓</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Day name below */}
                    <span className={`text-sm font-medium ${isToday ? 'text-pink-400' : hasWorkout ? 'text-white' : 'text-gray-500'}`}>
                      {dayName.slice(0, 3)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Main Progress Ring - Large center ring like the screenshot */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-48 h-48 relative">
                {/* Large background circle */}
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 192 192">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#dc2626"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Progress circle - pink when workouts completed */}
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#ec4899"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 88}
                    strokeDashoffset={(() => {
                      const weekWorkouts = workouts.filter(w => {
                        const workoutDate = new Date(w.date)
                        const today = new Date()
                        const weekStart = new Date(today)
                        weekStart.setDate(today.getDate() - today.getDay() + 1)
                        const weekEnd = new Date(weekStart)
                        weekEnd.setDate(weekStart.getDate() + 6)
                        return workoutDate >= weekStart && workoutDate <= weekEnd
                      })
                      const progress = (weekWorkouts.length / 7) * 100
                      return 2 * Math.PI * 88 - (2 * Math.PI * 88 * progress / 100)
                    })()}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    {workouts.filter(w => {
                      const workoutDate = new Date(w.date)
                      const today = new Date()
                      const weekStart = new Date(today)
                      weekStart.setDate(today.getDate() - today.getDay() + 1)
                      const weekEnd = new Date(weekStart)
                      weekEnd.setDate(weekStart.getDate() + 6)
                      return workoutDate >= weekStart && workoutDate <= weekEnd
                    }).length}
                  </div>
                  <div className="text-lg text-pink-400 font-semibold">/ 7</div>
                  <div className="text-sm text-gray-400 mt-1">Workouts</div>
                </div>
              </div>
              
              {/* Pink arrow pointing right - like the screenshot */}
              <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
                <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">→</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Weekly Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-xl p-6 text-center border border-pink-500/30">
              <div className="text-4xl font-bold text-pink-400 mb-2">
                {workouts.filter(w => {
                  const workoutDate = new Date(w.date)
                  const today = new Date()
                  const weekStart = new Date(today)
                  weekStart.setDate(today.getDate() - today.getDay() + 1)
                  const weekEnd = new Date(weekStart)
                  weekEnd.setDate(weekStart.getDate() + 6)
                  return workoutDate >= weekStart && workoutDate <= weekEnd
                }).length}
              </div>
              <div className="text-pink-300 text-sm font-medium">Workouts This Week</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-6 text-center border border-green-500/30">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {workouts.filter(w => {
                  const workoutDate = new Date(w.date)
                  const today = new Date()
                  const weekStart = new Date(today)
                  weekStart.setDate(today.getDate() - today.getDay() + 1)
                  const weekEnd = new Date(weekStart)
                  weekEnd.setDate(weekStart.getDate() + 6)
                  return workoutDate >= weekStart && workoutDate <= weekEnd
                }).reduce((total, w) => total + w.exercises.reduce((exTotal, ex) => exTotal + ex.sets.reduce((setTotal, set) => setTotal + set.reps, 0), 0), 0)}
              </div>
              <div className="text-green-300 text-sm font-medium">Total Reps</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-6 text-center border border-blue-500/30">
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {workouts.filter(w => {
                  const workoutDate = new Date(w.date)
                  const today = new Date()
                  const weekStart = new Date(today)
                  weekStart.setDate(today.getDate() - today.getDay() + 1)
                  const weekEnd = new Date(weekStart)
                  weekEnd.setDate(weekStart.getDate() + 6)
                  return workoutDate >= weekStart && workoutDate <= weekEnd
                }).reduce((total, w) => total + w.exercises.reduce((exTotal, ex) => exTotal + ex.sets.reduce((setTotal, set) => setTotal + (set.reps * (set.weight || 0)), 0), 0), 0).toFixed(0)}
              </div>
              <div className="text-blue-300 text-sm font-medium">Volume (kg)</div>
            </div>
          </div>
          
          {/* Motivational Message */}
          <div className="text-center">
            <div className="text-xl text-white font-body mb-3">
              {(() => {
                const completedWorkouts = workouts.filter(w => {
                  const workoutDate = new Date(w.date)
                  const today = new Date()
                  const weekStart = new Date(today)
                  weekStart.setDate(today.getDate() - today.getDay() + 1)
                  const weekEnd = new Date(weekStart)
                  weekEnd.setDate(weekStart.getDate() + 6)
                  return workoutDate >= weekStart && workoutDate <= weekEnd
                }).length
                
                if (completedWorkouts === 0) return "🚀 Start your week strong with your first workout!"
                if (completedWorkouts < 3) return "💪 Great start! Keep building momentum this week!"
                if (completedWorkouts < 5) return "🔥 You're on fire! Almost there!"
                if (completedWorkouts < 7) return "⚡ So close! One more workout to complete the week!"
                return "🎉 Perfect week! You've completed all your workouts!"
              })()}
            </div>
            <div className="text-pink-300 text-sm font-medium">
              Complete all 7 days to unlock next week's achievements
            </div>
          </div>
        </div>
      </main>

      {/* Edit Workout Modal */}
      <EditWorkoutModal
        workout={editingWorkout}
        isOpen={isEditModalOpen}
        onClose={onCloseEditModal}
        onSave={onSaveEditedWorkout}
      />

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

