import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Check, Play, Pause, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
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

interface ExerciseState {
  name: string
  sets: SetState[]
  isCollapsed: boolean
  currentInputs: {
    reps: string
    weight: string
    rpe: string
  }
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

  // Initialize all exercises with their sets
  const [exercises, setExercises] = useState<ExerciseState[]>(
    template.exercises.map((ex, idx) => ({
      name: ex.name,
      isCollapsed: false,
      sets: Array(ex.sets).fill(null).map((_, setIdx) => ({
        status: idx === 0 && setIdx === 0 ? 'in_progress' : 'pending'
      })),
      currentInputs: {
        reps: ex.reps.toString(),
        weight: ex.weight?.toString() || '',
        rpe: '7'
      }
    }))
  )
  
  const [isFinished, setIsFinished] = useState(false)
  const [notes, setNotes] = useState('')
  
  // Single global timer
  const [restTimerRemaining, setRestTimerRemaining] = useState(90)
  const [restTimerActive, setRestTimerActive] = useState(false)
  const [defaultRestTime] = useState(90)
  
  const timerInterval = useRef<number | null>(null)

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

  const toggleExerciseCollapse = (exerciseIndex: number) => {
    setExercises(prev => prev.map((ex, idx) => 
      idx === exerciseIndex ? { ...ex, isCollapsed: !ex.isCollapsed } : ex
    ))
  }

  const handleCompleteSet = (exerciseIndex: number, setIndex: number) => {
    const exercise = exercises[exerciseIndex]
    const reps = parseInt(exercise.currentInputs.reps)
    const weight = parseFloat(exercise.currentInputs.weight)
    const rpe = exercise.currentInputs.rpe ? parseInt(exercise.currentInputs.rpe) : undefined

    if (!reps || reps <= 0 || !weight || weight < 0) {
      alert('Please enter valid reps and weight')
      return
    }

    if (rpe !== undefined && (rpe < 1 || rpe > 10)) {
      alert('RPE must be between 1 and 10')
      return
    }

    const newSet: SetLog = { reps, weight, rpe }
    
    setExercises(prev => prev.map((ex, exIdx) => {
      if (exIdx !== exerciseIndex) return ex

      const updatedSets = [...ex.sets]
      updatedSets[setIndex] = {
        status: 'completed',
        data: newSet
      }

      // Move to next set if available
      if (setIndex + 1 < updatedSets.length) {
        updatedSets[setIndex + 1] = {
          ...updatedSets[setIndex + 1],
          status: 'in_progress'
        }
      } else {
        // Exercise complete - find next exercise and activate its first set
        const nextExerciseIndex = exIdx + 1
        if (nextExerciseIndex < exercises.length) {
          setTimeout(() => {
            setExercises(prevEx => prevEx.map((e, i) => {
              if (i === nextExerciseIndex && e.sets[0]) {
                const newSets = [...e.sets]
                newSets[0] = { ...newSets[0], status: 'in_progress' }
                return { ...e, sets: newSets }
              }
              return e
            }))
          }, 100)
        }
      }

      // Check if exercise is complete and collapse it
      const allComplete = updatedSets.every(s => s.status === 'completed')
      
      return {
        ...ex,
        sets: updatedSets,
        isCollapsed: allComplete
      }
    }))
  }

  const handleFinishWorkout = async () => {
    // Build exercise logs from completed sets
    const exerciseLogs: ExerciseLog[] = exercises.map(ex => ({
      name: ex.name,
      sets: ex.sets.filter(s => s.status === 'completed' && s.data).map(s => s.data!)
    }))

    const hasAnySets = exerciseLogs.some(log => log.sets.length > 0)
    if (!hasAnySets) {
      alert('Please log at least one set before finishing')
      return
    }

    const { totalVolume, totalReps } = calculateTotals(exerciseLogs)

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

  const calculateTotals = (exerciseLogs: ExerciseLog[]) => {
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

  const updateInput = (exerciseIndex: number, field: 'reps' | 'weight' | 'rpe', value: string) => {
    setExercises(prev => prev.map((ex, idx) => 
      idx === exerciseIndex 
        ? { ...ex, currentInputs: { ...ex.currentInputs, [field]: value } }
        : ex
    ))
  }

  // Finished screen
  if (isFinished) {
    const exerciseLogs: ExerciseLog[] = exercises.map(ex => ({
      name: ex.name,
      sets: ex.sets.filter(s => s.status === 'completed' && s.data).map(s => s.data!)
    }))
    const { totalVolume, totalReps } = calculateTotals(exerciseLogs)

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

  // Active workout screen - ACCORDION VIEW
  return (
    <div className="min-h-screen bg-gray-900 p-2 sm:p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
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
            className="px-4 sm:px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
          >
            Finish
          </button>
        </div>

        {/* Workout Title */}
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">{template.name}</h1>
          <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-400">
            <span>📅 {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* All Exercises - Accordion Style */}
        <div className="space-y-3 mb-4">
          {exercises.map((exercise, exerciseIndex) => {
            const templateExercise = template.exercises[exerciseIndex]
            const allSetsCompleted = exercise.sets.every(s => s.status === 'completed')
            
            return (
              <div 
                key={exerciseIndex}
                className="bg-gray-800 rounded-lg overflow-hidden"
              >
                {/* Exercise Header - Always visible */}
                <button
                  onClick={() => toggleExerciseCollapse(exerciseIndex)}
                  className="w-full px-3 py-3 flex items-center justify-between border-b border-gray-700 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-semibold text-sm">{exerciseIndex + 1}.</span>
                    <h3 className={`font-bold text-left ${allSetsCompleted ? 'text-green-500' : 'text-blue-400'}`}>
                      {exercise.name}
                    </h3>
                    {allSetsCompleted && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  {exercise.isCollapsed ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* Exercise Content - Collapsible */}
                {!exercise.isCollapsed && (
                  <div className="p-2 sm:p-3">
                    {/* Compact Table for Mobile */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-400">
                            <th className="text-left pb-2 px-1">Set</th>
                            <th className="text-center pb-2 px-1">kg</th>
                            <th className="text-center pb-2 px-1">Reps</th>
                            <th className="text-center pb-2 px-1">RPE</th>
                            <th className="w-10 pb-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {exercise.sets.map((setState, setIndex) => {
                            const isCompleted = setState.status === 'completed'
                            const isInProgress = setState.status === 'in_progress'
                            const previousSet = setIndex > 0 ? exercise.sets[setIndex - 1].data : null

                            return (
                              <tr key={setIndex} className="border-t border-gray-700">
                                {/* Set Number & Previous */}
                                <td className="py-2 px-1">
                                  <div className="text-white font-semibold">{setIndex + 1}</div>
                                  {previousSet && (
                                    <div className="text-xs text-gray-500">
                                      {previousSet.weight}×{previousSet.reps}
                                    </div>
                                  )}
                                </td>

                                {/* Weight Input */}
                                <td className="py-2 px-1">
                                  <input
                                    type="number"
                                    inputMode="decimal"
                                    step="0.5"
                                    value={isCompleted && setState.data ? setState.data.weight : (isInProgress ? exercise.currentInputs.weight : '')}
                                    onChange={(e) => {
                                      if (isInProgress) {
                                        updateInput(exerciseIndex, 'weight', e.target.value)
                                      }
                                    }}
                                    disabled={!isInProgress}
                                    placeholder={templateExercise.weight?.toString()}
                                    className="w-full px-1 py-2 bg-gray-700 border border-gray-600 rounded text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-800 disabled:text-gray-400 disabled:border-gray-700"
                                  />
                                </td>

                                {/* Reps Input */}
                                <td className="py-2 px-1">
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    value={isCompleted && setState.data ? setState.data.reps : (isInProgress ? exercise.currentInputs.reps : '')}
                                    onChange={(e) => {
                                      if (isInProgress) {
                                        updateInput(exerciseIndex, 'reps', e.target.value)
                                      }
                                    }}
                                    disabled={!isInProgress}
                                    placeholder={templateExercise.reps.toString()}
                                    className="w-full px-1 py-2 bg-gray-700 border border-gray-600 rounded text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-800 disabled:text-gray-400 disabled:border-gray-700"
                                  />
                                </td>

                                {/* RPE Input */}
                                <td className="py-2 px-1">
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    min="1"
                                    max="10"
                                    value={isCompleted && setState.data?.rpe ? setState.data.rpe : (isInProgress ? exercise.currentInputs.rpe : '')}
                                    onChange={(e) => {
                                      if (isInProgress) {
                                        updateInput(exerciseIndex, 'rpe', e.target.value)
                                      }
                                    }}
                                    disabled={!isInProgress}
                                    placeholder="7"
                                    className="w-full px-1 py-2 bg-gray-700 border border-gray-600 rounded text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-800 disabled:text-gray-400 disabled:border-gray-700"
                                  />
                                </td>

                                {/* Checkmark */}
                                <td className="py-2 px-1">
                                  {isCompleted ? (
                                    <div className="flex items-center justify-center">
                                      <Check className="w-5 h-5 text-green-500" />
                                    </div>
                                  ) : isInProgress ? (
                                    <button
                                      onClick={() => handleCompleteSet(exerciseIndex, setIndex)}
                                      className="flex items-center justify-center p-2 hover:bg-gray-700 rounded transition-colors w-full"
                                    >
                                      <div className="w-5 h-5 rounded border-2 border-gray-500 hover:border-gray-400" />
                                    </button>
                                  ) : (
                                    <div className="flex items-center justify-center">
                                      <div className="w-5 h-5 rounded border-2 border-gray-700" />
                                    </div>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Timer Section */}
        <div className="bg-gray-800 rounded-lg p-3 mb-3">
          <h3 className="text-white font-semibold mb-2 text-xs uppercase text-gray-400">Rest Timer</h3>
          
          {/* Timer Display - Full width on mobile */}
          <div className={`w-full text-center py-4 rounded-lg font-mono text-3xl sm:text-4xl font-bold mb-3 ${
            restTimerRemaining === 0 ? 'bg-green-600 text-white' : 
            restTimerRemaining <= 10 ? 'bg-red-600 text-white' : 
            'bg-gray-700 text-white'
          }`}>
            {formatTime(restTimerRemaining)}
          </div>

          {/* Controls Row */}
          <div className="flex items-center gap-2">
            {/* Timer Duration Input */}
            <div className="flex-shrink-0" style={{ width: '70px' }}>
              <input
                type="number"
                inputMode="numeric"
                value={Math.floor(restTimerRemaining)}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0
                  setRestTimerRemaining(value)
                }}
                className="w-full px-2 py-2.5 bg-gray-700 border border-gray-600 rounded text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="90"
              />
              <p className="text-xs text-gray-400 text-center mt-1">sec</p>
            </div>

            {/* Timer Controls */}
            <div className="flex-1 flex gap-2">
              {!restTimerActive ? (
                <button
                  onClick={startRestTimer}
                  className="flex-1 p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <Play className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={pauseRestTimer}
                  className="flex-1 p-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <Pause className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={resetRestTimer}
                className="flex-1 p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Workout Notes */}
        <div className="bg-gray-800 rounded-lg p-3 mb-3">
          <label htmlFor="workout-notes" className="block text-gray-400 font-medium mb-2 text-xs uppercase">
            Workout Notes
          </label>
          <textarea
            id="workout-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did you feel?"
            className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}
