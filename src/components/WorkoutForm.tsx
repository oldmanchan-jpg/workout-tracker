
import React, { useEffect, useState } from 'react'
import type { Template, Workout, ExerciseEntry } from '@/types'
import { getExerciseMedia, defaultExerciseImage } from '@/data/exerciseMedia'

type Props = {
  template?: Template | null
  onSave: (w: Omit<Workout, 'id' | 'userId'>) => Promise<void>
}

export default function WorkoutForm({ template, onSave }: Props) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10))
  const [notes, setNotes] = useState('')
  const [exercises, setExercises] = useState<ExerciseEntry[]>([])

  useEffect(()=>{
    if (template) {
      const entries: ExerciseEntry[] = template.exercises.map((e, idx) => ({
        id: String(idx+1),
        name: e.name,
        sets: Array.from({length: e.sets}, ()=>({ reps: e.reps, weight: 0 }))
      }))
      setExercises(entries)
    }
  }, [template])

  const updateSet = (ei: number, si: number, field: 'reps'|'weight', val: number) => {
    setExercises(prev => prev.map((ex, i) => i!==ei ? ex : {
      ...ex,
      sets: ex.sets.map((s, j) => j!==si ? s : { ...s, [field]: val })
    }))
  }

  const addExercise = () => setExercises(prev => ([...prev, { id: crypto.randomUUID(), name: 'New Exercise', sets: [{ reps: 8, weight: 0 }]}]))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave({ date: new Date(date).toISOString(), notes, exercises })
    setNotes('')
  }

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-soft p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Date</label>
          <input className="w-full border rounded-xl px-3 py-2" type="date" value={date} onChange={e=>setDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Notes</label>
          <input className="w-full border rounded-xl px-3 py-2" placeholder="Optional" value={notes} onChange={e=>setNotes(e.target.value)} />
        </div>
      </div>

      <div className="space-y-4">
        {exercises.map((ex, ei) => {
          const exerciseMedia = getExerciseMedia(ex.name) || defaultExerciseImage
          return (
            <div key={ex.id} className="border rounded-xl p-3">
              <div className="flex items-center gap-3 mb-3">
                {/* Exercise Image - Smaller and Inline */}
                <div 
                  className="w-10 h-10 bg-cover bg-center rounded-lg flex-shrink-0"
                  style={{ backgroundImage: `url(${exerciseMedia.url})` }}
                  title={exerciseMedia.altText}
                />
                
                {/* Exercise Name Input */}
                <input className="flex-1 border rounded-lg px-2 py-1" value={ex.name} onChange={e=>{
                  const name = e.target.value
                  setExercises(prev => prev.map((x,i)=> i===ei ? { ...x, name } : x))
                }} />
                <button type="button" className="text-sm px-3 py-1 border rounded-lg" onClick={()=>{
                  setExercises(prev => prev.filter((_,i)=>i!==ei))
                }}>Remove</button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ex.sets.map((s, si) => (
                  <div key={si} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-6">S{si+1}</span>
                    <input className="w-full border rounded-lg px-2 py-1" type="number" min={1} value={s.reps}
                      onChange={e=>updateSet(ei, si, 'reps', Number(e.target.value))} />
                    <input className="w-full border rounded-lg px-2 py-1" type="number" step="0.5" value={s.weight}
                      onChange={e=>updateSet(ei, si, 'weight', Number(e.target.value))} placeholder="kg" />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        <button type="button" className="rounded-xl border px-3 py-2" onClick={addExercise}>+ Add Exercise</button>
      </div>

      <div className="flex justify-end">
        <button className="bg-brand.green text-white rounded-xl px-4 py-2">Save Workout</button>
      </div>
    </form>
  )
}
