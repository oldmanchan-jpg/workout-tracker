// Sample workout template using the 5 exercises we have images for
export const sampleWorkoutTemplate = {
  id: 'sample-full-body',
  name: 'Full Body Strength',
  description: 'Complete full body workout using fundamental compound movements',
  exercises: [
    {
      name: 'push-ups',
      sets: 3,
      reps: 10,
      weight: 0, // Bodyweight
      rest: '60s'
    },
    {
      name: 'squats',
      sets: 4,
      reps: 12,
      weight: 0, // Bodyweight
      rest: '90s'
    },
    {
      name: 'deadlifts',
      sets: 3,
      reps: 8,
      weight: 60, // kg
      rest: '120s'
    },
    {
      name: 'bench press',
      sets: 3,
      reps: 8,
      weight: 40, // kg
      rest: '90s'
    },
    {
      name: 'pull-ups',
      sets: 3,
      reps: 6,
      weight: 0, // Bodyweight
      rest: '90s'
    }
  ],
  estimatedDuration: '45-60 minutes',
  difficulty: 'Intermediate',
  focus: 'Full Body'
}

// Helper function to get a sample workout
export const getSampleWorkout = () => sampleWorkoutTemplate
