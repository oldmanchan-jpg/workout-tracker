import type { InputHTMLAttributes } from 'react'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export default function Input({ className, ...props }: InputProps) {
  const classes = ['ui-input', className].filter(Boolean).join(' ')

  return <input className={classes} {...props} />
}
