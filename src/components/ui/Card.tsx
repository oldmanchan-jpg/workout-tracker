import type { HTMLAttributes } from 'react'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'flat' | 'elevated' | 'prominent'
}

const variantClasses: Record<NonNullable<CardProps['variant']>, string> = {
  default: '',
  flat: 'ui-card--flat',
  elevated: 'ui-card--elevated',
  prominent: 'ui-card--prominent',
}

export default function Card({ 
  variant = 'default',
  className, 
  ...props 
}: CardProps) {
  const classes = [
    'ui-card',
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <div className={classes} {...props} />
}
