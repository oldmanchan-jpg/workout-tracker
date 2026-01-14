import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Activity, Target, Calendar, ArrowUp, ArrowDown, Dumbbell, Award } from 'lucide-react'
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <TopBar />
        <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Skeleton Loader */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl animate-pulse">
            <div className="h-12 w-64 bg-gray-200 rounded-lg mx-auto mb-3" />
            <div className="h-6 w-96 bg-gray-200 rounded-lg mx-auto" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-2xl animate-pulse">
                <div className="h-10 w-20 bg-gray-200 rounded mx-auto mb-2" />
                <div className="h-4 w-24 bg-gray-200 rounded mx-auto" />
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-2xl animate-pulse">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <TopBar />
        <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-12 text-center shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Activity className="w-12 h-12 text-red-600" />
            </motion.div>
            <div className="text-red-600 text-2xl font-bold mb-4">{error}</div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadWorkouts}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-orange-500/30"
            >
              Try Again
            </motion.button>
          </motion.div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <TopBar />

      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header - WHITE CARD */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-6 sm:p-8 text-center shadow-2xl border-2 border-orange-100"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <TrendingUp className="w-10 h-10 text-orange-500" />
            </motion.div>
            <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              Your Progress
            </span>
          </h1>
          <p className="text-gray-700 text-base sm:text-lg font-medium">
            Track your gains and celebrate your victories! 🎉
          </p>
        </motion.div>

        {/* Stats Grid - WHITE CARDS */}
        {stats && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Activity, value: stats.totalWorkouts, label: 'Workouts', delay: 0, color: 'orange' },
              { icon: Target, value: stats.totalReps, label: 'Total Reps', delay: 0.1, color: 'blue' },
              { icon: TrendingUp, value: stats.totalVolume, label: 'Volume (kg)', delay: 0.2, decimals: 0, color: 'green' },
              { icon: Calendar, value: stats.avgVolume, label: 'Avg Volume', delay: 0.3, decimals: 0, color: 'purple' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: stat.delay, duration: 0.5, type: "spring" }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-gray-200 hover:border-orange-400 transition-all duration-300 text-center shadow-xl hover:shadow-2xl cursor-default"
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  stat.color === 'orange' ? 'bg-orange-100' :
                  stat.color === 'blue' ? 'bg-blue-100' :
                  stat.color === 'green' ? 'bg-green-100' :
                  'bg-purple-100'
                }`}>
                  <stat.icon className={`w-6 h-6 ${
                    stat.color === 'orange' ? 'text-orange-600' :
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    'text-purple-600'
                  }`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  <CountUp 
                    end={stat.value} 
                    duration={2} 
                    decimals={stat.decimals || 0}
                    separator=","
                  />
                </div>
                <div className="text-gray-600 text-sm font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Volume Trend Chart - WHITE CARD */}
        {chartData.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border-2 border-gray-200"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              Volume Trend
            </h3>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '2px solid #f97316',
                      borderRadius: '12px',
                      color: '#111827',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#f97316" 
                    strokeWidth={4}
                    dot={{ fill: '#f97316', r: 6, strokeWidth: 3, stroke: '#ffffff' }}
                    activeDot={{ r: 8, stroke: '#f97316', strokeWidth: 4 }}
                    animationDuration={1500}
                    animationBegin={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>
        )}

        {/* Week Comparison - WHITE CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border-2 border-gray-200"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            Weekly Progress
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Workout Count Comparison */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={{ scale: 1.03 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200"
            >
              <div className="text-blue-700 text-sm font-bold mb-2 uppercase">Workouts This Week</div>
              <div className="flex items-baseline gap-3 mb-3">
                <div className="text-4xl font-bold text-blue-900">
                  <CountUp end={weekComparison.thisWeek.count} duration={2} />
                </div>
                <div className="text-sm text-blue-600 font-semibold">
                  vs {weekComparison.lastWeek.count} last week
                </div>
              </div>
              {weekComparison.workoutCountChange !== 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                  className={`flex items-center gap-2 text-base font-bold ${
                    weekComparison.workoutCountChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  <motion.div
                    animate={{ y: weekComparison.workoutCountChange > 0 ? [-2, 0, -2] : [2, 0, 2] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {weekComparison.workoutCountChange > 0 ? (
                      <ArrowUp className="w-5 h-5" />
                    ) : (
                      <ArrowDown className="w-5 h-5" />
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
              whileHover={{ scale: 1.03 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-200"
            >
              <div className="text-purple-700 text-sm font-bold mb-2 uppercase">Volume This Week</div>
              <div className="flex items-baseline gap-3 mb-3">
                <div className="text-4xl font-bold text-purple-900">
                  <CountUp end={weekComparison.thisWeek.volume} duration={2} decimals={0} />
                </div>
                <div className="text-sm text-purple-600 font-semibold">kg</div>
              </div>
              {weekComparison.volumeChange !== 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3, duration: 0.4 }}
                  className={`flex items-center gap-2 text-base font-bold ${
                    weekComparison.volumeChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  <motion.div
                    animate={{ y: weekComparison.volumeChange > 0 ? [-2, 0, -2] : [2, 0, 2] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {weekComparison.volumeChange > 0 ? (
                      <ArrowUp className="w-5 h-5" />
                    ) : (
                      <ArrowDown className="w-5 h-5" />
                    )}
                  </motion.div>
                  {Math.abs(weekComparison.volumeChange).toFixed(1)}%
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Workout History - WHITE CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border-2 border-gray-200"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            Recent Workouts
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
                <Dumbbell className="w-24 h-24 text-gray-300 mx-auto" />
              </motion.div>
              <p className="text-gray-600 mb-2 text-xl font-bold">No workouts yet!</p>
              <p className="text-gray-500 mb-6 text-base">Start your first workout to see your progress here.</p>
              <Link to="/">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(249, 115, 22, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all text-lg"
                >
                  Start First Workout
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
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:border-orange-400 transition-all duration-300 hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <motion.div 
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0"
                    >
                      <Award className="w-6 h-6 text-orange-600" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-base">{workout.template_name}</div>
                      <div className="text-sm text-gray-600 font-semibold">{formatDate(workout.workout_date)}</div>
                      {workout.notes && (
                        <div className="text-sm text-gray-500 mt-1 italic border-l-2 border-orange-400 pl-2 break-words">
                          "{workout.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-left sm:text-right pl-16 sm:pl-0">
                    <div className="text-sm text-gray-600 font-semibold">
                      {workout.exercises?.length || 0} exercises
                    </div>
                    <div className="text-xs text-gray-500 font-semibold">
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
