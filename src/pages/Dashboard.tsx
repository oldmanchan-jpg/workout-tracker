import PixelOverlay from '@/components/dev/PixelOverlay'
import { Avatar, BottomNav, Card, IconButton, Pill, StatTile } from '@/components/ui'

type IconProps = {
  className?: string
}

const iconClassName = 'h-4 w-4'

function SearchIcon({ className }: IconProps) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}

function BellIcon({ className }: IconProps) {
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
      <path d="M6 9a6 6 0 1 1 12 0c0 4 2 5 2 5H4s2-1 2-5" />
      <path d="M9.5 19a2.5 2.5 0 0 0 5 0" />
    </svg>
  )
}

function HeartIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'h-5 w-5'}
      aria-hidden="true"
    >
      <path d="M12 20s-6-4.2-8-7.4C2.6 10 3.5 6.6 6.6 5.5c2.2-.8 4.4.1 5.4 2 1-1.9 3.2-2.8 5.4-2 3.1 1.1 4 4.5 2.6 7.1C18 15.8 12 20 12 20z" />
    </svg>
  )
}

function ScaleIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'h-5 w-5'}
      aria-hidden="true"
    >
      <path d="M5 19h14l-1.5-12.5a2 2 0 0 0-2-1.5H8.5a2 2 0 0 0-2 1.5L5 19z" />
      <path d="M12 9.5v3.5" />
      <path d="M9.5 9.5a2.5 2.5 0 0 1 5 0" />
    </svg>
  )
}

function HeightIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'h-5 w-5'}
      aria-hidden="true"
    >
      <path d="M6 4v16" />
      <path d="M10 7h6" />
      <path d="M10 11h6" />
      <path d="M10 15h6" />
      <path d="M10 19h6" />
    </svg>
  )
}

function AgeIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'h-5 w-5'}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function TrendIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? iconClassName}
      aria-hidden="true"
    >
      <path d="M4 16l6-6 4 4 6-6" />
      <path d="M16 8h4v4" />
    </svg>
  )
}

function ShareIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? iconClassName}
      aria-hidden="true"
    >
      <circle cx="6" cy="12" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M8 12l8-5" />
      <path d="M8 12l8 5" />
    </svg>
  )
}

export default function Dashboard() {
  return (
    <div className="min-h-screen flex justify-center bg-[radial-gradient(80%_60%_at_20%_0%,rgba(41,227,60,0.20),transparent_55%),linear-gradient(#010101,#010101)]">
      <div className="w-canvas min-h-screen relative px-6 pt-10 pb-28 text-white/90 text-left">
        {import.meta.env.DEV && <PixelOverlay src="/figma/Home.png" />}

        <div className="relative z-10 space-y-6">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar size={52} initials="AJ" />
              <div className="leading-tight">
                <p className="text-white/70 text-xs">Welcome Back!</p>
                <p className="text-white/90 text-base font-semibold">Allen Jhon</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <IconButton aria-label="Search">
                <SearchIcon />
              </IconButton>
              <IconButton aria-label="Notifications">
                <BellIcon />
              </IconButton>
            </div>
          </header>

          <section className="space-y-1">
            <p className="text-[38px] font-semibold leading-[1.05] tracking-tight">Always keep</p>
            <p className="text-[38px] font-semibold leading-[1.05] tracking-tight">
              yourself safe and
            </p>
            <p className="text-[38px] font-semibold leading-[1.05] tracking-tight text-[#29e33c]">
              Healthy
            </p>
          </section>

          <Card className="p-5">
            <div className="grid grid-cols-3 gap-4">
              <StatTile label="Weight" value="62 Kg" icon={<ScaleIcon />} />
              <StatTile label="Height" value="5.6 ft" icon={<HeightIcon />} />
              <StatTile label="Age" value="26" icon={<AgeIcon />} />
            </div>
          </Card>

          <div className="flex items-baseline gap-2">
            <p className="text-white/70 text-sm">Heart AVG bpm</p>
            <p className="text-hp-accent text-2xl font-semibold">76</p>
          </div>

          <Card className="relative p-5">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold">Heart&apos;s bpm</p>
              <div className="flex items-center gap-3 text-white/40">
                <TrendIcon />
                <ShareIcon />
              </div>
            </div>
            <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-black/35 px-3 py-1 text-xs text-white/90">
              89
            </div>
            <svg viewBox="0 0 320 140" className="mt-6 h-32 w-full">
              <line x1="0" y1="22" x2="320" y2="22" stroke="rgba(255,255,255,0.1)" />
              <line x1="0" y1="70" x2="320" y2="70" stroke="rgba(255,255,255,0.1)" />
              <line x1="0" y1="118" x2="320" y2="118" stroke="rgba(255,255,255,0.1)" />
              <line
                x1="170"
                y1="0"
                x2="170"
                y2="140"
                stroke="rgba(255,255,255,0.25)"
                strokeDasharray="4 6"
              />
              <path
                d="M0 100 C40 78 80 120 120 90 C160 55 200 18 240 58 C270 85 300 70 320 88"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-hp-accent"
              />
            </svg>
            <div className="mt-2 flex justify-between text-xs text-white/50">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>
          </Card>

          <p className="text-white/90 text-sm font-semibold">Health Stats</p>

          <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-[52px] w-[52px] rounded-2xl border border-white/10 bg-black/25 flex items-center justify-center text-[#ff4d4f]">
                <HeartIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-white/50 text-sm">Heart Health</p>
                <p className="text-white/90 text-xl font-semibold">55</p>
              </div>
            </div>
            <Pill tone="accent" className="px-5 py-2 text-sm font-medium">
              Measure
            </Pill>
          </Card>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
