import type { Template } from '@/types'

// Pre-loaded workout templates with push-pull-legs split
export const workoutTemplates: Template[] = [
  {
    id: 'push-day',
    userId: 'admin',
    name: 'Push Day',
    exercises: [
      { name: 'bench press', sets: 4, reps: 12, weight: 45, intensity: '75%', targetReps: 12 },
      { name: 'overhead press', sets: 3, reps: 10, weight: 30, intensity: '70%', targetReps: 10 },
      { name: 'incline bench press', sets: 3, reps: 14, weight: 35, intensity: '65%', targetReps: 14 },
      { name: 'lateral raise 1 arm', sets: 3, reps: 15, weight: 8, intensity: '60%', targetReps: 15 },
      { name: 'tricep dips', sets: 3, reps: 12, weight: 0, intensity: '70%', targetReps: 12 },
      { name: 'close grip bench press', sets: 3, reps: 10, weight: 40, intensity: '75%', targetReps: 10 }
    ],
    createdAt: new Date()
  },
  {
    id: 'pull-day',
    userId: 'admin',
    name: 'Pull Day',
    exercises: [
      { name: 'deadlift', sets: 4, reps: 8, weight: 80, intensity: '80%', targetReps: 8 },
      { name: 'barbell rows', sets: 3, reps: 12, weight: 50, intensity: '70%', targetReps: 12 },
      { name: 'seal row', sets: 3, reps: 15, weight: 25, intensity: '65%', targetReps: 15 },
      { name: 'cable pull 1 mano', sets: 3, reps: 15, weight: 20, intensity: '60%', targetReps: 15 },
      { name: 'face pulls', sets: 3, reps: 15, weight: 15, intensity: '55%', targetReps: 15 },
      { name: 'bicep curls', sets: 3, reps: 12, weight: 20, intensity: '70%', targetReps: 12 }
    ],
    createdAt: new Date()
  },
  {
    id: 'leg-day',
    userId: 'admin',
    name: 'Leg Day',
    exercises: [
      { name: 'squat', sets: 4, reps: 10, weight: 70, intensity: '75%', targetReps: 10 },
      { name: 'lunges', sets: 3, reps: 12, weight: 25, intensity: '70%', targetReps: 12 },
      { name: 'polpacci seduto', sets: 3, reps: 15, weight: 0, intensity: '60%', targetReps: 15 },
      { name: 'leg press', sets: 3, reps: 12, weight: 120, intensity: '70%', targetReps: 12 },
      { name: 'romanian deadlift', sets: 3, reps: 10, weight: 60, intensity: '75%', targetReps: 10 },
      { name: 'leg extensions', sets: 3, reps: 15, weight: 45, intensity: '65%', targetReps: 15 }
    ],
    createdAt: new Date()
  },
  {
    id: 'shoulder-day',
    userId: 'admin',
    name: 'Shoulder Day',
    exercises: [
      { name: 'overhead press', sets: 4, reps: 10, weight: 35, intensity: '75%', targetReps: 10 },
      { name: 'y cable raises', sets: 3, reps: 15, weight: 12, intensity: '60%', targetReps: 15 },
      { name: 'lateral raise 1 arm', sets: 3, reps: 12, weight: 10, intensity: '65%', targetReps: 12 },
      { name: 'rear delt flyes', sets: 3, reps: 15, weight: 8, intensity: '55%', targetReps: 15 },
      { name: 'upright rows', sets: 3, reps: 12, weight: 25, intensity: '70%', targetReps: 12 },
      { name: 'shrugs', sets: 3, reps: 15, weight: 40, intensity: '65%', targetReps: 15 }
    ],
    createdAt: new Date()
  }
]

// Helper functions
export const getWorkoutTemplates = () => workoutTemplates

export const getWorkoutTemplateById = (id: string) => {
  return workoutTemplates.find(template => template.id === id)
}

export const getWorkoutTemplateByName = (name: string) => {
  return workoutTemplates.find(template => template.name.toLowerCase().includes(name.toLowerCase()))
}
