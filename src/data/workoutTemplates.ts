import type { Template } from '@/types'

// Simple workout templates
export const workoutTemplates: Template[] = [
  {
    id: 'push-day',
    name: 'Push Day',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 12, weight: 45 },
      { name: 'Overhead Press', sets: 3, reps: 10, weight: 30 },
      { name: 'Incline Bench Press', sets: 3, reps: 14, weight: 35 },
      { name: 'Lateral Raises', sets: 3, reps: 15, weight: 8 },
      { name: 'Tricep Dips', sets: 3, reps: 12, weight: 0 },
      { name: 'Close Grip Bench Press', sets: 3, reps: 10, weight: 40 }
    ]
  },
  {
    id: 'pull-day',
    name: 'Pull Day',
    exercises: [
      { name: 'Deadlift', sets: 4, reps: 8, weight: 80 },
      { name: 'Barbell Rows', sets: 3, reps: 12, weight: 50 },
      { name: 'Seal Rows', sets: 3, reps: 15, weight: 25 },
      { name: 'Cable Pulls', sets: 3, reps: 15, weight: 20 },
      { name: 'Face Pulls', sets: 3, reps: 15, weight: 15 },
      { name: 'Bicep Curls', sets: 3, reps: 12, weight: 20 }
    ]
  },
  {
    id: 'leg-day',
    name: 'Leg Day',
    exercises: [
      { name: 'Squat', sets: 4, reps: 10, weight: 70 },
      { name: 'Lunges', sets: 3, reps: 12, weight: 25 },
      { name: 'Calf Raises', sets: 3, reps: 15, weight: 0 },
      { name: 'Leg Press', sets: 3, reps: 12, weight: 120 },
      { name: 'Romanian Deadlift', sets: 3, reps: 10, weight: 60 },
      { name: 'Leg Extensions', sets: 3, reps: 15, weight: 45 }
    ]
  },

  // Temporary fixtures for testing EMOM + Circuit support
  {
    id: "test-emom-1",
    name: "Test EMOM 16min",
    type: "emom",
    exercises: [],
    durationMinutes: 16,
    warmup: [
      { label: "Easy cardio", target: "2 min" }
    ],
    minuteA: [
      { label: "Exercise A", target: "40 seconds" }
    ],
    minuteB: [
      { label: "Exercise B", target: "12 reps" }
    ]
  },
  {
    id: "test-circuit-1",
    name: "Test Circuit 3 Rounds",
    type: "circuit",
    exercises: [],
    rounds: 3,
    restBetweenRoundsSeconds: 90,
    warmup: [
      { label: "Easy cardio", target: "2 min" }
    ],
    stations: [
      { order: 1, label: "Station 1", target: "30 seconds" },
      { order: 2, label: "Station 2", target: "12 reps" }
    ]
  }
]

export const getWorkoutTemplates = () => workoutTemplates
export const getWorkoutTemplateById = (id: string) => workoutTemplates.find(t => t.id === id)
