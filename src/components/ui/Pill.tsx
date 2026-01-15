import type { ButtonHTMLAttributes } from 'react'

export type PillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'default' | 'accent'
}

export default function Pill({
  className,
  tone = 'default',
  type = 'button',
  ...props
}: PillProps) {
  const toneClasses =
    tone === 'accent'
      ? 'bg-hp-accent text-black border border-transparent font-medium hover:shadow-[0_0_18px_rgba(41,227,60,0.35)]'
      : 'bg-hp-surface2 text-hp-text2 border border-hp-border'

  const classes = [
    'inline-flex items-center justify-center rounded-pill px-4 py-2 text-xs font-semibold',
    'transition-colors',
    toneClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <button type={type} className={classes} {...props} />
}
