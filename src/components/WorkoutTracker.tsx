import React, { useState, useEffect, useRef } from 'react'
import type { Template, Workout } from '@/types'
import { getExerciseMedia, defaultExerciseImage } from '@/data/exerciseMedia'

interface WorkoutTrackerProps {
  template: Template
  uid: string
  onFinish: (workout: Workout) => void
  onClose: () => void
}

interface TrackingSet {
  reps: number
  weight: number
}

interface TrackingExercise {
  name: string
  sets: TrackingSet[]
  media?: { url: string; type: 'image' | 'video'; altText: string }
  targetReps: number
  intensity?: string
}

export default function WorkoutTracker({ template, uid, onFinish, onClose }: WorkoutTrackerProps) {
  const [workoutTime, setWorkoutTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [notes, setNotes] = useState('')
  const [exercises, setExercises] = useState<TrackingExercise[]>([])
  
  const timerRef = useRef<NodeJS.Timeout>()

  // Initialize exercises from template
  useEffect(() => {
    console.log('Template received:', template)
    
    const initialExercises = template.exercises.map((ex) => {
      const media = getExerciseMedia(ex.name) || defaultExerciseImage
      
      const exercise = {
        name: ex.name,
        sets: Array.from({ length: ex.sets }, () => ({
          reps: ex.reps || 0,
          weight: ex.weight || 0
        })),
        media,
        targetReps: ex.targetReps || ex.reps || 0,
        intensity: ex.intensity
      }
      
      console.log(`Initialized exercise: ${ex.name}`, exercise)
      return exercise
    })
    
    console.log('All initial exercises:', initialExercises)
    setExercises(initialExercises)
  }, [template])

  // Timer logic
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setWorkoutTime(prev => prev + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const updateSetValue = (exIdx: number, setIdx: number, field: 'weight' | 'reps', value: string) => {
    const numValue = Number(value)
    if (isNaN(numValue) || numValue < 0) return
    
    console.log(`Updating ${field} for exercise ${exIdx}, set ${setIdx} to ${numValue}`)
    
    setExercises(prev => {
      const newExercises = [...prev]
      newExercises[exIdx] = { ...newExercises[exIdx] }
      newExercises[exIdx].sets = [...newExercises[exIdx].sets]
      newExercises[exIdx].sets[setIdx] = { ...newExercises[exIdx].sets[setIdx] }
      
      if (field === 'reps') {
        newExercises[exIdx].sets[setIdx].reps = numValue
      } else if (field === 'weight') {
        newExercises[exIdx].sets[setIdx].weight = numValue
      }
      
      console.log('New exercises state:', newExercises)
      return newExercises
    })
  }

  const handleFinish = () => {
    const workoutData: Workout = {
      id: crypto.randomUUID(),
      userId: uid,
      date: new Date().toISOString(),
      notes,
      exercises: exercises.map(ex => ({
        id: crypto.randomUUID(),
        name: ex.name,
        sets: ex.sets.map(s => ({
          reps: s.reps,
          weight: s.weight
        }))
      }))
    }
    console.log('Finishing workout with data:', workoutData)
    onFinish(workoutData)
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  // Test function to verify state updates
  const testStateUpdate = () => {
    console.log('Current exercises state:', exercises)
    if (exercises.length > 0 && exercises[0].sets.length > 0) {
      updateSetValue(0, 0, 'reps', '15')
    }
  }

  return (
    <div className="fixed inset-0 bg-dark z-50">
      <div className="w-full h-full overflow-y-auto">
        {/* Workout Header */}
        <div className="bg-dark border-b border-purple p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={togglePause}
              className="flex items-center gap-2 px-3 py-2 bg-secondary-dark rounded-lg text-white hover:bg-secondary transition-colors"
            >
              <span className="text-lg font-body-semibold">{isPaused ? '▶' : '⏸'}</span>
              <span className="font-mono text-lg font-body-semibold">{formatTime(workoutTime)}</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-secondary-dark rounded-lg text-white font-body-medium hover:bg-secondary transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleFinish}
                className="px-6 py-2 bg-primary rounded-lg text-white font-body-semibold hover:bg-primary-light transition-colors"
              >
                Finish
              </button>
            </div>
          </div>
          
          <h1 className="text-2xl font-display text-white mb-1">{template.name}</h1>
          <p className="text-secondary text-sm mb-2 font-body">Week 1 · Day 2</p>
          <p className="text-secondary text-sm mb-3 font-body">Recommended Accessories: Legs, Abs</p>
          
          <div className="flex items-center gap-2 p-3 bg-secondary-dark rounded-lg">
            <span className="text-secondary font-body">✏</span>
            <input
              type="text"
              placeholder="Add notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-secondary outline-none font-body"
            />
          </div>
        </div>

        {/* Exercise Section */}
        <div className="p-4">
          {exercises.map((exercise, exIdx) => (
            <div key={exIdx} className="mb-6">
              <div className="mb-3">
                <h2 className="text-lg font-display text-white">
                  {exercise.name.charAt(0).toUpperCase() + exercise.name.slice(1)}
                </h2>
                <button
                  onClick={() => {
                    console.log('Exercise state:', exercise)
                    console.log('All exercises state:', exercises)
                  }}
                  className="text-xs text-secondary hover:text-white ml-2"
                >
                  Debug
                </button>
              </div>
              
              {/* Exercise Media Preview */}
              {exercise.media && (
                <div className="mb-3">
                  <div 
                    className="w-20 h-20 bg-cover bg-center rounded-lg mx-auto"
                    style={{ backgroundImage: `url(${exercise.media.url})` }}
                    title={exercise.media.altText}
                  />
                </div>
              )}
              
              {/* Workout Table */}
              <div className="bg-secondary-dark rounded-lg overflow-hidden">
                <div className="grid grid-cols-5 text-xs text-secondary font-body-medium border-b border-purple">
                  <div className="p-3 text-center">Set</div>
                  <div className="p-3 text-center">Intensity</div>
                  <div className="p-3 text-center">Target Reps</div>
                  <div className="p-3 text-center">Weight (kg)</div>
                  <div className="p-3 text-center">Reps</div>
                </div>
                
                {exercise.sets.map((set, setIdx) => (
                  <div key={setIdx} className="grid grid-cols-5 border-b border-purple last:border-b-0">
                    <div className="p-3 text-center text-white font-body-semibold">
                      {setIdx + 1}
                    </div>
                    <div className="p-3 text-center text-secondary font-body">
                      {exercise.intensity || '-'}
                    </div>
                    <div className="p-3 text-center text-white font-body">
                      {exercise.targetReps}
                    </div>
                    <div className="p-3 text-center">
                      <input
                        type="number"
                        value={set.weight}
                        onChange={(e) => updateSetValue(exIdx, setIdx, 'weight', e.target.value)}
                        className="w-16 h-8 bg-white text-dark text-center rounded border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-body"
                        placeholder="0"
                        min="0"
                        step="2.5"
                      />
                      <div className="text-xs text-secondary mt-1">Current: {set.weight}</div>
                    </div>
                    <div className="p-3 text-center">
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => updateSetValue(exIdx, setIdx, 'reps', e.target.value)}
                        className="w-16 h-8 bg-white text-dark text-center rounded border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-body"
                        placeholder={String(exercise.targetReps)}
                        min="0"
                        step="1"
                      />
                      <div className="text-xs text-secondary mt-1">Current: {set.reps}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Test Button */}
        <div className="p-4 border-t border-purple">
          <button
            onClick={testStateUpdate}
            className="w-full p-4 bg-red-500 text-white rounded-lg mb-4"
          >
            TEST: Update First Set Reps to 15
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 p-4 bg-secondary-dark rounded-lg text-white hover:bg-secondary transition-colors">
              <span className="text-lg font-body">⏰</span>
              <span className="font-body-medium">Rest Timer</span>
            </button>
            <button className="flex items-center justify-center gap-2 p-4 bg-secondary-dark rounded-lg text-white hover:bg-secondary transition-colors">
              <span className="text-lg font-body">🧮</span>
              <span className="font-body-medium">Plate Calculator</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
