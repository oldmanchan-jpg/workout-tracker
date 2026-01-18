import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Check, Play, Pause, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import type { Template, WorkoutType } from '../types'
import { saveWorkout, fetchTemplatesForCurrentUserFromSupabase } from '../services/workoutService'
import BottomNav from '../components/BottomNav'

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

// Template Picker Component - handles template selection UI
function TemplatePicker({ 
  templates, 
  templatesLoading,
  templatesError,
  selectedTemplateId, 
  onTemplateChange, 
  onStartWorkout 
}: { 
  templates: Template[]
  templatesLoading: boolean
  templatesError?: string | null
  selectedTemplateId: string
  onTemplateChange: (id: string) => void
  onStartWorkout: (template: Template) => void
}) {
  const navigate = useNavigate()
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

  return (
    <div className="min-h-screen hp-bg page-container p-4">
      <div className="mx-auto w-full max-w-[420px] pt-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 flex items-center justify-center rounded-full hp-pill text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="hp-title text-lg font-semibold flex-1 text-center">Start Workout</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Template Selection Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hp-card p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="hp-title font-semibold text-lg">Select Template</h2>
            <span className="hp-muted text-sm">{templates.length} available</span>
          </div>

          {/* Template Dropdown */}
          {templatesLoading ? (
            <div className="ui-input w-full px-4 py-4 font-medium text-base bg-black/20 border-white/10 text-white/80">
              Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="ui-input w-full px-4 py-4 bg-black/20 border-white/10 text-center">
              <div className="hp-title font-semibold">No templates assigned yet</div>
              <div className="hp-muted text-sm mt-1">Contact your coach to get started</div>
              {templatesError ? (
                <div className="hp-muted text-xs mt-2 opacity-70">{templatesError}</div>
              ) : null}
            </div>
          ) : (
            <div className="relative">
              <select
                value={selectedTemplateId}
                onChange={(e) => onTemplateChange(e.target.value)}
                className="ui-input w-full px-4 py-4 appearance-none font-medium text-base cursor-pointer bg-black/20 border-white/10 text-white"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id} className="bg-[#141416]">
                    {t.name}
                  </option>
                ))}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#29e33c] rotate-90 pointer-events-none" />
            </div>
          )}

          {/* Start Workout Button */}
          {selectedTemplate && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStartWorkout(selectedTemplate)}
              className="w-full h-14 bg-[#29e33c] text-black font-bold text-lg rounded-full flex items-center justify-center gap-3 hp-glow-soft"
            >
              <Play className="w-6 h-6" fill="currentColor" />
              Start Workout
            </motion.button>
          )}
        </motion.div>
      </div>
      <BottomNav />
    </div>
  )
}

// Workout Session Component - handles all workout logging logic
function WorkoutSession({ template }: { template: Template }) {
  const navigate = useNavigate()
  const workoutType: WorkoutType = template?.type || 'strength'
  
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

  // EMOM timer
  const [emomSecondsRemaining, setEmomSecondsRemaining] = useState(() =>
    workoutType === 'emom' ? (template.durationMinutes || 0) * 60 : 0
  )
  const [emomTimerActive, setEmomTimerActive] = useState(false)
  const emomInterval = useRef<number | null>(null)

  // Circuit state + rest timer
  const [circuitRound, setCircuitRound] = useState(1)
  const [circuitRoundsCompleted, setCircuitRoundsCompleted] = useState(0)
  const [circuitRestRemaining, setCircuitRestRemaining] = useState(() =>
    workoutType === 'circuit' ? (template.restBetweenRoundsSeconds ?? 0) : 0
  )
  const [circuitRestActive, setCircuitRestActive] = useState(false)
  const [circuitIsResting, setCircuitIsResting] = useState(false)
  const circuitInterval = useRef<number | null>(null)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current)
      }
      if (emomInterval.current) {
        clearInterval(emomInterval.current)
      }
      if (circuitInterval.current) {
        clearInterval(circuitInterval.current)
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

  // EMOM timer effect
  useEffect(() => {
    if (workoutType === 'emom' && emomTimerActive && emomSecondsRemaining > 0) {
      emomInterval.current = window.setInterval(() => {
        setEmomSecondsRemaining(prev => {
          if (prev <= 1) {
            setEmomTimerActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (emomInterval.current) {
        clearInterval(emomInterval.current)
        emomInterval.current = null
      }
    }

    return () => {
      if (emomInterval.current) {
        clearInterval(emomInterval.current)
      }
    }
  }, [workoutType, emomTimerActive, emomSecondsRemaining])

  // Circuit rest timer effect
  useEffect(() => {
    if (workoutType === 'circuit' && circuitRestActive && circuitRestRemaining > 0) {
      circuitInterval.current = window.setInterval(() => {
        setCircuitRestRemaining(prev => {
          if (prev <= 1) {
            setCircuitRestActive(false)
            setCircuitIsResting(false)
            setCircuitRound(r => {
              const total = template.rounds || 0
              return total > 0 ? Math.min(r + 1, total) : r + 1
            })
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (circuitInterval.current) {
        clearInterval(circuitInterval.current)
        circuitInterval.current = null
      }
    }

    return () => {
      if (circuitInterval.current) {
        clearInterval(circuitInterval.current)
      }
    }
  }, [workoutType, circuitRestActive, circuitRestRemaining, template.rounds])

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

  const resetEmomTimer = () => {
    setEmomTimerActive(false)
    setEmomSecondsRemaining((template.durationMinutes || 0) * 60)
  }

  const startCircuitRest = () => {
    const restSeconds = template.restBetweenRoundsSeconds ?? 0
    if (restSeconds <= 0) {
      setCircuitIsResting(false)
      setCircuitRestActive(false)
      setCircuitRestRemaining(0)
      setCircuitRound(r => {
        const total = template.rounds || 0
        return total > 0 ? Math.min(r + 1, total) : r + 1
      })
      return
    }
    setCircuitIsResting(true)
    setCircuitRestRemaining(restSeconds)
    setCircuitRestActive(true)
  }

  const skipCircuitRest = () => {
    setCircuitRestActive(false)
    setCircuitIsResting(false)
    setCircuitRestRemaining(0)
    setCircuitRound(r => {
      const total = template.rounds || 0
      return total > 0 ? Math.min(r + 1, total) : r + 1
    })
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

  const handleFinishEmomWorkout = async () => {
    const durationMinutes = template.durationMinutes || 0
    const initialSeconds = durationMinutes * 60
    const elapsedSeconds = Math.max(0, initialSeconds - emomSecondsRemaining)

    const workoutData = {
      workout_date: new Date().toISOString(),
      template_name: template.name,
      exercises: [],
      total_volume: 0,
      total_reps: 0,
      notes: JSON.stringify({
        type: 'emom',
        durationMinutes,
        elapsedSeconds
      })
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

  const handleCompleteCircuitRound = () => {
    const totalRounds = template.rounds || 0
    if (totalRounds <= 0) return
    if (circuitIsResting) return

    // Completing current round
    const isLastRound = circuitRound >= totalRounds
    setCircuitRoundsCompleted(prev => Math.min(prev + 1, totalRounds))

    if (isLastRound) {
      return
    }

    startCircuitRest()
  }

  const handleFinishCircuitWorkout = async () => {
    const totalRounds = template.rounds || 0

    const workoutData = {
      workout_date: new Date().toISOString(),
      template_name: template.name,
      exercises: [],
      total_volume: 0,
      total_reps: 0,
      notes: JSON.stringify({
        type: 'circuit',
        roundsCompleted: circuitRoundsCompleted,
        totalRounds
      })
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

  function renderStrengthWorkout() {
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
        <div className="min-h-screen hp-bg page-container p-4">
          <div className="mx-auto w-full max-w-[420px]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="hp-card p-8 text-center"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                className="w-24 h-24 bg-[#29e33c] rounded-full flex items-center justify-center mx-auto mb-6 hp-glow"
              >
                <Check className="w-12 h-12 text-black" strokeWidth={3} />
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="hp-title text-3xl font-bold mb-2"
              >
                Workout Complete!
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="hp-muted mb-8"
              >
                Great job crushing <span className="text-[#29e33c] font-semibold">{template.name}</span>!
              </motion.p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="hp-card-2 p-4"
                >
                  <p className="hp-muted text-sm mb-1">Total Volume</p>
                  <p className="text-[#29e33c] text-2xl font-bold">{totalVolume.toFixed(0)} kg</p>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="hp-card-2 p-4"
                >
                  <p className="hp-muted text-sm mb-1">Total Reps</p>
                  <p className="hp-title text-2xl font-bold">{totalReps}</p>
                </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="hp-card-2 p-4 mb-6 text-left"
              >
                <h3 className="hp-title font-semibold mb-3">Summary</h3>
                {exerciseLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 hp-divider last:border-0">
                    <span className="hp-title">{log.name}</span>
                    <span className="text-[#29e33c] font-medium">{log.sets.length} sets</span>
                  </div>
                ))}
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/')}
                className="w-full py-4 bg-[#29e33c] text-black font-bold text-lg rounded-full hp-glow-soft"
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
      <div className="min-h-screen hp-bg page-container">
        <div className="mx-auto w-full max-w-[420px] px-4 pt-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to quit this workout?')) {
                    navigate('/')
                  }
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full hp-pill text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="text-center flex-1">
                <h1 className="hp-title text-lg font-semibold">{template.name}</h1>
                <p className="hp-muted text-xs">{completedSets}/{totalSets} sets</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleFinishWorkout}
                className="bg-[#29e33c] text-black rounded-full px-5 py-2 text-sm font-semibold hp-glow-soft"
              >
                Finish
              </motion.button>
            </div>

            {/* Exercises */}
            <div className="space-y-4">
              {exercises.map((exercise, exerciseIndex) => {
                const templateExercise = template.exercises[exerciseIndex]
                const completedCount = exercise.sets.filter(s => s.status === 'completed').length
                const totalSetCount = exercise.sets.length
                const hasActiveSet = exercise.sets.some(s => s.status === 'in_progress')

                return (
                  <motion.div
                    key={exerciseIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: exerciseIndex * 0.05 }}
                    className="hp-card p-4 bg-black/20 border-white/10"
                  >
                    <button
                      onClick={() => toggleExerciseCollapse(exerciseIndex)}
                      className="w-full flex items-center justify-between hover:opacity-80 transition-opacity active:scale-[0.99]"
                    >
                      <div className="text-left">
                        <h3 className="hp-title text-base font-semibold">{exercise.name}</h3>
                        <p className="hp-muted text-xs">
                          {completedCount}/{totalSetCount} sets complete
                        </p>
                      </div>
                      <motion.div
                        animate={{ rotate: exercise.isCollapsed ? 0 : 180 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className={`w-5 h-5 ${hasActiveSet ? 'text-[#29e33c]' : 'hp-muted'}`} />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {!exercise.isCollapsed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 space-y-3">
                            {exercise.sets.map((setState, setIndex) => {
                              const isCompleted = setState.status === 'completed'
                              const isInProgress = setState.status === 'in_progress'

                              return (
                                <motion.div
                                  key={setIndex}
                                  initial={isInProgress ? { scale: 0.98 } : {}}
                                  animate={isInProgress ? { scale: 1 } : {}}
                                  className="grid grid-cols-[auto_1fr_1fr_56px] items-center gap-3"
                                >
                                  <span className="min-w-[40px] px-3 py-1.5 rounded-full text-xs font-semibold hp-pill hp-muted text-center">
                                    {setIndex + 1}
                                  </span>

                                  <div className="hp-pill h-[44px] px-3 flex items-center bg-black/20 border-white/10">
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
                                      className="w-full bg-transparent text-center text-sm font-semibold text-white/90 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#29e33c]/50 focus:shadow-[0_0_0_2px_rgba(41,227,60,0.2)]"
                                      style={{ backgroundColor: 'transparent' }}
                                    />
                                  </div>

                                  <div className="hp-pill h-[44px] px-3 flex items-center bg-black/20 border-white/10">
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
                                      className="w-full bg-transparent text-center text-sm font-semibold text-white/90 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#29e33c]/50 focus:shadow-[0_0_0_2px_rgba(41,227,60,0.2)]"
                                      style={{ backgroundColor: 'transparent' }}
                                    />
                                  </div>

                                  <div className="w-[56px] flex items-center justify-center">
                                    {isCompleted ? (
                                      <div className="w-11 h-11 flex items-center justify-center rounded-full bg-[#29e33c] hp-glow-soft">
                                        <Check className="w-5 h-5 text-black" strokeWidth={3} />
                                      </div>
                                    ) : isInProgress ? (
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleCompleteSet(exerciseIndex, setIndex)}
                                        className="w-11 h-11 flex items-center justify-center rounded-full border-2 border-[#29e33c] hp-pill"
                                      >
                                        <Check className="w-5 h-5 text-[#29e33c]" />
                                      </motion.button>
                                    ) : (
                                      <div className="w-11 h-11 rounded-full hp-pill" />
                                    )}
                                  </div>
                                </motion.div>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>

            {/* Rest Timer */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="hp-card p-5 bg-black/20 border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="hp-title text-sm font-semibold">Rest Timer</span>
                <span className="hp-muted text-xs">{formatTime(defaultRestTime)}</span>
              </div>

              <div className="text-center text-4xl font-semibold tracking-wide hp-title mb-6">
                {formatTime(restTimerRemaining)}
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={restTimerActive ? pauseRestTimer : startRestTimer}
                  className="flex-1 h-14 bg-[#29e33c] text-black rounded-full text-sm font-semibold hp-glow-soft border border-[#29e33c]/30"
                >
                  {restTimerActive ? 'Pause' : 'Start'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetRestTimer}
                  className="w-11 h-11 flex items-center justify-center rounded-full hp-pill hp-muted hover:text-white transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>

            {/* Workout Notes */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="hp-card p-4 bg-black/20 border-white/10"
            >
              <label className="block hp-title text-sm font-semibold mb-2">
                Workout Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did you feel today?"
                className="w-full hp-pill p-3 text-sm hp-title bg-black/20 border-white/10 text-white/90 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#29e33c]/50 focus:shadow-[0_0_0_2px_rgba(41,227,60,0.2)] resize-none min-h-[80px]"
                rows={3}
                style={{ backgroundColor: 'transparent' }}
              />
            </motion.div>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  function renderEmomWorkout() {
    const durationMinutes = template.durationMinutes || 0
    const totalSeconds = durationMinutes * 60
    const elapsedSeconds = Math.max(0, totalSeconds - emomSecondsRemaining)
    const currentMinute = Math.floor(elapsedSeconds / 60)
    const isMinuteA = currentMinute % 2 === 0

    const warmup = template.warmup || []
    const minuteA = template.minuteA || []
    const minuteB = template.minuteB || []
    const extras = template.extras || []

    if (isFinished) {
      return (
        <div className="min-h-screen hp-bg page-container p-4">
          <div className="mx-auto w-full max-w-[420px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="hp-card p-8 text-center"
            >
              <div className="w-24 h-24 bg-[#29e33c] rounded-full flex items-center justify-center mx-auto mb-6 hp-glow">
                <Check className="w-12 h-12 text-black" strokeWidth={3} />
              </div>
              <h1 className="hp-title text-3xl font-bold mb-2">Workout Complete!</h1>
              <p className="hp-muted mb-8">
                Completed <span className="text-[#29e33c] font-semibold">{template.name}</span>
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/')}
                className="w-full py-4 bg-[#29e33c] text-black font-bold text-lg rounded-full hp-glow-soft"
              >
                Back to Dashboard
              </motion.button>
            </motion.div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen hp-bg page-container">
        <div className="mx-auto w-full max-w-[420px] px-4 pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to quit this workout?')) {
                    navigate('/')
                  }
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full hp-pill text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="text-center flex-1">
                <h1 className="hp-title text-lg font-semibold">{template.name}</h1>
                <p className="hp-muted text-xs">EMOM • {durationMinutes} min</p>
              </div>
              <div className="w-10" />
            </div>

            {warmup.length > 0 && (
              <div className="hp-card p-5 bg-black/20 border-white/10">
                <h3 className="hp-title text-sm font-semibold mb-3">Warmup</h3>
                <div className="space-y-2">
                  {warmup.map((w, idx) => (
                    <div key={idx} className="flex items-center justify-between hp-divider last:border-0 py-2">
                      <span className="hp-title text-sm">{w.label}</span>
                      <span className="hp-muted text-sm">{w.target}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="hp-card p-5 bg-black/20 border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="hp-title text-sm font-semibold">Timer</span>
                <span className={`text-xs font-semibold ${emomTimerActive ? 'text-[#29e33c]' : 'hp-muted'}`}>
                  {emomTimerActive ? 'Active' : 'Paused'}
                </span>
              </div>

              <div className={`text-center text-4xl font-semibold tracking-wide mb-2 ${emomTimerActive ? 'text-[#29e33c]' : 'hp-title'}`}>
                {formatTime(emomSecondsRemaining)}
              </div>
              <div className="text-center hp-muted text-sm mb-6">
                {emomSecondsRemaining > 0 ? (isMinuteA ? 'Minute A' : 'Minute B') : 'Time!'}
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEmomTimerActive(prev => !prev)}
                  disabled={durationMinutes <= 0 || (emomSecondsRemaining <= 0 && !emomTimerActive)}
                  className="flex-1 h-14 bg-[#29e33c] text-black rounded-full text-sm font-semibold hp-glow-soft border border-[#29e33c]/30 disabled:opacity-60"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {emomTimerActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" fill="currentColor" />}
                    {emomTimerActive ? 'Pause' : 'Start'}
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetEmomTimer}
                  className="w-11 h-11 flex items-center justify-center rounded-full hp-pill hp-muted hover:text-white transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            <div className="hp-card p-5 bg-black/20 border-white/10">
              <h3 className="hp-title text-sm font-semibold mb-3">{emomSecondsRemaining > 0 ? (isMinuteA ? 'Minute A' : 'Minute B') : 'Work'}</h3>
              <div className="space-y-2">
                {(emomSecondsRemaining > 0 ? (isMinuteA ? minuteA : minuteB) : [...minuteA, ...minuteB]).map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between hp-divider last:border-0 py-2">
                    <span className="hp-title text-sm">{it.label}</span>
                    <span className="hp-muted text-sm">{it.target}</span>
                  </div>
                ))}
              </div>
            </div>

            {extras.length > 0 && (
              <div className="hp-card p-5 bg-black/20 border-white/10">
                <h3 className="hp-title text-sm font-semibold mb-3">Extras</h3>
                <div className="space-y-2">
                  {extras.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between hp-divider last:border-0 py-2">
                      <span className="hp-title text-sm">{it.label}</span>
                      <span className="hp-muted text-sm">{it.target}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFinishEmomWorkout}
              className="w-full h-14 bg-[#29e33c] text-black font-bold text-lg rounded-full flex items-center justify-center gap-3 hp-glow-soft"
            >
              Complete Workout
            </motion.button>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  function renderCircuitWorkout() {
    const totalRounds = template.rounds || 0
    const warmup = template.warmup || []
    const stations = (template.stations || []).slice().sort((a, b) => a.order - b.order)
    const allRoundsComplete = totalRounds > 0 && circuitRoundsCompleted >= totalRounds

    if (isFinished) {
      return (
        <div className="min-h-screen hp-bg page-container p-4">
          <div className="mx-auto w-full max-w-[420px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="hp-card p-8 text-center"
            >
              <div className="w-24 h-24 bg-[#29e33c] rounded-full flex items-center justify-center mx-auto mb-6 hp-glow">
                <Check className="w-12 h-12 text-black" strokeWidth={3} />
              </div>
              <h1 className="hp-title text-3xl font-bold mb-2">Workout Complete!</h1>
              <p className="hp-muted mb-8">
                Completed <span className="text-[#29e33c] font-semibold">{template.name}</span>
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/')}
                className="w-full py-4 bg-[#29e33c] text-black font-bold text-lg rounded-full hp-glow-soft"
              >
                Back to Dashboard
              </motion.button>
            </motion.div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen hp-bg page-container">
        <div className="mx-auto w-full max-w-[420px] px-4 pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to quit this workout?')) {
                    navigate('/')
                  }
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full hp-pill text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="text-center flex-1">
                <h1 className="hp-title text-lg font-semibold">{template.name}</h1>
                <p className="hp-muted text-xs">
                  Circuit • Round {Math.min(circuitRound, totalRounds || circuitRound)} of {totalRounds || '—'}
                </p>
              </div>
              <div className="w-10" />
            </div>

            {warmup.length > 0 && (
              <div className="hp-card p-5 bg-black/20 border-white/10">
                <h3 className="hp-title text-sm font-semibold mb-3">Warmup</h3>
                <div className="space-y-2">
                  {warmup.map((w, idx) => (
                    <div key={idx} className="flex items-center justify-between hp-divider last:border-0 py-2">
                      <span className="hp-title text-sm">{w.label}</span>
                      <span className="hp-muted text-sm">{w.target}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="hp-card p-5 bg-black/20 border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="hp-title text-sm font-semibold">Stations</span>
                <span className="hp-muted text-xs">{stations.length} stations</span>
              </div>
              <div className="space-y-2">
                {stations.map((st) => (
                  <div key={st.order} className="flex items-center justify-between hp-divider last:border-0 py-2">
                    <span className="hp-title text-sm">{st.order}. {st.label}</span>
                    <span className="hp-muted text-sm">{st.target}</span>
                  </div>
                ))}
              </div>
            </div>

            {circuitIsResting && (
              <div className="hp-card p-5 bg-black/20 border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="hp-title text-sm font-semibold">Rest</span>
                  <span className={`text-xs font-semibold ${circuitRestActive ? 'text-[#29e33c]' : 'hp-muted'}`}>
                    {circuitRestActive ? 'Active' : 'Paused'}
                  </span>
                </div>
                <div className={`text-center text-4xl font-semibold tracking-wide mb-6 ${circuitRestActive ? 'text-[#29e33c]' : 'hp-title'}`}>
                  {formatTime(circuitRestRemaining)}
                </div>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCircuitRestActive(prev => !prev)}
                    className="flex-1 h-14 bg-[#29e33c] text-black rounded-full text-sm font-semibold hp-glow-soft border border-[#29e33c]/30"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      {circuitRestActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" fill="currentColor" />}
                      {circuitRestActive ? 'Pause' : 'Start'}
                    </span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={skipCircuitRest}
                    className="h-14 px-5 hp-pill text-white/90 font-semibold border border-white/10"
                  >
                    Skip
                  </motion.button>
                </div>
              </div>
            )}

            {!allRoundsComplete ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCompleteCircuitRound}
                disabled={circuitIsResting || totalRounds <= 0}
                className="w-full h-14 bg-[#29e33c] text-black font-bold text-lg rounded-full flex items-center justify-center gap-3 hp-glow-soft disabled:opacity-60"
              >
                Complete Round
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFinishCircuitWorkout}
                className="w-full h-14 bg-[#29e33c] text-black font-bold text-lg rounded-full flex items-center justify-center gap-3 hp-glow-soft"
              >
                Complete Workout
              </motion.button>
            )}
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  if (workoutType === 'strength') {
    return renderStrengthWorkout()
  }

  if (workoutType === 'emom') {
    return renderEmomWorkout()
  }

  if (workoutType === 'circuit') {
    return renderCircuitWorkout()
  }

  return renderStrengthWorkout()
}

// Main component - only manages state and renders appropriate child
export default function ActiveWorkout() {
  const location = useLocation()
  const templateFromState = location.state?.template as Template | undefined

  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [activeTemplate, setActiveTemplate] = useState<Template | undefined>(templateFromState)
  const [templatesLoading, setTemplatesLoading] = useState<boolean>(true)
  const [templatesError, setTemplatesError] = useState<string | null>(null)

  // Load templates on mount (RLS-filtered)
  useEffect(() => {
    let cancelled = false

    const loadTemplates = async () => {
      setTemplatesLoading(true)
      setTemplatesError(null)
      try {
        const list = await fetchTemplatesForCurrentUserFromSupabase()
        if (cancelled) return

        setTemplates(list)

        // Preserve existing selection behavior (keep if valid, otherwise fall back)
        setSelectedTemplateId(prev => {
          if (list.length === 0) return ''
          if (!prev || !list.find(t => t.id === prev)) {
            return list[0].id
          }
          return prev
        })
      } catch (err) {
        console.error('Failed to load templates from Supabase:', err)
        if (cancelled) return
        setTemplates([])
        setSelectedTemplateId('')
        setTemplatesError('Failed to load templates')
      } finally {
        if (!cancelled) setTemplatesLoading(false)
      }
    }

    loadTemplates()
    return () => {
      cancelled = true
    }
  }, [])

  // Render template picker if no template selected, otherwise render workout session
  if (!activeTemplate) {
    return (
      <TemplatePicker
        templates={templates}
        templatesLoading={templatesLoading}
        templatesError={templatesError}
        selectedTemplateId={selectedTemplateId}
        onTemplateChange={setSelectedTemplateId}
        onStartWorkout={setActiveTemplate}
      />
    )
  }

  return <WorkoutSession template={activeTemplate} />
}
