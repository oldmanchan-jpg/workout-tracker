import React from 'react'
import type { Workout } from '@/types'

export default function WorkoutList({
  workouts,
  onDelete,
  onEdit,
}: {
  workouts: Workout[]
  onDelete?: (id: string) => void
  onEdit?: (workout: Workout) => void
}) {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-4">
      <h3 className="font-semibold mb-3">Recent Workouts</h3>
      <div className="space-y-3">
        {workouts.map(w => (
          <div key={w.id} className="border rounded-xl p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-gray-600">{new Date(w.date).toLocaleDateString()}</div>
                <div className="text-sm">{w.exercises.length} exercises</div>
                {w.notes && <div className="text-xs text-gray-500">{w.notes}</div>}
              </div>
              <div className="flex gap-2">
                {onEdit && (
                  <button 
                    className="text-sm border rounded-lg px-3 py-1 hover:bg-gray-50 transition-colors" 
                    onClick={() => onEdit(w)}
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button 
                    className="text-sm border rounded-lg px-3 py-1 text-red-600 hover:bg-red-50 transition-colors" 
                    onClick={() => onDelete(w.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {workouts.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">💪</div>
            <div className="text-gray-600 font-medium mb-2">Ready to start your fitness journey?</div>
            <div className="text-gray-500 text-sm">Log your first workout to see it here and track your progress!</div>
          </div>
        )}
      </div>
    </div>
  )
}
