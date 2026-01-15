import { Activity, BarChart2, Home, User } from 'lucide-react'

export default function BottomNav() {
  return (
    <div className="h-16 w-full rounded-pill bg-hp-surface border border-hp-border flex items-center justify-around px-6">
      <button type="button" className="flex flex-col items-center gap-1 text-hp-accent">
        <Home className="h-5 w-5" />
        <span className="h-1 w-6 rounded-full bg-hp-accent" />
      </button>
      <button type="button" className="text-hp-text2">
        <Activity className="h-5 w-5" />
      </button>
      <button type="button" className="text-hp-text2">
        <BarChart2 className="h-5 w-5" />
      </button>
      <button type="button" className="text-hp-text2">
        <User className="h-5 w-5" />
      </button>
    </div>
  )
}
