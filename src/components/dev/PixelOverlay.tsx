import { useState } from 'react'

export type PixelOverlayProps = {
  src: string
}

export default function PixelOverlay({ src }: PixelOverlayProps) {
  const [enabled, setEnabled] = useState(true)
  const [opacity, setOpacity] = useState(40)

  if (!import.meta.env.DEV) return null

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="pointer-events-auto absolute left-4 top-4 z-20 rounded-card bg-hp-surface2/90 p-3 text-xs text-hp-text border border-hp-border">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="h-4 w-4 accent-hp-accent"
          />
          Overlay
        </label>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={100}
            value={opacity}
            onChange={(event) => setOpacity(Number(event.target.value))}
            className="w-24"
          />
          <span className="text-hp-text2">{opacity}%</span>
        </div>
      </div>
      {enabled && (
        <img
          src={src}
          alt="Pixel overlay"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: opacity / 100 }}
        />
      )}
    </div>
  )
}
