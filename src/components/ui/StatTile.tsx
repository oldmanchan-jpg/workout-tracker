import type { HTMLAttributes, ReactNode } from 'react'

export type StatTileProps = HTMLAttributes<HTMLDivElement> & {
  label: string
  value: string
  icon?: ReactNode
}

export default function StatTile({ label, value, icon, className, ...props }: StatTileProps) {
  const classes = ['flex flex-col items-start gap-2 text-left', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} {...props}>
      <div className="h-10 w-10 rounded-full bg-black/25 flex items-center justify-center text-hp-text/80">
        {icon}
      </div>
      <div className="text-hp-accent text-lg font-semibold leading-none">{value}</div>
      <div className="text-hp-text text-xs font-medium">{label}</div>
    </div>
  )
}
