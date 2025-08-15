import React, { useEffect, useState } from 'react'
import { useAuth } from '@/state/AuthContext'
import { createTemplate, listTemplates, updateTemplate, deleteTemplate } from '@/lib/firestore'
import type { Template } from '@/types'
import { Link } from 'react-router-dom'
import { useToast, toast } from '@/components/Toaster'

type Ex = { name: string; sets: number; reps: number }
type FormVals = { name: string; exercises: Ex[] }
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
  const [vals, setVals] = useState<FormVals>(initial)
  const addEx = () => setVals(v => ({ ...v, exercises: [...v.exercises, { name: 'Exercise', sets: 3, reps: 8 }] }))
  const rmEx = (i: number) => setVals(v => ({ ...v, exercises: v.exercises.filter((_, idx) => idx !== i) }))

  return (
    <div className="bg-white rounded-2xl shadow-soft p-4">
      <label className="block text-sm text-gray-600 mb-1">Template name</label>
      <input className="w-full border rounded-xl px-3 py-2 mb-3"
             value={vals.name}
             onChange={e=>setVals(v=>({ ...v, name: e.target.value }))} />

      <div className="space-y-2">
        <div className="text-sm font-medium">Exercises</div>
        {vals.exercises.map((ex, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <input className="col-span-6 border rounded-xl px-3 py-2" placeholder="Name" value={ex.name}
                   onChange={e=>setVals(v=>{ const arr=[...v.exercises]; arr[i]={...arr[i], name:e.target.value}; return {...v, exercises:arr} })}/>
            <input className="col-span-3 border rounded-xl px-3 py-2" type="number" min={1} value={ex.sets}
                   onChange={e=>setVals(v=>{ const arr=[...v.exercises]; arr[i]={...arr[i], sets:Number(e.target.value)}; return {...v, exercises:arr} })}/>
            <input className="col-span-3 border rounded-xl px-3 py-2" type="number" min={1} value={ex.reps}
                   onChange={e=>setVals(v=>{ const arr=[...v.exercises]; arr[i]={...arr[i], reps:Number(e.target.value)}; return {...v, exercises:arr} })}/>
            <button type="button" className="col-span-12 sm:col-span-2 text-sm border rounded-lg px-3 py-1"
                    onClick={()=>rmEx(i)}>Remove</button>
          </div>
        ))}
        <button type="button" className="border rounded-xl px-3 py-2" onClick={addEx}>+ Add Exercise</button>
      </div>

      <div className="flex gap-2 justify-end mt-4">
        {onCancel && <button className="border rounded-xl px-3 py-2" onClick={onCancel}>Cancel</button>}
        <button
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 disabled:opacity-60"
          onClick={()=>onSave(vals)}
        >
          Save
        </button>
      </div>
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
      await createTemplate(uid, { name: vals.name, exercises: vals.exercises })
      await refresh()
      addToast(toast.success('Template Created!', `Template "${vals.name}" has been successfully created.`))
    } catch (error) {
      addToast(toast.error('Create Failed', 'Failed to create template. Please try again.'))
    }
  }
  const onUpdate = async (id: string, vals: FormVals) => {
    try {
      await updateTemplate(uid, id, { name: vals.name, exercises: vals.exercises } as any)
      setEditingId(null)
      await refresh()
      addToast(toast.success('Template Updated!', `Template "${vals.name}" has been successfully updated.`))
    } catch (error) {
      addToast(toast.error('Update Failed', 'Failed to update template. Please try again.'))
    }
  }
  const onDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return
    try {
      const templateToDelete = templates.find(t => t.id === id)
      await deleteTemplate(uid, id)
      await refresh()
      addToast(toast.success('Template Deleted', `Template "${templateToDelete?.name || 'Unknown'}" has been successfully deleted.`))
    } catch (error) {
      addToast(toast.error('Delete Failed', 'Failed to delete template. Please try again.'))
    }
  }

  const exportTemplates = () => {
    if (templates.length === 0) {
      addToast(toast.error('No Templates', 'No templates to export.'))
      return
    }

    // Prepare templates for export (remove internal IDs)
    const exportData = templates.map(t => ({
      name: t.name,
      exercises: t.exercises
    }))

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workout-templates-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    addToast(toast.success('Export Complete', `${templates.length} template(s) exported successfully.`))
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="font-semibold">Templates</div>
          <div className="flex gap-2">
            <Link to="/import-template" className="text-sm px-3 py-1 rounded-lg border">Import</Link>
            <Link to="/app" className="text-sm px-3 py-1 rounded-lg border">Back to App</Link>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-4 space-y-4">
        <section>
          <h2 className="text-xl font-semibold mb-2">Create a new template</h2>
          <TemplateForm onSave={onCreate} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Your templates</h2>
            {!loading && templates.length > 0 && (
              <button
                onClick={exportTemplates}
                className="text-sm border rounded-xl px-3 py-2 hover:bg-gray-50"
              >
                Export All Templates
              </button>
            )}
          </div>
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
