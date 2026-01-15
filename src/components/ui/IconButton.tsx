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
    'h-11 w-11 rounded-full border border-white/5 bg-white/10',
    'flex items-center justify-center text-hp-text/80 transition-colors',
    'hover:bg-white/15 hover:text-hp-text',
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
