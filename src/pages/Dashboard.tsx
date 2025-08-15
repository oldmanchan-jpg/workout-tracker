import React, { useEffect, useMemo, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/state/AuthContext'
import type { Template, Workout } from '@/types'
import {
  listTemplates,
  listWorkouts,
  saveWorkout,
  seedDefaultTemplate,
  deleteWorkout,
  updateWorkout,
} from '@/lib/firestore'
import ProgressChart from '@/components/ProgressChart'
import WorkoutList from '@/components/WorkoutList'
import EditWorkoutModal from '@/components/EditWorkoutModal'
import { useToast, toast } from '@/components/Toaster'
import { validateWorkoutForm } from '@/lib/validation'

type DraftSet = { reps: number; weight?: number }
type DraftExercise = { name: string; sets: DraftSet[] }

export default function Dashboard() {
  const { user } = useAuth()
  const uid = user!.uid
  const { addToast } = useToast()

  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [draftExercises, setDraftExercises] = useState<DraftExercise[]>([])
  const [notes, setNotes] = useState('')

  // Edit modal state
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Refs for keyboard navigation
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([])
  const saveButtonRef = useRef<HTMLButtonElement>(null)

  // NEW: chart controls
  const [exerciseFilter, setExerciseFilter] = useState('Squat')
  const [metric, setMetric] = useState<'volume' | 'topSet'>('volume')

  const selectedTemplate = useMemo(
    () => templates.find(t => t.id === selectedTemplateId),
    [templates, selectedTemplateId]
  )

  // options for exercise selector
  const exerciseOptions = useMemo(() => {
    const set = new Set<string>()
    templates.forEach(t => t.exercises.forEach(e => set.add(e.name)))
    workouts.forEach(w => w.exercises.forEach(e => set.add(e.name)))
    const arr = Array.from(set).sort()
    return arr.length ? arr : ['Squat']
  }, [templates, workouts])

  useEffect(() => {
    if (!selectedTemplate) return
    const next: DraftExercise[] = selectedTemplate.exercises.map(ex => ({
      name: ex.name,
      sets: Array.from({ length: ex.sets }).map(() => ({ reps: ex.reps, weight: undefined })),
    }))
    setDraftExercises(next)
  }, [selectedTemplateId, selectedTemplate])

  useEffect(() => {
    (async () => {
      setLoading(true)
      let ts = await listTemplates(uid)
      if (ts.length === 0) {
        await seedDefaultTemplate(uid)
        ts = await listTemplates(uid)
      }
      setTemplates(ts)
      setSelectedTemplateId(prev => (prev || (ts[0]?.id ?? '')))
      const ws = await listWorkouts(uid)
      setWorkouts(ws)
      setLoading(false)
    })()
  }, [uid])

  const refreshWorkouts = async () => setWorkouts(await listWorkouts(uid))

  const onChangeSet = (exIdx: number, setIdx: number, field: 'reps' | 'weight', val: string) => {
    setDraftExercises(prev => {
      const copy = prev.map(e => ({ ...e, sets: e.sets.map(s => ({ ...s })) }))
      let num = Number(val)
      
      if (Number.isNaN(num)) {
        num = field === 'reps' ? 0 : undefined
      } else {
        // Clamp values
        if (field === 'reps') {
          num = Math.max(0, Math.min(1000, num)) // Clamp reps between 0-1000
        } else {
          num = Math.max(0, Math.min(1000, num)) // Clamp weight between 0-1000
        }
      }
      
      ;(copy[exIdx].sets[setIdx] as any)[field] = num
      return copy
    })
  }

  const handleKeyDown = (exIdx: number, setIdx: number, field: 'reps' | 'weight', e: React.KeyboardEvent) => {
    const currentValue = draftExercises[exIdx]?.sets[setIdx]?.[field] || 0
    
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const newValue = field === 'reps' ? currentValue + 1 : currentValue + 2.5
      onChangeSet(exIdx, setIdx, field, newValue.toString())
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newValue = field === 'reps' ? Math.max(0, currentValue - 1) : Math.max(0, currentValue - 2.5)
      onChangeSet(exIdx, setIdx, field, newValue.toString())
    } else if (e.key === 'Enter') {
      e.preventDefault()
      // Find next input or save
      const nextInput = findNextInput(exIdx, setIdx, field)
      if (nextInput) {
        nextInput.focus()
      } else {
        saveButtonRef.current?.focus()
      }
    }
  }

  const findNextInput = (exIdx: number, setIdx: number, field: 'reps' | 'weight'): HTMLInputElement | null => {
    const currentFieldIndex = field === 'reps' ? 0 : 1
    
    // Try next field in same set
    if (currentFieldIndex === 0 && inputRefs.current[exIdx]?.[setIdx * 2 + 1]) {
      return inputRefs.current[exIdx][setIdx * 2 + 1]
    }
    
    // Try next set
    if (setIdx + 1 < draftExercises[exIdx]?.sets.length) {
      return inputRefs.current[exIdx]?.[(setIdx + 1) * 2] || null
    }
    
    // Try next exercise
    if (exIdx + 1 < draftExercises.length) {
      return inputRefs.current[exIdx + 1]?.[0] || null
    }
    
    return null
  }

  const onSaveWorkout = async () => {
    if (!selectedTemplate) return
    
    // Validate workout data
    const workoutData = {
      date: new Date().toISOString(),
      notes,
      exercises: draftExercises.map(ex => ({
        id: crypto.randomUUID(),
        name: ex.name,
        sets: ex.sets.map(s => ({ reps: s.reps, weight: s.weight ?? 0 })),
      }))
    }
    
    const validation = validateWorkoutForm(workoutData)
    if (!validation.isValid) {
      addToast(toast.error('Validation Error', validation.errors.join(', ')))
      return
    }
    
    setSaving(true)
    try {
      const workout: Omit<Workout, 'id' | 'userId'> = {
        date: new Date().toISOString(),
        notes,
        exercises: draftExercises.map(ex => ({
          name: ex.name,
          sets: ex.sets.map(s => ({ reps: s.reps, weight: s.weight ?? 0 })),
        })) as any,
      }
      await saveWorkout(uid, workout)
      setNotes('')
      await refreshWorkouts()
      addToast(toast.success('Workout Saved!', 'Your workout has been successfully saved.'))
    } catch (error) {
      addToast(toast.error('Save Failed', 'Failed to save workout. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  const onDeleteWorkout = async (id: string) => {
    if (!confirm('Delete this workout?')) return
    try {
      await deleteWorkout(uid, id)
      await refreshWorkouts()
      addToast(toast.success('Workout Deleted', 'The workout has been successfully deleted.'))
    } catch (error) {
      addToast(toast.error('Delete Failed', 'Failed to delete workout. Please try again.'))
    }
  }

  const onEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout)
    setIsEditModalOpen(true)
  }

  const onSaveEditedWorkout = async (updatedWorkout: Workout) => {
    try {
      await updateWorkout(uid, updatedWorkout.id, {
        date: updatedWorkout.date,
        notes: updatedWorkout.notes,
        exercises: updatedWorkout.exercises,
      })
      await refreshWorkouts()
      addToast(toast.success('Workout Updated!', 'Your workout has been successfully updated.'))
    } catch (error) {
      addToast(toast.error('Update Failed', 'Failed to update workout. Please try again.'))
    }
  }

  const onCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingWorkout(null)
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">Workout App</div>
          <div className="text-sm text-gray-600">Signed in</div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-4 space-y-4 pb-24 md:pb-4">
        {/* Log Workout */}
        <div className="bg-white rounded-2xl shadow-soft p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold">Log Workout</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Template</label>
              <select className="border rounded-xl px-3 py-2"
                value={selectedTemplateId}
                onChange={e => setSelectedTemplateId(e.target.value)}>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <Link to="/templates" className="text-sm border rounded-xl px-3 py-2">Manage Templates</Link>
              <Link to="/history" className="text-sm border rounded-xl px-3 py-2">Exercise History</Link>
            </div>
          </div>

          {loading && <div className="mt-3 text-gray-600">Loading…</div>}
          {!loading && selectedTemplate && (
            <div className="mt-4 space-y-4">
              {draftExercises.map((ex, exIdx) => (
                <div key={exIdx} className="border rounded-xl p-3">
                  <div className="font-medium mb-2">{ex.name}</div>
                  <div className="grid grid-cols-12 gap-2">
                    {ex.sets.map((s, setIdx) => (
                      <div key={setIdx} className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 border rounded-lg p-2">
                        <div className="text-xs text-gray-500 mb-1">Set {setIdx + 1}</div>
                        <div className="flex items-center gap-2">
                          <input 
                            ref={el => {
                              if (!inputRefs.current[exIdx]) inputRefs.current[exIdx] = []
                              inputRefs.current[exIdx][setIdx * 2] = el
                            }}
                            type="number" 
                            min={0} 
                            max={1000}
                            step={1}
                            className="w-20 border rounded-lg px-2 py-1"
                            value={s.reps} 
                            onChange={e => onChangeSet(exIdx, setIdx, 'reps', e.target.value)}
                            onKeyDown={e => handleKeyDown(exIdx, setIdx, 'reps', e)}
                          />
                          <span className="text-sm text-gray-600">reps</span>
                          <input 
                            ref={el => {
                              if (!inputRefs.current[exIdx]) inputRefs.current[exIdx] = []
                              inputRefs.current[exIdx][setIdx * 2 + 1] = el
                            }}
                            type="number" 
                            min={0} 
                            max={1000}
                            step={0.5}
                            className="w-24 border rounded-lg px-2 py-1" 
                            placeholder="kg"
                            value={s.weight ?? ''} 
                            onChange={e => onChangeSet(exIdx, setIdx, 'weight', e.target.value)}
                            onKeyDown={e => handleKeyDown(exIdx, setIdx, 'weight', e)}
                          />
                          <span className="text-sm text-gray-600">kg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-sm text-gray-600 mb-1">Notes</label>
                <textarea className="w-full border rounded-xl px-3 py-2" rows={2}
                          value={notes} onChange={e => setNotes(e.target.value)} />
              </div>

              <div className="flex justify-end">
                <button
                  ref={saveButtonRef}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 disabled:opacity-60"
                  onClick={onSaveWorkout}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : 'Save Workout'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Workouts with delete */}
        <WorkoutList workouts={workouts} onDelete={onDeleteWorkout} onEdit={onEditWorkout} />

        {/* Chart controls */}
        <div className="bg-white rounded-2xl shadow-soft p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Exercise</label>
              <select className="border rounded-xl px-3 py-2" value={exerciseFilter}
                      onChange={e=>setExerciseFilter(e.target.value)}>
                {exerciseOptions.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Metric</label>
              <select className="border rounded-xl px-3 py-2" value={metric}
                      onChange={e=>setMetric(e.target.value as any)}>
                <option value="volume">Weekly Volume</option>
                <option value="topSet">Weekly Top Set (kg)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Progress Chart */}
        <ProgressChart workouts={workouts} exerciseName={exerciseFilter} metric={metric} />
      </main>

      {/* Sticky Mobile Save Button */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t p-4 md:hidden">
        <button
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-3 disabled:opacity-60 font-medium"
          onClick={onSaveWorkout}
          disabled={saving || !selectedTemplate}
        >
          {saving ? 'Saving…' : 'Save Workout'}
        </button>
      </div>

      {/* Edit Workout Modal */}
      <EditWorkoutModal
        workout={editingWorkout}
        isOpen={isEditModalOpen}
        onClose={onCloseEditModal}
        onSave={onSaveEditedWorkout}
      />
    </div>
  )
}
