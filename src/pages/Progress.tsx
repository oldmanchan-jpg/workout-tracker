import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Activity, Target, Calendar, ArrowUp, ArrowDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
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
          <div className="text-center py-12">
            <div className="text-white text-xl">Loading your progress...</div>
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
          <div className="text-center py-12">
            <div className="text-red-400 text-xl mb-4">{error}</div>
            <button 
              onClick={loadWorkouts}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark">
      <TopBar />

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-500" />
            Your Progress
          </h1>
          <p className="text-gray-300 text-lg">Track your workout performance and improvements</p>
        </div>

        {/* Compact Stats Grid (2x2) */}
        {stats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
              <div className="text-2xl font-bold text-orange-500 mb-1 flex items-center justify-center gap-2">
                <Activity className="w-5 h-5" />
                {stats.totalWorkouts}
              </div>
              <div className="text-gray-400 text-sm">Total Workouts</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
              <div className="text-2xl font-bold text-orange-500 mb-1 flex items-center justify-center gap-2">
                <Target className="w-5 h-5" />
                {stats.totalReps}
              </div>
              <div className="text-gray-400 text-sm">Total Reps</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
              <div className="text-2xl font-bold text-orange-500 mb-1 flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {stats.totalVolume.toFixed(0)}
              </div>
              <div className="text-gray-400 text-sm">Volume (kg)</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
              <div className="text-2xl font-bold text-orange-500 mb-1 flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" />
                {stats.avgVolume.toFixed(0)}
              </div>
              <div className="text-gray-400 text-sm">Avg. Volume</div>
            </div>
          </div>
        )}

        {/* Volume Trend Chart */}
        {chartData.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Volume Trend (Last 10 Workouts)</h3>
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
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#F97316" 
                  strokeWidth={2}
                  dot={{ fill: '#F97316', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* This Week vs Last Week */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">This Week vs Last Week</h3>
          <div className="grid grid-cols-2 gap-6">
            {/* Workout Count Comparison */}
            <div>
              <div className="text-gray-400 text-sm mb-2">Workouts Completed</div>
              <div className="flex items-baseline gap-3">
                <div className="text-2xl font-bold text-white">
                  {weekComparison.thisWeek.count}
                </div>
                <div className="text-sm text-gray-400">
                  vs {weekComparison.lastWeek.count} last week
                </div>
              </div>
              {weekComparison.workoutCountChange !== 0 && (
                <div className={`flex items-center gap-1 mt-2 text-sm ${
                  weekComparison.workoutCountChange > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {weekComparison.workoutCountChange > 0 ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  {Math.abs(weekComparison.workoutCountChange).toFixed(1)}%
                </div>
              )}
            </div>

            {/* Volume Comparison */}
            <div>
              <div className="text-gray-400 text-sm mb-2">Total Volume</div>
              <div className="flex items-baseline gap-3">
                <div className="text-2xl font-bold text-white">
                  {weekComparison.thisWeek.volume.toFixed(0)} kg
                </div>
                <div className="text-sm text-gray-400">
                  vs {weekComparison.lastWeek.volume.toFixed(0)} kg last week
                </div>
              </div>
              {weekComparison.volumeChange !== 0 && (
                <div className={`flex items-center gap-1 mt-2 text-sm ${
                  weekComparison.volumeChange > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {weekComparison.volumeChange > 0 ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  {Math.abs(weekComparison.volumeChange).toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Workout History */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Workout History</h3>
          
          {workouts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No workouts yet! Start your first workout to track your progress.</p>
              <Link 
                to="/"
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg"
              >
                Start Your First Workout
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {workouts.map((workout) => (
                <div 
                  key={workout.id} 
                  className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-orange-500/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                      <Activity className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{workout.template_name}</div>
                      <div className="text-sm text-gray-400">{formatDate(workout.workout_date)}</div>
                      {workout.notes && (
                        <div className="text-sm text-gray-400 mt-1 italic border-l-2 border-orange-500/50 pl-2">
                          "{workout.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">
                      {workout.exercises?.length || 0} exercises
                    </div>
                    <div className="text-xs text-gray-500">
                      {workout.total_reps} reps · {workout.total_volume?.toFixed(0)} kg
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
