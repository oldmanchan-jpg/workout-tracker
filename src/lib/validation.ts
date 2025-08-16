import type { ExerciseSet, ExerciseEntry, Workout, Template } from '@/types'
import { z } from 'zod'

// Validation result type
export type ValidationResult = {
  isValid: boolean
  errors: string[]
}

// Generic validation helpers
export const isRequired = (value: any, fieldName: string): string | null => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`
  }
  return null
}

export const isString = (value: any, fieldName: string): string | null => {
  if (typeof value !== 'string') {
    return `${fieldName} must be a string`
  }
  return null
}

export const isNumber = (value: any, fieldName: string): string | null => {
  if (typeof value !== 'number' || isNaN(value)) {
    return `${fieldName} must be a number`
  }
  return null
}

export const isPositiveNumber = (value: any, fieldName: string): string | null => {
  const numError = isNumber(value, fieldName)
  if (numError) return numError
  
  if (value <= 0) {
    return `${fieldName} must be greater than 0`
  }
  return null
}

export const isNonNegativeNumber = (value: any, fieldName: string): string | null => {
  const numError = isNumber(value, fieldName)
  if (numError) return numError
  
  if (value < 0) {
    return `${fieldName} must be 0 or greater`
  }
  return null
}

export const isInRange = (value: number, min: number, max: number, fieldName: string): string | null => {
  const numError = isNumber(value, fieldName)
  if (numError) return numError
  
  if (value < min || value > max) {
    return `${fieldName} must be between ${min} and ${max}`
  }
  return null
}

export const isValidDate = (dateString: string, fieldName: string): string | null => {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return `${fieldName} must be a valid date`
  }
  return null
}

export const isNotFutureDate = (dateString: string, fieldName: string): string | null => {
  const dateError = isValidDate(dateString, fieldName)
  if (dateError) return dateError
  
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(23, 59, 59, 999) // End of today
  
  if (date > today) {
    return `${fieldName} cannot be in the future`
  }
  return null
}

export const hasMinLength = (value: string, minLength: number, fieldName: string): string | null => {
  const strError = isString(value, fieldName)
  if (strError) return strError
  
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`
  }
  return null
}

export const hasMaxLength = (value: string, maxLength: number, fieldName: string): string | null => {
  const strError = isString(value, fieldName)
  if (strError) return strError
  
  if (value.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters long`
  }
  return null
}

export const isNotEmptyArray = (value: any[], fieldName: string): string | null => {
  if (!Array.isArray(value)) {
    return `${fieldName} must be an array`
  }
  
  if (value.length === 0) {
    return `${fieldName} cannot be empty`
  }
  return null
}

// Exercise-specific validations
export const validateExerciseSet = (set: ExerciseSet): string[] => {
  const errors: string[] = []
  
  const repsError = isPositiveNumber(set.reps, 'Reps')
  if (repsError) errors.push(repsError)
  
  const weightError = isNonNegativeNumber(set.weight, 'Weight')
  if (weightError) errors.push(weightError)
  
  return errors
}

export const validateExerciseEntry = (exercise: ExerciseEntry): string[] => {
  const errors: string[] = []
  
  const nameError = isRequired(exercise.name, 'Exercise name')
  if (nameError) errors.push(nameError)
  
  const nameLengthError = hasMaxLength(exercise.name, 100, 'Exercise name')
  if (nameLengthError) errors.push(nameLengthError)
  
  const setsError = isNotEmptyArray(exercise.sets, 'Sets')
  if (setsError) errors.push(setsError)
  
  if (exercise.sets.length > 0) {
    exercise.sets.forEach((set, index) => {
      const setErrors = validateExerciseSet(set)
      setErrors.forEach(error => errors.push(`Set ${index + 1}: ${error}`))
    })
  }
  
  return errors
}

// Workout validations
export const validateWorkout = (workout: Omit<Workout, 'id' | 'userId'>): ValidationResult => {
  const errors: string[] = []
  
  const dateError = isRequired(workout.date, 'Date')
  if (dateError) errors.push(dateError)
  
  if (workout.date) {
    const validDateError = isValidDate(workout.date, 'Date')
    if (validDateError) errors.push(validDateError)
    
    const futureDateError = isNotFutureDate(workout.date, 'Date')
    if (futureDateError) errors.push(futureDateError)
  }
  
  if (workout.notes !== undefined) {
    const notesLengthError = hasMaxLength(workout.notes, 500, 'Notes')
    if (notesLengthError) errors.push(notesLengthError)
  }
  
  const exercisesError = isNotEmptyArray(workout.exercises, 'Exercises')
  if (exercisesError) errors.push(exercisesError)
  
  if (workout.exercises.length > 0) {
    workout.exercises.forEach((exercise, index) => {
      const exerciseErrors = validateExerciseEntry(exercise)
      exerciseErrors.forEach(error => errors.push(`Exercise ${index + 1}: ${error}`))
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Template validations
export const validateTemplateForm = (template: Omit<Template, 'id' | 'userId'>): ValidationResult => {
  const errors: string[] = []
  
  const nameError = isRequired(template.name, 'Template name')
  if (nameError) errors.push(nameError)
  
  const nameLengthError = hasMaxLength(template.name, 100, 'Template name')
  if (nameLengthError) errors.push(nameLengthError)
  
  const exercisesError = isNotEmptyArray(template.exercises, 'Exercises')
  if (exercisesError) errors.push(exercisesError)
  
  if (template.exercises.length > 0) {
    template.exercises.forEach((exercise, index) => {
      const nameError = isRequired(exercise.name, `Exercise ${index + 1} name`)
      if (nameError) errors.push(nameError)
      
      const nameLengthError = hasMaxLength(exercise.name, 100, `Exercise ${index + 1} name`)
      if (nameLengthError) errors.push(nameLengthError)
      
      const setsError = isPositiveNumber(exercise.sets, `Exercise ${index + 1} sets`)
      if (setsError) errors.push(setsError)
      
      const repsError = isPositiveNumber(exercise.reps, `Exercise ${index + 1} reps`)
      if (repsError) errors.push(repsError)
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Enhanced workout validation schema with Zod
export const workoutFormSchema = z.object({
  notes: z.string().optional(),
  exercises: z.array(z.object({
    name: z.string().min(1, 'Exercise name is required'),
    sets: z.array(z.object({
      reps: z.number().min(0, 'Reps must be 0 or greater').max(1000, 'Reps cannot exceed 1000').optional(),
      weight: z.number().min(0, 'Weight must be 0 or greater').max(1000, 'Weight cannot exceed 1000kg').optional()
    })).min(1, 'At least one set is required')
  })).min(1, 'At least one exercise is required')
})

export type WorkoutFormData = z.infer<typeof workoutFormSchema>

// Enhanced validation function using Zod
export const validateWorkoutForm = (data: any) => {
  try {
    const validated = workoutFormSchema.parse(data)
    return { isValid: true, data: validated, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(err => `${err.path.join('.')}: ${err.message}`)
      return { isValid: false, data: null, errors }
    }
    return { isValid: false, data: null, errors: ['Unknown validation error'] }
  }
}

// Individual field validation schemas
export const setSchema = z.object({
  reps: z.number().min(0).max(1000),
  weight: z.number().min(0).max(1000)
})

export const exerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.array(setSchema).min(1)
})

// Real-time validation helpers
export const validateReps = (value: string): { isValid: boolean; error?: string } => {
  const num = Number(value)
  if (isNaN(num)) return { isValid: false, error: 'Must be a number' }
  if (num < 0) return { isValid: false, error: 'Cannot be negative' }
  if (num > 1000) return { isValid: false, error: 'Cannot exceed 1000' }
  return { isValid: true }
}

export const validateWeight = (value: string): { isValid: boolean; error?: string } => {
  const num = Number(value)
  if (isNaN(num)) return { isValid: false, error: 'Must be a number' }
  if (num < 0) return { isValid: false, error: 'Cannot be negative' }
  if (num > 1000) return { isValid: false, error: 'Cannot exceed 1000kg' }
  return { isValid: true }
}

// Template-specific types and constants
export const LIMITS = {
  SETS_MIN: 1,
  SETS_MAX: 10,
  REPS_MIN: 1,
  REPS_MAX: 50,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100
} as const

export type TemplateExerciseDraft = {
  name: string
  sets: number
  reps: number
}

export type TemplateDraft = {
  name: string
  exercises: TemplateExerciseDraft[]
}

// Utility functions for templates
export const clampInt = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, Math.round(value)))
}

export const cleanName = (name: string): string => {
  return name.trim().replace(/\s+/g, ' ')
}

// Template validation with detailed error structure
export const validateTemplate = (template: TemplateDraft): {
  ok: boolean
  errors: {
    name?: string
    exercises?: Array<{
      name?: string
      sets?: string
      reps?: string
    }>
  }
} => {
  const errors: {
    name?: string
    exercises?: Array<{
      name?: string
      sets?: string
      reps?: string
    }>
  } = {}

  // Validate name
  const nameError = isRequired(template.name, 'Template name')
  if (nameError) {
    errors.name = nameError
  } else {
    const nameLengthError = hasMinLength(template.name, LIMITS.NAME_MIN_LENGTH, 'Template name')
    if (nameLengthError) errors.name = nameLengthError
    else {
      const maxLengthError = hasMaxLength(template.name, LIMITS.NAME_MAX_LENGTH, 'Template name')
      if (maxLengthError) errors.name = maxLengthError
    }
  }

  // Validate exercises
  const exercisesError = isNotEmptyArray(template.exercises, 'Exercises')
  if (exercisesError) {
    errors.exercises = []
  } else {
    errors.exercises = template.exercises.map((exercise, index) => {
      const exerciseErrors: { name?: string; sets?: string; reps?: string } = {}

      // Validate exercise name
      const exNameError = isRequired(exercise.name, `Exercise ${index + 1} name`)
      if (exNameError) {
        exerciseErrors.name = exNameError
      } else {
        const exNameLengthError = hasMinLength(exercise.name, LIMITS.NAME_MIN_LENGTH, `Exercise ${index + 1} name`)
        if (exNameLengthError) exerciseErrors.name = exNameLengthError
        else {
          const exMaxLengthError = hasMaxLength(exercise.name, LIMITS.NAME_MAX_LENGTH, `Exercise ${index + 1} name`)
          if (exMaxLengthError) exerciseErrors.name = exMaxLengthError
        }
      }

      // Validate sets
      const setsError = isInRange(exercise.sets, LIMITS.SETS_MIN, LIMITS.SETS_MAX, `Exercise ${index + 1} sets`)
      if (setsError) exerciseErrors.sets = setsError

      // Validate reps
      const repsError = isInRange(exercise.reps, LIMITS.REPS_MIN, LIMITS.REPS_MAX, `Exercise ${index + 1} reps`)
      if (repsError) exerciseErrors.reps = repsError

      return exerciseErrors
    })
  }

  const hasErrors = errors.name || errors.exercises?.some(ex => ex.name || ex.sets || ex.reps)

  return {
    ok: !hasErrors,
    errors
  }
}

// Utility functions
export const validateAll = (validations: (string | null)[]): string[] => {
  return validations.filter((error): error is string => error !== null)
}

export const createValidator = <T>(validators: ((value: T) => string | null)[]) => {
  return (value: T): ValidationResult => {
    const errors = validateAll(validators.map(validator => validator(value)))
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Common validation patterns
export const workoutNameValidator = createValidator([
  (name: string) => isRequired(name, 'Workout name'),
  (name: string) => hasMinLength(name, 1, 'Workout name'),
  (name: string) => hasMaxLength(name, 100, 'Workout name')
])

export const exerciseNameValidator = createValidator([
  (name: string) => isRequired(name, 'Exercise name'),
  (name: string) => hasMinLength(name, 1, 'Exercise name'),
  (name: string) => hasMaxLength(name, 100, 'Exercise name')
])

export const repsValidator = createValidator([
  (reps: number) => isPositiveNumber(reps, 'Reps'),
  (reps: number) => isInRange(reps, 1, 1000, 'Reps')
])

export const weightValidator = createValidator([
  (weight: number) => isNonNegativeNumber(weight, 'Weight'),
  (weight: number) => isInRange(weight, 0, 1000, 'Weight')
])

export const setsValidator = createValidator([
  (sets: number) => isPositiveNumber(sets, 'Sets'),
  (sets: number) => isInRange(sets, 1, 50, 'Sets')
])
