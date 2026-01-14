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

    // Auto-start rest timer after completing a set
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

  // Get timer state for styling
  const getTimerState = () => {
    if (restTimerRemaining === 0) return 'complete'
    if (restTimerRemaining <= 10) return 'critical'
    if (restTimerRemaining <= 30) return 'warning'
    return 'default'
  }

  // Finished screen
  if (isFinished) {
    const exerciseLogs: ExerciseLog[] = exercises.map(ex => ({
      name: ex.name,
      sets: ex.sets.filter(s => s.status === 'completed' && s.data).map(s => s.data!)
    }))
    const { totalVolume, totalReps } = calculateTotals(exerciseLogs)

    return (
      <div className="min-h-screen p-4" style={{ backgroundColor: '#0a0a0b' }}>
        <div className="max-w-lg mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: '#141416', border: '1px solid #27272a' }}
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)', boxShadow: '0 0 40px rgba(74, 222, 128, 0.4)' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <Check className="w-12 h-12" style={{ color: '#0a0a0b' }} strokeWidth={3} />
              </motion.div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl font-bold mb-2"
              style={{ color: '#fafafa' }}
            >
              Workout Complete!
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-8"
              style={{ color: '#a1a1aa' }}
            >
              Great job crushing {template.name}!
            </motion.p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="rounded-xl p-4"
                style={{ backgroundColor: '#1c1c1f', border: '1px solid #27272a' }}
              >
                <p className="text-sm mb-1" style={{ color: '#a1a1aa' }}>Total Volume</p>
                <p className="text-2xl font-bold" style={{ color: '#22d3ee' }}>{totalVolume.toFixed(0)} kg</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="rounded-xl p-4"
                style={{ backgroundColor: '#1c1c1f', border: '1px solid #27272a' }}
              >
                <p className="text-sm mb-1" style={{ color: '#a1a1aa' }}>Total Reps</p>
                <p className="text-2xl font-bold" style={{ color: '#22d3ee' }}>{totalReps}</p>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="rounded-xl p-4 mb-6 text-left"
              style={{ backgroundColor: '#1c1c1f', border: '1px solid #27272a' }}
            >
              <h3 className="font-semibold mb-3" style={{ color: '#fafafa' }}>Summary</h3>
              {exerciseLogs.map((log, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + (idx * 0.1), duration: 0.3 }}
                  className="mb-3 last:mb-0 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(74, 222, 128, 0.2)' }}>
                      <Check className="w-4 h-4" style={{ color: '#4ade80' }} />
                    </div>
                    <span style={{ color: '#fafafa' }}>{log.name}</span>
                  </div>
                  <span style={{ color: '#a1a1aa' }}>{log.sets.length} sets</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="w-full font-semibold py-4 rounded-xl transition-all"
              style={{ 
                background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                color: '#0a0a0b',
                boxShadow: '0 0 30px rgba(34, 211, 238, 0.3)'
              }}
            >
              Back to Dashboard
            </motion.button>
          </motion.div>
        </div>
      </div>
    )
  }

  // Active workout screen - NO TOPBAR, FOCUSED UI
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0b' }}>
      {/* MINIMAL HEADER - No TopBar */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: '#0a0a0b', borderBottom: '1px solid #27272a' }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (confirm('Quit workout? Your progress will be lost.')) {
              navigate('/')
            }
          }}
          className="w-11 h-11 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#1c1c1f', border: '1px solid #3f3f46' }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#a1a1aa' }} />
        </motion.button>

        <div className="text-center">
          <h1 className="font-semibold" style={{ color: '#fafafa' }}>{template.name}</h1>
          <p className="text-xs" style={{ color: '#52525b' }}>
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleFinishWorkout}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm"
          style={{ 
            background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
            color: '#0a0a0b',
            boxShadow: '0 0 20px rgba(74, 222, 128, 0.3)'
          }}
        >
          Finish
        </motion.button>
      </motion.header>

      {/* MAIN CONTENT */}
      <main className="p-4 pb-8 space-y-4 max-w-lg mx-auto">
        {/* Exercise Accordions */}
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
              transition={{ delay: exerciseIndex * 0.05, duration: 0.3 }}
              className="rounded-2xl overflow-hidden"
              style={{ 
                backgroundColor: '#141416', 
                border: allSetsCompleted ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid #27272a' 
              }}
            >
              {/* Exercise Header */}
              <motion.button
                whileTap={{ scale: 0.99 }}
                onClick={() => toggleExerciseCollapse(exerciseIndex)}
                className="w-full px-4 py-4 flex items-center justify-between"
                style={{ backgroundColor: allSetsCompleted ? 'rgba(74, 222, 128, 0.05)' : 'transparent' }}
              >
                <div className="flex items-center gap-3">
                  <span 
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                    style={{ 
                      backgroundColor: allSetsCompleted ? 'rgba(74, 222, 128, 0.2)' : '#1c1c1f',
                      color: allSetsCompleted ? '#4ade80' : '#22d3ee'
                    }}
                  >
                    {allSetsCompleted ? <Check className="w-4 h-4" /> : exerciseIndex + 1}
                  </span>
                  <div className="text-left">
                    <h3 
                      className="font-semibold text-base"
                      style={{ color: allSetsCompleted ? '#4ade80' : '#fafafa' }}
                    >
                      {exercise.name}
                    </h3>
                    <p className="text-sm" style={{ color: '#52525b' }}>
                      {completedCount}/{totalSets} sets
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: exercise.isCollapsed ? 0 : 180 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5" style={{ color: '#52525b' }} />
                </motion.div>
              </motion.button>

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
                      <div 
                        className="grid gap-2 pb-2 mb-2 text-xs font-medium"
                        style={{ 
                          gridTemplateColumns: '40px 1fr 1fr 56px 56px',
                          color: '#52525b',
                          borderBottom: '1px solid #27272a'
                        }}
                      >
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
                            className="grid gap-2 py-2 items-center"
                            style={{ 
                              gridTemplateColumns: '40px 1fr 1fr 56px 56px',
                              borderBottom: setIndex < exercise.sets.length - 1 ? '1px solid #1c1c1f' : 'none'
                            }}
                          >
                            {/* Set Number */}
                            <div>
                              <span className="font-bold" style={{ color: '#fafafa' }}>{setIndex + 1}</span>
                              {previousSet && (
                                <p className="text-xs" style={{ color: '#52525b' }}>
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
                              onChange={(e) => isInProgress && updateInput(exerciseIndex, 'weight', e.target.value)}
                              disabled={!isInProgress}
                              placeholder={templateExercise.weight?.toString() || '0'}
                              className="w-full h-12 rounded-lg text-center font-semibold transition-all outline-none"
                              style={
                                isCompleted 
                                  ? { backgroundColor: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.3)', color: '#4ade80' }
                                  : isInProgress 
                                    ? { backgroundColor: '#1e293b', border: '2px solid #22d3ee', color: '#fafafa', boxShadow: '0 0 0 4px rgba(34, 211, 238, 0.1)' }
                                    : { backgroundColor: '#1c1c1f', border: '1px solid #27272a', color: '#52525b' }
                              }
                            />

                            {/* Reps Input */}
                            <input
                              type="number"
                              inputMode="numeric"
                              value={isCompleted && setState.data ? setState.data.reps : (isInProgress ? exercise.currentInputs.reps : '')}
                              onChange={(e) => isInProgress && updateInput(exerciseIndex, 'reps', e.target.value)}
                              disabled={!isInProgress}
                              placeholder={templateExercise.reps.toString()}
                              className="w-full h-12 rounded-lg text-center font-semibold transition-all outline-none"
                              style={
                                isCompleted 
                                  ? { backgroundColor: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.3)', color: '#4ade80' }
                                  : isInProgress 
                                    ? { backgroundColor: '#1e293b', border: '2px solid #22d3ee', color: '#fafafa', boxShadow: '0 0 0 4px rgba(34, 211, 238, 0.1)' }
                                    : { backgroundColor: '#1c1c1f', border: '1px solid #27272a', color: '#52525b' }
                              }
                            />

                            {/* RPE Input */}
                            <input
                              type="number"
                              inputMode="numeric"
                              min="1"
                              max="10"
                              value={isCompleted && setState.data?.rpe ? setState.data.rpe : (isInProgress ? exercise.currentInputs.rpe : '')}
                              onChange={(e) => isInProgress && updateInput(exerciseIndex, 'rpe', e.target.value)}
                              disabled={!isInProgress}
                              placeholder="7"
                              className="w-full h-12 rounded-lg text-center font-semibold transition-all outline-none"
                              style={
                                isCompleted 
                                  ? { backgroundColor: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.3)', color: '#4ade80' }
                                  : isInProgress 
                                    ? { backgroundColor: '#1e293b', border: '2px solid #22d3ee', color: '#fafafa', boxShadow: '0 0 0 4px rgba(34, 211, 238, 0.1)' }
                                    : { backgroundColor: '#1c1c1f', border: '1px solid #27272a', color: '#52525b' }
                              }
                            />

                            {/* CHECKMARK - FIXED: Large, visible, proper touch target */}
                            <div className="flex justify-center">
                              {isCompleted ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                  className="w-11 h-11 rounded-full flex items-center justify-center"
                                  style={{ 
                                    background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                                    boxShadow: '0 0 15px rgba(74, 222, 128, 0.4)'
                                  }}
                                >
                                  <Check className="w-6 h-6" style={{ color: '#0a0a0b' }} strokeWidth={3} />
                                </motion.div>
                              ) : isInProgress ? (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleCompleteSet(exerciseIndex, setIndex)}
                                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all"
                                  style={{ 
                                    border: '3px solid #22d3ee',
                                    backgroundColor: 'rgba(34, 211, 238, 0.1)'
                                  }}
                                >
                                  <Check className="w-5 h-5" style={{ color: '#22d3ee', opacity: 0.5 }} />
                                </motion.button>
                              ) : (
                                <div 
                                  className="w-11 h-11 rounded-full"
                                  style={{ border: '2px solid #27272a' }}
                                />
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

        {/* REST TIMER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4"
          style={{ backgroundColor: '#141416', border: '1px solid #27272a' }}
        >
          <h3 className="text-sm font-medium mb-3" style={{ color: '#52525b' }}>REST TIMER</h3>
          
          {/* Timer Display */}
          <motion.div 
            animate={{ 
              scale: getTimerState() === 'critical' ? [1, 1.02, 1] : 1,
            }}
            transition={{ 
              duration: 0.5, 
              repeat: getTimerState() === 'critical' ? Infinity : 0 
            }}
            className="rounded-xl py-6 mb-4 font-mono text-5xl font-bold text-center"
            style={{ 
              backgroundColor: getTimerState() === 'complete' 
                ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
                : '#1c1c1f',
              background: getTimerState() === 'complete' 
                ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
                : '#1c1c1f',
              color: getTimerState() === 'complete' ? '#0a0a0b' 
                : getTimerState() === 'critical' ? '#f87171'
                : getTimerState() === 'warning' ? '#fbbf24'
                : '#fafafa',
              boxShadow: getTimerState() === 'critical' ? '0 0 30px rgba(248, 113, 113, 0.3)' 
                : getTimerState() === 'warning' ? '0 0 20px rgba(251, 191, 36, 0.2)'
                : getTimerState() === 'complete' ? '0 0 30px rgba(74, 222, 128, 0.4)'
                : 'none'
            }}
          >
            {formatTime(restTimerRemaining)}
          </motion.div>

          {/* Timer Controls */}
          <div className="flex gap-3">
            <input
              type="number"
              inputMode="numeric"
              value={restTimerRemaining}
              onChange={(e) => setRestTimerRemaining(parseInt(e.target.value) || 0)}
              className="w-20 h-12 rounded-lg text-center font-semibold outline-none"
              style={{ backgroundColor: '#1c1c1f', border: '1px solid #3f3f46', color: '#fafafa' }}
            />

            <AnimatePresence mode="wait">
              {!restTimerActive ? (
                <motion.button
                  key="play"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startRestTimer}
                  className="flex-1 h-12 rounded-lg flex items-center justify-center font-semibold gap-2"
                  style={{ 
                    background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                    color: '#0a0a0b'
                  }}
                >
                  <Play className="w-5 h-5" fill="currentColor" />
                  Start
                </motion.button>
              ) : (
                <motion.button
                  key="pause"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={pauseRestTimer}
                  className="flex-1 h-12 rounded-lg flex items-center justify-center font-semibold gap-2"
                  style={{ 
                    backgroundColor: '#fbbf24',
                    color: '#0a0a0b'
                  }}
                >
                  <Pause className="w-5 h-5" fill="currentColor" />
                  Pause
                </motion.button>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02, rotate: -90 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetRestTimer}
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#1c1c1f', border: '1px solid #3f3f46' }}
            >
              <RotateCcw className="w-5 h-5" style={{ color: '#a1a1aa' }} />
            </motion.button>
          </div>
        </motion.div>

        {/* NOTES */}
        <div 
          className="rounded-2xl p-4"
          style={{ backgroundColor: '#141416', border: '1px solid #27272a' }}
        >
          <label className="block text-sm font-medium mb-3" style={{ color: '#52525b' }}>
            WORKOUT NOTES
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did you feel? Any notes for next time..."
            rows={3}
            className="w-full rounded-lg p-3 resize-none outline-none transition-all"
            style={{ 
              backgroundColor: '#1c1c1f', 
              border: '1px solid #27272a', 
              color: '#fafafa',
              fontSize: '16px'
            }}
          />
        </div>
      </main>
    </div>
  )
}
