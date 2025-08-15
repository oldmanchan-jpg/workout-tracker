import React from 'react'
import type { Workout } from '@/types'
import { getExerciseMedia, defaultExerciseImage } from '@/data/exerciseMedia'

export default function WorkoutList({
  workouts,
  onDelete,
  onEdit,
}: {
  workouts: Workout[]
  onDelete?: (id: string) => void
  onEdit?: (workout: Workout) => void
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        weekday: 'short'
      })
    }
  }

  const getTotalVolume = (workout: Workout) => {
    return workout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((setTotal, set) => {
        return setTotal + (set.reps * (set.weight || 0))
      }, 0)
    }, 0)
  }

  const getTotalReps = (workout: Workout) => {
    return workout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((setTotal, set) => {
        return setTotal + set.reps
      }, 0)
    }, 0)
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-display text-white">Recent Workouts</h3>
      </div>
      
      {workouts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl font-display text-white">W</span>
          </div>
          <div className="text-xl font-display text-white mb-2">Ready to start your fitness journey?</div>
          <div className="text-secondary text-lg font-body">Log your first workout to see it here and track your progress!</div>
        </div>
      ) : (
        <div className="space-y-4">
          {workouts.map((workout, index) => (
            <div key={workout.id} className="card-dark p-4 hover:shadow-soft-hover transition-all duration-200 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              {/* Workout Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-display text-sm">W</span>
                  </div>
                  <div>
                    <div className="text-white font-display text-lg">
                      {formatDate(workout.date)}
                    </div>
                    <div className="text-secondary-light text-sm font-body">
                      {workout.exercises.length} exercises
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  {onEdit && (
                    <button 
                      className="btn btn-outline btn-sm text-white border-white hover:bg-white hover:text-dark"
                      onClick={() => onEdit(workout)}
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      className="btn btn-outline btn-sm text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                      onClick={() => onDelete(workout.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Workout Stats */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-white font-bold text-lg">
                    {getTotalReps(workout)}
                  </div>
                  <div className="text-secondary-light text-xs">Total Reps</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-white font-bold text-lg">
                    {getTotalVolume(workout).toFixed(0)}
                  </div>
                  <div className="text-secondary-light text-xs">Volume (kg)</div>
                </div>
              </div>

              {/* Exercise List with Media Previews */}
              <div className="space-y-3">
                {workout.exercises.slice(0, 3).map((exercise, index) => {
                  const exerciseMedia = getExerciseMedia(exercise.name) || defaultExerciseImage
                  return (
                    <div key={exercise.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                      {/* Exercise Image - Smaller Thumbnail */}
                      <div 
                        className="w-10 h-10 bg-cover bg-center rounded-lg flex-shrink-0"
                        style={{ backgroundImage: `url(${exerciseMedia.url})` }}
                        title={exerciseMedia.altText}
                      />
                      
                      {/* Exercise Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-white font-medium">{exercise.name}</span>
                          <span className="text-secondary-light">
                            ({exercise.sets.length} sets)
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {workout.exercises.length > 3 && (
                  <div className="text-secondary-light text-sm text-center pt-2">
                    +{workout.exercises.length - 3} more exercises
                  </div>
                )}
              </div>

              {/* Notes */}
              {workout.notes && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="text-secondary-light text-sm">
                    <span className="font-medium">Notes:</span> {workout.notes}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
