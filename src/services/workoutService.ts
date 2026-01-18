import { supabase } from '../lib/supabase'
import { workoutTemplates } from '../data/workoutTemplates'
import type { Template } from '../types'

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

// Template storage constants
const LS_TEMPLATES_KEY = "workout_templates_v1"

/**
 * Generate a slug from a string (for ID generation)
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Generate a random 4-character string
 */
function random4(): string {
  return Math.random().toString(36).substring(2, 6)
}

/**
 * Load templates from localStorage
 */
export function loadTemplatesFromStorage(): Template[] {
  try {
    const stored = localStorage.getItem(LS_TEMPLATES_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Error loading templates from storage:', error)
    return []
  }
}

/**
 * Save templates to localStorage
 */
export function saveTemplatesToStorage(templates: Template[]): void {
  try {
    localStorage.setItem(LS_TEMPLATES_KEY, JSON.stringify(templates))
  } catch (error) {
    console.error('Error saving templates to storage:', error)
  }
}

/**
 * Get all templates (fallback + imported, deduplicated by id)
 */
export function getAllTemplates(): Template[] {
  const imported = loadTemplatesFromStorage()
  const fallback = workoutTemplates
  
  // Create a map to deduplicate by id
  const templateMap = new Map<string, Template>()
  
  // Add fallback templates first
  fallback.forEach(t => templateMap.set(t.id, t))
  
  // Add imported templates (will override fallback if same id)
  imported.forEach(t => templateMap.set(t.id, t))
  
  return Array.from(templateMap.values())
}

/**
 * Import templates from JSON string
 * Supports both array format: [{...}] and object format: { templates: [...] }
 */
export function importTemplatesFromJSON(jsonText: string): { success: boolean; templates?: Template[]; error?: string } {
  try {
    // Parse JSON
    const parsed = JSON.parse(jsonText)
    
    // Handle both array and object formats
    let templatesArray: any[]
    if (Array.isArray(parsed)) {
      templatesArray = parsed
    } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.templates)) {
      templatesArray = parsed.templates
    } else {
      return { success: false, error: 'Invalid format: Expected array or object with "templates" array' }
    }
    
    if (templatesArray.length === 0) {
      return { success: false, error: 'No templates found in JSON' }
    }
    
    // Validate and adapt each template
    const adaptedTemplates: Template[] = []
    
    for (let i = 0; i < templatesArray.length; i++) {
      const t = templatesArray[i]
      
      // Validate required fields
      if (!t.name || typeof t.name !== 'string') {
        return { success: false, error: `Template ${i + 1}: Missing or invalid "name" field` }
      }
      
      if (!Array.isArray(t.exercises) || t.exercises.length === 0) {
        return { success: false, error: `Template ${i + 1}: Missing or empty "exercises" array` }
      }
      
      // Validate and adapt exercises
      const adaptedExercises: Template['exercises'] = []
      
      for (let j = 0; j < t.exercises.length; j++) {
        const ex = t.exercises[j]
        
        if (!ex.name || typeof ex.name !== 'string') {
          return { success: false, error: `Template ${i + 1}, Exercise ${j + 1}: Missing or invalid "name" field` }
        }
        
        if (typeof ex.sets !== 'number' || ex.sets < 1) {
          return { success: false, error: `Template ${i + 1}, Exercise ${j + 1}: "sets" must be a number >= 1` }
        }
        
        if (typeof ex.reps !== 'number' || ex.reps < 1) {
          return { success: false, error: `Template ${i + 1}, Exercise ${j + 1}: "reps" must be a number >= 1` }
        }
        
        // Adapt exercise to match Template shape
        adaptedExercises.push({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: typeof ex.weight === 'number' && ex.weight >= 0 ? ex.weight : undefined
        })
      }
      
      // Generate ID if missing
      const id = t.id && typeof t.id === 'string' ? t.id : `${slugify(t.name)}-${random4()}`
      
      // Create adapted template matching Template type
      adaptedTemplates.push({
        id,
        name: t.name,
        exercises: adaptedExercises
      })
    }
    
    return { success: true, templates: adaptedTemplates }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { success: false, error: 'Invalid JSON format' }
    }
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
