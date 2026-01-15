import type { HTMLAttributes } from 'react'

export type PillProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'default' | 'accent'
}

export default function Pill({ className, tone = 'default', ...props }: PillProps) {
  const toneClasses =
    tone === 'accent'
      ? 'bg-hp-accent/15 text-hp-accent border border-hp-accent/30'
      : 'bg-hp-surface2 text-hp-text2 border border-hp-border'
  const classes = [
    'inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-pill',
    toneClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <span className={classes} {...props} />
}
