import {
  Bell,
  CalendarDays,
  HeartPulse,
  Ruler,
  Scale,
  Search,
} from 'lucide-react'
import PixelOverlay from '@/components/dev/PixelOverlay'
import { Avatar, BottomNav, Card, IconButton, Pill, StatTile } from '@/components/ui'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-hp-bg flex justify-center">
      <div className="relative w-canvas min-h-screen px-6 pt-8 pb-28 text-hp-text">
        {import.meta.env.DEV && <PixelOverlay src="/figma/Home.png" />}

        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar size={48} />
            <div>
              <p className="text-hp-text2 text-xs">Welcome back</p>
              <p className="text-hp-text text-sm font-semibold">Alicia</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <IconButton aria-label="Search">
              <Search className="h-5 w-5" />
            </IconButton>
            <IconButton aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </IconButton>
          </div>
        </header>

        <section className="mt-6">
          <h1 className="text-3xl font-semibold leading-tight">
            Track your <span className="text-hp-accent">Healthy</span>
            <br />
            lifestyle
          </h1>
        </section>

        <Card className="mt-6 p-4">
          <div className="grid grid-cols-3 gap-3">
            <StatTile icon={<Scale className="h-4 w-4" />} value="74 kg" label="Weight" />
            <StatTile icon={<Ruler className="h-4 w-4" />} value="172 cm" label="Height" />
            <StatTile icon={<CalendarDays className="h-4 w-4" />} value="29 yr" label="Age" />
          </div>
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-hp-text2 text-sm">Heart AVG bpm</p>
          <p className="text-hp-accent text-2xl font-semibold">76</p>
        </div>

        <Card className="mt-3 p-4">
          <svg viewBox="0 0 300 120" className="h-28 w-full">
            <polyline
              points="0,92 30,78 60,84 90,58 120,64 150,46 180,60 210,52 240,72 270,64 300,80"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-hp-accent"
            />
            <circle cx="150" cy="46" r="4" className="text-hp-accent" fill="currentColor" />
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

        <p className="mt-6 text-hp-text2 text-sm font-medium">Health Stats</p>

        <Card className="mt-3 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl border border-hp-border bg-hp-surface2 flex items-center justify-center text-hp-accent">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <p className="text-hp-text text-sm font-semibold">Heart Health</p>
              <p className="text-hp-accent text-xl font-semibold">55</p>
            </div>
          </div>
          <Pill tone="accent">Measure</Pill>
        </Card>

        <div className="absolute bottom-6 left-6 right-6">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
