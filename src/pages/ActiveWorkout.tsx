import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Check, Dumbbell, Play, Pause, RotateCcw } from 'lucide-react'
import type { Template } from '../types'
import { saveWorkout } from '../services/workoutService'

interface SetLog {
  reps: number
  weight: number
  rpe?: number
}

interface SetState {
  status: 'pending' | 'in_progress' | 'completed'
  data?: SetLog
}

interface ExerciseLog {
  name: string
  sets: SetLog[]
}

export default function ActiveWorkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const template = location.state?.template as Template | undefined

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
  
  // Initialize sets based on template
  const currentExercise = template.exercises[currentExerciseIndex]
  const targetSets = currentExercise.sets
  
  const [setStates, setSetStates] = useState<SetState[]>(
    Array(targetSets).fill(null).map((_, idx) => ({
      status: idx === 0 ? 'in_progress' : 'pending'
    }))
  )
  
  // Global rest timer state
  const [restTimerRemaining, setRestTimerRemaining] = useState(90)
  const [restTimerActive, setRestTimerActive] = useState(false)
  const [defaultRestTime] = useState(90)
  const restTimerInterval = useRef<number | null>(null)
  
  const [isFinished, setIsFinished] = useState(false)
  const [notes, setNotes] = useState('')
  
  // Input states for in-progress set - PRE-FILLED with template values
  const [currentWeight, setCurrentWeight] = useState(currentExercise.weight?.toString() || '')
  const [currentReps, setCurrentReps] = useState(currentExercise.reps.toString())
  const [currentRPE, setCurrentRPE] = useState('7')

  const currentLog = exerciseLogs[currentExerciseIndex]
  const totalExercises = template.exercises.length

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (restTimerInterval.current) {
        clearInterval(restTimerInterval.current)
      }
    }
  }, [])

  // Global rest timer effect
  useEffect(() => {
    if (restTimerActive && restTimerRemaining > 0) {
      if (!restTimerInterval.current) {
        restTimerInterval.current = window.setInterval(() => {
          setRestTimerRemaining(prev => {
            if (prev <= 1) {
              setRestTimerActive(false)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    } else {
      if (restTimerInterval.current) {
        clearInterval(restTimerInterval.current)
        restTimerInterval.current = null
      }
    }
  }, [restTimerActive, restTimerRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCompleteSet = (setIndex: number) => {
    const weight = parseFloat(currentWeight)
    const reps = parseInt(currentReps)
    const rpe = currentRPE ? parseInt(currentRPE) : undefined

    if (!weight || weight < 0 || !reps || reps <= 0) {
      alert('Please enter valid weight and reps')
      return
    }

    if (rpe !== undefined && (rpe < 1 || rpe > 10)) {
      alert('RPE must be between 1 and 10')
      return
    }

    const newSet: SetLog = { weight, reps, rpe }
    
    // Update exercise logs
    const updatedLogs = [...exerciseLogs]
    updatedLogs[currentExerciseIndex].sets.push(newSet)
    setExerciseLogs(updatedLogs)

    // Update set states
    const updatedStates = [...setStates]
    updatedStates[setIndex] = {
      status: 'completed',
      data: newSet
    }

    // Move to next set if available
    if (setIndex + 1 < targetSets) {
      updatedStates[setIndex + 1] = {
        ...updatedStates[setIndex + 1],
        status: 'in_progress'
      }
    }
    
    // Keep the last set's values for quick re-entry
    setCurrentWeight(weight.toString())
    setCurrentReps(reps.toString())
    if (rpe) setCurrentRPE(rpe.toString())

    setSetStates(updatedStates)
    
    // Start rest timer automatically
    setRestTimerRemaining(defaultRestTime)
    setRestTimerActive(true)
  }

  const handleAddExtraSet = () => {
    const updatedStates = [...setStates]
    updatedStates.push({
      status: 'in_progress'
    })
    setSetStates(updatedStates)
  }

  const startRestTimer = () => {
    setRestTimerActive(true)
  }

  const pauseRestTimer = () => {
    setRestTimerActive(false)
  }

  const resetRestTimer = () => {
    setRestTimerActive(false)
    setRestTimerRemaining(defaultRestTime)
  }

  const handleNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      const nextExercise = template.exercises[currentExerciseIndex + 1]
      setCurrentExerciseIndex(currentExerciseIndex + 1)
      setSetStates(
        Array(nextExercise.sets).fill(null).map((_, idx) => ({
          status: idx === 0 ? 'in_progress' : 'pending'
        }))
      )
      // Pre-fill with next exercise's template values
      setCurrentWeight(nextExercise.weight?.toString() || '')
      setCurrentReps(nextExercise.reps.toString())
      setCurrentRPE('7')
      
      // Reset rest timer
      setRestTimerActive(false)
      setRestTimerRemaining(defaultRestTime)
    }
  }

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      const prevExercise = template.exercises[currentExerciseIndex - 1]
      setCurrentExerciseIndex(currentExerciseIndex - 1)
      setSetStates(
        Array(prevExercise.sets).fill(null).map((_, idx) => ({
          status: idx === 0 ? 'in_progress' : 'pending'
        }))
      )
      // Pre-fill with previous exercise's template values
      setCurrentWeight(prevExercise.weight?.toString() || '')
      setCurrentReps(prevExercise.reps.toString())
      setCurrentRPE('7')
      
      // Reset rest timer
      setRestTimerActive(false)
      setRestTimerRemaining(defaultRestTime)
    }
  }

  const handleFinishExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      handleNextExercise()
    } else {
      // Last exercise - finish workout
      handleFinishWorkout()
    }
  }

  const handleFinishWorkout = async () => {
    const hasAnySets = exerciseLogs.some(log => log.sets.length > 0)
    if (!hasAnySets) {
      alert('Please log at least one set before finishing')
      return
    }

    const { totalVolume, totalReps } = calculateTotals()

    const workoutData = {
      workout_date: new Date().toISOString(),
      template_name: template.name,
      exercises: exerciseLogs,
      total_volume: totalVolume,
      total_reps: totalReps,
      notes: notes
    }

    try {
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

  // Active workout screen - CHECKLIST MODE
  return (
    <div className="min-h-screen bg-gray-900 p-4 pb-32">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
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
            <h1 className="text-lg font-bold text-white">{template.name}</h1>
            <p className="text-gray-400 text-xs">
              Exercise {currentExerciseIndex + 1} of {totalExercises}
            </p>
          </div>
          <div className="w-6" />
        </div>

        {/* Exercise Header with Target */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white truncate">{currentExercise.name}</h2>
              <p className="text-gray-400 text-sm">
                Target: {currentExercise.sets} × {currentExercise.reps} @ {currentExercise.weight || '—'}kg
              </p>
            </div>
          </div>
        </div>

        {/* Sets Checklist */}
        <div className="space-y-2 mb-4">
          {setStates.map((setState, setIndex) => {
            const isCompleted = setState.status === 'completed'
            const isInProgress = setState.status === 'in_progress'
            const isPending = setState.status === 'pending'

            return (
              <div
                key={setIndex}
                className={`rounded-lg border-2 transition-all ${
                  isCompleted
                    ? 'bg-gray-800 border-green-600'
                    : isInProgress
                    ? 'bg-gray-800 border-orange-500'
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                {/* Completed Set - Collapsed */}
                {isCompleted && setState.data && (
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-white font-semibold">Set {setIndex + 1}</span>
                    </div>
                    <div className="text-gray-300 text-sm">
                      {setState.data.weight}kg × {setState.data.reps} reps
                      {setState.data.rpe && (
                        <span className="ml-2 text-orange-400">RPE {setState.data.rpe}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* In Progress Set - Expanded */}
                {isInProgress && (
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-full border-2 border-orange-500 flex-shrink-0" />
                      <span className="text-white font-semibold">Set {setIndex + 1}</span>
                    </div>

                    {/* Input Fields - Weight → Reps → RPE */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <input
                            type="number"
                            step="0.5"
                            value={currentWeight}
                            onChange={(e) => setCurrentWeight(e.target.value)}
                            placeholder={currentExercise.weight?.toString() || '0'}
                            className="w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                          <p className="text-xs text-gray-400 text-center mt-1">kg</p>
                        </div>
                        <div>
                          <input
                            type="number"
                            value={currentReps}
                            onChange={(e) => setCurrentReps(e.target.value)}
                            placeholder={currentExercise.reps.toString()}
                            className="w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                          <p className="text-xs text-gray-400 text-center mt-1">reps</p>
                        </div>
                        <div>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={currentRPE}
                            onChange={(e) => setCurrentRPE(e.target.value)}
                            placeholder="7"
                            className="w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                          <p className="text-xs text-gray-400 text-center mt-1">RPE</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCompleteSet(setIndex)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        Complete Set
                      </button>
                    </div>
                  </div>
                )}

                {/* Pending Set - Collapsed */}
                {isPending && (
                  <div className="p-3 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex-shrink-0" />
                    <span className="text-gray-500 font-semibold">Set {setIndex + 1}</span>
                  </div>
                )}
              </div>
            )
          })}

          {/* Add Extra Set Button */}
          <button
            onClick={handleAddExtraSet}
            className="w-full py-3 border-2 border-dashed border-gray-700 rounded-lg text-gray-400 hover:border-orange-500 hover:text-orange-500 transition-colors font-medium"
          >
            + Add Extra Set
          </button>
        </div>

        {/* Workout Notes */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <label htmlFor="workout-notes" className="block text-white font-medium mb-2 text-sm">
            Workout Notes (Optional)
          </label>
          <textarea
            id="workout-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did you feel? Any pain? Energy level?"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            rows={3}
          />
        </div>

        {/* Bottom Navigation - Fixed */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
          {/* Global Rest Timer Bar */}
          {restTimerRemaining < defaultRestTime && (
            <div className={`px-4 py-2 flex items-center justify-between ${
              restTimerRemaining === 0 ? 'bg-green-600' : 
              restTimerRemaining <= 10 ? 'bg-red-600' : 
              'bg-gray-800'
            }`}>
              <span className="text-white font-semibold text-sm">Rest Timer</span>
              <div className="flex items-center gap-3">
                <span className="text-white font-mono text-lg font-bold">
                  {formatTime(restTimerRemaining)}
                </span>
                <div className="flex gap-1">
                  {!restTimerActive ? (
                    <button
                      onClick={startRestTimer}
                      className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={pauseRestTimer}
                      className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={resetRestTimer}
                    className="p-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="p-4">
            <div className="max-w-2xl mx-auto flex gap-3">
              <button
                onClick={handlePreviousExercise}
                disabled={currentExerciseIndex === 0}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <button
                onClick={handleFinishExercise}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {currentExerciseIndex === totalExercises - 1 ? 'Finish Workout' : 'Next Exercise →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
