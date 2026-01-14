import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface UserPreferences {
  restTimerDefault: number // in seconds
  weightUnit: 'kg' | 'lbs'
  theme: 'dark' | 'light'
}

const DEFAULT_PREFERENCES: UserPreferences = {
  restTimerDefault: 90,
  weightUnit: 'kg',
  theme: 'dark'
}

export function useSettings() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch preferences from profile
  useEffect(() => {
    async function fetchPreferences() {
      if (!user) {
        setPreferences(DEFAULT_PREFERENCES)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', user.id)
          .single()

        if (error) throw error
        
        // Merge with defaults to handle missing keys
        if (data?.preferences) {
          setPreferences({
            ...DEFAULT_PREFERENCES,
            ...data.preferences
          })
        }
      } catch (err) {
        console.error('Error fetching preferences:', err)
        // Use defaults if fetch fails
        setPreferences(DEFAULT_PREFERENCES)
      } finally {
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [user])

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
    if (!user) return { error: 'Not logged in' }

    setSaving(true)
    setError(null)

    const updatedPreferences = {
      ...preferences,
      ...newPreferences
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferences: updatedPreferences })
        .eq('id', user.id)

      if (error) throw error

      setPreferences(updatedPreferences)
      return { error: null }
    } catch (err) {
      console.error('Error saving preferences:', err)
      const errorMessage = 'Failed to save preferences'
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setSaving(false)
    }
  }, [user, preferences])

  // Utility function to convert weight based on unit preference
  const formatWeight = useCallback((weightInKg: number): string => {
    if (preferences.weightUnit === 'lbs') {
      const lbs = Math.round(weightInKg * 2.20462 * 10) / 10
      return `${lbs} lbs`
    }
    return `${weightInKg} kg`
  }, [preferences.weightUnit])

  // Convert weight for display (number only)
  const convertWeight = useCallback((weightInKg: number): number => {
    if (preferences.weightUnit === 'lbs') {
      return Math.round(weightInKg * 2.20462 * 10) / 10
    }
    return weightInKg
  }, [preferences.weightUnit])

  // Convert weight back to kg for storage
  const toKg = useCallback((weight: number): number => {
    if (preferences.weightUnit === 'lbs') {
      return Math.round(weight / 2.20462 * 10) / 10
    }
    return weight
  }, [preferences.weightUnit])

  return {
    preferences,
    loading,
    saving,
    error,
    updatePreferences,
    formatWeight,
    convertWeight,
    toKg,
    // Convenience exports
    restTimerDefault: preferences.restTimerDefault,
    weightUnit: preferences.weightUnit,
    theme: preferences.theme
  }
}
