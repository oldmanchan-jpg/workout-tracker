import { supabase } from '../lib/supabase'
import { workoutTemplates } from '../data/workoutTemplates'
import type { Template, WorkoutType } from '../types'

export const WORKOUT_TEMPLATES_UPDATED = 'workout-templates-updated'

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
    // Dispatch event AFTER successful save
    window.dispatchEvent(new Event(WORKOUT_TEMPLATES_UPDATED))
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

    const isNonEmptyString = (v: any): v is string => typeof v === 'string' && v.trim().length > 0

    const validateTargetedItems = (
      items: any,
      label: string,
      opts: { required: boolean; requireNonEmpty: boolean }
    ):
      | { ok: true; value: Array<{ label: string; target: string }> | null }
      | { ok: false; error: string } => {
      if (items === undefined || items === null) {
        if (opts.required) return { ok: false, error: `Missing "${label}" field` }
        return { ok: true, value: null }
      }
      if (!Array.isArray(items)) return { ok: false, error: `"${label}" must be an array` }
      if (opts.requireNonEmpty && items.length === 0) return { ok: false, error: `"${label}" must not be empty` }

      const adapted: Array<{ label: string; target: string }> = []
      for (let k = 0; k < items.length; k++) {
        const it = items[k]
        if (!it || typeof it !== 'object') {
          return { ok: false, error: `"${label}" item ${k + 1}: must be an object` }
        }
        if (!isNonEmptyString(it.label)) {
          return { ok: false, error: `"${label}" item ${k + 1}: Missing or invalid "label"` }
        }
        if (!isNonEmptyString(it.target)) {
          return { ok: false, error: `"${label}" item ${k + 1}: Missing or invalid "target"` }
        }
        adapted.push({ label: it.label, target: it.target })
      }
      return { ok: true, value: adapted }
    }

    type TargetedItemsValidationResult =
      | { ok: true; value: Array<{ label: string; target: string }> | null }
      | { ok: false; error: string }

    const isTargetedItemsError = (
      res: TargetedItemsValidationResult
    ): res is { ok: false; error: string } => res.ok === false
    
    for (let i = 0; i < templatesArray.length; i++) {
      const t = templatesArray[i]
      
      // Validate required fields
      if (!t.name || typeof t.name !== 'string') {
        return { success: false, error: `Template ${i + 1}: Missing or invalid "name" field` }
      }

      // Validate workout type (default strength)
      const rawType = t.type
      let workoutType: WorkoutType = 'strength'
      if (rawType !== undefined) {
        if (typeof rawType !== 'string') {
          return { success: false, error: `Template ${i + 1}: "type" must be a string` }
        }
        if (rawType !== 'strength' && rawType !== 'emom' && rawType !== 'circuit') {
          return { success: false, error: `Template ${i + 1}: Invalid "type" (must be "strength", "emom", or "circuit")` }
        }
        workoutType = rawType
      }

      // Generate ID if missing
      const id = t.id && typeof t.id === 'string' ? t.id : `${slugify(t.name)}-${random4()}`

      if (workoutType === 'strength') {
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

          adaptedExercises.push({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: typeof ex.weight === 'number' && ex.weight >= 0 ? ex.weight : undefined
          })
        }

        adaptedTemplates.push({
          id,
          name: t.name,
          // Keep type optional for strength (missing defaults to strength)
          type: rawType === 'strength' ? 'strength' : undefined,
          exercises: adaptedExercises
        })
      } else if (workoutType === 'emom') {
        if (typeof t.durationMinutes !== 'number' || t.durationMinutes <= 0) {
          return { success: false, error: `Template ${i + 1}: "durationMinutes" must be a number > 0` }
        }

        const warmupRes = validateTargetedItems(t.warmup, 'warmup', { required: false, requireNonEmpty: false })
        if (isTargetedItemsError(warmupRes)) {
          return { success: false, error: `Template ${i + 1}: ${warmupRes.error}` }
        }

        const minuteARes = validateTargetedItems(t.minuteA, 'minuteA', { required: true, requireNonEmpty: true })
        if (isTargetedItemsError(minuteARes)) {
          return { success: false, error: `Template ${i + 1}: ${minuteARes.error}` }
        }

        const minuteBRes = validateTargetedItems(t.minuteB, 'minuteB', { required: true, requireNonEmpty: true })
        if (isTargetedItemsError(minuteBRes)) {
          return { success: false, error: `Template ${i + 1}: ${minuteBRes.error}` }
        }

        const extrasRes = validateTargetedItems(t.extras, 'extras', { required: false, requireNonEmpty: false })
        if (isTargetedItemsError(extrasRes)) {
          return { success: false, error: `Template ${i + 1}: ${extrasRes.error}` }
        }

        adaptedTemplates.push({
          id,
          name: t.name,
          type: 'emom',
          durationMinutes: t.durationMinutes,
          // Keep exercises field present for compatibility with existing strength code paths
          exercises: [],
          warmup: warmupRes.value || undefined,
          minuteA: minuteARes.value || [],
          minuteB: minuteBRes.value || [],
          extras: extrasRes.value || undefined
        })
      } else if (workoutType === 'circuit') {
        if (typeof t.rounds !== 'number' || t.rounds < 1) {
          return { success: false, error: `Template ${i + 1}: "rounds" must be a number >= 1` }
        }

        if (t.restBetweenRoundsSeconds !== undefined) {
          if (typeof t.restBetweenRoundsSeconds !== 'number' || t.restBetweenRoundsSeconds < 0) {
            return { success: false, error: `Template ${i + 1}: "restBetweenRoundsSeconds" must be a number >= 0` }
          }
        }

        const warmupRes = validateTargetedItems(t.warmup, 'warmup', { required: false, requireNonEmpty: false })
        if (isTargetedItemsError(warmupRes)) {
          return { success: false, error: `Template ${i + 1}: ${warmupRes.error}` }
        }

        if (!Array.isArray(t.stations) || t.stations.length === 0) {
          return { success: false, error: `Template ${i + 1}: Missing or empty "stations" array` }
        }

        const stations: NonNullable<Template['stations']> = []
        for (let j = 0; j < t.stations.length; j++) {
          const st = t.stations[j]
          if (!st || typeof st !== 'object') {
            return { success: false, error: `Template ${i + 1}, Station ${j + 1}: must be an object` }
          }
          if (typeof st.order !== 'number' || st.order < 1) {
            return { success: false, error: `Template ${i + 1}, Station ${j + 1}: "order" must be a number >= 1` }
          }
          if (!isNonEmptyString(st.label)) {
            return { success: false, error: `Template ${i + 1}, Station ${j + 1}: Missing or invalid "label"` }
          }
          if (!isNonEmptyString(st.target)) {
            return { success: false, error: `Template ${i + 1}, Station ${j + 1}: Missing or invalid "target"` }
          }
          stations.push({ order: st.order, label: st.label, target: st.target })
        }

        adaptedTemplates.push({
          id,
          name: t.name,
          type: 'circuit',
          rounds: t.rounds,
          restBetweenRoundsSeconds: t.restBetweenRoundsSeconds,
          // Keep exercises field present for compatibility with existing strength code paths
          exercises: [],
          warmup: warmupRes.value || undefined,
          stations
        })
      }
    }
    
    return { success: true, templates: adaptedTemplates }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { success: false, error: 'Invalid JSON format' }
    }
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
