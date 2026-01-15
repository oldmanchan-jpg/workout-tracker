import type { HTMLAttributes } from 'react'

export type CardProps = HTMLAttributes<HTMLDivElement>

export default function Card({ className, ...props }: CardProps) {
  const classes = [
    'rounded-card border border-hp-border bg-hp-surface',
    'shadow-[0_18px_40px_rgba(0,0,0,0.35)]',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <div className={classes} {...props} />
}
