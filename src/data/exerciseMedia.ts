// Sample exercise media data - in production this would come from your backend
export const exerciseMediaLibrary: Record<string, { url: string; type: 'image' | 'video'; altText: string }> = {
  // Push Day Exercises
  'bench press': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    type: 'image',
    altText: 'Bench press exercise'
  },
  'overhead press': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    type: 'image',
    altText: 'Overhead press exercise'
  },
  'incline bench press': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    type: 'image',
    altText: 'Incline bench press exercise'
  },
  'lateral raise 1 arm': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    type: 'image',
    altText: 'Single arm lateral raise'
  },
  'tricep dips': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    type: 'image',
    altText: 'Tricep dips exercise'
  },
  'close grip bench press': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    type: 'image',
    altText: 'Close grip bench press'
  },

  // Pull Day Exercises
  'deadlift': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    type: 'image',
    altText: 'Deadlift exercise'
  },
  'barbell rows': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    type: 'image',
    altText: 'Barbell rows exercise'
  },
  'seal row': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    type: 'image',
    altText: 'Seal row exercise for back'
  },
  'cable pull 1 mano': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    type: 'image',
    altText: 'Single arm cable pull exercise'
  },
  'face pulls': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    type: 'image',
    altText: 'Face pulls exercise'
  },
  'bicep curls': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    type: 'image',
    altText: 'Bicep curls exercise'
  },

  // Leg Day Exercises
  'squat': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    type: 'image',
    altText: 'Squat exercise'
  },
  'lunges': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    type: 'image',
    altText: 'Lunges exercise'
  },
  'polpacci seduto': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    type: 'image',
    altText: 'Seated calf raises exercise'
  },
  'leg press': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    type: 'image',
    altText: 'Leg press exercise'
  },
  'romanian deadlift': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    type: 'image',
    altText: 'Romanian deadlift exercise'
  },
  'leg extensions': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    type: 'image',
    altText: 'Leg extensions exercise'
  },

  // Shoulder Day Exercises
  'y cable raises': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    type: 'image',
    altText: 'Y cable raises for shoulders'
  },
  'rear delt flyes': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    type: 'image',
    altText: 'Rear delt flyes exercise'
  },
  'upright rows': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    type: 'image',
    altText: 'Upright rows exercise'
  },
  'shrugs': {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    type: 'image',
    altText: 'Shrugs exercise'
  }
}

// Helper function to get media for an exercise
export const getExerciseMedia = (exerciseName: string) => {
  const normalizedName = exerciseName.toLowerCase().trim()
  return exerciseMediaLibrary[normalizedName] || null
}

// Default exercise image for exercises without specific media
export const defaultExerciseImage = {
  url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
  type: 'image' as const,
  altText: 'Generic exercise illustration'
}
