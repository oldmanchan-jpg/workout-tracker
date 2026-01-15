import { useState } from 'react'

export type PixelOverlayProps = {
  src: string
}

export default function PixelOverlay({ src }: PixelOverlayProps) {
  const [enabled, setEnabled] = useState(true)
  const [opacity, setOpacity] = useState(0.5)

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="pointer-events-auto absolute left-3 top-3 z-30 rounded-card bg-hp-surface2/90 p-2 text-[10px] text-hp-text border border-white/10">
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
            max={1}
            step={0.05}
            value={opacity}
            onChange={(event) => setOpacity(Number.parseFloat(event.target.value))}
            className="w-20"
          />
          <span className="text-hp-text2">{opacity.toFixed(2)}</span>
        </div>
      </div>
      {enabled && (
        <img
          src={src}
          alt="Pixel overlay"
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
          style={{ opacity }}
        />
      )}
    </div>
  )
}
