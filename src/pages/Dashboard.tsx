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

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-hp-bg flex justify-center">
      <div className="w-canvas min-h-screen relative px-6 pt-8 pb-28 text-hp-text">
        {import.meta.env.DEV && <PixelOverlay src="/figma/Home.png" />}

        <div className="relative z-10 space-y-6">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar size={48} initials="AJ" />
              <div className="leading-tight">
                <p className="text-hp-text2 text-xs">Welcome Back!</p>
                <p className="text-hp-text text-base font-semibold">Allen Jhon</p>
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
            <p className="text-[28px] font-semibold leading-tight">Always keep</p>
            <p className="text-[28px] font-semibold leading-tight">yourself safe and</p>
            <p className="text-[28px] font-semibold leading-tight text-hp-accent">Healthy</p>
          </section>

          <Card className="p-4">
            <div className="grid grid-cols-3 gap-3">
              <StatTile label="Weight" value="62 Kg" />
              <StatTile label="Height" value="5.6 ft" />
              <StatTile label="Age" value="26" />
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-hp-text2 text-sm">Heart AVG bpm</p>
            <p className="text-hp-accent text-2xl font-semibold">76</p>
          </div>

          <Card className="p-4">
            <p className="text-sm font-semibold">Heart&apos;s bpm</p>
            <svg viewBox="0 0 300 120" className="mt-3 h-28 w-full">
              <polyline
                points="0,92 30,70 60,82 90,50 120,64 150,40 180,60 210,52 240,72 270,62 300,80"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-hp-accent"
              />
              <circle cx="150" cy="40" r="4" className="text-hp-accent" fill="currentColor" />
            </svg>
            <div className="mt-3 flex justify-between text-xs text-hp-text2">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>
          </Card>

          <p className="text-hp-text text-sm font-semibold">Health Stats</p>

          <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl border border-hp-border bg-hp-surface2 flex items-center justify-center text-hp-accent">
                <HeartIcon />
              </div>
              <div>
                <p className="text-sm font-semibold">Heart Health</p>
                <p className="text-hp-accent text-xl font-semibold">55</p>
              </div>
            </div>
            <Pill tone="accent">Measure</Pill>
          </Card>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full flex justify-center">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
