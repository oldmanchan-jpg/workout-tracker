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
      isCollapsed: idx !== 0,
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
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#29e33c', '#80f988', '#ffffff']
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#29e33c', '#80f988', '#ffffff']
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
                return { ...e, sets: newSets, isCollapsed: false }
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

    // Auto-start rest timer
    resetRestTimer()
    startRestTimer()
  }

  const handleFinishWorkout = async () => {
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

  // Calculate progress
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
  const completedSets = exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.status === 'completed').length, 0)
  const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0

  // Finished screen
  if (isFinished) {
    const exerciseLogs: ExerciseLog[] = exercises.map(ex => ({
      name: ex.name,
      sets: ex.sets.filter(s => s.status === 'completed' && s.data).map(s => s.data!)
    }))
    const { totalVolume, totalReps } = calculateTotals(exerciseLogs)

    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-lg mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-[#282a2c] rounded-[21px] p-8 text-center"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="w-24 h-24 bg-[#29e33c] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#29e33c]/50"
            >
              <Check className="w-12 h-12 text-black" strokeWidth={3} />
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Workout Complete!
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[#9a9fa4] mb-8"
            >
              Great job crushing <span className="text-[#29e33c]">{template.name}</span>!
            </motion.p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-black/30 rounded-[16px] p-4"
              >
                <p className="text-[#9a9fa4] text-sm mb-1">Total Volume</p>
                <p className="text-2xl font-bold text-[#29e33c]">{totalVolume.toFixed(0)} kg</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-black/30 rounded-[16px] p-4"
              >
                <p className="text-[#9a9fa4] text-sm mb-1">Total Reps</p>
                <p className="text-2xl font-bold text-white">{totalReps}</p>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-black/30 rounded-[16px] p-4 mb-6 text-left"
            >
              <h3 className="text-white font-semibold mb-3">Summary</h3>
              {exerciseLogs.map((log, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-white">{log.name}</span>
                  <span className="text-[#29e33c]">{log.sets.length} sets</span>
                </div>
              ))}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="w-full py-4 bg-[#29e33c] text-black font-bold text-lg rounded-[12px] shadow-lg shadow-[#29e33c]/30"
            >
              Back to Dashboard
            </motion.button>
          </motion.div>
        </div>
      </div>
    )
  }

  // Active workout screen
  return (
    <div className="min-h-screen bg-black pb-4">
      {/* Fixed Header */}
      <div className="sticky top-0 z-20 bg-black/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to quit this workout?')) {
                  navigate('/')
                }
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#282a2c] text-[#9a9fa4] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <h1 className="text-white font-semibold">{template.name}</h1>
              <p className="text-[#9a9fa4] text-xs">{completedSets}/{totalSets} sets</p>
            </div>

            <button
              onClick={handleFinishWorkout}
              className="px-4 py-2 bg-[#29e33c] text-black font-bold text-sm rounded-[10px]"
            >
              Finish
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 h-1 bg-[#282a2c] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#29e33c]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-3">
        {/* Exercises */}
        {exercises.map((exercise, exerciseIndex) => {
          const templateExercise = template.exercises[exerciseIndex]
          const allSetsCompleted = exercise.sets.every(s => s.status === 'completed')
          const completedCount = exercise.sets.filter(s => s.status === 'completed').length
          const totalSetCount = exercise.sets.length
          
          return (
            <motion.div 
              key={exerciseIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: exerciseIndex * 0.05 }}
              className={`bg-[#282a2c] rounded-[16px] overflow-hidden border ${
                allSetsCompleted ? 'border-[#29e33c]/30' : 'border-transparent'
              }`}
            >
              {/* Exercise Header */}
              <button
                onClick={() => toggleExerciseCollapse(exerciseIndex)}
                className="w-full px-4 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    allSetsCompleted 
                      ? 'bg-[#29e33c] text-black' 
                      : 'bg-[#29e33c]/20 text-[#29e33c]'
                  }`}>
                    {allSetsCompleted ? <Check className="w-5 h-5" /> : exerciseIndex + 1}
                  </div>
                  <div className="text-left">
                    <h3 className={`font-semibold ${allSetsCompleted ? 'text-[#29e33c]' : 'text-white'}`}>
                      {exercise.name}
                    </h3>
                    <p className="text-[#9a9fa4] text-xs">
                      {completedCount}/{totalSetCount} sets complete
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: exercise.isCollapsed ? 0 : 180 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-[#9a9fa4]" />
                </motion.div>
              </button>

              {/* Exercise Content */}
              <AnimatePresence>
                {!exercise.isCollapsed && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      {/* Table Header */}
                      <div className="grid grid-cols-[40px_1fr_1fr_1fr_48px] gap-2 text-[#9a9fa4] text-xs font-medium mb-2 px-1">
                        <span>SET</span>
                        <span className="text-center">KG</span>
                        <span className="text-center">REPS</span>
                        <span className="text-center">RPE</span>
                        <span></span>
                      </div>

                      {/* Sets */}
                      {exercise.sets.map((setState, setIndex) => {
                        const isCompleted = setState.status === 'completed'
                        const isInProgress = setState.status === 'in_progress'
                        const previousSet = setIndex > 0 ? exercise.sets[setIndex - 1].data : null

                        return (
                          <div 
                            key={setIndex} 
                            className={`grid grid-cols-[40px_1fr_1fr_1fr_48px] gap-2 items-center py-2 ${
                              isInProgress ? 'bg-black/30 -mx-2 px-2 rounded-[10px]' : ''
                            }`}
                          >
                            {/* Set Number */}
                            <div className="text-center">
                              <span className="text-white font-bold">{setIndex + 1}</span>
                              {previousSet && (
                                <p className="text-[#9a9fa4] text-[10px]">
                                  {previousSet.weight}×{previousSet.reps}
                                </p>
                              )}
                            </div>

                            {/* Weight Input */}
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
                              placeholder={templateExercise.weight?.toString() || '0'}
                              className={`w-full px-2 py-3 rounded-[8px] text-center font-semibold transition-all ${
                                isInProgress 
                                  ? 'bg-[#29e33c] text-black border-2 border-[#29e33c] focus:outline-none' 
                                  : isCompleted
                                  ? 'bg-[#29e33c]/20 text-[#29e33c] border border-[#29e33c]/30'
                                  : 'bg-black/30 text-[#9a9fa4] border border-white/5'
                              }`}
                            />

                            {/* Reps Input */}
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
                              className={`w-full px-2 py-3 rounded-[8px] text-center font-semibold transition-all ${
                                isInProgress 
                                  ? 'bg-[#29e33c] text-black border-2 border-[#29e33c] focus:outline-none' 
                                  : isCompleted
                                  ? 'bg-[#29e33c]/20 text-[#29e33c] border border-[#29e33c]/30'
                                  : 'bg-black/30 text-[#9a9fa4] border border-white/5'
                              }`}
                            />

                            {/* RPE Input */}
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
                              className={`w-full px-2 py-3 rounded-[8px] text-center font-semibold transition-all ${
                                isInProgress 
                                  ? 'bg-[#29e33c] text-black border-2 border-[#29e33c] focus:outline-none' 
                                  : isCompleted
                                  ? 'bg-[#29e33c]/20 text-[#29e33c] border border-[#29e33c]/30'
                                  : 'bg-black/30 text-[#9a9fa4] border border-white/5'
                              }`}
                            />

                            {/* Checkmark */}
                            <div className="flex justify-center">
                              {isCompleted ? (
                                <div className="w-10 h-10 bg-[#29e33c] rounded-full flex items-center justify-center">
                                  <Check className="w-5 h-5 text-black" strokeWidth={3} />
                                </div>
                              ) : isInProgress ? (
                                <button
                                  onClick={() => handleCompleteSet(exerciseIndex, setIndex)}
                                  className="w-10 h-10 rounded-full border-2 border-[#29e33c] flex items-center justify-center hover:bg-[#29e33c]/20 transition-colors"
                                >
                                  <Check className="w-5 h-5 text-[#29e33c]" />
                                </button>
                              ) : (
                                <div className="w-10 h-10 rounded-full border-2 border-white/10" />
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}

        {/* Rest Timer */}
        <div className="bg-[#282a2c] rounded-[16px] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#9a9fa4] text-sm font-medium">Rest Timer</span>
            <input
              type="number"
              inputMode="numeric"
              value={Math.floor(restTimerRemaining)}
              onChange={(e) => setRestTimerRemaining(parseInt(e.target.value) || 0)}
              className="w-16 px-2 py-1 bg-black/30 border border-white/10 rounded-[8px] text-white text-center text-sm font-medium focus:outline-none focus:border-[#29e33c]"
            />
          </div>
          
          {/* Timer Display */}
          <div className={`text-center py-6 rounded-[12px] font-mono text-5xl font-bold mb-4 transition-all ${
            restTimerRemaining === 0 
              ? 'bg-[#29e33c] text-black' 
              : restTimerRemaining <= 10 
              ? 'bg-red-500/20 text-red-400 animate-pulse' 
              : 'bg-black/30 text-white'
          }`}>
            {formatTime(restTimerRemaining)}
          </div>

          {/* Timer Controls */}
          <div className="flex gap-3">
            <AnimatePresence mode="wait">
              {!restTimerActive ? (
                <motion.button
                  key="play"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={startRestTimer}
                  className="flex-1 py-3 bg-[#29e33c] text-black rounded-[10px] flex items-center justify-center gap-2 font-bold"
                >
                  <Play className="w-5 h-5" fill="black" />
                  Start
                </motion.button>
              ) : (
                <motion.button
                  key="pause"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={pauseRestTimer}
                  className="flex-1 py-3 bg-yellow-500 text-black rounded-[10px] flex items-center justify-center gap-2 font-bold"
                >
                  <Pause className="w-5 h-5" />
                  Pause
                </motion.button>
              )}
            </AnimatePresence>
            <button
              onClick={resetRestTimer}
              className="py-3 px-4 bg-black/30 text-[#9a9fa4] rounded-[10px] hover:text-white transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workout Notes */}
        <div className="bg-[#282a2c] rounded-[16px] p-4">
          <label className="block text-[#9a9fa4] text-sm font-medium mb-2">
            Workout Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did you feel today?"
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-[10px] text-white placeholder-[#9a9fa4] focus:outline-none focus:border-[#29e33c] resize-none"
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}
