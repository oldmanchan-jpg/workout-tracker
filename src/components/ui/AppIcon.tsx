import { LucideIcon } from 'lucide-react'

interface AppIconProps {
  icon: LucideIcon
  className?: string
  size?: number
  strokeWidth?: number
}

/**
 * Standardized icon component for consistent sizing and styling across TopBar and BottomNav.
 * Defaults: size=20, strokeWidth=2
 */
export function AppIcon({ 
  icon: Icon, 
  className, 
  size = 20, 
  strokeWidth = 2 
}: AppIconProps) {
  const classes = ['shrink-0', 'inline-flex', className].filter(Boolean).join(' ')
  
  return (
    <Icon 
      size={size}
      strokeWidth={strokeWidth}
      className={classes}
    />
  )
}
