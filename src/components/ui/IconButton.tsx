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
    'flex items-center justify-center text-white/80 transition-colors',
    'hover:bg-white/15 hover:text-white',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29e33c]/40',
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
