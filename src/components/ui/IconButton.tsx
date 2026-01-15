import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
}

export default function IconButton({
  className,
  children,
  type = 'button',
  ...props
}: IconButtonProps) {
  const classes = [
    'h-10 w-10 rounded-full border border-hp-border bg-hp-surface2',
    'flex items-center justify-center text-hp-text transition-colors',
    'hover:border-hp-accent/50 hover:text-hp-accent',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hp-accent/40',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}
