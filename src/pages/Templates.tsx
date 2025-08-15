import React, { useEffect, useState } from 'react'
import { useAuth } from '@/state/AuthContext'
import { createTemplate, listTemplates, updateTemplate, deleteTemplate } from '@/lib/firestore'
import type { Template } from '@/types'
import { Link } from 'react-router-dom'
import { useToast, toast } from '@/components/Toaster'
import {
  clampInt, cleanName, validateTemplate, LIMITS,
  type TemplateDraft, type TemplateExerciseDraft
} from '@/lib/validation'

type Ex = TemplateExerciseDraft
type FormVals = TemplateDraft
const blank: FormVals = { name: 'New Template', exercises: [{ name: 'Squat', sets: 3, reps: 5 }] }

function TemplateForm({
  initial = blank,
  onSave,
  onCancel,
}: {
  initial?: FormVals
  onSave: (vals: FormVals) => Promise<void>
  onCancel?: () => void
}) {
  const { addToast } = useToast()
  const [vals, setVals] = useState<FormVals>({ ...initial })
  const [touched, setTouched] = useState(false)

  // recompute validity
  const { ok, errors } = validateTemplate(vals)

  const addEx = () =>
    setVals(v => ({ ...v, exercises: [...v.exercises, { name: 'Exercise', sets: 3, reps: 8 }] }))
  const rmEx = (i: number) =>
    setVals(v => ({ ...v, exercises: v.exercises.filter((_, idx) => idx !== i) }))

  const onNameBlur = () => setVals(v => ({ ...v, name: cleanName(v.name) }))
  const onExNameBlur = (i: number) =>
    setVals(v => {
      const arr = [...v.exercises]; arr[i] = { ...arr[i], name: cleanName(arr[i].name) }; return { ...v, exercises: arr }
    })

  const onClamp = (i: number, field: 'sets' | 'reps', min: number, max: number) =>
    setVals(v => {
      const arr = [...v.exercises]
      arr[i] = { ...arr[i], [field]: clampInt(Number(arr[i][field]), min, max) }
      return { ...v, exercises: arr }
    })

  const handleSave = async () => {
    setTouched(true)
    if (!ok) {
      addToast(toast.error('Please fix the highlighted fields.'))
      return
    }
    await onSave({ ...vals, name: cleanName(vals.name) })
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft p-4">
      <label className="block text-sm text-gray-600 mb-1">Template name</label>
      <input
        className={`w-full border rounded-xl px-3 py-2 mb-1 ${touched && errors.name ? 'border-red-500' : ''}`}
        value={vals.name}
        onChange={e=>setVals(v=>({ ...v, name: e.target.value }))}
        onBlur={onNameBlur}
        minLength={2}
      />
      {touched && errors.name && <div className="text-xs text-red-600 mb-2">{errors.name}</div>}

      <div className="space-y-2">
        <div className="text-sm font-medium">Exercises</div>
        {vals.exercises.map((ex, i) => {
          const err = errors.exercises?.[i] || {}
          return (
            <div key={i} className="grid grid-cols-12 gap-2 items-start">
              <input
                className={`col-span-6 border rounded-xl px-3 py-2 ${touched && err.name ? 'border-red-500' : ''}`}
                placeholder="Name"
                value={ex.name}
                onChange={e=>setVals(v=>{ const arr=[...v.exercises]; arr[i]={...arr[i], name:e.target.value}; return {...v, exercises:arr} })}
                onBlur={()=>onExNameBlur(i)}
              />
              <input
                className={`col-span-3 border rounded-xl px-3 py-2 ${touched && err.sets ? 'border-red-500' : ''}`}
                type="number" min={LIMITS.SETS_MIN} max={LIMITS.SETS_MAX}
                value={ex.sets}
                onChange={e=>setVals(v=>{ const arr=[...v.exercises]; arr[i]={...arr[i], sets:Number(e.target.value)}; return {...v, exercises:arr} })}
                onBlur={()=>onClamp(i,'sets',LIMITS.SETS_MIN,LIMITS.SETS_MAX)}
              />
              <input
                className={`col-span-3 border rounded-xl px-3 py-2 ${touched && err.reps ? 'border-red-500' : ''}`}
                type="number" min={1} max={50}
                value={ex.reps}
                onChange={e=>setVals(v=>{ const arr=[...v.exercises]; arr[i]={...arr[i], reps:Number(e.target.value)}; return {...v, exercises:arr} })}
                onBlur={()=>onClamp(i,'reps',1,50)}
              />
              <div className="col-span-12 sm:col-span-2 flex gap-2">
                <button type="button" className="text-sm border rounded-lg px-3 py-2" onClick={()=>rmEx(i)}>Remove</button>
              </div>
              {touched && (err.name || err.sets || err.reps) && (
                <div className="col-span-12 text-xs text-red-600">
                  {err.name && <span className="mr-3">Name: {err.name}</span>}
                  {err.sets && <span className="mr-3">Sets: {err.sets}</span>}
                  {err.reps && <span className="mr-3">Reps: {err.reps}</span>}
                </div>
              )}
            </div>
          )
        })}
        <button type="button" className="border rounded-xl px-3 py-2" onClick={addEx}>+ Add Exercise</button>
      </div>

      <div className="flex gap-2 justify-end mt-4">
        {onCancel && <button className="border rounded-xl px-3 py-2" onClick={onCancel}>Cancel</button>}
        <button
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 disabled:opacity-60"
          onClick={handleSave}
          disabled={!ok}
          title={!ok ? 'Fix errors before saving' : 'Save template'}
        >
          Save
        </button>
      </div>
      {!ok && touched && (
        <div className="text-xs text-gray-500 mt-2">Tip: sets 1–10, reps 1–50, names ≥ 2 chars.</div>
      )}
    </div>
  )
}

export default function TemplatesPage() {
  const { user } = useAuth()
  const uid = user!.uid
  const { addToast } = useToast()
  const [templates, setTemplates] = useState<Template[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    const ts = await listTemplates(uid)
    setTemplates(ts)
    setLoading(false)
  }
  useEffect(()=>{ refresh() }, [])

  const onCreate = async (vals: FormVals) => {
    try {
      await createTemplate(uid, vals)
      await refresh()
      addToast(toast.success('Template created'))
    } catch (e:any) {
      addToast(toast.error(e.message ?? 'Failed to create template'))
    }
  }
  const onUpdate = async (id: string, vals: FormVals) => {
    try {
      await updateTemplate(uid, id, vals as any)
      setEditingId(null)
      await refresh()
      addToast(toast.success('Template updated'))
    } catch (e:any) {
      addToast(toast.error(e.message ?? 'Failed to update template'))
    }
  }
  const onDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return
    try {
      await deleteTemplate(uid, id)
      await refresh()
      addToast(toast.success('Template deleted'))
    } catch (e:any) {
      addToast(toast.error(e.message ?? 'Failed to delete template'))
    }
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="font-semibold">Templates</div>
          <div className="flex gap-2">
            <Link to="/import" className="text-sm border rounded-lg px-3 py-1">Import CSV</Link>
            <Link to="/app" className="text-sm border rounded-lg px-3 py-1">Back to App</Link>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-4 space-y-4">
        <section>
          <h2 className="text-xl font-semibold mb-2">Create a new template</h2>
          <TemplateForm onSave={onCreate} />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Your templates</h2>
          {loading && <div>Loading…</div>}
          {!loading && templates.length===0 && <div className="text-gray-600">No templates yet.</div>}
          <div className="space-y-4">
            {templates.map(t => (
              <div key={t.id} className="bg-white rounded-2xl shadow-soft p-4">
                {editingId === t.id ? (
                  <TemplateForm initial={{ name: t.name, exercises: t.exercises }}
                                onSave={(vals)=>onUpdate(t.id, vals)}
                                onCancel={()=>setEditingId(null)} />
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{t.name}</div>
                      <div className="flex gap-2">
                        <button className="text-sm border rounded-lg px-3 py-1" onClick={()=>setEditingId(t.id)}>Edit</button>
                        <button className="text-sm border rounded-lg px-3 py-1" onClick={()=>onDelete(t.id)}>Delete</button>
                      </div>
                    </div>
                    <ul className="mt-2 text-sm text-gray-700 grid sm:grid-cols-2 gap-1">
                      {t.exercises.map((e,i)=>(
                        <li key={i}>• {e.name} — {e.sets}×{e.reps}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
