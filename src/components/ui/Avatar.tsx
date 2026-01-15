import type { ImgHTMLAttributes } from 'react'

export type AvatarProps = ImgHTMLAttributes<HTMLImageElement> & {
  size?: number
}

export default function Avatar({ size = 48, className, src, alt, ...props }: AvatarProps) {
  const wrapperClasses = [
    'rounded-full border-2 border-hp-accent flex items-center justify-center overflow-hidden',
    'bg-gradient-to-br from-hp-accent/60 to-hp-surface2',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapperClasses} style={{ width: size, height: size }}>
      {src ? (
        <img src={src} alt={alt ?? 'Avatar'} className="h-full w-full object-cover" {...props} />
      ) : (
        <span className="text-hp-bg text-xs font-semibold">HP</span>
      )}
    </div>
  )
}
