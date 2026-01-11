import { supabase } from '../lib/supabase'

export interface WorkoutData {
  workout_date: string
  template_name: string
  exercises: {
    name: string
    sets: {
      reps: number
      weight: number
      rpe?: number // Rate of Perceived Exertion (1-10)
    }[]
  }[]
  total_volume: number
  total_reps: number
  notes?: string
}

export interface SavedWorkout extends WorkoutData {
  id: string
  user_id: string
  created_at: string
}

/**
 * Save a completed workout to Supabase
 */
export async function saveWorkout(workoutData: WorkoutData) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Add user_id to workout data
    const workoutWithUser = {
      ...workoutData,
      user_id: user.id
    }

    const { data, error } = await supabase
      .from('workouts')
      .insert([workoutWithUser])
      .select()
      .single()

    if (error) {
      console.error('Error saving workout:', error)
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Failed to save workout:', error)
    return { data: null, error }
  }
}

/**
 * Get all workouts for the current user, sorted by date (newest first)
 */
export async function getAllWorkouts() {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('workout_date', { ascending: false })

    if (error) {
      console.error('Error fetching workouts:', error)
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Failed to fetch workouts:', error)
    return { data: null, error }
  }
}

/**
 * Get a single workout by ID
 */
export async function getWorkoutById(id: string) {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching workout:', error)
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Failed to fetch workout:', error)
    return { data: null, error }
  }
}

/**
 * Get workouts within a date range
 */
export async function getWorkoutsByDateRange(startDate: string, endDate: string) {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .gte('workout_date', startDate)
      .lte('workout_date', endDate)
      .order('workout_date', { ascending: false })

    if (error) {
      console.error('Error fetching workouts by date range:', error)
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Failed to fetch workouts by date range:', error)
    return { data: null, error }
  }
}

/**
 * Delete a workout by ID
 */
export async function deleteWorkout(id: string) {
  try {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting workout:', error)
      throw error
    }

    return { error: null }
  } catch (error) {
    console.error('Failed to delete workout:', error)
    return { error }
  }
}

/**
 * Calculate total stats from all workouts
 */
export function calculateWorkoutStats(workouts: SavedWorkout[]) {
  const totalWorkouts = workouts.length
  
  const totalVolume = workouts.reduce((sum, workout) => {
    return sum + (workout.total_volume || 0)
  }, 0)

  const totalReps = workouts.reduce((sum, workout) => {
    return sum + (workout.total_reps || 0)
  }, 0)

  const avgVolume = totalWorkouts > 0 ? totalVolume / totalWorkouts : 0

  return {
    totalWorkouts,
    totalVolume,
    totalReps,
    avgVolume
  }
}
