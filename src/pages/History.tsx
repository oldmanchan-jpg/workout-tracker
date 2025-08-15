import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/state/AuthContext'
import { listWorkouts, updateWorkout, deleteWorkout } from '@/lib/firestore'
import type { Workout, ExerciseEntry, ExerciseSet } from '@/types'
import { useToast, toast } from '@/components/Toaster'

type ExerciseHistoryEntry = {
  date: string
  workoutId: string
  exerciseName: string
  exerciseId: string
  sets: ExerciseSet[]
  totalVolume: number
  maxWeight: number
  totalReps: number
}

type SortField = 'date' | 'totalVolume' | 'maxWeight' | 'totalReps' | 'sets'
type SortDirection = 'asc' | 'desc'

export default function History() {
  const { user } = useAuth()
  const uid = user!.uid
  const { addToast } = useToast()
  
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExercise, setSelectedExercise] = useState<string>('')
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  })
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [editingSets, setEditingSets] = useState<ExerciseSet[]>([])

  // Load workouts
  useEffect(() => {
    const loadWorkouts = async () => {
      setLoading(true)
      try {
        const workoutList = await listWorkouts(uid)
        setWorkouts(workoutList)
        
        // Set default selected exercise if none selected
        if (!selectedExercise && workoutList.length > 0) {
          const allExercises = new Set<string>()
          workoutList.forEach(workout => {
            workout.exercises.forEach(exercise => {
              allExercises.add(exercise.name)
            })
          })
          const exerciseArray = Array.from(allExercises).sort()
          if (exerciseArray.length > 0) {
            setSelectedExercise(exerciseArray[0])
          }
        }
      } catch (error) {
        addToast(toast.error('Load Failed', 'Failed to load workout history.'))
      } finally {
        setLoading(false)
      }
    }
    
    loadWorkouts()
  }, [uid])

  // Get all available exercises
  const availableExercises = useMemo(() => {
    const exercises = new Set<string>()
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exercises.add(exercise.name)
      })
    })
    return Array.from(exercises).sort()
  }, [workouts])

  // Filter and process exercise history
  const exerciseHistory = useMemo(() => {
    if (!selectedExercise) return []

    const history: ExerciseHistoryEntry[] = []
    
    workouts.forEach(workout => {
      // Parse workout date and set time to start of day for comparison
      const workoutDate = new Date(workout.date)
      workoutDate.setHours(0, 0, 0, 0)
      
      const startDate = new Date(dateRange.start)
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date(dateRange.end)
      endDate.setHours(23, 59, 59, 999) // End of day
      
      // Check if workout is within date range
      if (workoutDate >= startDate && workoutDate <= endDate) {
        const exercise = workout.exercises.find(ex => ex.name === selectedExercise)
        if (exercise) {
          const totalVolume = exercise.sets.reduce((sum, set) => sum + (set.reps * set.weight), 0)
          const maxWeight = Math.max(...exercise.sets.map(set => set.weight))
          const totalReps = exercise.sets.reduce((sum, set) => sum + set.reps, 0)
          
          history.push({
            date: workout.date,
            workoutId: workout.id,
            exerciseName: exercise.name,
            exerciseId: exercise.id,
            sets: exercise.sets,
            totalVolume,
            maxWeight,
            totalReps
          })
        }
      }
    })
    
    // Sort by selected field and direction
    return history.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortField) {
        case 'date':
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case 'totalVolume':
          aValue = a.totalVolume
          bValue = b.totalVolume
          break
        case 'maxWeight':
          aValue = a.maxWeight
          bValue = b.maxWeight
          break
        case 'totalReps':
          aValue = a.totalReps
          bValue = b.totalReps
          break
        case 'sets':
          aValue = a.sets.length
          bValue = b.sets.length
          break
        default:
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
      }
      
      if (sortDirection === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })
  }, [workouts, selectedExercise, dateRange, sortField, sortDirection])

  // Handle sorting
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }, [sortField, sortDirection])

  // Start editing an entry
  const startEdit = useCallback((entry: ExerciseHistoryEntry) => {
    setEditingEntry(entry.workoutId + '-' + entry.exerciseId)
    setEditingSets([...entry.sets])
  }, [])

  // Cancel editing
  const cancelEdit = useCallback(() => {
    setEditingEntry(null)
    setEditingSets([])
  }, [])

  // Save edited entry
  const saveEdit = useCallback(async (entry: ExerciseHistoryEntry) => {
    try {
      const workout = workouts.find(w => w.id === entry.workoutId)
      if (!workout) throw new Error('Workout not found')

      const updatedExercises = workout.exercises.map(exercise => 
        exercise.id === entry.exerciseId 
          ? { ...exercise, sets: editingSets }
          : exercise
      )

      await updateWorkout(uid, entry.workoutId, { exercises: updatedExercises })
      
      // Update local state
      setWorkouts(prev => prev.map(w => 
        w.id === entry.workoutId 
          ? { ...w, exercises: updatedExercises }
          : w
      ))
      
      setEditingEntry(null)
      setEditingSets([])
      addToast(toast.success('Updated', 'Exercise updated successfully.'))
    } catch (error) {
      addToast(toast.error('Update Failed', 'Failed to update exercise.'))
    }
  }, [uid, workouts, editingSets, addToast])

  // Delete an entry
  const deleteEntry = useCallback(async (entry: ExerciseHistoryEntry) => {
    if (!confirm('Are you sure you want to delete this exercise from the workout?')) {
      return
    }

    try {
      const workout = workouts.find(w => w.id === entry.workoutId)
      if (!workout) throw new Error('Workout not found')

      const updatedExercises = workout.exercises.filter(exercise => exercise.id !== entry.exerciseId)

      if (updatedExercises.length === 0) {
        // If no exercises left, delete the entire workout
        await deleteWorkout(uid, entry.workoutId)
        setWorkouts(prev => prev.filter(w => w.id !== entry.workoutId))
        addToast(toast.success('Deleted', 'Workout deleted successfully.'))
      } else {
        // Update workout with remaining exercises
        await updateWorkout(uid, entry.workoutId, { exercises: updatedExercises })
        setWorkouts(prev => prev.map(w => 
          w.id === entry.workoutId 
            ? { ...w, exercises: updatedExercises }
            : w
        ))
        addToast(toast.success('Deleted', 'Exercise deleted successfully.'))
      }
    } catch (error) {
      addToast(toast.error('Delete Failed', 'Failed to delete exercise.'))
    }
  }, [uid, workouts, addToast])

  // Update editing sets
  const updateEditingSet = useCallback((index: number, field: 'reps' | 'weight', value: number) => {
    setEditingSets(prev => prev.map((set, i) => 
      i === index ? { ...set, [field]: value } : set
    ))
  }, [])

  // Add new set to editing
  const addEditingSet = useCallback(() => {
    setEditingSets(prev => [...prev, { reps: 0, weight: 0 }])
  }, [])

  // Remove set from editing
  const removeEditingSet = useCallback((index: number) => {
    setEditingSets(prev => prev.filter((_, i) => i !== index))
  }, [])

  // Export to CSV (single exercise)
  const exportToCSV = useCallback(() => {
    if (exerciseHistory.length === 0) {
      addToast(toast.error('No Data', 'No data to export for the selected criteria.'))
      return
    }

    const headers = ['Date', 'Exercise', 'Sets', 'Total Reps', 'Max Weight (kg)', 'Total Volume (kg)', 'Set Details']
    const csvContent = [
      headers.join(','),
      ...exerciseHistory.map(entry => [
        new Date(entry.date).toLocaleDateString(),
        entry.exerciseName,
        entry.sets.length,
        entry.totalReps,
        entry.maxWeight,
        entry.totalVolume,
        entry.sets.map(set => `${set.reps}×${set.weight}kg`).join('; ')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedExercise}-history-${dateRange.start}-to-${dateRange.end}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    addToast(toast.success('Export Complete', 'Exercise history exported to CSV successfully.'))
  }, [exerciseHistory, selectedExercise, dateRange, addToast])

  // Export all workouts to CSV
  const exportAllToCSV = useCallback(() => {
    const allWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date)
      workoutDate.setHours(0, 0, 0, 0)
      
      const startDate = new Date(dateRange.start)
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date(dateRange.end)
      endDate.setHours(23, 59, 59, 999)
      
      return workoutDate >= startDate && workoutDate <= endDate
    })

    if (allWorkouts.length === 0) {
      addToast(toast.error('No Data', 'No workouts found in the selected date range.'))
      return
    }

    const headers = ['Date', 'Exercise', 'Sets', 'Total Reps', 'Max Weight (kg)', 'Total Volume (kg)', 'Set Details', 'Notes']
    const csvContent = [
      headers.join(','),
      ...allWorkouts.flatMap(workout => 
        workout.exercises.map(exercise => {
          const totalVolume = exercise.sets.reduce((sum, set) => sum + (set.reps * set.weight), 0)
          const maxWeight = Math.max(...exercise.sets.map(set => set.weight))
          const totalReps = exercise.sets.reduce((sum, set) => sum + set.reps, 0)
          
          return [
            new Date(workout.date).toLocaleDateString(),
            exercise.name,
            exercise.sets.length,
            totalReps,
            maxWeight,
            totalVolume,
            exercise.sets.map(set => `${set.reps}×${set.weight}kg`).join('; '),
            workout.notes || ''
          ].join(',')
        })
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `all-workouts-${dateRange.start}-to-${dateRange.end}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    addToast(toast.success('Export Complete', 'All workouts exported to CSV successfully.'))
  }, [workouts, dateRange, addToast])

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (exerciseHistory.length === 0) return null
    
    const totalWorkouts = exerciseHistory.length
    const totalVolume = exerciseHistory.reduce((sum, entry) => sum + entry.totalVolume, 0)
    const totalReps = exerciseHistory.reduce((sum, entry) => sum + entry.totalReps, 0)
    const maxWeight = Math.max(...exerciseHistory.map(entry => entry.maxWeight))
    const avgVolume = totalVolume / totalWorkouts
    
    return {
      totalWorkouts,
      totalVolume,
      totalReps,
      maxWeight,
      avgVolume
    }
  }, [exerciseHistory])

  // Sortable header component
  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th 
      className="text-left py-3 px-4 font-medium cursor-pointer hover:bg-green-50 select-none transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <span className="text-primary">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  )

  return (
    <div className="min-h-screen bg-primary-dark">
      {/* Modern Header */}
      <div className="sticky top-0 z-20 bg-dark shadow-soft border-b border-purple">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📊</span>
            </div>
            <div className="font-bold text-xl text-dark">Exercise History</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportAllToCSV}
              className="btn btn-secondary btn-sm"
            >
              Export All
            </button>
            <Link to="/app" className="btn btn-outline btn-sm">
              Back to App
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 space-y-6 pb-24 md:pb-6">
        {/* Filters */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Filter & Search</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Exercise</label>
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="input"
              >
                <option value="">Select Exercise</option>
                {availableExercises.map(exercise => (
                  <option key={exercise} value={exercise}>{exercise}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {summaryStats && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Progress Summary</h3>
              <button
                onClick={exportToCSV}
                className="btn btn-primary"
              >
                Export to CSV
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="bg-primary-light rounded-lg p-4 animate-scale-in" style={{ animationDelay: '0ms' }}>
                <div className="text-3xl font-bold text-white mb-1">{summaryStats.totalWorkouts}</div>
                <div className="text-white text-sm font-medium">Workouts</div>
              </div>
              <div className="bg-secondary rounded-lg p-4 animate-scale-in" style={{ animationDelay: '100ms' }}>
                <div className="text-3xl font-bold text-white mb-1">{summaryStats.totalVolume.toFixed(0)}</div>
                <div className="text-white text-sm font-medium">Total Volume (kg)</div>
              </div>
              <div className="bg-primary rounded-lg p-4 animate-scale-in" style={{ animationDelay: '200ms' }}>
                <div className="text-3xl font-bold text-white mb-1">{summaryStats.totalReps}</div>
                <div className="text-white text-sm font-medium">Total Reps</div>
              </div>
              <div className="bg-secondary-light rounded-lg p-4 animate-scale-in" style={{ animationDelay: '300ms' }}>
                <div className="text-3xl font-bold text-dark mb-1">{summaryStats.maxWeight}</div>
                <div className="text-dark text-sm font-medium">Max Weight (kg)</div>
              </div>
              <div className="bg-primary-light rounded-lg p-4 animate-scale-in" style={{ animationDelay: '400ms' }}>
                <div className="text-3xl font-bold text-white mb-1">{summaryStats.avgVolume.toFixed(0)}</div>
                <div className="text-white text-sm font-medium">Avg Volume (kg)</div>
              </div>
            </div>
          </div>
        )}

        {/* History Table */}
        <div className="card p-6">
          <h3 className="text-2xl font-bold text-white mb-6">
            {selectedExercise ? `${selectedExercise} History` : 'Select an exercise to view history'}
          </h3>
          
          {loading && (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-secondary">Loading workout history...</div>
            </div>
          )}
          
          {!loading && exerciseHistory.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-secondary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📊</span>
              </div>
                             <div className="text-xl font-semibold text-white mb-2">
                 {selectedExercise 
                   ? 'No workouts found for this exercise'
                   : 'Select an exercise to view its history'
                 }
               </div>
              <div className="text-secondary text-lg">
                {selectedExercise 
                  ? 'Try adjusting your date range or select a different exercise.'
                  : 'Choose an exercise from the filter above to see your progress over time.'
                }
              </div>
            </div>
          )}
          
          {!loading && exerciseHistory.length > 0 && (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <SortableHeader field="date">Date</SortableHeader>
                    <SortableHeader field="sets">Sets</SortableHeader>
                    <SortableHeader field="totalReps">Total Reps</SortableHeader>
                    <SortableHeader field="maxWeight">Max Weight</SortableHeader>
                    <SortableHeader field="totalVolume">Total Volume</SortableHeader>
                    <th className="text-left py-3 px-4 font-medium">Set Details</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exerciseHistory.map((entry, index) => {
                    const isEditing = editingEntry === entry.workoutId + '-' + entry.exerciseId
                    
                    return (
                                             <tr key={index} className="hover:bg-secondary-dark transition-colors">
                                                 <td className="py-4 px-4">
                           <div className="font-medium text-white">
                             {new Date(entry.date).toLocaleDateString('en-US', { 
                               month: 'short', 
                               day: 'numeric',
                               weekday: 'short'
                             })}
                           </div>
                         </td>
                         <td className="py-4 px-4">
                           <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                             {entry.sets.length}
                           </div>
                         </td>
                         <td className="py-4 px-4 font-semibold text-white">{entry.totalReps}</td>
                         <td className="py-4 px-4">
                           <div className="bg-secondary text-white rounded-lg px-3 py-1 text-sm font-bold inline-block">
                             {entry.maxWeight} kg
                           </div>
                         </td>
                         <td className="py-4 px-4 font-semibold text-white">{entry.totalVolume.toFixed(0)} kg</td>
                        <td className="py-4 px-4">
                          {isEditing ? (
                            <div className="space-y-2">
                              {editingSets.map((set, setIndex) => (
                                <div key={setIndex} className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={set.reps}
                                    onChange={(e) => updateEditingSet(setIndex, 'reps', parseInt(e.target.value) || 0)}
                                    className="input w-16 text-center"
                                    placeholder="Reps"
                                  />
                                  <span className="text-secondary">×</span>
                                  <input
                                    type="number"
                                    value={set.weight}
                                    onChange={(e) => updateEditingSet(setIndex, 'weight', parseInt(e.target.value) || 0)}
                                    className="input w-16 text-center"
                                    placeholder="Weight"
                                  />
                                  <span className="text-secondary text-sm">kg</span>
                                  <button
                                    onClick={() => removeEditingSet(setIndex)}
                                    className="text-red-500 hover:text-red-700 text-sm bg-red-50 hover:bg-red-100 rounded-full w-6 h-6 flex items-center justify-center"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={addEditingSet}
                                className="text-primary hover:text-primary-light text-sm font-medium"
                              >
                                + Add Set
                              </button>
                            </div>
                          ) : (
                            <div className="text-sm text-secondary">
                              {entry.sets.map((set, setIndex) => (
                                <span key={setIndex}>
                                  {set.reps}×{set.weight}kg
                                  {setIndex < entry.sets.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => saveEdit(entry)}
                                className="btn btn-primary btn-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="btn btn-secondary btn-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => startEdit(entry)}
                                className="btn btn-outline btn-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteEntry(entry)}
                                className="btn btn-outline btn-sm text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
