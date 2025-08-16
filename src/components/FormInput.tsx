import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface FormInputProps {
  name: string
  label?: string
  placeholder?: string
  type?: 'text' | 'number' | 'email' | 'password'
  required?: boolean
  min?: number
  max?: number
  step?: number
  className?: string
  disabled?: boolean
}

export default function FormInput({
  name,
  label,
  placeholder,
  type = 'text',
  required = false,
  min,
  max,
  step,
  className = '',
  disabled = false
}: FormInputProps) {
  const { control, formState: { errors } } = useFormContext()
  const error = errors[name]
  const hasError = !!error

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-white">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="relative">
            <input
              {...field}
              type={type}
              placeholder={placeholder}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              className={`
                w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary
                ${hasError 
                  ? 'border-red-400 focus:ring-red-400' 
                  : 'border-gray-600 focus:border-primary'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            />
            
            {/* Error/Success Icons */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {hasError ? (
                <AlertCircle className="w-5 h-5 text-red-400" />
              ) : field.value && (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              )}
            </div>
          </div>
        )}
      />
      
      {/* Error Message */}
      {hasError && (
        <div className="flex items-center gap-2 text-red-400 text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4" />
          <span>{error.message as string}</span>
        </div>
      )}
    </div>
  )
}

// Specialized input for workout sets
export function WorkoutSetInput({
  exerciseIndex,
  setIndex,
  field,
  className = ''
}: {
  exerciseIndex: number
  setIndex: number
  field: 'reps' | 'weight'
  className?: string
}) {
  const { control, formState: { errors } } = useFormContext()
  const fieldName = `exercises.${exerciseIndex}.sets.${setIndex}.${field}`
  const error = errors[fieldName]
  const hasError = !!error

  return (
    <div className={`space-y-1 ${className}`}>
      <Controller
        name={fieldName}
        control={control}
        render={({ field: inputField }) => (
          <div className="relative">
            <input
              {...inputField}
              type="number"
              placeholder={field === 'reps' ? '0' : '0'}
              min={0}
              max={1000}
              step={field === 'weight' ? 0.5 : 1}
              className={`
                w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-dark
                text-center text-lg font-medium transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                ${hasError 
                  ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
                  : 'hover:border-gray-300'
                }
                placeholder:text-gray-400
              `}
            />
            
            {/* Field Label */}
            <div className="absolute -top-2 left-2 px-2 bg-white text-xs text-gray-500 font-medium">
              {field === 'reps' ? 'Reps' : 'kg'}
            </div>
            
            {/* Error/Success Icons */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              {hasError ? (
                <AlertCircle className="w-4 h-4 text-red-500" />
              ) : inputField.value && inputField.value > 0 ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
              )}
            </div>
          </div>
        )}
      />
      
      {/* Error Message */}
      {hasError && (
        <div className="text-red-500 text-xs text-center animate-fade-in">
          {error.message as string}
        </div>
      )}
    </div>
  )
}
