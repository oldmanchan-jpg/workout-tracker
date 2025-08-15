import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/state/AuthContext'
import { createTemplate } from '@/lib/firestore'
import type { Template } from '@/types'
import { useToast, toast } from '@/components/Toaster'

type ImportedTemplate = {
  name: string
  exercises: { name: string; sets: number; reps: number }[]
}

export default function ImportTemplate() {
  const { user } = useAuth()
  const uid = user!.uid
  const { addToast } = useToast()
  
  const [importedTemplates, setImportedTemplates] = useState<ImportedTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTemplates, setSelectedTemplates] = useState<Set<number>>(new Set())

  const parseCSV = (content: string): ImportedTemplate[] => {
    const lines = content.trim().split('\n')
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row')
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    
    // Expected CSV format: Template Name,Exercise Name,Sets,Reps
    const templateNameIndex = headers.findIndex(h => h.includes('template') || h.includes('name'))
    const exerciseNameIndex = headers.findIndex(h => h.includes('exercise'))
    const setsIndex = headers.findIndex(h => h.includes('sets'))
    const repsIndex = headers.findIndex(h => h.includes('reps'))

    if (templateNameIndex === -1 || exerciseNameIndex === -1 || setsIndex === -1 || repsIndex === -1) {
      throw new Error('CSV must have columns for Template Name, Exercise Name, Sets, and Reps')
    }

    const templatesMap = new Map<string, ImportedTemplate>()

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(',').map(v => v.trim())
      if (values.length < Math.max(templateNameIndex, exerciseNameIndex, setsIndex, repsIndex) + 1) {
        continue // Skip incomplete rows
      }

      const templateName = values[templateNameIndex]
      const exerciseName = values[exerciseNameIndex]
      const sets = parseInt(values[setsIndex])
      const reps = parseInt(values[repsIndex])

      if (!templateName || !exerciseName || isNaN(sets) || isNaN(reps)) {
        continue // Skip invalid rows
      }

      if (!templatesMap.has(templateName)) {
        templatesMap.set(templateName, {
          name: templateName,
          exercises: []
        })
      }

      const template = templatesMap.get(templateName)!
      template.exercises.push({
        name: exerciseName,
        sets,
        reps
      })
    }

    return Array.from(templatesMap.values())
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        let templates: ImportedTemplate[] = []

        if (file.name.toLowerCase().endsWith('.csv')) {
          // Parse CSV
          templates = parseCSV(content)
        } else {
          // Parse JSON
          const data = JSON.parse(content)
          templates = Array.isArray(data) ? data : [data]
        }
        
        // Validate templates
        const validTemplates = templates.filter(template => 
          template.name && 
          Array.isArray(template.exercises) &&
          template.exercises.length > 0 &&
          template.exercises.every(ex => 
            ex.name && 
            typeof ex.sets === 'number' && 
            typeof ex.reps === 'number'
          )
        )

        if (validTemplates.length === 0) {
          addToast(toast.error('Invalid Format', 'No valid templates found in the file.'))
          return
        }

        setImportedTemplates(validTemplates)
        setSelectedTemplates(new Set(validTemplates.map((_, index) => index)))
        addToast(toast.success('Import Successful', `${validTemplates.length} template(s) found and ready to import.`))
      } catch (error) {
        addToast(toast.error('Parse Error', `Failed to parse the file: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    }
    reader.readAsText(file)
  }

  const toggleTemplateSelection = (index: number) => {
    const newSelected = new Set(selectedTemplates)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedTemplates(newSelected)
  }

  const selectAll = () => {
    setSelectedTemplates(new Set(importedTemplates.map((_, index) => index)))
  }

  const deselectAll = () => {
    setSelectedTemplates(new Set())
  }

  const importSelectedTemplates = async () => {
    if (selectedTemplates.size === 0) {
      addToast(toast.error('No Selection', 'Please select at least one template to import.'))
      return
    }

    setLoading(true)
    try {
      const templatesToImport = Array.from(selectedTemplates).map(index => importedTemplates[index])
      
      for (const template of templatesToImport) {
        await createTemplate(uid, {
          name: template.name,
          exercises: template.exercises
        })
      }

      addToast(toast.success('Import Complete', `Successfully imported ${templatesToImport.length} template(s).`))
      setImportedTemplates([])
      setSelectedTemplates(new Set())
    } catch (error) {
      addToast(toast.error('Import Failed', 'Failed to import templates. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const downloadSampleTemplate = () => {
    const sampleTemplate = {
      name: "Sample Workout Template",
      exercises: [
        { name: "Squat", sets: 3, reps: 5 },
        { name: "Bench Press", sets: 3, reps: 5 },
        { name: "Deadlift", sets: 1, reps: 5 }
      ]
    }

    const blob = new Blob([JSON.stringify(sampleTemplate, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-template.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadSampleCSV = () => {
    const csvContent = `Template Name,Exercise Name,Sets,Reps
Push Day,Chest Press,3,8
Push Day,Shoulder Press,3,10
Push Day,Tricep Dips,3,12
Pull Day,Deadlift,3,5
Pull Day,Barbell Rows,3,8
Pull Day,Bicep Curls,3,12
Leg Day,Squat,3,5
Leg Day,Lunges,3,10
Leg Day,Calf Raises,3,15`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-templates.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="font-semibold">Import Templates</div>
          <Link to="/templates" className="text-sm px-3 py-1 rounded-lg border">Back to Templates</Link>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-4 space-y-4">
        {/* File Upload Section */}
        <div className="bg-white rounded-2xl shadow-soft p-4">
          <h2 className="text-xl font-semibold mb-4">Import Templates from JSON</h2>
          
          <div className="space-y-4">
                         <div>
               <label className="block text-sm text-gray-600 mb-2">Upload JSON or CSV file</label>
               <input
                 type="file"
                 accept=".json,.csv"
                 onChange={handleFileUpload}
                 className="w-full border rounded-xl px-3 py-2"
               />
             </div>

                                    <div className="flex items-center gap-4">
               <button
                 onClick={downloadSampleTemplate}
                 className="text-sm border rounded-xl px-3 py-2 hover:bg-gray-50"
               >
                 Download Sample JSON
               </button>
               <button
                 onClick={downloadSampleCSV}
                 className="text-sm border rounded-xl px-3 py-2 hover:bg-gray-50"
               >
                 Download Sample CSV
               </button>
               <div className="text-sm text-gray-600">
                 Upload a JSON or CSV file containing workout templates
               </div>
             </div>
           
           <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
             <strong>Testing Tip:</strong> You can export your current templates from the Templates page and then import them back here for testing purposes.
           </div>
          </div>
        </div>

        {/* Imported Templates Preview */}
        {importedTemplates.length > 0 && (
          <div className="bg-white rounded-2xl shadow-soft p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Templates to Import</h3>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-sm border rounded-lg px-3 py-1 hover:bg-gray-50"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAll}
                  className="text-sm border rounded-lg px-3 py-1 hover:bg-gray-50"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {importedTemplates.map((template, index) => (
                <div
                  key={index}
                  className={`border rounded-xl p-3 cursor-pointer transition-colors ${
                    selectedTemplates.has(index) ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                  }`}
                  onClick={() => toggleTemplateSelection(index)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedTemplates.has(index)}
                      onChange={() => toggleTemplateSelection(index)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {template.exercises.length} exercise(s):{' '}
                        {template.exercises.map(ex => `${ex.name} (${ex.sets}×${ex.reps})`).join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={importSelectedTemplates}
                disabled={loading || selectedTemplates.size === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 disabled:opacity-60"
              >
                {loading ? 'Importing...' : `Import ${selectedTemplates.size} Template(s)`}
              </button>
            </div>
          </div>
        )}

                 {/* Instructions */}
         <div className="bg-white rounded-2xl shadow-soft p-4">
           <h3 className="text-lg font-semibold mb-3">How to Import Templates</h3>
           <div className="text-sm text-gray-600 space-y-2">
             <p><strong>JSON Format:</strong></p>
             <p>1. Prepare a JSON file with your workout templates</p>
             <p>2. Each template should have a name and an array of exercises</p>
             <p>3. Each exercise should have a name, number of sets, and number of reps</p>
             <p>4. You can import a single template or an array of multiple templates</p>
             <br />
             <p><strong>CSV Format:</strong></p>
             <p>1. Create a CSV with columns: Template Name, Exercise Name, Sets, Reps</p>
             <p>2. Each row represents one exercise in a template</p>
             <p>3. Multiple exercises for the same template should have the same template name</p>
             <p>4. Download the sample CSV to see the correct format</p>
           </div>
         </div>
      </main>
    </div>
  )
}
