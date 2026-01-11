import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Dumbbell } from 'lucide-react'
import type { WorkoutTemplate } from '../types'
import { saveWorkout } from '../services/workoutService'

interface SetLog {
  reps: number
  weight: number
}

interface ExerciseLog {
  name: string
  sets: SetLog[]
}

export default function ActiveWorkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const template = location.state?.template as WorkoutTemplate | undefined

  // If no template provided, redirect to dashboard
  if (!template) {
    navigate('/')
    return null
  }

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(
    template.exercises.map(ex => ({
      name: ex.name,
      sets: []
    }))
  )
  const [currentReps, setCurrentReps] = useState('')
  const [currentWeight, setCurrentWeight] = useState('')
  const [isFinished, setIsFinished] = useState(false)

  const currentExercise = template.exercises[currentExerciseIndex]
  const currentLog = exerciseLogs[currentExerciseIndex]
  const totalExercises = template.exercises.length

  const handleAddSet = () => {
    const reps = parseInt(currentReps)
    const weight = parseFloat(currentWeight)

    if (!reps || reps <= 0 || !weight || weight < 0) {
      alert('Please enter valid reps and weight')
      return
    }

    const newSet: SetLog = { reps, weight }
    const updatedLogs = [...exerciseLogs]
    updatedLogs[currentExerciseIndex].sets.push(newSet)
    setExerciseLogs(updatedLogs)

    // Clear inputs
    setCurrentReps('')
    setCurrentWeight('')
  }

  const handleNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
      setCurrentReps('')
      setCurrentWeight('')
    }
  }

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1)
      setCurrentReps('')
      setCurrentWeight('')
    }
  }

  const handleFinishWorkout = async () => {
    // Check if at least one set was logged
    const hasAnySets = exerciseLogs.some(log => log.sets.length > 0)
    if (!hasAnySets) {
      alert('Please log at least one set before finishing')
      return
    }

    // Calculate totals
    const { totalVolume, totalReps } = calculateTotals()

    // Prepare workout data for Supabase
    const workoutData = {
      workout_date: new Date().toISOString(),
      template_name: template.name,
      exercises: exerciseLogs,
      total_volume: totalVolume,
      total_reps: totalReps,
      notes: ''
    }

    try {
      // Save to Supabase
      const { data, error } = await saveWorkout(workoutData)
      
      if (error) {
        alert('Failed to save workout. Please try again.')
        console.error('Save error:', error)
        return
      }

      console.log('Workout saved successfully:', data)
      setIsFinished(true)
    } catch (error) {
      alert('Failed to save workout. Please try again.')
      console.error('Save error:', error)
    }
  }

  const calculateTotals = () => {
    let totalVolume = 0
    let totalReps = 0

    exerciseLogs.forEach(log => {
      log.sets.forEach(set => {
        totalVolume += set.reps * set.weight
        totalReps += set.reps
      })
    })

    return { totalVolume, totalReps }
  }

  // Finished screen
  if (isFinished) {
    const { totalVolume, totalReps } = calculateTotals()

    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">Workout Complete!</h1>
            <p className="text-gray-400 mb-8">Great job crushing that {template.name}!</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Total Volume</p>
                <p className="text-2xl font-bold text-white">{totalVolume.toFixed(0)} kg</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Total Reps</p>
                <p className="text-2xl font-bold text-white">{totalReps}</p>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-white font-semibold mb-3">Workout Summary</h3>
              {exerciseLogs.map((log, idx) => (
                <div key={idx} className="mb-3 last:mb-0">
                  <p className="text-white font-medium">{log.name}</p>
                  <p className="text-gray-400 text-sm">
                    {log.sets.length} sets completed
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Active workout screen
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to quit this workout?')) {
                navigate('/')
              }
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">{template.name}</h1>
            <p className="text-gray-400 text-sm">
              Exercise {currentExerciseIndex + 1} of {totalExercises}
            </p>
          </div>
          <div className="w-6" /> {/* Spacer */}
        </div>

        {/* Current Exercise */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{currentExercise.name}</h2>
              <p className="text-gray-400">
                Target: {currentExercise.sets} sets × {currentExercise.reps} reps
              </p>
            </div>
          </div>

          {/* Completed Sets */}
          {currentLog.sets.length > 0 && (
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">Completed Sets:</p>
              <div className="space-y-2">
                {currentLog.sets.map((set, idx) => (
                  <div key={idx} className="bg-gray-700 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-white font-medium">Set {idx + 1}</span>
                    <span className="text-gray-300">
                      {set.reps} reps × {set.weight} kg
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Reps</label>
                <input
                  type="number"
                  value={currentReps}
                  onChange={(e) => setCurrentReps(e.target.value)}
                  placeholder="12"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  placeholder="20"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <button
              onClick={handleAddSet}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Complete Set
            </button>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={handlePreviousExercise}
            disabled={currentExerciseIndex === 0}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>
          <button
            onClick={handleNextExercise}
            disabled={currentExerciseIndex === totalExercises - 1}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Next
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Finish Workout Button */}
        <button
          onClick={handleFinishWorkout}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          Finish Workout
        </button>
      </div>
    </div>
  )
}