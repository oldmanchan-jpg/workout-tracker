import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Check, Play, Pause, RotateCcw, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
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

  // Initialize all exercises - COLLAPSED BY DEFAULT except first one
  const [exercises, setExercises] = useState<ExerciseState[]>(
    template.exercises.map((ex, idx) => ({
      name: ex.name,
      isCollapsed: idx !== 0, // ✅ FIX: Only first exercise is open
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

  // Trigger confetti when workout is finished
  useEffect(() => {
    if (isFinished) {
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval = window.setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [isFinished])

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
                return { ...e, sets: newSets, isCollapsed: false } // ✅ Auto-open next exercise
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
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-8 text-center shadow-2xl"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Workout Complete!
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-gray-400 mb-8"
            >
              Great job crushing that {template.name}!
            </motion.p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 border border-gray-600 hover:border-orange-500/50 transition-all shadow-lg"
              >
                <p className="text-gray-400 text-sm mb-1">Total Volume</p>
                <p className="text-2xl font-bold text-white">{totalVolume.toFixed(0)} kg</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 border border-gray-600 hover:border-orange-500/50 transition-all shadow-lg"
              >
                <p className="text-gray-400 text-sm mb-1">Total Reps</p>
                <p className="text-2xl font-bold text-white">{totalReps}</p>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 mb-6 text-left border border-gray-600"
            >
              <h3 className="text-white font-semibold mb-3">Workout Summary</h3>
              {exerciseLogs.map((log, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + (idx * 0.1), duration: 0.3 }}
                  className="mb-3 last:mb-0"
                >
                  <p className="text-white font-medium">{log.name}</p>
                  <p className="text-gray-400 text-sm">
                    {log.sets.length} sets completed
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(249, 115, 22, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-orange-500/30"
            >
              Back to Dashboard
            </motion.button>
          </motion.div>
        </div>
      </div>
    )
  }

  // Active workout screen - IMPROVED MOBILE UI
  return (
    <div className="min-h-screen bg-gray-900 p-3 sm:p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-4"
        >
          <motion.button
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (confirm('Are you sure you want to quit this workout?')) {
                navigate('/')
              }
            }}
            className="p-3 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors border-2 border-gray-700"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(34, 197, 94, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFinishWorkout}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg transition-all text-base shadow-lg shadow-green-600/30"
          >
            Finish Workout
          </motion.button>
        </motion.div>

        {/* Workout Title - LARGER FONT */}
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{template.name}</h1>
          <div className="flex items-center gap-3 text-base text-gray-400">
            <span>📅 {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* All Exercises - Accordion Style */}
        <div className="space-y-3 mb-4">
          {exercises.map((exercise, exerciseIndex) => {
            const templateExercise = template.exercises[exerciseIndex]
            const allSetsCompleted = exercise.sets.every(s => s.status === 'completed')
            const completedCount = exercise.sets.filter(s => s.status === 'completed').length
            const totalSets = exercise.sets.length
            
            return (
              <motion.div 
                key={exerciseIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: exerciseIndex * 0.1, duration: 0.3 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl rounded-lg overflow-hidden border-2 border-gray-700"
              >
                {/* Exercise Header - LARGER & MORE VISIBLE */}
                <motion.button
                  whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleExerciseCollapse(exerciseIndex)}
                  className="w-full px-4 py-4 flex items-center justify-between border-b-2 border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 font-bold text-lg">{exerciseIndex + 1}.</span>
                    <div className="text-left">
                      <h3 className={`font-bold text-lg ${allSetsCompleted ? 'text-green-400' : 'text-orange-400'}`}>
                        {exercise.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {completedCount}/{totalSets} sets complete
                      </p>
                    </div>
                    {allSetsCompleted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        className="ml-2"
                      >
                        <Check className="w-6 h-6 text-green-400" />
                      </motion.div>
                    )}
                  </div>
                  <motion.div
                    animate={{ rotate: exercise.isCollapsed ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  </motion.div>
                </motion.button>

                {/* Exercise Content - Collapsible */}
                <AnimatePresence>
                  {!exercise.isCollapsed && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 sm:p-4 bg-gray-900">
                        {/* IMPROVED TABLE - BETTER CONTRAST & LARGER */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-base">
                            <thead>
                              <tr className="text-sm font-bold text-gray-300 border-b-2 border-gray-700">
                                <th className="text-left pb-3 px-2">Set</th>
                                <th className="text-center pb-3 px-2">kg</th>
                                <th className="text-center pb-3 px-2">Reps</th>
                                <th className="text-center pb-3 px-2">RPE</th>
                                <th className="w-12 pb-3"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {exercise.sets.map((setState, setIndex) => {
                            const isCompleted = setState.status === 'completed'
                            const isInProgress = setState.status === 'in_progress'
                            const previousSet = setIndex > 0 ? exercise.sets[setIndex - 1].data : null

                            return (
                              <tr key={setIndex} className="border-t border-gray-700">
                                {/* Set Number & Previous - LARGER */}
                                <td className="py-3 px-2">
                                  <div className="text-white font-bold text-lg">{setIndex + 1}</div>
                                  {previousSet && (
                                    <div className="text-sm text-gray-400">
                                      {previousSet.weight}×{previousSet.reps}
                                    </div>
                                  )}
                                </td>

                                {/* Weight Input - LARGER & BETTER CONTRAST */}
                                <td className="py-3 px-2">
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
                                    className={`w-full px-2 py-3 rounded-lg text-center text-base font-semibold focus:outline-none focus:ring-4 transition-all ${
                                      isInProgress 
                                        ? 'bg-white text-gray-900 border-2 border-orange-500 focus:ring-orange-500/50' 
                                        : 'bg-gray-800 text-gray-300 border-2 border-gray-700'
                                    }`}
                                  />
                                </td>

                                {/* Reps Input - LARGER & BETTER CONTRAST */}
                                <td className="py-3 px-2">
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
                                    className={`w-full px-2 py-3 rounded-lg text-center text-base font-semibold focus:outline-none focus:ring-4 transition-all ${
                                      isInProgress 
                                        ? 'bg-white text-gray-900 border-2 border-orange-500 focus:ring-orange-500/50' 
                                        : 'bg-gray-800 text-gray-300 border-2 border-gray-700'
                                    }`}
                                  />
                                </td>

                                {/* RPE Input - LARGER & BETTER CONTRAST */}
                                <td className="py-3 px-2">
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
                                    className={`w-full px-2 py-3 rounded-lg text-center text-base font-semibold focus:outline-none focus:ring-4 transition-all ${
                                      isInProgress 
                                        ? 'bg-white text-gray-900 border-2 border-orange-500 focus:ring-orange-500/50' 
                                        : 'bg-gray-800 text-gray-300 border-2 border-gray-700'
                                    }`}
                                  />
                                </td>

                                {/* Checkmark - MUCH MORE VISIBLE */}
                                <td className="py-3 px-2">
                                  {isCompleted ? (
                                    <div className="flex items-center justify-center">
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring" }}
                                        className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center"
                                      >
                                        <Check className="w-6 h-6 text-white" strokeWidth={3} />
                                      </motion.div>
                                    </div>
                                  ) : isInProgress ? (
                                    <button
                                      onClick={() => handleCompleteSet(exerciseIndex, setIndex)}
                                      className="flex items-center justify-center p-2 hover:bg-orange-500/20 rounded-lg transition-all w-full"
                                    >
                                      <div className="w-9 h-9 rounded-full border-4 border-orange-500 hover:bg-orange-500/30 transition-all" />
                                    </button>
                                  ) : (
                                    <div className="flex items-center justify-center">
                                      <div className="w-9 h-9 rounded-full border-4 border-gray-700" />
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Timer Section - LARGER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl rounded-lg p-4 mb-4 border-2 border-gray-700"
        >
          <h3 className="text-white font-bold mb-3 text-base uppercase text-gray-300">Rest Timer</h3>
          
          {/* Timer Display - LARGER */}
          <motion.div 
            animate={{ 
              scale: restTimerRemaining <= 10 && restTimerRemaining > 0 ? [1, 1.02, 1] : 1,
              boxShadow: restTimerRemaining === 0 ? "0 0 30px rgba(34, 197, 94, 0.5)" : "none"
            }}
            transition={{ 
              scale: { duration: 0.5, repeat: restTimerRemaining <= 10 && restTimerRemaining > 0 ? Infinity : 0 },
              boxShadow: { duration: 0.3 }
            }}
            className={`w-full text-center py-6 rounded-xl font-mono text-5xl sm:text-6xl font-bold mb-4 transition-colors duration-300 ${
              restTimerRemaining === 0 ? 'bg-green-600 text-white' : 
              restTimerRemaining <= 10 ? 'bg-red-600 text-white' : 
              'bg-gray-700 text-white'
            }`}
          >
            {formatTime(restTimerRemaining)}
          </motion.div>

          {/* Controls Row - LARGER BUTTONS */}
          <div className="flex items-center gap-3">
            {/* Timer Duration Input */}
            <div className="flex-shrink-0" style={{ width: '90px' }}>
              <input
                type="number"
                inputMode="numeric"
                value={Math.floor(restTimerRemaining)}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0
                  setRestTimerRemaining(value)
                }}
                className="w-full px-3 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 text-center text-base font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/50"
                placeholder="90"
              />
              <p className="text-sm text-gray-400 text-center mt-1 font-semibold">seconds</p>
            </div>

            {/* Timer Controls - LARGER */}
            <div className="flex-1 flex gap-3">
              <AnimatePresence mode="wait">
                {!restTimerActive ? (
                  <motion.button
                    key="play"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startRestTimer}
                    className="flex-1 p-4 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors flex items-center justify-center shadow-lg font-bold"
                  >
                    <Play className="w-6 h-6" />
                  </motion.button>
                ) : (
                  <motion.button
                    key="pause"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={pauseRestTimer}
                    className="flex-1 p-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl transition-colors flex items-center justify-center shadow-lg font-bold"
                  >
                    <Pause className="w-6 h-6" />
                  </motion.button>
                )}
              </AnimatePresence>
              <motion.button
                whileHover={{ scale: 1.05, rotate: -180 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetRestTimer}
                className="flex-1 p-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors flex items-center justify-center shadow-lg font-bold"
              >
                <RotateCcw className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Workout Notes - LARGER */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl rounded-lg p-4 mb-4 border-2 border-gray-700">
          <label htmlFor="workout-notes" className="block text-gray-300 font-bold mb-3 text-base uppercase">
            Workout Notes
          </label>
          <textarea
            id="workout-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did you feel?"
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 text-base placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-orange-500/50 resize-none font-medium"
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}
