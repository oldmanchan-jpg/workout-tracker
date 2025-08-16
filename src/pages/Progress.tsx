import React from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, ArrowLeft, Activity, Target, Calendar, TrendingUp, Award, Zap, Clock } from 'lucide-react'
import TopBar from '@/components/TopBar'

export default function Progress() {
  // Sample data for demonstration
  const stats = {
    totalWorkouts: 12,
    totalExercises: 48,
    totalVolume: 2400,
    totalReps: 360
  }

  const exercisePerformance = [
    { name: 'Bench Press', count: 8, avgWeight: 45, avgReps: 10 },
    { name: 'Squat', count: 6, avgWeight: 70, avgReps: 8 },
    { name: 'Deadlift', count: 5, avgWeight: 80, avgReps: 6 },
    { name: 'Pull-ups', count: 4, avgWeight: 0, avgReps: 12 }
  ]

  const streakInfo = {
    currentStreak: 3,
    longestStreak: 7,
    avgWorkoutsPerWeek: 3.2
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

        {/* Simple Progress Summary */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Progress Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-700">Monthly Overview</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">January:</span>
                  <span className="font-medium">4 workouts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">February:</span>
                  <span className="font-medium">3 workouts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">March:</span>
                  <span className="font-medium">5 workouts</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-700">Weekly Average</h4>
              <div className="text-3xl font-bold text-blue-600">{streakInfo.avgWorkoutsPerWeek}</div>
              <p className="text-gray-600">workouts per week</p>
            </div>
          </div>
        </div>

        {/* Personal Records */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Personal Records</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Most Weight Lifted */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium mb-1">Heaviest Single Lift</div>
              <div className="text-2xl font-bold text-blue-700">80kg</div>
            </div>
            
            {/* Most Reps in One Set */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium mb-1">Most Reps in One Set</div>
              <div className="text-2xl font-bold text-green-700">20 reps</div>
            </div>
            
            {/* Most Exercises in One Workout */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-600 font-medium mb-1">Most Exercises in One Workout</div>
              <div className="text-2xl font-bold text-purple-700">6 exercises</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
