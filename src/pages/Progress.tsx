import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Activity, Target, Calendar, ArrowUp, ArrowDown, Dumbbell } from 'lucide-react'
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
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
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
      thisWeek: {
        count: thisWeekCount,
        volume: thisWeekVolume
      },
      lastWeek: {
        count: lastWeekCount,
        volume: lastWeekVolume
      },
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
      <div className="min-h-screen bg-dark">
        <TopBar />
        <main className="max-w-7xl mx-auto p-4 space-y-6">
          {/* Skeleton Loader */}
          <div className="text-center animate-fade-in">
            <div className="h-10 w-64 bg-gray-800 rounded-lg mx-auto mb-2 animate-pulse" />
            <div className="h-6 w-96 bg-gray-800 rounded-lg mx-auto animate-pulse" />
          </div>
          
          {/* Skeleton Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-4 border border-gray-700 animate-pulse">
                <div className="h-8 w-16 bg-gray-700 rounded mx-auto mb-2" />
                <div className="h-4 w-24 bg-gray-700 rounded mx-auto" />
              </div>
            ))}
          </div>

          {/* Skeleton Chart */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse">
            <div className="h-6 w-48 bg-gray-700 rounded mb-4" />
            <div className="h-64 bg-gray-700 rounded" />
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark">
        <TopBar />
        <main className="max-w-7xl mx-auto p-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Activity className="w-10 h-10 text-red-500" />
            </motion.div>
            <div className="text-red-400 text-xl mb-4">{error}</div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadWorkouts}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors shadow-lg shadow-orange-500/30"
            >
              Retry
            </motion.button>
          </motion.div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark">
      <TopBar />

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </motion.div>
            Your Progress
          </h1>
          <p className="text-gray-300 text-lg">Track your workout performance and improvements</p>
        </motion.div>

        {/* Compact Stats Grid (2x2) */}
        {stats && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Activity, value: stats.totalWorkouts, label: 'Total Workouts', delay: 0 },
              { icon: Target, value: stats.totalReps, label: 'Total Reps', delay: 0.1 },
              { icon: TrendingUp, value: stats.totalVolume, label: 'Volume (kg)', delay: 0.2, decimals: 0 },
              { icon: Calendar, value: stats.avgVolume, label: 'Avg. Volume', delay: 0.3, decimals: 0 }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: stat.delay, duration: 0.5, type: "spring" }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-700 hover:border-orange-500/50 transition-all duration-300 text-center shadow-lg hover:shadow-orange-500/20 cursor-default"
              >
                <div className="text-2xl font-bold text-orange-500 mb-1 flex items-center justify-center gap-2">
                  <stat.icon className="w-5 h-5" />
                  <CountUp 
                    end={stat.value} 
                    duration={2} 
                    decimals={stat.decimals || 0}
                    separator=","
                  />
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Volume Trend Chart */}
        {chartData.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700 shadow-xl"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Volume Trend (Last 10 Workouts)
            </h3>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #F97316',
                      borderRadius: '8px',
                      color: '#fff',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#F97316" 
                    strokeWidth={3}
                    dot={{ fill: '#F97316', r: 5, strokeWidth: 2, stroke: '#1F2937' }}
                    activeDot={{ r: 7, stroke: '#F97316', strokeWidth: 3 }}
                    animationDuration={1500}
                    animationBegin={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>
        )}

        {/* This Week vs Last Week */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 sm:p-6 border border-gray-700 shadow-xl"
        >
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            This Week vs Last Week
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Workout Count Comparison */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
            >
              <div className="text-gray-400 text-sm mb-2">Workouts Completed</div>
              <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                <div className="text-2xl font-bold text-white">
                  <CountUp end={weekComparison.thisWeek.count} duration={2} />
                </div>
                <div className="text-sm text-gray-400">
                  vs {weekComparison.lastWeek.count} last week
                </div>
              </div>
              {weekComparison.workoutCountChange !== 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                  className={`flex items-center gap-1 mt-2 text-sm font-semibold ${
                    weekComparison.workoutCountChange > 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  <motion.div
                    animate={{ y: weekComparison.workoutCountChange > 0 ? [-2, 0, -2] : [2, 0, 2] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {weekComparison.workoutCountChange > 0 ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                  </motion.div>
                  {Math.abs(weekComparison.workoutCountChange).toFixed(1)}%
                </motion.div>
              )}
            </motion.div>

            {/* Volume Comparison */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
            >
              <div className="text-gray-400 text-sm mb-2">Total Volume</div>
              <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                <div className="text-2xl font-bold text-white">
                  <CountUp end={weekComparison.thisWeek.volume} duration={2} decimals={0} /> kg
                </div>
                <div className="text-sm text-gray-400">
                  vs {weekComparison.lastWeek.volume.toFixed(0)} kg last week
                </div>
              </div>
              {weekComparison.volumeChange !== 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3, duration: 0.4 }}
                  className={`flex items-center gap-1 mt-2 text-sm font-semibold ${
                    weekComparison.volumeChange > 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  <motion.div
                    animate={{ y: weekComparison.volumeChange > 0 ? [-2, 0, -2] : [2, 0, 2] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {weekComparison.volumeChange > 0 ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                  </motion.div>
                  {Math.abs(weekComparison.volumeChange).toFixed(1)}%
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Workout History */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 sm:p-6 border border-gray-700 shadow-xl"
        >
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-500" />
            Workout History
          </h3>
          
          {workouts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="mb-6"
              >
                <Dumbbell className="w-20 h-20 text-gray-600 mx-auto" />
              </motion.div>
              <p className="text-gray-400 mb-2 text-lg font-medium">No workouts yet!</p>
              <p className="text-gray-500 mb-6">Start your first workout to track your progress.</p>
              <Link to="/">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(249, 115, 22, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg shadow-orange-500/30 transition-all"
                >
                  Start Your First Workout
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {workouts.map((workout, index) => (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + (index * 0.1), duration: 0.4 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <motion.div 
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0"
                    >
                      <Activity className="w-4 h-4 text-orange-500" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white">{workout.template_name}</div>
                      <div className="text-sm text-gray-400">{formatDate(workout.workout_date)}</div>
                      {workout.notes && (
                        <div className="text-sm text-gray-400 mt-1 italic border-l-2 border-orange-500/50 pl-2 break-words">
                          "{workout.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-left sm:text-right pl-11 sm:pl-0">
                    <div className="text-sm text-gray-400">
                      {workout.exercises?.length || 0} exercises
                    </div>
                    <div className="text-xs text-gray-500">
                      {workout.total_reps} reps · {workout.total_volume?.toFixed(0)} kg
                    </div>
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
