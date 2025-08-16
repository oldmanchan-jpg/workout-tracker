import React from 'react'
import { motion } from 'framer-motion'

interface AnimatedButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  className?: string
  icon?: React.ComponentType<{ className?: string }>
  iconPosition?: 'left' | 'right'
}

const variantClasses = {
  primary: 'bg-primary text-white hover:bg-primary-light shadow-lg hover:shadow-xl',
  secondary: 'bg-secondary text-white hover:bg-secondary-light shadow-lg hover:shadow-xl',
  outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl'
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl'
}

export default function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  icon: Icon,
  iconPosition = 'left'
}: AnimatedButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `

  const iconClasses = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : size === 'lg' ? 'w-6 h-6' : 'w-7 h-7'

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={baseClasses}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17
      }}
    >
      {loading ? (
        <motion.div
          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className={`${iconClasses} mr-2`} />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon className={`${iconClasses} ml-2`} />
          )}
        </>
      )}
    </motion.button>
  )
}

// Specialized button variants
export function PrimaryButton(props: Omit<AnimatedButtonProps, 'variant'>) {
  return <AnimatedButton {...props} variant="primary" />
}

export function SecondaryButton(props: Omit<AnimatedButtonProps, 'variant'>) {
  return <AnimatedButton {...props} variant="secondary" />
}

export function OutlineButton(props: Omit<AnimatedButtonProps, 'variant'>) {
  return <AnimatedButton {...props} variant="outline" />
}

export function GhostButton(props: Omit<AnimatedButtonProps, 'variant'>) {
  return <AnimatedButton {...props} variant="ghost" />
}

export function DangerButton(props: Omit<AnimatedButtonProps, 'variant'>) {
  return <AnimatedButton {...props} variant="danger" />
}

// Floating action button
export function FloatingActionButton({
  children,
  onClick,
  className = '',
  icon: Icon
}: {
  children?: React.ReactNode
  onClick?: () => void
  className?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full
        shadow-lg hover:shadow-xl flex items-center justify-center
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
        ${className}
      `}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17
      }}
    >
      {Icon ? <Icon className="w-6 h-6" /> : children}
    </motion.button>
  )
}

// Icon button with animations
export function IconButton({
  icon: Icon,
  onClick,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  className = ''
}: {
  icon: React.ComponentType<{ className?: string }>
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  className?: string
}) {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7'
  }

  return (
    <AnimatedButton
      onClick={onClick}
      variant={variant}
      size={size}
      disabled={disabled}
      className={`p-2 ${className}`}
    >
      <Icon className={iconSizes[size]} />
    </AnimatedButton>
  )
}
