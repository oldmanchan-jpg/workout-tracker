import type { HTMLAttributes } from 'react'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'raised'
}

export default function Card({ className, variant = 'default', ...props }: CardProps) {
  const baseClasses = 'bg-hp-surface rounded-card border border-hp-border'
  const variantClasses = variant === 'raised' ? 'bg-hp-surface/90 shadow-glow-soft' : ''
  const classes = [baseClasses, variantClasses, className].filter(Boolean).join(' ')

  return <div className={classes} {...props} />
}
