import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Check, Play, Pause, RotateCcw } from 'lucide-react'
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
  
  const [isFinished, setIsFinished] = useState(false)
  const [notes, setNotes] = useState('')
  
  // Single global timer
  const [restTimerRemaining, setRestTimerRemaining] = useState(90)
  const [restTimerActive, setRestTimerActive] = useState(false)
  const [defaultRestTime] = useState(90)
  
  // Input states - pre-filled with template values
  const [currentReps, setCurrentReps] = useState(currentExercise.reps.toString())
  const [currentWeight, setCurrentWeight] = useState(currentExercise.weight?.toString() || '')
  const [currentRPE, setCurrentRPE] = useState('7')
  
  const timerInterval = useRef<number | null>(null)

  const currentLog = exerciseLogs[currentExerciseIndex]
  const totalExercises = template.exercises.length

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current)
      }
    }
  }, [])

  // Timer effect
  useEffect(() => {
    if (restTimerActive && restTimerRemaining > 0) {
      timerInterval.current = window.setInterval(() => {
        setRestTimerRemaining(prev => {
          if (prev <= 1) {
            setRestTimerActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerInterval.current) {
        clearInterval(timerInterval.current)
        timerInterval.current = null
      }
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current)
      }
    }
  }, [restTimerActive, restTimerRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startRestTimer = () => setRestTimerActive(true)
  const pauseRestTimer = () => setRestTimerActive(false)
  const resetRestTimer = () => {
    setRestTimerActive(false)
    setRestTimerRemaining(defaultRestTime)
  }

  const handleCompleteSet = (setIndex: number) => {
    const reps = parseInt(currentReps)
    const weight = parseFloat(currentWeight)
    const rpe = currentRPE ? parseInt(currentRPE) : undefined

    if (!reps || reps <= 0 || !weight || weight < 0) {
      alert('Please enter valid reps and weight')
      return
    }

    if (rpe !== undefined && (rpe < 1 || rpe > 10)) {
      alert('RPE must be between 1 and 10')
      return
    }

    const newSet: SetLog = { reps, weight, rpe }
    
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

    setSetStates(updatedStates)
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
      setCurrentReps(nextExercise.reps.toString())
      setCurrentWeight(nextExercise.weight?.toString() || '')
      setCurrentRPE('7')
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
      setCurrentReps(prevExercise.reps.toString())
      setCurrentWeight(prevExercise.weight?.toString() || '')
      setCurrentRPE('7')
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

  // Get the current in-progress set index
  const currentSetIndex = setStates.findIndex(s => s.status === 'in_progress')

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

  // Active workout screen - STRONG-STYLE TABLE VIEW
  return (
    <div className="min-h-screen bg-gray-900 p-4 pb-32">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to quit this workout?')) {
                navigate('/')
              }
            }}
            className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleFinishWorkout}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            Finish
          </button>
        </div>

        {/* Workout Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">{template.name}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>📅 {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Current Exercise Card */}
        <div className="bg-gray-800 rounded-lg mb-4">
          {/* Exercise Header */}
          <div className="px-4 py-3 border-b border-gray-700">
            <h2 className="text-xl font-bold text-blue-400">{currentExercise.name}</h2>
          </div>

          {/* Sets Table */}
          <div className="p-4">
            {/* Table Header */}
            <div 
              className="grid gap-2 mb-2 text-xs text-gray-400 font-medium"
              style={{ gridTemplateColumns: '40px 60px 1fr 1fr 1fr 40px' }}
            >
              <div>Set</div>
              <div>Prev</div>
              <div className="text-center">kg</div>
              <div className="text-center">Reps</div>
              <div className="text-center">RPE</div>
              <div></div>
            </div>

            {/* Sets Rows */}
            <div className="space-y-1">
              {setStates.map((setState, setIndex) => {
                const isCompleted = setState.status === 'completed'
                const isInProgress = setState.status === 'in_progress'
                const previousSet = setIndex > 0 && exerciseLogs[currentExerciseIndex]?.sets[setIndex - 1]

                return (
                  <div
                    key={setIndex}
                    className="grid gap-2 items-center"
                    style={{ gridTemplateColumns: '40px 60px 1fr 1fr 1fr 40px' }}
                  >
                    {/* Set Number */}
                    <div className="text-white font-semibold text-sm">{setIndex + 1}</div>

                    {/* Previous */}
                    <div className="text-gray-500 text-xs truncate">
                      {previousSet ? `${previousSet.weight}×${previousSet.reps}` : '—'}
                    </div>

                    {/* Weight Input */}
                    <input
                      type="number"
                      step="0.5"
                      value={isCompleted && setState.data ? setState.data.weight : (isInProgress ? currentWeight : '')}
                      onChange={(e) => {
                        if (isInProgress) {
                          setCurrentWeight(e.target.value)
                        }
                      }}
                      disabled={!isInProgress}
                      placeholder={currentExercise.weight?.toString()}
                      className="px-2 py-2 bg-gray-700 border border-gray-600 rounded text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-800 disabled:text-gray-400 disabled:border-gray-700"
                    />

                    {/* Reps Input */}
                    <input
                      type="number"
                      value={isCompleted && setState.data ? setState.data.reps : (isInProgress ? currentReps : '')}
                      onChange={(e) => {
                        if (isInProgress) {
                          setCurrentReps(e.target.value)
                        }
                      }}
                      disabled={!isInProgress}
                      placeholder={currentExercise.reps.toString()}
                      className="px-2 py-2 bg-gray-700 border border-gray-600 rounded text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-800 disabled:text-gray-400 disabled:border-gray-700"
                    />

                    {/* RPE Input */}
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={isCompleted && setState.data?.rpe ? setState.data.rpe : (isInProgress ? currentRPE : '')}
                      onChange={(e) => {
                        if (isInProgress) {
                          setCurrentRPE(e.target.value)
                        }
                      }}
                      disabled={!isInProgress}
                      placeholder="7"
                      className="px-2 py-2 bg-gray-700 border border-gray-600 rounded text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-800 disabled:text-gray-400 disabled:border-gray-700"
                    />

                    {/* Checkmark */}
                    {isCompleted ? (
                      <div className="flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                    ) : isInProgress ? (
                      <button
                        onClick={() => handleCompleteSet(setIndex)}
                        className="flex items-center justify-center p-1 hover:bg-gray-700 rounded transition-colors"
                      >
                        <div className="w-5 h-5 rounded border-2 border-gray-500 hover:border-gray-400" />
                      </button>
                    ) : (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 rounded border-2 border-gray-700" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Timer Section */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <h3 className="text-white font-semibold mb-3 text-sm uppercase text-gray-400">Timer</h3>
          <div className="flex items-center gap-3">
            {/* Timer Duration Input */}
            <div className="flex-shrink-0" style={{ width: '80px' }}>
              <input
                type="number"
                value={Math.floor(restTimerRemaining)}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0
                  setRestTimerRemaining(value)
                }}
                className="w-full px-2 py-2 bg-gray-700 border border-gray-600 rounded text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="90"
              />
              <p className="text-xs text-gray-400 text-center mt-1">sec</p>
            </div>

            {/* Timer Display */}
            <div className={`flex-1 text-center py-3 rounded-lg font-mono text-2xl font-bold ${
              restTimerRemaining === 0 ? 'bg-green-600 text-white' : 
              restTimerRemaining <= 10 ? 'bg-red-600 text-white' : 
              'bg-gray-700 text-white'
            }`}>
              {formatTime(restTimerRemaining)}
            </div>

            {/* Timer Controls */}
            <div className="flex gap-2">
              {!restTimerActive ? (
                <button
                  onClick={startRestTimer}
                  className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Play className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={pauseRestTimer}
                  className="p-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                >
                  <Pause className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={resetRestTimer}
                className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Workout Notes */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <label htmlFor="workout-notes" className="block text-gray-400 font-medium mb-2 text-sm uppercase">
            Workout Notes
          </label>
          <textarea
            id="workout-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did you feel?"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Bottom Navigation - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          {currentExerciseIndex > 0 && (
            <button
              onClick={handlePreviousExercise}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              ← Previous
            </button>
          )}
          <button
            onClick={currentExerciseIndex < totalExercises - 1 ? handleNextExercise : handleFinishWorkout}
            className={`flex-1 font-semibold py-3 rounded-lg transition-colors ${
              currentExerciseIndex < totalExercises - 1 
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {currentExerciseIndex < totalExercises - 1 ? 'Next →' : 'Finish Workout'}
          </button>
        </div>
      </div>
    </div>
  )
}
