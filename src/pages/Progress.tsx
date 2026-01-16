import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Activity, Calendar, ArrowUp, ArrowDown, Dumbbell, Flame, Clock } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import TopBar from '@/components/TopBar'
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
      <div className="min-h-screen bg-black">
        <TopBar />
        <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
          {/* Skeleton */}
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 bg-[#141416] rounded-lg" />
            <div className="h-[200px] bg-[#141416] rounded-[21px] border border-white/5" />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-[#141416] rounded-[16px] border border-white/5" />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <TopBar />
        <main className="max-w-lg mx-auto px-4 py-6">
          <div className="bg-[#141416] rounded-[21px] p-8 text-center border border-white/5">
            <Activity className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loadWorkouts}
              className="px-6 py-3 bg-[#29e33c] text-black font-bold rounded-[12px]"
              style={{ boxShadow: '0 0 20px rgba(41, 227, 60, 0.3)' }}
            >
              Retry
            </motion.button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <TopBar />

      <main className="max-w-lg mx-auto px-4 pb-24 space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4"
        >
          <p className="text-[#9a9fa4] text-sm font-medium">Today</p>
          <h1 className="text-white text-2xl font-semibold">
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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                timeRange === range 
                  ? 'bg-[#29e33c] text-black' 
                  : 'bg-[#1c1c1f] text-[#9a9fa4] hover:text-white border border-white/5'
              }`}
              style={timeRange === range ? { boxShadow: '0 0 15px rgba(41, 227, 60, 0.3)' } : {}}
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
          className="bg-[#141416] rounded-[21px] overflow-hidden border border-white/5"
        >
          {/* Chart Area with Gradient */}
          <div className="relative h-[200px] p-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#29e33c" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#29e33c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9a9fa4', fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1c1c1f', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                    }}
                    formatter={(value: number) => [`${value.toFixed(0)} kg`, 'Volume']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#29e33c" 
                    strokeWidth={3}
                    fill="url(#volumeGradient)"
                    dot={{ fill: '#29e33c', r: 4, strokeWidth: 2, stroke: '#141416' }}
                    activeDot={{ r: 6, stroke: '#29e33c', strokeWidth: 3, filter: 'drop-shadow(0 0 6px rgba(41, 227, 60, 0.6))' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-[#9a9fa4]">No data yet</p>
              </div>
            )}

            {/* Floating Stats */}
            {stats && stats.totalWorkouts > 0 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <motion.p 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-5xl font-bold text-white"
                  style={{ textShadow: '0 0 30px rgba(0,0,0,0.8)' }}
                >
                  <CountUp end={stats.totalVolume} duration={2} separator="," decimals={0} />
                </motion.p>
                <p className="text-[#9a9fa4] text-sm mt-1">Total Volume (kg)</p>
                {weekComparison.volumeChange !== 0 && (
                  <div 
                    className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                      weekComparison.volumeChange > 0 
                        ? 'bg-[#29e33c]/20 text-[#29e33c]' 
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {weekComparison.volumeChange > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(weekComparison.volumeChange).toFixed(0)}%
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 px-4 pb-4 border-t border-white/5 pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                <CountUp end={stats?.totalWorkouts || 0} duration={1.5} />
              </p>
              <p className="text-[#9a9fa4] text-xs mt-1">Workouts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                <CountUp end={stats?.totalReps || 0} duration={1.5} separator="," />
              </p>
              <p className="text-[#9a9fa4] text-xs mt-1">Total Reps</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                <CountUp end={stats?.avgVolume || 0} duration={1.5} separator="," decimals={0} />
              </p>
              <p className="text-[#9a9fa4] text-xs mt-1">Avg/Session</p>
            </div>
          </div>
        </motion.div>

        {/* This Week Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#141416] rounded-[21px] p-4 border border-white/5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div 
              className="w-8 h-8 rounded-full bg-[#29e33c]/20 flex items-center justify-center"
            >
              <Calendar className="w-4 h-4 text-[#29e33c]" />
            </div>
            <h3 className="text-white font-semibold">This Week</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1c1c1f] rounded-[12px] p-4 border border-white/5">
              <p className="text-[#9a9fa4] text-xs mb-1">Workouts</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">
                  {weekComparison.thisWeek.count}
                </span>
                {weekComparison.workoutCountChange !== 0 && (
                  <span className={`text-sm font-medium flex items-center gap-1 ${
                    weekComparison.workoutCountChange > 0 ? 'text-[#29e33c]' : 'text-red-400'
                  }`}>
                    {weekComparison.workoutCountChange > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(weekComparison.workoutCountChange).toFixed(0)}%
                  </span>
                )}
              </div>
              <p className="text-[#9a9fa4] text-xs mt-1">vs {weekComparison.lastWeek.count} last week</p>
            </div>

            <div className="bg-[#1c1c1f] rounded-[12px] p-4 border border-white/5">
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
        </motion.div>

        {/* Recent Workouts */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Recent Workouts</h3>
            <span className="text-[#9a9fa4] text-sm">{workouts.length} total</span>
          </div>
          
          {workouts.length === 0 ? (
            <div className="bg-[#141416] rounded-[21px] p-8 text-center border border-white/5">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Dumbbell className="w-16 h-16 text-[#9a9fa4] mx-auto mb-4" />
              </motion.div>
              <p className="text-white font-medium mb-2">No workouts yet!</p>
              <p className="text-[#9a9fa4] text-sm mb-4">Start your first workout to track progress</p>
              <Link to="/">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-[#29e33c] text-black font-bold rounded-[12px]"
                  style={{ boxShadow: '0 0 20px rgba(41, 227, 60, 0.3)' }}
                >
                  Start First Workout
                </motion.button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {workouts.slice(0, 5).map((workout, index) => (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (index * 0.1) }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-[#141416] rounded-[16px] p-4 flex items-center gap-4 hover:bg-[#1c1c1f] transition-all cursor-pointer border border-white/5"
                >
                  <div 
                    className="w-12 h-12 rounded-full bg-[#29e33c]/20 flex items-center justify-center flex-shrink-0"
                  >
                    <Activity className="w-6 h-6 text-[#29e33c]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{workout.template_name}</p>
                    <p className="text-[#9a9fa4] text-sm">{formatDate(workout.workout_date)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[#29e33c] font-semibold">{workout.total_volume?.toFixed(0)} kg</p>
                    <p className="text-[#9a9fa4] text-xs">{workout.total_reps} reps</p>
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
