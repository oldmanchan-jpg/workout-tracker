import React, { useState, useEffect, useRef } from 'react'
import type { Workout, ExerciseEntry } from '@/types'
import { validateWorkoutForm } from '@/lib/validation'

type Props = {
  workout: Workout | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedWorkout: Workout) => Promise<void>
}

export default function EditWorkoutModal({ workout, isOpen, onClose, onSave }: Props) {
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [exercises, setExercises] = useState<ExerciseEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Refs for keyboard navigation
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([])
  const saveButtonRef = useRef<HTMLButtonElement>(null)

  // Initialize form when workout changes
  useEffect(() => {
    if (workout) {
      setDate(new Date(workout.date).toISOString().slice(0, 10))
      setNotes(workout.notes || '')
      setExercises([...workout.exercises])
    }
  }, [workout])

  const updateSet = (ei: number, si: number, field: 'reps' | 'weight', val: string) => {
    setExercises(prev => prev.map((ex, i) => i !== ei ? ex : {
      ...ex,
      sets: ex.sets.map((s, j) => j !== si ? s : { ...s, [field]: val })
    }))
  }

  const onChangeSet = (ei: number, si: number, field: 'reps' | 'weight', val: string) => {
    setExercises(prev => {
      const copy = prev.map(e => ({ ...e, sets: e.sets.map(s => ({ ...s })) }))
      let num = Number(val)
      
      if (Number.isNaN(num)) {
        num = field === 'reps' ? 0 : 0
      } else {
        // Clamp values
        if (field === 'reps') {
          num = Math.max(0, Math.min(1000, num)) // Clamp reps between 0-1000
        } else {
          num = Math.max(0, Math.min(1000, num)) // Clamp weight between 0-1000
        }
      }
      
      ;(copy[ei].sets[si] as any)[field] = num
      return copy
    })
  }

  const handleKeyDown = (ei: number, si: number, field: 'reps' | 'weight', e: React.KeyboardEvent) => {
    const currentValue = exercises[ei]?.sets[si]?.[field] || 0
    
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const newValue = field === 'reps' ? currentValue + 1 : currentValue + 2.5
      onChangeSet(ei, si, field, newValue.toString())
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newValue = field === 'reps' ? Math.max(0, currentValue - 1) : Math.max(0, currentValue - 2.5)
      onChangeSet(ei, si, field, newValue.toString())
    } else if (e.key === 'Enter') {
      e.preventDefault()
      // Find next input or save
      const nextInput = findNextInput(ei, si, field)
      if (nextInput) {
        nextInput.focus()
      } else {
        saveButtonRef.current?.focus()
      }
    }
  }

  const findNextInput = (ei: number, si: number, field: 'reps' | 'weight'): HTMLInputElement | null => {
    const currentFieldIndex = field === 'reps' ? 0 : 1
    
    // Try next field in same set
    if (currentFieldIndex === 0 && inputRefs.current[ei]?.[si * 2 + 1]) {
      return inputRefs.current[ei][si * 2 + 1]
    }
    
    // Try next set
    if (si + 1 < exercises[ei]?.sets.length) {
      return inputRefs.current[ei]?.[(si + 1) * 2] || null
    }
    
    // Try next exercise
    if (ei + 1 < exercises.length) {
      return inputRefs.current[ei + 1]?.[0] || null
    }
    
    return null
  }

  const updateExerciseName = (ei: number, name: string) => {
    setExercises(prev => prev.map((ex, i) => i === ei ? { ...ex, name } : ex))
  }

  const removeExercise = (ei: number) => {
    setExercises(prev => prev.filter((_, i) => i !== ei))
  }

  const addSet = (ei: number) => {
    setExercises(prev => prev.map((ex, i) => i !== ei ? ex : {
      ...ex,
      sets: [...ex.sets, { reps: 8, weight: 0 }]
    }))
  }

  const removeSet = (ei: number, si: number) => {
    setExercises(prev => prev.map((ex, i) => i !== ei ? ex : {
      ...ex,
      sets: ex.sets.filter((_, j) => j !== si)
    }))
  }

  const addExercise = () => {
    setExercises(prev => ([...prev, { 
      id: crypto.randomUUID(), 
      name: 'New Exercise', 
      sets: [{ reps: 8, weight: 0 }]
    }]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workout) return

    // Validate workout data
    const workoutData = {
      date: new Date(date).toISOString(),
      notes: notes.trim() || undefined,
      exercises: exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        sets: ex.sets.map(s => ({ reps: s.reps, weight: s.weight }))
      }))
    }
    
    const validation = validateWorkoutForm(workoutData)
    if (!validation.isValid) {
      // For now, just log validation errors since we don't have toast in this component
      console.error('Validation errors:', validation.errors)
      return
    }

    setIsLoading(true)
    try {
      const updatedWorkout: Workout = {
        ...workout,
        date: new Date(date).toISOString(),
        notes: notes.trim() || undefined,
        exercises
      }
      await onSave(updatedWorkout)
      onClose()
    } catch (error) {
      console.error('Failed to save workout:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !workout) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Edit Workout</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date and Notes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional workout notes"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                />
              </div>
            </div>

            {/* Exercises */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Exercises</h3>
                <button
                  type="button"
                  onClick={addExercise}
                  className="bg-brand-green text-white rounded-lg px-3 py-2 text-sm hover:bg-green-600 transition-colors"
                >
                  + Add Exercise
                </button>
              </div>

              {exercises.map((exercise, ei) => (
                <div key={exercise.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(e) => updateExerciseName(ei, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      placeholder="Exercise name"
                    />
                    <button
                      type="button"
                      onClick={() => removeExercise(ei)}
                      className="text-red-600 hover:text-red-800 text-sm px-3 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Sets */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Sets</span>
                      <button
                        type="button"
                        onClick={() => addSet(ei)}
                        className="text-brand-green hover:text-green-600 text-sm px-2 py-1 border border-brand-green rounded-lg hover:bg-green-50 transition-colors"
                      >
                        + Add Set
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 mb-2">
                      <div>Set</div>
                      <div>Reps</div>
                      <div>Weight (kg)</div>
                      <div></div>
                    </div>

                    {exercise.sets.map((set, si) => (
                      <div key={si} className="grid grid-cols-4 gap-2 items-center">
                        <div className="text-sm text-gray-600">Set {si + 1}</div>
                        <input
                          ref={el => {
                            if (!inputRefs.current[ei]) inputRefs.current[ei] = []
                            inputRefs.current[ei][si * 2] = el
                          }}
                          type="number"
                          min="0"
                          max="1000"
                          step="1"
                          value={set.reps}
                          onChange={(e) => onChangeSet(ei, si, 'reps', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(ei, si, 'reps', e)}
                          className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent"
                        />
                        <input
                          ref={el => {
                            if (!inputRefs.current[ei]) inputRefs.current[ei] = []
                            inputRefs.current[ei][si * 2 + 1] = el
                          }}
                          type="number"
                          step="0.5"
                          min="0"
                          max="1000"
                          value={set.weight}
                          onChange={(e) => onChangeSet(ei, si, 'weight', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(ei, si, 'weight', e)}
                          className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent"
                        />
                        {exercise.sets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSet(ei, si)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {exercises.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                  <div className="text-gray-400 mb-2">No exercises added</div>
                  <div className="text-sm text-gray-500">Click "Add Exercise" to get started</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                ref={saveButtonRef}
                type="submit"
                disabled={isLoading || exercises.length === 0}
                className="bg-brand-green text-white rounded-xl px-6 py-2 hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
