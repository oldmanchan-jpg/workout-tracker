
export type ExerciseSet = {
  reps: number
  weight: number
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

export type Template = {
  id: string
  name: string
  exercises: { 
    name: string; 
    sets: number; 
    reps: number; 
    weight?: number;
  }[]
}
