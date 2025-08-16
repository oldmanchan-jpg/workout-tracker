import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/state/AuthContext'
import { listWorkouts } from '@/lib/firestore'
import type { Workout } from '@/types'
import ProgressChart from '@/components/ProgressChart'
import { BarChart3, ArrowLeft, Activity, Target, Calendar, TrendingUp, Award, Zap, Clock } from 'lucide-react'

export default function Progress() {
  const { user } = useAuth()
  const uid = user!.uid
  
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  // Load workouts
  useEffect(() => {
    const loadWorkouts = async () => {
      setLoading(true)
      try {
        const workoutList = await listWorkouts(uid)
        setWorkouts(workoutList)
      } catch (error) {
        console.error('Failed to load workouts:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadWorkouts()
  }, [uid])

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    if (workouts.length === 0) return null
    
    const totalExercises = workouts.reduce<number>((sum, w) => sum + (w.exercises?.length || 0), 0)
    const totalVolume = workouts.reduce<number>((sum, w) => 
      sum + (w.exercises?.reduce<number>((exSum, ex) => 
        exSum + (ex.sets?.reduce<number>((setSum, set) => 
          setSum + (set.reps * (set.weight || 0)), 0) || 0), 0) || 0), 0)
    const totalReps = workouts.reduce<number>((sum, w) => 
      sum + (w.exercises?.reduce<number>((exSum, ex) => 
        exSum + (ex.sets?.reduce<number>((setSum, set) => 
          setSum + set.reps, 0) || 0), 0) || 0), 0)
    
    return {
      totalWorkouts: workouts.length,
      totalExercises,
      totalVolume,
      totalReps
    }
  }, [workouts])

  // Get exercise frequency and performance
  const exercisePerformance = useMemo(() => {
    const exerciseCounts: { [key: string]: number } = {}
    const exerciseData: { [key: string]: { totalWeight: number; totalReps: number; sets: number } } = {}
    
    workouts.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        exerciseCounts[exercise.name] = (exerciseCounts[exercise.name] || 0) + 1
        
        if (!exerciseData[exercise.name]) {
          exerciseData[exercise.name] = { totalWeight: 0, totalReps: 0, sets: 0 }
        }
        
        exercise.sets?.forEach(set => {
          exerciseData[exercise.name].totalWeight += set.reps * (set.weight || 0)
          exerciseData[exercise.name].totalReps += set.reps
          exerciseData[exercise.name].sets += 1
        })
      })
    })
    
    return Object.entries(exerciseCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([name, count]) => ({
        name,
        count,
        avgWeight: exerciseData[name] ? exerciseData[name].totalWeight / exerciseData[name].sets : 0,
        avgReps: exerciseData[name] ? exerciseData[name].totalReps / exerciseData[name].sets : 0
      }))
  }, [workouts])

  // Calculate streak information
  const streakInfo = useMemo(() => {
    if (workouts.length === 0) return { currentStreak: 0, longestStreak: 0, avgWorkoutsPerWeek: 0 }
    
    let maxStreak = 0
    let currentStreak = 0
    let lastDate: Date | null = null
    
    const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    sortedWorkouts.forEach(workout => {
      const workoutDate = new Date(workout.date)
      if (lastDate) {
        const daysDiff = Math.floor((lastDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff === 1) {
          currentStreak++
        } else {
          maxStreak = Math.max(maxStreak, currentStreak)
          currentStreak = 1
        }
      } else {
        currentStreak = 1
      }
      lastDate = workoutDate
    })
    
    maxStreak = Math.max(maxStreak, currentStreak)
    
    // Calculate average workouts per week
    const firstWorkout = sortedWorkouts[sortedWorkouts.length - 1]
    const weeksSinceStart = Math.max(1, Math.ceil((new Date().getTime() - new Date(firstWorkout.date).getTime()) / (1000 * 60 * 60 * 24 * 7)))
    const avgWorkoutsPerWeek = workouts.length / weeksSinceStart
    
    return {
      currentStreak,
      longestStreak: maxStreak,
      avgWorkoutsPerWeek: avgWorkoutsPerWeek
    }
  }, [workouts])

  if (loading) {
    return (
      <div className="min-h-screen app-container">
        <div className="max-w-7xl mx-auto p-4">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-300">Loading progress data...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen app-container">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-dark shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="font-bold text-xl text-white">Progress & Analytics</div>
          </div>
          <Link to="/" className="text-sm font-medium text-white hover:text-primary transition-all duration-200 hover:scale-105 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 space-y-6 pb-24 md:pb-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-display text-white mb-2 flex items-center justify-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            Your Progress
          </h1>
          <p className="text-gray-300 text-lg font-body">Track your workout performance and improvements</p>
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
                {stats.totalExercises}
              </div>
              <div className="text-gray-600 font-body">Exercises Completed</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
              <div className="text-4xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
                <Calendar className="w-8 h-8" />
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
          </div>
        )}

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Streak */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-orange-800">Current Streak</h3>
            </div>
            <div className="text-3xl font-bold text-orange-700">{streakInfo.currentStreak}</div>
            <div className="text-sm text-orange-600">consecutive days</div>
          </div>
          
          {/* Longest Streak */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-purple-800">Longest Streak</h3>
            </div>
            <div className="text-3xl font-bold text-purple-700">{streakInfo.longestStreak}</div>
            <div className="text-sm text-purple-600">days achieved</div>
          </div>
          
          {/* Average Workouts */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800">Weekly Average</h3>
            </div>
            <div className="text-3xl font-bold text-blue-700">{streakInfo.avgWorkoutsPerWeek.toFixed(1)}</div>
            <div className="text-sm text-blue-600">workouts per week</div>
          </div>
        </div>

        {/* Exercise Performance Analysis */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-display text-dark mb-4">Exercise Performance Analysis</h3>
          <div className="space-y-4">
            {exercisePerformance.map((exercise, index) => (
              <div key={exercise.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-dark">{exercise.name}</div>
                    <div className="text-sm text-gray-600">{exercise.count} workouts completed</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Avg. Weight: {exercise.avgWeight.toFixed(1)}kg</div>
                  <div className="text-sm text-gray-600">Avg. Reps: {exercise.avgReps.toFixed(0)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Over Time */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Workout Frequency */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-display text-dark mb-4">Monthly Workout Frequency</h3>
            <ProgressChart
              type="line"
              title=""
              height={250}
              data={{
                labels: (() => {
                  const months = []
                  const today = new Date()
                  for (let i = 5; i >= 0; i--) {
                    const month = new Date(today.getFullYear(), today.getMonth() - i, 1)
                    months.push(month.toLocaleDateString('en-US', { month: 'short' }))
                  }
                  return months
                })(),
                datasets: [{
                  label: 'Workouts',
                  data: (() => {
                    const months = []
                    const today = new Date()
                    for (let i = 5; i >= 0; i--) {
                      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1)
                      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0)
                      const monthWorkouts = workouts.filter(w => {
                        const workoutDate = new Date(w.date)
                        return workoutDate >= monthStart && workoutDate <= monthEnd
                      })
                      months.push(monthWorkouts.length)
                    }
                    return months
                  })(),
                  borderColor: 'rgba(147, 51, 234, 1)',
                  backgroundColor: 'rgba(147, 51, 234, 0.1)',
                  borderWidth: 3,
                  fill: true,
                  tension: 0.4,
                }]
              }}
            />
          </div>

          {/* Strength Progress */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-display text-dark mb-4">Strength Progress (Last 4 Weeks)</h3>
            <ProgressChart
              type="bar"
              title=""
              height={250}
              data={{
                labels: (() => {
                  const weeks = []
                  const today = new Date()
                  for (let i = 3; i >= 0; i--) {
                    const weekStart = new Date(today)
                    weekStart.setDate(today.getDate() - (today.getDay() + 7 * i))
                    weeks.push(`Week ${4 - i}`)
                  }
                  return weeks
                })(),
                datasets: [{
                  label: 'Total Weight (kg)',
                  data: (() => {
                    const weeks = []
                    const today = new Date()
                    for (let i = 3; i >= 0; i--) {
                      const weekStart = new Date(today)
                      weekStart.setDate(today.getDate() - (today.getDay() + 7 * i))
                      const weekEnd = new Date(weekStart)
                      weekEnd.setDate(weekStart.getDate() + 6)
                      
                      const weekWorkouts = workouts.filter(w => {
                        const workoutDate = new Date(w.date)
                        return workoutDate >= weekStart && workoutDate <= weekEnd
                      })
                      
                      const weekWeight = weekWorkouts.reduce((total, workout) => {
                        return total + workout.exercises.reduce((exTotal, exercise) => {
                          return exTotal + exercise.sets.reduce((setTotal, set) => {
                            return setTotal + (set.reps * (set.weight || 0))
                          }, 0)
                        }, 0)
                      }, 0)
                      
                      weeks.push(weekWeight)
                    }
                    return weeks
                  })(),
                  backgroundColor: 'rgba(16, 185, 129, 0.8)',
                  borderColor: 'rgba(16, 185, 129, 1)',
                  borderWidth: 2,
                }]
              }}
            />
          </div>
        </div>

        {/* Personal Records */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-display text-dark mb-4">Personal Records</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Most Weight Lifted */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium mb-1">Heaviest Single Lift</div>
              <div className="text-2xl font-bold text-blue-700">
                {(() => {
                  const maxWeight = Math.max(...workouts.flatMap(w => 
                    w.exercises.flatMap(ex => ex.sets.map(set => set.weight || 0))
                  ))
                  return maxWeight > 0 ? `${maxWeight}kg` : 'N/A'
                })()}
              </div>
            </div>
            
            {/* Most Reps in One Set */}
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium mb-1">Most Reps in One Set</div>
              <div className="text-2xl font-bold text-green-700">
                {(() => {
                  const maxReps = Math.max(...workouts.flatMap(w => 
                    w.exercises.flatMap(ex => ex.sets.map(set => set.reps))
                  ))
                  return maxReps > 0 ? `${maxReps} reps` : 'N/A'
                })()}
              </div>
            </div>
            
            {/* Most Exercises in One Workout */}
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-600 font-medium mb-1">Most Exercises in One Workout</div>
              <div className="text-2xl font-bold text-purple-700">
                {(() => {
                  const maxExercises = Math.max(...workouts.map(w => w.exercises.length))
                  return maxExercises > 0 ? `${maxExercises} exercises` : 'N/A'
                })()}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
