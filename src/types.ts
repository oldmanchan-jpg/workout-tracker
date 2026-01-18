
export type ExerciseSet = {
  reps: number
  weight: number
  rpe?: number // Rate of Perceived Exertion (1-10)
}

export type ExerciseEntry = {
  id: string
  name: string
  sets: ExerciseSet[]
}

export type Workout = {
  id: string
  date: string // ISO string
  notes?: string
  exercises: ExerciseEntry[]
}

export type WorkoutType = 'strength' | 'emom' | 'circuit'

export type Template = {
  id: string
  name: string
  type?: WorkoutType // Optional, defaults to 'strength'

  // Strength workouts (existing)
  exercises: {
    name: string
    sets: number
    reps: number
    weight?: number
  }[]

  // EMOM-specific fields (only when type === 'emom')
  durationMinutes?: number
  warmup?: Array<{ label: string; target: string }>
  minuteA?: Array<{ label: string; target: string }>
  minuteB?: Array<{ label: string; target: string }>
  extras?: Array<{ label: string; target: string }>

  // Circuit-specific fields (only when type === 'circuit')
  rounds?: number
  restBetweenRoundsSeconds?: number
  stations?: Array<{ order: number; label: string; target: string }>
}
