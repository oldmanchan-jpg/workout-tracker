import React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { Info, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error'
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  disabled?: boolean
}

const variantStyles = {
  default: 'bg-gray-900 text-white',
  info: 'bg-blue-600 text-white',
  success: 'bg-green-600 text-white',
  warning: 'bg-yellow-600 text-white',
  error: 'bg-red-600 text-white'
}

const variantIcons = {
  default: null,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle
}

export default function Tooltip({
  children,
  content,
  variant = 'default',
  side = 'top',
  align = 'center',
  delayDuration = 500,
  disabled = false
}: TooltipProps) {
  if (disabled) {
    return <>{children}</>
  }

  const IconComponent = variantIcons[variant]

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root delayDuration={delayDuration}>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            className={`
              z-50 px-3 py-2 rounded-lg shadow-lg border border-gray-200
              ${variantStyles[variant]}
              animate-fade-in
            `}
            side={side}
            align={align}
            sideOffset={5}
          >
            <div className="flex items-center gap-2">
              {IconComponent && (
                <IconComponent className="w-4 h-4 flex-shrink-0" />
              )}
              <div className="text-sm font-medium">
                {content}
              </div>
            </div>
            
            <TooltipPrimitive.Arrow className="fill-current" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

// Specialized tooltip for help text
export function HelpTooltip({
  children,
  helpText,
  variant = 'info'
}: {
  children: React.ReactNode
  helpText: string
  variant?: 'info' | 'success' | 'warning' | 'error'
}) {
  return (
    <Tooltip content={helpText} variant={variant}>
      <div className="inline-flex items-center">
        {children}
        <Info className="w-4 h-4 ml-1 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
      </div>
    </Tooltip>
  )
}

// Specialized tooltip for validation errors
export function ErrorTooltip({
  children,
  error,
  disabled = false
}: {
  children: React.ReactNode
  error?: string
  disabled?: boolean
}) {
  if (!error || disabled) {
    return <>{children}</>
  }

  return (
    <Tooltip content={error} variant="error" side="bottom">
      {children}
    </Tooltip>
  )
}

// Specialized tooltip for success messages
export function SuccessTooltip({
  children,
  message,
  disabled = false
}: {
  children: React.ReactNode
  message?: string
  disabled?: boolean
}) {
  if (!message || disabled) {
    return <>{children}</>
  }

  return (
    <Tooltip content={message} variant="success" side="bottom">
      {children}
    </Tooltip>
  )
}
