type IconProps = {
  className?: string
}

const iconClassName = 'h-5 w-5'

function HomeIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? iconClassName}
      aria-hidden="true"
    >
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  )
}

function ActivityIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? iconClassName}
      aria-hidden="true"
    >
      <path d="M4 12h4l2.5-6 3.5 12 2.5-6H20" />
    </svg>
  )
}

function ChartIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? iconClassName}
      aria-hidden="true"
    >
      <path d="M4 20V6" />
      <path d="M10 20V10" />
      <path d="M16 20V4" />
      <path d="M22 20H2" />
    </svg>
  )
}

function UserIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? iconClassName}
      aria-hidden="true"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  )
}

export type BottomNavProps = {
  className?: string
  active?: 'home' | 'activity' | 'stats' | 'profile'
}

export default function BottomNav({ className, active = 'home' }: BottomNavProps) {
  const classes = [
    // NOTE: removed bg-hp-surface/90 (fails); use solid surface + blur + shadow
    'w-full h-[72px] rounded-pill border border-white/5 bg-hp-surface backdrop-blur-md',
    'px-8 flex items-center justify-between',
    'shadow-[0_16px_30px_rgba(0,0,0,0.35)]',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const inactiveBtn = 'text-white/30 hover:text-white/60 transition-colors'
  const activeBtn = 'flex flex-col items-center gap-1 text-hp-accent'

  return (
    <nav className={classes} aria-label="Bottom navigation">
      <button type="button" aria-label="Home" className={active === 'home' ? activeBtn : inactiveBtn}>
        <HomeIcon />
        {active === 'home' && <span className="h-1 w-6 rounded-full bg-hp-accent" />}
      </button>

      <button
        type="button"
        aria-label="Activity"
        className={active === 'activity' ? activeBtn : inactiveBtn}
      >
        <ActivityIcon />
        {active === 'activity' && <span className="h-1 w-6 rounded-full bg-hp-accent" />}
      </button>

      <button type="button" aria-label="Stats" className={active === 'stats' ? activeBtn : inactiveBtn}>
        <ChartIcon />
        {active === 'stats' && <span className="h-1 w-6 rounded-full bg-hp-accent" />}
      </button>

      <button
        type="button"
        aria-label="Profile"
        className={active === 'profile' ? activeBtn : inactiveBtn}
      >
        <UserIcon />
        {active === 'profile' && <span className="h-1 w-6 rounded-full bg-hp-accent" />}
      </button>
    </nav>
  )
}
