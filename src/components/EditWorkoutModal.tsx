import React, { useState, useEffect } from 'react'
import type { Workout, ExerciseEntry } from '@/types'

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

  // Initialize form when workout changes
  useEffect(() => {
    if (workout) {
      setDate(new Date(workout.date).toISOString().slice(0, 10))
      setNotes(workout.notes || '')
      setExercises([...workout.exercises])
    }
  }, [workout])

  const updateSet = (ei: number, si: number, field: 'reps' | 'weight', val: number) => {
    setExercises(prev => prev.map((ex, i) => i !== ei ? ex : {
      ...ex,
      sets: ex.sets.map((s, j) => j !== si ? s : { ...s, [field]: val })
    }))
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
                          type="number"
                          min="1"
                          value={set.reps}
                          onChange={(e) => updateSet(ei, si, 'reps', Number(e.target.value))}
                          className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-brand-green focus:border-transparent"
                        />
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={set.weight}
                          onChange={(e) => updateSet(ei, si, 'weight', Number(e.target.value))}
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
