import type { HTMLAttributes } from 'react'

export type CardProps = HTMLAttributes<HTMLDivElement>

export default function Card({ className, ...props }: CardProps) {
  const classes = [
    'rounded-card border border-white/5 bg-hp-surface/90',
    'shadow-[0_18px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <div className={classes} {...props} />
}
