import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Activity, Target, Calendar } from 'lucide-react'
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
            <TrendingUp className="w-8 h-8 text-blue-600" />
            Your Progress
          </h1>
          <p className="text-gray-300 text-lg">Track your workout performance and improvements</p>
        </div>

        {/* Key Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
              <div className="text-4xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
                <Activity className="w-8 h-8" />
                {stats.totalWorkouts}
              </div>
              <div className="text-gray-600 font-body">Total Workouts</div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
              <div className="text-4xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
                <Target className="w-8 h-8" />
                {stats.totalReps}
              </div>
              <div className="text-gray-600 font-body">Total Reps</div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
              <div className="text-4xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
                <TrendingUp className="w-8 h-8" />
                {stats.totalVolume.toFixed(0)}
              </div>
              <div className="text-gray-600 font-body">Volume (kg)</div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
              <div className="text-4xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
                <Calendar className="w-8 h-8" />
                {stats.avgVolume.toFixed(0)}
              </div>
              <div className="text-gray-600 font-body">Avg. Volume/Workout</div>
            </div>
          </div>
        )}

        {/* Recent Workouts */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Workout History</h3>
          
          {workouts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No workouts yet! Start your first workout to track your progress.</p>
              <Link 
                to="/"
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg"
              >
                Start Your First Workout
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {workouts.map((workout) => (
                <div 
                  key={workout.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Activity className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-dark">{workout.template_name}</div>
                      <div className="text-sm text-gray-600">{formatDate(workout.workout_date)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
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

        {/* Motivational Message */}
        {workouts.length > 0 && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Keep Going! 💪</h3>
            <p className="text-white/90">
              You've completed {stats.totalWorkouts} workout{stats.totalWorkouts !== 1 ? 's' : ''} and lifted {stats.totalVolume.toFixed(0)} kg total!
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
