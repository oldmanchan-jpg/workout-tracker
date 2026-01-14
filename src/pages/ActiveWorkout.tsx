import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Check, ChevronDown, Play, Pause, RotateCcw } from 'lucide-react'
import { saveWorkout } from '../services/workoutService'
import { useSettings } from '../hooks/useSettings'
import type { Template } from '../types'

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
  const { restTimerDefault, weightUnit, formatWeight } = useSettings()
  const template = location.state?.template as Template | undefined

  if (!template) {
    navigate('/')
    return null
  }

  // Initialize exercises - only first one expanded
  const [exercises, setExercises] = useState<ExerciseState[]>(
    template.exercises.map((ex, idx) => ({
      name: ex.name,
      isCollapsed: idx !== 0, // Only first is expanded
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
  
  // Rest timer - use user preference for default
  const [restTimerRemaining, setRestTimerRemaining] = useState(restTimerDefault)
  const [restTimerActive, setRestTimerActive] = useState(false)
  
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
    setRestTimerRemaining(restTimerDefault)
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
    
    setExercises(prev => {
      const updated = prev.map((ex, exIdx) => {
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
        }

        // Check if exercise is complete
        const allComplete = updatedSets.every(s => s.status === 'completed')
        
        return {
          ...ex,
          sets: updatedSets,
          isCollapsed: allComplete
        }
      })

      // Auto-progression: if exercise complete, open next exercise
      const completedExercise = updated[exerciseIndex]
      const allComplete = completedExercise.sets.every(s => s.status === 'completed')
      
      if (allComplete) {
        const nextIndex = exerciseIndex + 1
        if (nextIndex < updated.length) {
          setTimeout(() => {
            setExercises(prevEx => prevEx.map((e, i) => {
              if (i === nextIndex) {
                return {
                  ...e,
                  isCollapsed: false,
                  sets: e.sets.map((s, si) => si === 0 ? { ...s, status: 'in_progress' } : s)
                }
              }
              return e
            }))
          }, 100)
        }
      }

      return updated
    })

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

  // Finished screen
  if (isFinished) {
    const exerciseLogs: ExerciseLog[] = exercises.map(ex => ({
      name: ex.name,
      sets: ex.sets.filter(s => s.status === 'completed' && s.data).map(s => s.data!)
    }))
    const { totalVolume, totalReps } = calculateTotals(exerciseLogs)

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0b', padding: '16px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{
            backgroundColor: '#141416',
            borderRadius: '16px',
            border: '1px solid #27272a',
            padding: '32px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 0 40px rgba(74, 222, 128, 0.4)'
            }}>
              <Check size={48} color="#0a0a0b" strokeWidth={3} />
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#fafafa', margin: '0 0 8px' }}>
              Workout Complete!
            </h1>
            <p style={{ fontSize: '16px', color: '#a1a1aa', margin: '0 0 32px' }}>
              Great job crushing {template.name}!
            </p>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              <div style={{
                flex: 1,
                backgroundColor: '#1c1c1f',
                borderRadius: '12px',
                border: '1px solid #27272a',
                padding: '16px'
              }}>
                <p style={{ fontSize: '14px', color: '#a1a1aa', margin: '0 0 8px' }}>Total Volume</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#22d3ee', margin: 0 }}>
                  {formatWeight(totalVolume)}
                </p>
              </div>
              <div style={{
                flex: 1,
                backgroundColor: '#1c1c1f',
                borderRadius: '12px',
                border: '1px solid #27272a',
                padding: '16px'
              }}>
                <p style={{ fontSize: '14px', color: '#a1a1aa', margin: '0 0 8px' }}>Total Reps</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#22d3ee', margin: 0 }}>
                  {totalReps}
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: '#1c1c1f',
              borderRadius: '12px',
              border: '1px solid #27272a',
              padding: '16px',
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fafafa', margin: '0 0 12px' }}>
                Summary
              </h3>
              {exerciseLogs.map((log, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: idx < exerciseLogs.length - 1 ? '12px' : 0
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(74, 222, 128, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={16} color="#4ade80" />
                    </div>
                    <span style={{ fontSize: '16px', color: '#fafafa' }}>{log.name}</span>
                  </div>
                  <span style={{ fontSize: '16px', color: '#a1a1aa' }}>{log.sets.length} sets</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/')}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                color: '#0a0a0b',
                cursor: 'pointer',
                boxShadow: '0 0 30px rgba(34, 211, 238, 0.3)'
              }}
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
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0b', overflowX: 'hidden' }}>
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '12px 16px'
      }}>
        {/* Back button - 44x44px */}
        <button
          onClick={() => {
            if (confirm('Quit workout?')) {
              navigate('/')
            }
          }}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: '#1c1c1f',
            border: '1px solid #27272a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} color="#a1a1aa" />
        </button>

        {/* Title centered */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#fafafa', margin: 0 }}>
            {template.name}
          </h1>
          <p style={{ fontSize: '13px', color: '#52525b', margin: 0 }}>
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>

        {/* Finish button */}
        <button
          onClick={handleFinishWorkout}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
            border: 'none',
            fontSize: '15px',
            fontWeight: '600',
            color: '#0a0a0b',
            cursor: 'pointer'
          }}
        >
          Finish
        </button>
      </header>

      {/* Exercise Cards Container */}
      <div style={{ padding: '0 16px', maxWidth: '100%', overflowX: 'hidden' }}>
        {exercises.map((exercise, exerciseIndex) => {
          const templateExercise = template.exercises[exerciseIndex]
          const completedCount = exercise.sets.filter(s => s.status === 'completed').length
          const totalSets = exercise.sets.length
          const allSetsCompleted = completedCount === totalSets
          const hasActiveSet = exercise.sets.some(s => s.status === 'in_progress')
          
          return (
            <div
              key={exerciseIndex}
              style={{
                backgroundColor: '#141416',
                borderRadius: '16px',
                border: allSetsCompleted ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid #27272a',
                marginBottom: '12px',
                overflow: 'hidden'
              }}
            >
              {/* Accordion Header - 60px min height for tapping */}
              <button
                onClick={() => toggleExerciseCollapse(exerciseIndex)}
                style={{
                  width: '100%',
                  minHeight: '60px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: allSetsCompleted ? 'rgba(74, 222, 128, 0.05)' : 'transparent',
                  border: 'none',
                  borderBottom: exercise.isCollapsed ? 'none' : '1px solid #27272a',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {/* Number/Check badge - 40x40px */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: allSetsCompleted ? 'rgba(74, 222, 128, 0.15)' : hasActiveSet ? 'rgba(34, 211, 238, 0.1)' : '#1c1c1f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {allSetsCompleted ? (
                    <Check size={20} color="#4ade80" strokeWidth={3} />
                  ) : (
                    <span style={{ fontSize: '16px', fontWeight: '700', color: hasActiveSet ? '#22d3ee' : '#52525b' }}>
                      {exerciseIndex + 1}
                    </span>
                  )}
                </div>

                {/* Exercise name + progress */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: allSetsCompleted ? '#4ade80' : '#fafafa',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {exercise.name}
                  </h3>
                  <span style={{ fontSize: '13px', color: '#52525b' }}>
                    {completedCount}/{totalSets} sets
                  </span>
                </div>

                {/* Chevron */}
                <ChevronDown 
                  size={20} 
                  color="#52525b"
                  style={{
                    transform: exercise.isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                    transition: 'transform 0.2s ease',
                    flexShrink: 0
                  }}
                />
              </button>

              {/* Accordion Content - only show if not collapsed */}
              {!exercise.isCollapsed && (
                <div style={{ padding: '16px' }}>
                  {/* Column headers */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    paddingBottom: '10px',
                    marginBottom: '8px',
                    borderBottom: '1px solid #27272a',
                    minWidth: 0,
                    overflowX: 'hidden'
                  }}>
                    <span style={{ width: '32px', fontSize: '11px', fontWeight: '600', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Set</span>
                    <span style={{ width: '64px', fontSize: '11px', fontWeight: '600', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>{weightUnit.toUpperCase()}</span>
                    <span style={{ width: '64px', fontSize: '11px', fontWeight: '600', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Reps</span>
                    <span style={{ width: '48px', fontSize: '11px', fontWeight: '600', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>RPE</span>
                    <span style={{ width: '48px' }}></span>
                  </div>

                  {/* Each set row */}
                  {exercise.sets.map((setState, setIndex) => {
                    const isActive = setState.status === 'in_progress'
                    const isCompleted = setState.status === 'completed'
                    
                    // Input style based on state
                    const getInputStyle = () => {
                      if (isActive) {
                        return {
                          backgroundColor: '#1e293b',
                          border: '2px solid #22d3ee',
                          color: '#fafafa'
                        }
                      }
                      if (isCompleted) {
                        return {
                          backgroundColor: 'rgba(74, 222, 128, 0.08)',
                          border: '1px solid rgba(74, 222, 128, 0.3)',
                          color: '#4ade80'
                        }
                      }
                      return {
                        backgroundColor: '#1c1c1f',
                        border: '1px solid #27272a',
                        color: '#52525b'
                      }
                    }

                    const inputStyle = getInputStyle()

                    return (
                      <div
                        key={setIndex}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 0',
                          borderBottom: setIndex < exercise.sets.length - 1 ? '1px solid #1c1c1f' : 'none',
                          minWidth: 0,
                          overflowX: 'hidden'
                        }}
                      >
                        {/* Set number - 32px fixed */}
                        <div style={{ width: '32px', flexShrink: 0 }}>
                          <span style={{ fontSize: '16px', fontWeight: '700', color: '#fafafa' }}>
                            {setIndex + 1}
                          </span>
                        </div>

                        {/* KG input - 64px fixed, 48px height */}
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.5"
                          value={isCompleted && setState.data ? setState.data.weight.toString() : (isActive ? exercise.currentInputs.weight : '')}
                          onChange={(e) => isActive && updateInput(exerciseIndex, 'weight', e.target.value)}
                          disabled={!isActive}
                          placeholder={templateExercise.weight?.toString() || ''}
                          style={{
                            width: '64px',
                            height: '48px',
                            borderRadius: '10px',
                            fontSize: '16px',
                            fontWeight: '600',
                            textAlign: 'center',
                            flexShrink: 0,
                            outline: 'none',
                            ...inputStyle
                          }}
                        />

                        {/* Reps input - 64px fixed, 48px height */}
                        <input
                          type="number"
                          inputMode="numeric"
                          value={isCompleted && setState.data ? setState.data.reps.toString() : (isActive ? exercise.currentInputs.reps : '')}
                          onChange={(e) => isActive && updateInput(exerciseIndex, 'reps', e.target.value)}
                          disabled={!isActive}
                          placeholder={templateExercise.reps?.toString() || ''}
                          style={{
                            width: '64px',
                            height: '48px',
                            borderRadius: '10px',
                            fontSize: '16px',
                            fontWeight: '600',
                            textAlign: 'center',
                            flexShrink: 0,
                            outline: 'none',
                            ...inputStyle
                          }}
                        />

                        {/* RPE input - 48px fixed, 48px height */}
                        <input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          max="10"
                          value={isCompleted && setState.data?.rpe ? setState.data.rpe.toString() : (isActive ? exercise.currentInputs.rpe : '')}
                          onChange={(e) => isActive && updateInput(exerciseIndex, 'rpe', e.target.value)}
                          disabled={!isActive}
                          placeholder="7"
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            fontSize: '16px',
                            fontWeight: '600',
                            textAlign: 'center',
                            flexShrink: 0,
                            outline: 'none',
                            ...inputStyle
                          }}
                        />

                        {/* Checkmark - 48px fixed, MUST BE VERY VISIBLE */}
                        <div style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                          {isCompleted ? (
                            <div style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 0 15px rgba(74, 222, 128, 0.4)'
                            }}>
                              <Check size={24} color="white" strokeWidth={3} />
                            </div>
                          ) : isActive ? (
                            <button
                              onClick={() => handleCompleteSet(exerciseIndex, setIndex)}
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                border: '3px solid #22d3ee',
                                backgroundColor: 'rgba(34, 211, 238, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <Check size={24} color="#22d3ee" strokeWidth={2} />
                            </button>
                          ) : (
                            <div style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '12px',
                              border: '2px solid #27272a',
                              backgroundColor: '#1c1c1f'
                            }} />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Timer Section */}
      <div style={{ padding: '0 16px', marginTop: '16px' }}>
        <div style={{
          backgroundColor: '#141416',
          borderRadius: '16px',
          border: '1px solid #27272a',
          padding: '16px'
        }}>
          <p style={{ 
            fontSize: '11px', 
            fontWeight: '600', 
            color: '#52525b', 
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '12px',
            margin: '0 0 12px'
          }}>
            Rest Timer
          </p>

          {/* Timer display - BIG */}
          <div style={{
            backgroundColor: restTimerRemaining === 0 ? '#22c55e' : '#1c1c1f',
            borderRadius: '16px',
            padding: '24px 0',
            textAlign: 'center',
            marginBottom: '16px',
            boxShadow: restTimerRemaining <= 10 && restTimerRemaining > 0
              ? '0 0 30px rgba(248, 113, 113, 0.4)'
              : restTimerRemaining === 0
                ? '0 0 30px rgba(74, 222, 128, 0.5)'
                : 'none'
          }}>
            <span style={{
              fontFamily: 'ui-monospace, SFMono-Regular, monospace',
              fontSize: '48px',
              fontWeight: '700',
              color: restTimerRemaining === 0 
                ? '#0a0a0b' 
                : restTimerRemaining <= 10 
                  ? '#f87171' 
                  : restTimerRemaining <= 30 
                    ? '#fbbf24' 
                    : '#fafafa'
            }}>
              {formatTime(restTimerRemaining)}
            </span>
          </div>

          {/* Timer controls */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            {/* Time input */}
            <div>
              <input
                type="number"
                inputMode="numeric"
                value={restTimerRemaining}
                onChange={(e) => setRestTimerRemaining(parseInt(e.target.value) || 0)}
                style={{
                  width: '64px',
                  height: '48px',
                  borderRadius: '12px',
                  border: '1px solid #3f3f46',
                  backgroundColor: '#1c1c1f',
                  color: '#fafafa',
                  fontSize: '16px',
                  fontWeight: '600',
                  fontFamily: 'ui-monospace, monospace',
                  textAlign: 'center',
                  outline: 'none'
                }}
              />
              <p style={{ fontSize: '11px', color: '#52525b', textAlign: 'center', marginTop: '4px', margin: '4px 0 0' }}>sec</p>
            </div>

            {/* Start/Pause */}
            <button
              onClick={restTimerActive ? pauseRestTimer : startRestTimer}
              style={{
                flex: 1,
                height: '48px',
                borderRadius: '12px',
                border: 'none',
                background: restTimerActive 
                  ? '#fbbf24' 
                  : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                color: '#0a0a0b',
                fontSize: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              {restTimerActive ? <Pause size={20} /> : <Play size={20} />}
              {restTimerActive ? 'Pause' : 'Start'}
            </button>

            {/* Reset */}
            <button
              onClick={resetRestTimer}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                border: '1px solid #3f3f46',
                backgroundColor: '#1c1c1f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={20} color="#a1a1aa" />
            </button>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div style={{ padding: '0 16px', marginTop: '12px', marginBottom: '32px' }}>
        <div style={{
          backgroundColor: '#141416',
          borderRadius: '16px',
          border: '1px solid #27272a',
          padding: '16px'
        }}>
          <label style={{ 
            fontSize: '11px', 
            fontWeight: '600', 
            color: '#52525b', 
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'block',
            marginBottom: '8px'
          }}>
            Workout Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did you feel? Any notes..."
            rows={3}
            style={{
              width: '100%',
              borderRadius: '12px',
              border: '1px solid #27272a',
              backgroundColor: '#1c1c1f',
              color: '#fafafa',
              fontSize: '16px',
              padding: '12px',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>
    </div>
  )
}
