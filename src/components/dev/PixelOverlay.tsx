import { useMemo, useState } from 'react'

export type PixelOverlayProps = {
  src: string
  defaultOpacity?: number // 0..100
}

export default function PixelOverlay({ src, defaultOpacity = 40 }: PixelOverlayProps) {
  const [enabled, setEnabled] = useState(true)
  const [opacity, setOpacity] = useState(defaultOpacity)

  const style = useMemo(
    () => ({ opacity: opacity / 100 }),
    [opacity]
  )

  if (!import.meta.env.DEV) return null

  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      {/* Controls */}
      <div className="pointer-events-auto absolute top-2 left-2 rounded-[12px] border border-white/10 bg-black/60 backdrop-blur px-3 py-2 text-xs text-white/90">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Overlay
        </label>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-white/60">Opacity</span>
          <input
            type="range"
            min={0}
            max={100}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
          />
          <span className="w-8 text-right text-white/70">{opacity}</span>
        </div>
      </div>

      {enabled && (
        <img
          src={src}
          alt=""
          style={style}
          className="absolute inset-0 h-full w-full object-contain"
        />
      )}
    </div>
  )
}
