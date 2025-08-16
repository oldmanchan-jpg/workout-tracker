import React, { useState, useEffect, useRef } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Template, Workout } from '@/types'
import { getExerciseMedia, defaultExerciseImage } from '@/data/exerciseMedia'
import { workoutFormSchema, type WorkoutFormData } from '@/lib/validation'
import { WorkoutSetInput } from './FormInput'
import { 
  Play, 
  Pause, 
  Square, 
  Save, 
  X, 
  Timer, 
  Edit3, 
  CheckCircle2,
  AlertCircle,
  Target
} from 'lucide-react'

interface WorkoutTrackerProps {
  template: Template
  uid: string
  onFinish: (workout: Workout) => void
  onClose: () => void
}

export default function WorkoutTracker({ template, uid, onFinish, onClose }: WorkoutTrackerProps) {
  const [workoutTime, setWorkoutTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  
  const timerRef = useRef<NodeJS.Timeout>()

  // Initialize form with React Hook Form
  const methods = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      notes: '',
      exercises: template.exercises.map((ex) => ({
        name: ex.name,
        sets: Array.from({ length: ex.sets }, () => ({
          reps: undefined,
          weight: undefined
        }))
      }))
    }
  })

  const { handleSubmit, formState: { errors, isValid }, watch } = methods
  const watchedExercises = watch('exercises')

  // Get exercise media for display
  const getExerciseDisplayData = (exerciseName: string) => {
    const media = getExerciseMedia(exerciseName) || defaultExerciseImage
    const templateExercise = template.exercises.find(ex => ex.name === exerciseName)
    
    return {
      media,
      targetReps: templateExercise?.targetReps || templateExercise?.reps || 0,
      intensity: templateExercise?.intensity
    }
  }

  // Timer logic
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setWorkoutTime(prev => prev + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const onSubmit = (data: WorkoutFormData) => {
    const workoutData: Workout = {
      id: crypto.randomUUID(),
      userId: uid,
      date: new Date().toISOString(),
      notes: data.notes || '',
      exercises: data.exercises.map(ex => ({
        id: crypto.randomUUID(),
        name: ex.name,
        sets: ex.sets
          .filter(set => set.reps !== undefined && set.reps > 0) // Only include completed sets
          .map(s => ({
            reps: s.reps || 0,
            weight: s.weight || 0
          }))
      }))
    }
    console.log('Finishing workout with data:', workoutData)
    onFinish(workoutData)
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="fixed inset-0 bg-dark z-50">
        <div className="w-full h-full overflow-y-auto">
          {/* Workout Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={togglePause}
                className="workout-timer flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-primary/10 hover:bg-primary/20"
              >
                {isPaused ? (
                  <Play className="w-4 h-4 text-primary" />
                ) : (
                  <Pause className="w-4 h-4 text-primary" />
                )}
                <Timer className="w-4 h-4 text-primary" />
                <span className="font-mono text-lg font-body-semibold text-primary">{formatTime(workoutTime)}</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-500 rounded-lg text-white font-body-medium hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Close
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary rounded-lg text-white font-body-semibold hover:bg-primary-light transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Finish Workout
                </button>
              </div>
            </div>
            
            <h1 className="text-2xl font-display text-dark mb-2">{template.name}</h1>
            
            {/* Notes Input */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Edit3 className="w-4 h-4 text-gray-500" />
              <input
                {...methods.register('notes')}
                type="text"
                placeholder="Add workout notes here..."
                className="workout-input flex-1 bg-transparent outline-none font-body text-dark placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Exercises */}
          <div className="p-4 space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-semibold">i</span>
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">How to track your workout:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Enter the number of reps and weight for each set</li>
                    <li>• Leave fields empty if you didn't complete a set</li>
                    <li>• Use the timer to track your workout duration</li>
                    <li>• Add notes about your performance or how you felt</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Workout Progress</span>
                <span className="text-sm text-gray-500">
                  {(() => {
                    const totalSets = watchedExercises?.reduce((total, ex) => total + ex.sets.length, 0) || 0
                    const completedSets = watchedExercises?.reduce((total, ex) => 
                      total + ex.sets.filter(set => set.reps && set.reps > 0).length, 0) || 0
                    return `${completedSets}/${totalSets} sets completed`
                  })()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(() => {
                      const totalSets = watchedExercises?.reduce((total, ex) => total + ex.sets.length, 0) || 0
                      const completedSets = watchedExercises?.reduce((total, ex) => 
                        total + ex.sets.filter(set => set.reps && set.reps > 0).length, 0) || 0
                      return totalSets > 0 ? (completedSets / totalSets) * 100 : 0
                    })()}%` 
                  }}
                ></div>
              </div>
            </div>

            {watchedExercises?.map((exercise, exerciseIndex) => {
              const displayData = getExerciseDisplayData(exercise.name)
              
              return (
                <div key={exerciseIndex} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4 mb-6">
                    {/* Exercise Media */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                      {displayData.media.type === 'image' ? (
                        <img 
                          src={displayData.media.url} 
                          alt={displayData.media.altText || exercise.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video 
                          src={displayData.media.url} 
                          className="w-full h-full object-cover"
                          muted
                        />
                      )}
                    </div>
                    
                    {/* Exercise Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-display text-dark mb-3">{exercise.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {displayData.targetReps > 0 && (
                          <span className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                            <Target className="w-4 h-4" />
                            Target: {displayData.targetReps} reps
                          </span>
                        )}
                        {displayData.intensity && (
                          <span className="flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 rounded-full">
                            <AlertCircle className="w-4 h-4" />
                            {displayData.intensity}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sets Grid */}
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-gray-600 mb-3">Sets</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="space-y-2">
                          <div className="text-center text-xs font-medium text-gray-500 bg-gray-50 py-1 rounded">
                            Set {setIndex + 1}
                          </div>
                          <WorkoutSetInput
                            exerciseIndex={exerciseIndex}
                            setIndex={setIndex}
                            field="reps"
                          />
                          <WorkoutSetInput
                            exerciseIndex={exerciseIndex}
                            setIndex={setIndex}
                            field="weight"
                          />
                          {/* Set completion indicator */}
                          {watchedExercises[exerciseIndex].sets[setIndex].reps && 
                           watchedExercises[exerciseIndex].sets[setIndex].reps > 0 && (
                            <div className="text-center">
                              <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                <CheckCircle2 className="w-3 h-3" />
                                Complete
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exercise Errors */}
                  {errors.exercises?.[exerciseIndex] && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>Please complete all sets for this exercise</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Form Errors Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="fixed bottom-4 left-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg animate-fade-in z-50">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Please complete the following:</span>
              </div>
              <ul className="text-sm space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>• {error?.message as string}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </form>
    </FormProvider>
  )
}
