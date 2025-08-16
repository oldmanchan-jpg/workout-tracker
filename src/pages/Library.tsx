import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Search, Dumbbell, Target, TrendingUp } from 'lucide-react'

// Sample exercise data - you can expand this
const exerciseLibrary = [
  {
    id: 1,
    name: 'Bench Press',
    category: 'Push',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    description: 'Compound exercise for chest development and upper body strength',
    benefits: ['Builds chest strength', 'Improves shoulder stability', 'Increases overall upper body power'],
    instructions: [
      'Lie on bench with feet flat on ground',
      'Grip barbell slightly wider than shoulder width',
      'Lower bar to chest with controlled movement',
      'Press bar back up to starting position'
    ]
  },
  {
    id: 2,
    name: 'Squat',
    category: 'Legs',
    muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    description: 'Fundamental lower body compound exercise',
    benefits: ['Builds leg strength', 'Improves core stability', 'Enhances athletic performance'],
    instructions: [
      'Position barbell on upper back',
      'Stand with feet shoulder-width apart',
      'Lower body by bending knees and hips',
      'Return to standing position'
    ]
  },
  {
    id: 3,
    name: 'Deadlift',
    category: 'Pull',
    muscleGroups: ['Back', 'Glutes', 'Hamstrings'],
    difficulty: 'Advanced',
    equipment: 'Barbell',
    description: 'Full body compound exercise for posterior chain development',
    benefits: ['Builds total body strength', 'Improves posture', 'Enhances functional movement'],
    instructions: [
      'Stand with feet hip-width apart',
      'Bend at hips and knees to grasp bar',
      'Keep back straight and lift bar',
      'Return bar to ground with control'
    ]
  },
  {
    id: 4,
    name: 'Pull-up',
    category: 'Pull',
    muscleGroups: ['Back', 'Biceps', 'Shoulders'],
    difficulty: 'Intermediate',
    equipment: 'Pull-up Bar',
    description: 'Bodyweight exercise for upper back and arm strength',
    benefits: ['Builds back strength', 'Improves grip strength', 'No equipment needed'],
    instructions: [
      'Hang from pull-up bar with palms facing away',
      'Pull body up until chin clears bar',
      'Lower body with control',
      'Repeat movement'
    ]
  },
  {
    id: 5,
    name: 'Overhead Press',
    category: 'Push',
    muscleGroups: ['Shoulders', 'Triceps', 'Upper Chest'],
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    description: 'Vertical pressing movement for shoulder development',
    benefits: ['Builds shoulder strength', 'Improves overhead mobility', 'Enhances core stability'],
    instructions: [
      'Hold barbell at shoulder level',
      'Press bar overhead while keeping core tight',
      'Lower bar back to shoulders',
      'Maintain control throughout movement'
    ]
  },
  {
    id: 6,
    name: 'Romanian Deadlift',
    category: 'Pull',
    muscleGroups: ['Hamstrings', 'Glutes', 'Lower Back'],
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    description: 'Hip hinge movement for posterior chain development',
    benefits: ['Improves hip mobility', 'Builds hamstring strength', 'Enhances deadlift form'],
    instructions: [
      'Hold barbell in front of thighs',
      'Hinge at hips while keeping legs straight',
      'Lower bar along legs',
      'Return to standing position'
    ]
  }
]

export default function Library() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')

  const categories = ['All', 'Push', 'Pull', 'Legs', 'Core', 'Cardio']
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced']

  const filteredExercises = useMemo(() => {
    return exerciseLibrary.filter(exercise => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exercise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exercise.muscleGroups.some(muscle => muscle.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'All' || exercise.category === selectedCategory
      const matchesDifficulty = selectedDifficulty === 'All' || exercise.difficulty === selectedDifficulty
      
      return matchesSearch && matchesCategory && matchesDifficulty
    })
  }, [searchTerm, selectedCategory, selectedDifficulty])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Push': return 'bg-blue-100 text-blue-800'
      case 'Pull': return 'bg-green-100 text-green-800'
      case 'Legs': return 'bg-purple-100 text-purple-800'
      case 'Core': return 'bg-orange-100 text-orange-800'
      case 'Cardio': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-dark shadow-soft border-b border-purple">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div className="font-bold text-xl text-white">Exercise Library</div>
          </div>
          <Link to="/" className="btn btn-outline btn-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl font-display text-white mb-4">Exercise Library</h1>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            Browse our comprehensive collection of exercises with detailed instructions, 
            muscle group targeting, and difficulty levels to help you build effective workouts.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search exercises, muscle groups, or equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredExercises.map((exercise) => (
            <div key={exercise.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-200">
              {/* Exercise Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{exercise.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{exercise.description}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(exercise.category)}`}>
                        {exercise.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                        {exercise.difficulty}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {exercise.equipment}
                      </span>
                    </div>
                  </div>
                  
                  {/* Exercise Icon */}
                  <div className="ml-4">
                    <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Dumbbell className="w-10 h-10 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Muscle Groups */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Target Muscles:</h4>
                  <div className="flex flex-wrap gap-2">
                    {exercise.muscleGroups.map((muscle, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Exercise Details */}
              <div className="p-6 space-y-4">
                {/* Benefits */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    Key Benefits
                  </h4>
                  <ul className="space-y-1">
                    {exercise.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    How to Perform
                  </h4>
                  <ol className="space-y-1">
                    {exercise.instructions.map((instruction, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <Dumbbell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No exercises found</h3>
            <p className="text-gray-500">Try adjusting your search terms or filters</p>
          </div>
        )}
      </main>
    </div>
  )
}
