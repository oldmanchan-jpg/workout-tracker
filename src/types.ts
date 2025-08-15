
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
  userId: string
  date: string // ISO string
  notes?: string
  exercises: ExerciseEntry[]
  createdAt?: any // Firestore timestamp
}

export type Template = {
  id: string
  userId: string
  name: string
  exercises: { 
    name: string; 
    sets: number; 
    reps: number; 
    weight?: number;
    intensity?: string; // Intensity percentage
    targetReps?: number; // Target reps for the exercise
    mediaUrl?: string; // URL to exercise image/video
    mediaType?: 'image' | 'video'; // Type of media
  }[]
  createdAt?: any // Firestore timestamp
}

// New types for exercise media
export type ExerciseMedia = {
  url: string
  type: 'image' | 'video'
  altText?: string
}

export type ExerciseWithMedia = {
  name: string
  sets: number
  reps: number
  weight?: number
  intensity?: string
  targetReps?: number
  media?: ExerciseMedia
}
