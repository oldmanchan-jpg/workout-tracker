import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/state/AuthContext'
import { listWorkouts } from '@/lib/firestore'
import type { Workout } from '@/types'
import { useToast, toast } from '@/components/Toaster'

type ExerciseHistoryEntry = {
  date: string
  workoutId: string
  exerciseName: string
  sets: { reps: number; weight: number }[]
  totalVolume: number
  maxWeight: number
  totalReps: number
}

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
            sets: exercise.sets,
            totalVolume,
            maxWeight,
            totalReps
          })
        }
      }
    })
    
    // Sort by date (newest first)
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [workouts, selectedExercise, dateRange])

  // Export to CSV
  const exportToCSV = () => {
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
  }

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

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="font-semibold">Exercise History</div>
          <Link to="/app" className="text-sm px-3 py-1 rounded-lg border">Back to App</Link>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-4 space-y-4">
                 {/* Filters */}
         <div className="bg-white rounded-2xl shadow-soft p-4">
           <h2 className="text-xl font-semibold mb-4">Filters</h2>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
               <label className="block text-sm text-gray-600 mb-2">Exercise</label>
               <select
                 value={selectedExercise}
                 onChange={(e) => setSelectedExercise(e.target.value)}
                 className="w-full border rounded-xl px-3 py-2"
               >
                 <option value="">Select Exercise</option>
                 {availableExercises.map(exercise => (
                   <option key={exercise} value={exercise}>{exercise}</option>
                 ))}
               </select>
             </div>
             
             <div>
               <label className="block text-sm text-gray-600 mb-2">Start Date</label>
               <input
                 type="date"
                 value={dateRange.start}
                 onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                 className="w-full border rounded-xl px-3 py-2"
               />
             </div>
             
             <div>
               <label className="block text-sm text-gray-600 mb-2">End Date</label>
               <input
                 type="date"
                 value={dateRange.end}
                 onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                 className="w-full border rounded-xl px-3 py-2"
               />
             </div>
           </div>
           
           {/* Debug Info */}
           <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
             <div><strong>Debug Info:</strong></div>
             <div>Total workouts loaded: {workouts.length}</div>
             <div>Available exercises: {availableExercises.join(', ')}</div>
             <div>Selected exercise: {selectedExercise}</div>
             <div>Date range: {dateRange.start} to {dateRange.end}</div>
             <div>Filtered results: {exerciseHistory.length} entries</div>
             {workouts.length > 0 && (
               <div>Latest workout date: {new Date(workouts[0].date).toLocaleDateString()}</div>
             )}
           </div>
         </div>

        {/* Summary Stats */}
        {summaryStats && (
          <div className="bg-white rounded-2xl shadow-soft p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Summary</h3>
              <button
                onClick={exportToCSV}
                className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-3 py-2"
              >
                Export to CSV
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-600">{summaryStats.totalWorkouts}</div>
                <div className="text-sm text-gray-600">Workouts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{summaryStats.totalVolume.toFixed(0)}</div>
                <div className="text-sm text-gray-600">Total Volume (kg)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{summaryStats.totalReps}</div>
                <div className="text-sm text-gray-600">Total Reps</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{summaryStats.maxWeight}</div>
                <div className="text-sm text-gray-600">Max Weight (kg)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{summaryStats.avgVolume.toFixed(0)}</div>
                <div className="text-sm text-gray-600">Avg Volume (kg)</div>
              </div>
            </div>
          </div>
        )}

        {/* History Table */}
        <div className="bg-white rounded-2xl shadow-soft p-4">
          <h3 className="text-lg font-semibold mb-4">
            {selectedExercise ? `${selectedExercise} History` : 'Select an exercise to view history'}
          </h3>
          
          {loading && <div className="text-center py-8 text-gray-600">Loading...</div>}
          
          {!loading && exerciseHistory.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              {selectedExercise 
                ? 'No workouts found for this exercise in the selected date range.'
                : 'Please select an exercise to view its history.'
              }
            </div>
          )}
          
          {!loading && exerciseHistory.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Sets</th>
                    <th className="text-left py-3 px-4 font-medium">Total Reps</th>
                    <th className="text-left py-3 px-4 font-medium">Max Weight</th>
                    <th className="text-left py-3 px-4 font-medium">Total Volume</th>
                    <th className="text-left py-3 px-4 font-medium">Set Details</th>
                  </tr>
                </thead>
                <tbody>
                  {exerciseHistory.map((entry, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">{entry.sets.length}</td>
                      <td className="py-3 px-4">{entry.totalReps}</td>
                      <td className="py-3 px-4">{entry.maxWeight} kg</td>
                      <td className="py-3 px-4">{entry.totalVolume} kg</td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {entry.sets.map((set, setIndex) => (
                            <span key={setIndex}>
                              {set.reps}×{set.weight}kg
                              {setIndex < entry.sets.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
