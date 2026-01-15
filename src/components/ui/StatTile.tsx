import type { ReactNode } from 'react'

export type StatTileProps = {
  icon: ReactNode
  value: string
  label: string
  className?: string
}

export default function StatTile({ icon, value, label, className }: StatTileProps) {
  const classes = ['flex items-center gap-3', className].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <div className="h-11 w-11 rounded-full bg-hp-surface2 border border-hp-border flex items-center justify-center text-hp-accent">
        {icon}
      </div>
      <div>
        <div className="text-hp-accent text-lg font-semibold leading-tight">{value}</div>
        <div className="text-hp-text2 text-xs">{label}</div>
      </div>
    </div>
  )
}
