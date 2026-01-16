import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Activity, Calendar, ArrowUp, ArrowDown, Dumbbell, Flame, Clock } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import TopBar from '@/components/TopBar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { getAllWorkouts, calculateWorkoutStats, type SavedWorkout } from '../services/workoutService'

export default function Progress() {
  const [workouts, setWorkouts] = useState<SavedWorkout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')

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
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <TopBar />
        <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
          {/* Skeleton */}
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 rounded-lg" style={{ backgroundColor: 'var(--bg-elevated)' }} />
            <div className="h-[200px] rounded-2xl" style={{ backgroundColor: 'var(--bg-elevated)' }} />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }} />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <TopBar />
        <main className="max-w-lg mx-auto px-4 py-6">
          <Card className="p-8 text-center">
            <Activity className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--accent-danger)' }} />
            <p className="text-lg mb-4" style={{ color: 'var(--accent-danger)' }}>{error}</p>
            <Button onClick={loadWorkouts}>
              Retry
            </Button>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <TopBar />

      <main className="max-w-lg mx-auto px-4 pb-24 space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4"
        >
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Today</p>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h1>
        </motion.div>

        {/* Time Range Tabs */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2"
        >
          {(['week', 'month', 'year'] as const).map((range) => (
            <motion.button
              key={range}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeRange(range)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={timeRange === range 
                ? { 
                    backgroundColor: 'var(--accent)',
                    color: 'var(--bg)',
                    boxShadow: '0 0 15px rgba(41, 227, 60, 0.3)'
                  }
                : { 
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)'
                  }
              }
              onMouseEnter={(e) => {
                if (timeRange !== range) {
                  e.currentTarget.style.color = 'var(--text)'
                }
              }}
              onMouseLeave={(e) => {
                if (timeRange !== range) {
                  e.currentTarget.style.color = 'var(--text-muted)'
                }
              }}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        {/* Main Stats Card - Like Activity Screen */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="elevated" className="overflow-hidden p-0">
          {/* Chart Area with Gradient */}
          <div className="relative h-[200px] p-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-surface)', 
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      color: 'var(--text)',
                      fontSize: '12px',
                      boxShadow: 'var(--shadow-md)'
                    }}
                    formatter={(value: number) => [`${value.toFixed(0)} kg`, 'Volume']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="var(--accent)" 
                    strokeWidth={3}
                    fill="url(#volumeGradient)"
                    dot={{ fill: 'var(--accent)', r: 4, strokeWidth: 2, stroke: 'var(--bg-elevated)' }}
                    activeDot={{ r: 6, stroke: 'var(--accent)', strokeWidth: 3, filter: 'drop-shadow(0 0 6px rgba(41, 227, 60, 0.6))' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p style={{ color: 'var(--text-muted)' }}>No data yet</p>
              </div>
            )}

            {/* Floating Stats */}
            {stats && stats.totalWorkouts > 0 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <motion.p 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-5xl font-bold"
                  style={{ 
                    color: 'var(--text)',
                    textShadow: '0 0 30px rgba(0,0,0,0.8)' 
                  }}
                >
                  <CountUp end={stats.totalVolume} duration={2} separator="," decimals={0} />
                </motion.p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Total Volume (kg)</p>
                {weekComparison.volumeChange !== 0 && (
                  <div 
                    className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: weekComparison.volumeChange > 0 
                        ? 'rgba(41, 227, 60, 0.2)' 
                        : 'rgba(248, 113, 113, 0.2)',
                      color: weekComparison.volumeChange > 0 
                        ? 'var(--accent)' 
                        : 'var(--accent-danger)'
                    }}
                  >
                    {weekComparison.volumeChange > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(weekComparison.volumeChange).toFixed(0)}%
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 px-4 pb-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                <CountUp end={stats?.totalWorkouts || 0} duration={1.5} />
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Workouts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                <CountUp end={stats?.totalReps || 0} duration={1.5} separator="," />
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Total Reps</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                <CountUp end={stats?.avgVolume || 0} duration={1.5} separator="," decimals={0} />
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Avg/Session</p>
            </div>
          </div>
          </Card>
        </motion.div>

        {/* This Week Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(41, 227, 60, 0.2)' }}
            >
              <Calendar className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            </div>
            <h3 className="font-semibold" style={{ color: 'var(--text)' }}>This Week</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Workouts</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                  {weekComparison.thisWeek.count}
                </span>
                {weekComparison.workoutCountChange !== 0 && (
                  <span 
                    className="text-sm font-medium flex items-center gap-1"
                    style={{
                      color: weekComparison.workoutCountChange > 0 
                        ? 'var(--accent)' 
                        : 'var(--accent-danger)'
                    }}
                  >
                    {weekComparison.workoutCountChange > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(weekComparison.workoutCountChange).toFixed(0)}%
                  </span>
                )}
              </div>
              <p className="text-[#9a9fa4] text-xs mt-1">vs {weekComparison.lastWeek.count} last week</p>
            </div>

            <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <p className="text-[#9a9fa4] text-xs mb-1">Volume</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">
                  {(weekComparison.thisWeek.volume / 1000).toFixed(1)}k
                </span>
                {weekComparison.volumeChange !== 0 && (
                  <span className={`text-sm font-medium flex items-center gap-1 ${
                    weekComparison.volumeChange > 0 ? 'text-[#29e33c]' : 'text-red-400'
                  }`}>
                    {weekComparison.volumeChange > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(weekComparison.volumeChange).toFixed(0)}%
                  </span>
                )}
              </div>
              <p className="text-[#9a9fa4] text-xs mt-1">vs last week</p>
            </div>
          </div>
          </Card>
        </motion.div>

        {/* Recent Workouts */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--text)' }}>Recent Workouts</h3>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{workouts.length} total</span>
          </div>
          
          {workouts.length === 0 ? (
            <Card className="p-8 text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Dumbbell className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              </motion.div>
              <p className="font-medium mb-2" style={{ color: 'var(--text)' }}>No workouts yet!</p>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Start your first workout to track progress</p>
              <Link to="/">
                <Button>
                  Start First Workout
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {workouts.slice(0, 5).map((workout, index) => (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (index * 0.1) }}
                  whileHover={{ scale: 1.01 }}
                  className="rounded-xl p-4 flex items-center gap-4 transition-all cursor-pointer"
                  style={{ 
                    backgroundColor: 'var(--bg-elevated)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(41, 227, 60, 0.2)' }}
                  >
                    <Activity className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: 'var(--text)' }}>{workout.template_name}</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{formatDate(workout.workout_date)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold" style={{ color: 'var(--accent)' }}>{workout.total_volume?.toFixed(0)} kg</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{workout.total_reps} reps</p>
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
