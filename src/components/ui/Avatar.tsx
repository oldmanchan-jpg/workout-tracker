import type { ImgHTMLAttributes } from 'react'

export type AvatarProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'size'> & {
  size?: number
  initials?: string
  className?: string
}

export default function Avatar({
  size = 48,
  initials = 'AJ',
  className,
  src,
  alt,
  ...props
}: AvatarProps) {
  const wrapperClasses = [
    'flex items-center justify-center overflow-hidden rounded-full border-[3px] border-hp-accent',
    'bg-hp-surface2 shadow-glow-soft',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapperClasses} style={{ width: size, height: size }}>
      {src ? (
        <img src={src} alt={alt ?? 'Avatar'} className="h-full w-full object-cover" {...props} />
      ) : (
        <span className="text-hp-accent text-xs font-semibold">{initials}</span>
      )}
    </div>
  )
}
import type { ImgHTMLAttributes } from 'react'

export type AvatarProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'size'> & {
  size?: number
  initials?: string
  className?: string
}

export default function Avatar({
  size = 48,
  initials = 'AJ',
  className,
  src,
  alt,
  ...props
}: AvatarProps) {
  const wrapperClasses = [
    'flex items-center justify-center overflow-hidden rounded-full border-[3px] border-hp-accent',
    'bg-hp-surface2 shadow-glow-soft',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapperClasses} style={{ width: size, height: size }}>
      {src ? (
        <img src={src} alt={alt ?? 'Avatar'} className="h-full w-full object-cover" {...props} />
      ) : (
        <span className="text-hp-accent text-xs font-semibold">{initials}</span>
      )}
    </div>
  )
}
