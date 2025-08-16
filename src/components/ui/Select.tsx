import React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown, Check, ChevronUp } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'filled'
  error?: string
  required?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-4 py-3 text-lg'
}

const variantClasses = {
  default: 'bg-white border-gray-300 hover:border-gray-400 focus:border-primary',
  outline: 'bg-transparent border-gray-300 hover:border-gray-400 focus:border-primary',
  filled: 'bg-gray-50 border-gray-300 hover:border-gray-400 focus:border-primary focus:bg-white'
}

export default function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Select option',
  disabled = false,
  size = 'md',
  variant = 'default',
  error,
  required = false,
  className = ''
}: SelectProps) {
  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className={`space-y-2 ${className}`}>
      <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          className={`
            flex items-center justify-between w-full rounded-lg border transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <SelectPrimitive.Value placeholder={placeholder}>
            {selectedOption ? selectedOption.label : placeholder}
          </SelectPrimitive.Value>
          
          <SelectPrimitive.Icon className="text-gray-400">
            <ChevronDown className="w-4 h-4" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="z-50 min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 p-1 animate-fade-in"
            position="popper"
            sideOffset={5}
          >
            <SelectPrimitive.ScrollUpButton className="flex items-center justify-center py-2 cursor-default">
              <ChevronUp className="w-4 h-4 text-gray-400" />
            </SelectPrimitive.ScrollUpButton>
            
            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={`
                    relative flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors
                    ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}
                    ${option.disabled 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-primary/10 focus:bg-primary/10 focus:outline-none'
                    }
                    ${option.value === value ? 'bg-primary/10 text-primary' : 'text-gray-700'}
                  `}
                >
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  
                  {option.value === value && (
                    <SelectPrimitive.ItemIndicator className="absolute right-3">
                      <Check className="w-4 h-4 text-primary" />
                    </SelectPrimitive.ItemIndicator>
                  )}
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
            
            <SelectPrimitive.ScrollDownButton className="flex items-center justify-center py-2 cursor-default">
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm animate-fade-in">
          <div className="w-1 h-1 bg-red-500 rounded-full" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

// Specialized select for workout templates
export function TemplateSelect({
  value,
  onValueChange,
  templates,
  disabled = false,
  size = 'md'
}: {
  value: string
  onValueChange: (value: string) => void
  templates: { id: string; name: string }[]
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const options = templates.map(template => ({
    value: template.id,
    label: template.name
  }))

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      options={options}
      placeholder="Select workout template"
      disabled={disabled}
      size={size}
      variant="outline"
    />
  )
}

// Specialized select for exercise types
export function ExerciseTypeSelect({
  value,
  onValueChange,
  exerciseTypes,
  disabled = false,
  size = 'md'
}: {
  value: string
  onValueChange: (value: string) => void
  exerciseTypes: { value: string; label: string }[]
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      options={exerciseTypes}
      placeholder="Select exercise type"
      disabled={disabled}
      size={size}
      variant="outline"
    />
  )
}
