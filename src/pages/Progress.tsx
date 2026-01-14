import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Activity, Target, Calendar, ArrowUp, ArrowDown, Dumbbell, Zap } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import TopBar from '@/components/TopBar'
import { getAllWorkouts, calculateWorkoutStats, type SavedWorkout } from '../services/workoutService'

export default function Progress() {
  const [workouts, setWorkouts] = useState<SavedWorkout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadWorkouts()
  }, [])

  const loadWorkouts = async () => {
    setLoading(true)
    setError(null)
    
    const { data, error: fetchError } = await getAllWorkouts()
    
    if (fetchError) {
      setError('Failed to load workouts')
      setLoading(false)
      return
    }

    setWorkouts(data || [])
    setLoading(false)
  }

  const stats = calculateWorkoutStats(workouts)

  // Get start of week (Monday)
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  // Calculate week comparison
  const weekComparison = useMemo(() => {
    const now = new Date()
    const startOfThisWeek = getStartOfWeek(now)
    startOfThisWeek.setHours(0, 0, 0, 0)
    
    const endOfThisWeek = new Date(now)
    endOfThisWeek.setHours(23, 59, 59, 999)
    
    const startOfLastWeek = new Date(startOfThisWeek)
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)
    
    const endOfLastWeek = new Date(startOfThisWeek)
    endOfLastWeek.setDate(endOfLastWeek.getDate() - 1)
    endOfLastWeek.setHours(23, 59, 59, 999)

    const thisWeekWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.workout_date)
      return workoutDate >= startOfThisWeek && workoutDate <= endOfThisWeek
    })

    const lastWeekWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.workout_date)
      return workoutDate >= startOfLastWeek && workoutDate <= endOfLastWeek
    })

    const thisWeekCount = thisWeekWorkouts.length
    const lastWeekCount = lastWeekWorkouts.length
    const thisWeekVolume = thisWeekWorkouts.reduce((sum, w) => sum + (w.total_volume || 0), 0)
    const lastWeekVolume = lastWeekWorkouts.reduce((sum, w) => sum + (w.total_volume || 0), 0)

    const workoutCountChange = lastWeekCount > 0 
      ? ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100 
      : (thisWeekCount > 0 ? 100 : 0)
    
    const volumeChange = lastWeekVolume > 0 
      ? ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100 
      : (thisWeekVolume > 0 ? 100 : 0)

    return {
      thisWeek: { count: thisWeekCount, volume: thisWeekVolume },
      lastWeek: { count: lastWeekCount, volume: lastWeekVolume },
      workoutCountChange,
      volumeChange
    }
  }, [workouts])

  // Prepare chart data (last 10 workouts)
  const chartData = useMemo(() => {
    const recentWorkouts = [...workouts].slice(0, 10).reverse()
    return recentWorkouts.map(workout => {
      const date = new Date(workout.workout_date)
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        volume: workout.total_volume || 0
      }
    })
  }, [workouts])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0a0a0b' }}>
        <TopBar />
        <main className="max-w-lg mx-auto p-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className="rounded-2xl p-6 animate-pulse"
              style={{ backgroundColor: '#141416' }}
            >
              <div className="h-8 rounded-lg mb-2" style={{ backgroundColor: '#1c1c1f', width: '60%' }} />
              <div className="h-4 rounded-lg" style={{ backgroundColor: '#1c1c1f', width: '40%' }} />
            </div>
          ))}
        </main>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0a0a0b' }}>
        <TopBar />
        <main className="max-w-lg mx-auto p-4">
          <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: '#141416', border: '1px solid #27272a' }}>
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)' }}
            >
              <Activity className="w-8 h-8" style={{ color: '#f87171' }} />
            </div>
            <p className="text-lg font-medium mb-4" style={{ color: '#f87171' }}>{error}</p>
            <button 
              onClick={loadWorkouts}
              className="px-6 py-3 rounded-xl font-semibold"
              style={{ 
                background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                color: '#0a0a0b'
              }}
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0b' }}>
      <TopBar />

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-4"
        >
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2" style={{ color: '#fafafa' }}>
            <TrendingUp className="w-6 h-6" style={{ color: '#22d3ee' }} />
            Your Progress
          </h1>
          <p style={{ color: '#52525b' }}>Track your gains over time</p>
        </motion.div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Activity, value: stats.totalWorkouts, label: 'Workouts', color: '#22d3ee' },
              { icon: Target, value: stats.totalReps, label: 'Total Reps', color: '#818cf8' },
              { icon: TrendingUp, value: stats.totalVolume, label: 'Volume', suffix: 'kg', color: '#4ade80' },
              { icon: Zap, value: stats.avgVolume, label: 'Avg/Session', suffix: 'kg', color: '#fbbf24' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="rounded-2xl p-4"
                style={{ backgroundColor: '#141416', border: '1px solid #27272a' }}
              >
                <stat.icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
                <div className="text-2xl font-bold" style={{ color: '#fafafa' }}>
                  <CountUp end={stat.value} duration={2} decimals={0} separator="," />
                  {stat.suffix && <span className="text-base font-normal ml-1" style={{ color: '#52525b' }}>{stat.suffix}</span>}
                </div>
                <p className="text-sm" style={{ color: '#52525b' }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Volume Chart */}
        {chartData.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="rounded-2xl p-4"
            style={{ backgroundColor: '#141416', border: '1px solid #27272a' }}
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#fafafa' }}>
              <TrendingUp className="w-5 h-5" style={{ color: '#22d3ee' }} />
              Volume Trend
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis 
                  dataKey="date" 
                  stroke="#52525b"
                  tick={{ fill: '#52525b', fontSize: 12 }}
                  axisLine={{ stroke: '#27272a' }}
                />
                <YAxis 
                  stroke="#52525b"
                  tick={{ fill: '#52525b', fontSize: 12 }}
                  axisLine={{ stroke: '#27272a' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1c1c1f', 
                    border: '1px solid #3f3f46',
                    borderRadius: '12px',
                    color: '#fafafa'
                  }}
                  labelStyle={{ color: '#a1a1aa' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#22d3ee" 
                  strokeWidth={3}
                  dot={{ fill: '#22d3ee', r: 4, strokeWidth: 2, stroke: '#0a0a0b' }}
                  activeDot={{ r: 6, stroke: '#22d3ee', strokeWidth: 2 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Week Comparison */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="rounded-2xl p-4"
          style={{ backgroundColor: '#141416', border: '1px solid #27272a' }}
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#fafafa' }}>
            <Calendar className="w-5 h-5" style={{ color: '#818cf8' }} />
            This Week
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Workouts */}
            <div className="rounded-xl p-3" style={{ backgroundColor: '#1c1c1f' }}>
              <p className="text-sm mb-1" style={{ color: '#52525b' }}>Workouts</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold" style={{ color: '#fafafa' }}>
                  <CountUp end={weekComparison.thisWeek.count} duration={1} />
                </span>
                {weekComparison.workoutCountChange !== 0 && (
                  <span 
                    className="text-sm font-medium flex items-center gap-0.5"
                    style={{ color: weekComparison.workoutCountChange > 0 ? '#4ade80' : '#f87171' }}
                  >
                    {weekComparison.workoutCountChange > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(weekComparison.workoutCountChange).toFixed(0)}%
                  </span>
                )}
              </div>
              <p className="text-xs" style={{ color: '#3f3f46' }}>vs {weekComparison.lastWeek.count} last week</p>
            </div>

            {/* Volume */}
            <div className="rounded-xl p-3" style={{ backgroundColor: '#1c1c1f' }}>
              <p className="text-sm mb-1" style={{ color: '#52525b' }}>Volume</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold" style={{ color: '#fafafa' }}>
                  <CountUp end={weekComparison.thisWeek.volume} duration={1} decimals={0} />
                </span>
                <span className="text-sm" style={{ color: '#52525b' }}>kg</span>
              </div>
              {weekComparison.volumeChange !== 0 && (
                <p 
                  className="text-xs font-medium flex items-center gap-0.5"
                  style={{ color: weekComparison.volumeChange > 0 ? '#4ade80' : '#f87171' }}
                >
                  {weekComparison.volumeChange > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {Math.abs(weekComparison.volumeChange).toFixed(0)}% vs last week
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Workout History */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: '#141416', border: '1px solid #27272a' }}
        >
          <div className="p-4" style={{ borderBottom: '1px solid #27272a' }}>
            <h3 className="font-semibold flex items-center gap-2" style={{ color: '#fafafa' }}>
              <Activity className="w-5 h-5" style={{ color: '#4ade80' }} />
              Recent Workouts
            </h3>
          </div>
          
          {workouts.length === 0 ? (
            <div className="p-8 text-center">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <Dumbbell className="w-16 h-16 mx-auto" style={{ color: '#27272a' }} />
              </motion.div>
              <p className="font-medium mb-1" style={{ color: '#a1a1aa' }}>No workouts yet</p>
              <p className="text-sm mb-4" style={{ color: '#52525b' }}>Start your first workout to track progress</p>
              <Link to="/">
                <button
                  className="px-6 py-3 rounded-xl font-semibold"
                  style={{ 
                    background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                    color: '#0a0a0b'
                  }}
                >
                  Start Workout
                </button>
              </Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: '#1c1c1f' }}>
              {workouts.slice(0, 5).map((workout, index) => (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + (index * 0.1), duration: 0.3 }}
                  className="p-4 flex items-center gap-3"
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#1c1c1f' }}
                  >
                    <Activity className="w-5 h-5" style={{ color: '#4ade80' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: '#fafafa' }}>
                      {workout.template_name}
                    </p>
                    <p className="text-sm" style={{ color: '#52525b' }}>
                      {formatDate(workout.workout_date)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium" style={{ color: '#22d3ee' }}>
                      {workout.total_volume?.toFixed(0)} kg
                    </p>
                    <p className="text-xs" style={{ color: '#52525b' }}>
                      {workout.total_reps} reps
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
