import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
}

export default function IconButton({ className, children, ...props }: IconButtonProps) {
  const classes = [
    'h-11 w-11 rounded-full border border-hp-border bg-hp-surface2 text-hp-text',
    'flex items-center justify-center transition-colors',
    'hover:text-hp-accent hover:border-hp-accent/40',
    'focus:outline-none focus:ring-2 focus:ring-hp-accent/40',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  )
}
