import React, { useState } from 'react'
import { exerciseMediaLibrary, defaultExerciseImage } from '@/data/exerciseMedia'

// This component demonstrates how you would manage exercise media from the backend
// In production, this would be an admin-only interface for managing the exercise library
export default function ExerciseMediaManager() {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const exerciseNames = Object.keys(exerciseMediaLibrary)

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display text-dark mb-2">Exercise Media Library</h2>
          <p className="text-secondary text-sm">
            Manage exercise images and videos for the workout app
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light transition-colors"
        >
          + Add Exercise Media
        </button>
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {exerciseNames.map((exerciseName) => {
          const media = exerciseMediaLibrary[exerciseName]
          return (
            <div
              key={exerciseName}
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedExercise === exerciseName ? 'border-primary bg-primary/5' : 'border-gray-200'
              }`}
              onClick={() => setSelectedExercise(exerciseName)}
            >
              {/* Exercise Image - Smaller for Grid */}
              <div className="w-full h-24 bg-cover bg-center rounded-lg mb-3" 
                   style={{ backgroundImage: `url(${media.url})` }} />
              
              {/* Exercise Info */}
              <div className="text-center">
                <h3 className="font-semibold text-dark mb-1 capitalize">{exerciseName}</h3>
                <div className="flex items-center justify-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    media.type === 'video' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {media.type === 'video' ? '🎥 Video' : '🖼️ Image'}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Exercise Details */}
      {selectedExercise && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-dark mb-4 capitalize">
            {selectedExercise} - Media Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Media Preview */}
            <div>
              <h4 className="font-medium text-dark mb-2">Preview</h4>
              <div className="border rounded-lg overflow-hidden">
                {exerciseMediaLibrary[selectedExercise].type === 'video' ? (
                  <video
                    src={exerciseMediaLibrary[selectedExercise].url}
                    controls
                    className="w-full"
                    muted
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={exerciseMediaLibrary[selectedExercise].url}
                    alt={exerciseMediaLibrary[selectedExercise].altText}
                    className="w-full"
                  />
                )}
              </div>
            </div>

            {/* Media Information */}
            <div>
              <h4 className="font-medium text-dark mb-2">Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Media Type</label>
                  <div className="text-dark font-medium">
                    {exerciseMediaLibrary[selectedExercise].type === 'video' ? 'Video' : 'Image'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">URL</label>
                  <div className="text-sm text-gray-500 break-all">
                    {exerciseMediaLibrary[selectedExercise].url}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Alt Text</label>
                  <div className="text-sm text-gray-500">
                    {exerciseMediaLibrary[selectedExercise].altText}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <button className="bg-primary text-white px-3 py-2 rounded-lg text-sm hover:bg-primary-light transition-colors">
                  Edit Media
                </button>
                <button className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Exercise Media Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-dark mb-4">Add New Exercise Media</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Exercise Name</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g., push-ups, squats"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Media Type</label>
                <select className="w-full border rounded-lg px-3 py-2">
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Media URL</label>
                <input
                  type="url"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Alt Text</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Description of the exercise"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-200 text-dark px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light transition-colors">
                Add Media
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <div className="text-blue-500 text-lg">ℹ️</div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">How This Works</h4>
            <p className="text-blue-800 text-sm">
              This is a demonstration of how you would manage exercise media from your backend. 
              In production, users would only see the exercise images/videos without any upload or 
              management capabilities. You would upload and manage all exercise media through an 
              admin interface like this one.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
