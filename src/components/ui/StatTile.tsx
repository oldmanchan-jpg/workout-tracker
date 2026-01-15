import type { HTMLAttributes } from 'react'

export type StatTileProps = HTMLAttributes<HTMLDivElement> & {
  label: string
  value: string
}

export default function StatTile({ label, value, className, ...props }: StatTileProps) {
  const classes = ['flex flex-col items-center gap-1 text-center', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} {...props}>
      <div className="text-hp-accent text-lg font-semibold leading-none">{value}</div>
      <div className="text-hp-text2 text-xs">{label}</div>
    </div>
  )
}
