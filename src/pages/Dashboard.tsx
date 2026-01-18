import { useNavigate } from 'react-router-dom'
import { Play, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import TopBar from '@/components/TopBar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function Dashboard() {
  const navigate = useNavigate()

  const onGoToWorkout = () => {
    navigate('/workout')
  }

  return (
    <div className="min-h-screen page-container" style={{ backgroundColor: 'var(--bg)' }}>
      <TopBar />
      
      <main className="mx-auto w-full max-w-[420px] px-4 pt-4 space-y-4">
        {/* Welcome Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="section-gap"
        >
          <Card variant="prominent" className="p-6">
            <p className="text-hp-muted text-sm uppercase tracking-wide mb-2">Welcome back</p>
            <h1 className="text-hp-primary text-2xl font-semibold">
              Ready to <span className="text-hp-accent">Train</span>?
            </h1>
            <p className="text-hp-muted text-sm mt-2">
              Select a workout and crush your goals
            </p>
          </Card>
        </motion.div>

        {/* This Week Summary Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="section-gap"
        >
          <Card className="p-5">
            <p className="text-hp-muted text-xs uppercase tracking-wide mb-4">This Week</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-hp-muted text-xs mb-1">Workouts</p>
                <p className="text-hp-primary text-xl font-semibold">3</p>
              </div>
              <div>
                <p className="text-hp-muted text-xs mb-1">Volume</p>
                <p className="text-hp-accent text-xl font-semibold">12,450 kg</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Primary CTA - Go to Workout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="section-gap"
        >
          <Button
            onClick={onGoToWorkout}
            className="w-full h-14 text-lg rounded-full flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6" fill="currentColor" />
            Go to Workout
          </Button>
        </motion.div>

        {/* Bottom Tip Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="section-gap"
        >
          <Card variant="flat" className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#29e33c]/20 flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-hp-accent" />
            </div>
            <div>
              <p className="text-hp-primary font-medium text-sm mb-1">Track Your RPE</p>
              <p className="text-hp-muted text-xs">
                Rate of Perceived Exertion helps monitor your training intensity and prevent overtraining.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* End Spacer */}
        <div aria-hidden="true" className="h-10" />
      </main>
    </div>
  )
}
