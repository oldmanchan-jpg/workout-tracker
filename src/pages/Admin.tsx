import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile, Profile } from '../hooks/useProfile'
import { supabase } from '../lib/supabase'
import { Users, Shield, CheckCircle, XCircle, UserPlus, Mail, Upload, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import TopBar from '@/components/TopBar'
import type { Template } from '../types'
import {
  fetchAssignmentsForClient,
  fetchClientProfiles,
  fetchTemplatesForCurrentUserFromSupabase,
  importTemplatesFromJSON,
  loadTemplatesFromStorage,
  saveTemplatesToStorage,
  setAssignmentsForClient,
  upsertTemplatesToSupabase
} from '../services/workoutService'

export default function Admin() {
  const navigate = useNavigate()
  const { isAdmin, loading: profileLoading } = useProfile()
  const [clients, setClients] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  
  // Template import state
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)
  const [templateCount, setTemplateCount] = useState(0)
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>([])

  // Assignment UI state (minimal)
  const [assignmentClients, setAssignmentClients] = useState<Array<{ id: string; email: string | null }>>([])
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [assignedTemplateIds, setAssignedTemplateIds] = useState<string[]>([])
  const [assignmentStatus, setAssignmentStatus] = useState<string | null>(null)

  // Redirect non-admins
  useEffect(() => {
    if (!profileLoading && !isAdmin) {
      navigate('/')
    }
  }, [isAdmin, profileLoading, navigate])

  // Fetch all clients
  useEffect(() => {
    async function fetchClients() {
      if (!isAdmin) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching clients:', error)
      } else {
        setClients(data || [])
      }
      setLoading(false)
    }

    if (isAdmin) {
      fetchClients()
    }
  }, [isAdmin])

  // Load templates (Supabase) for admin
  useEffect(() => {
    async function loadTemplates() {
      if (!isAdmin) return
      setTemplatesLoading(true)
      try {
        const templates = await fetchTemplatesForCurrentUserFromSupabase()
        setAvailableTemplates(templates)
        setTemplateCount(templates.length)
      } finally {
        setTemplatesLoading(false)
      }
    }

    if (isAdmin) loadTemplates()
  }, [isAdmin])

  // Load client list for assignments (minimal shape)
  useEffect(() => {
    async function loadAssignmentClients() {
      if (!isAdmin) return
      const rows = await fetchClientProfiles()
      setAssignmentClients(rows)
    }

    if (isAdmin) loadAssignmentClients()
  }, [isAdmin])

  // When a client is selected, load their assignments
  useEffect(() => {
    async function loadAssignments() {
      if (!isAdmin) return
      if (!selectedClientId) {
        setAssignedTemplateIds([])
        return
      }
      const ids = await fetchAssignmentsForClient(selectedClientId)
      setAssignedTemplateIds(ids)
    }

    loadAssignments()
  }, [isAdmin, selectedClientId])

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      setImportError('Please select a JSON file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setImportText(text)
      setImportError(null)
    }
    reader.onerror = () => {
      setImportError('Error reading file')
    }
    reader.readAsText(file)
  }

  // Handle import
  const handleImport = async () => {
    if (!importText.trim()) {
      setImportError('Please paste or upload JSON content')
      return
    }

    setImportError(null)
    setImportSuccess(false)

    const result = importTemplatesFromJSON(importText)
    
    if (!result.success || !result.templates) {
      setImportError(result.error || 'Import failed')
      return
    }

    setTemplatesLoading(true)
    const upsertResult = await upsertTemplatesToSupabase(result.templates)
    setTemplatesLoading(false)

    if (!upsertResult.success) {
      setImportError(upsertResult.error || 'Failed to save templates to Supabase')
      return
    }

    // Optional: keep localStorage save as admin-only backup
    const existing = loadTemplatesFromStorage()
    const merged = [...existing, ...result.templates]
    const uniqueMap = new Map<string, Template>()
    merged.forEach(t => uniqueMap.set(t.id, t))
    saveTemplatesToStorage(Array.from(uniqueMap.values()))

    // Refresh available templates from Supabase
    setTemplatesLoading(true)
    const templates = await fetchTemplatesForCurrentUserFromSupabase()
    setAvailableTemplates(templates)
    setTemplateCount(templates.length)
    setTemplatesLoading(false)

    setImportSuccess(true)
    setImportText('')
    setTimeout(() => setImportSuccess(false), 3000)
  }

  // Toggle client active status
  const toggleActiveStatus = async (clientId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('id', clientId)

    if (error) {
      console.error('Error updating status:', error)
      alert('Failed to update client status')
    } else {
      setClients(clients.map(c => 
        c.id === clientId ? { ...c, is_active: !currentStatus } : c
      ))
    }
  }

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen page-container bg-black">
        <TopBar />
        <main className="max-w-lg mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-24 bg-[#141416] rounded-[21px] border border-white/5" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-28 bg-[#141416] rounded-[16px] border border-white/5" />
              <div className="h-28 bg-[#141416] rounded-[16px] border border-white/5" />
            </div>
            <div className="h-64 bg-[#141416] rounded-[21px] border border-white/5" />
          </div>
        </main>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const activeClients = clients.filter(c => c.is_active).length
  const inactiveClients = clients.length - activeClients

  return (
    <div className="min-h-screen page-container bg-black">
      <TopBar />
      
      <main className="mx-auto w-full max-w-[420px] px-4 pt-4 space-y-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4 flex items-center gap-4"
        >
          <div 
            className="w-14 h-14 bg-[#29e33c] rounded-full flex items-center justify-center"
            style={{ boxShadow: '0 0 30px rgba(41, 227, 60, 0.4)' }}
          >
            <Shield className="w-7 h-7 text-black" />
          </div>
          <div>
            <h1 className="text-white text-2xl font-semibold">Admin Panel</h1>
            <p className="text-[#9a9fa4] text-sm">Manage your clients</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="bg-[#141416] rounded-[16px] p-4 border border-white/5">
            <div 
              className="w-10 h-10 bg-[#29e33c]/20 rounded-full flex items-center justify-center mb-3"
            >
              <Users className="w-5 h-5 text-[#29e33c]" />
            </div>
            <p className="text-3xl font-bold text-white">{clients.length}</p>
            <p className="text-[#9a9fa4] text-sm">Total Clients</p>
          </div>

          <div className="bg-[#141416] rounded-[16px] p-4 border border-white/5">
            <div 
              className="w-10 h-10 bg-[#29e33c]/20 rounded-full flex items-center justify-center mb-3"
            >
              <CheckCircle className="w-5 h-5 text-[#29e33c]" />
            </div>
            <p 
              className="text-3xl font-bold text-[#29e33c]"
              style={{ textShadow: '0 0 20px rgba(41, 227, 60, 0.3)' }}
            >
              {activeClients}
            </p>
            <p className="text-[#9a9fa4] text-sm">Active Now</p>
          </div>
        </motion.div>

        {/* Client List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#141416] rounded-[21px] overflow-hidden border border-white/5"
        >
          <div className="px-4 py-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Clients</h2>
              <span className="text-[#9a9fa4] text-sm">
                {inactiveClients > 0 && (
                  <span className="text-yellow-500">{inactiveClients} pending</span>
                )}
              </span>
            </div>
          </div>

          {clients.length === 0 ? (
            <div className="p-8 text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="mb-4"
              >
                <UserPlus className="w-16 h-16 text-[#9a9fa4] mx-auto" />
              </motion.div>
              <p className="text-white font-medium mb-2">No clients yet</p>
              <p className="text-[#9a9fa4] text-sm">
                Clients will appear here when they sign up
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {clients.map((client, index) => (
                <motion.div 
                  key={client.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (index * 0.05) }}
                  className="p-4 flex items-center gap-4 hover:bg-[#1c1c1f] transition-colors"
                >
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                      client.is_active 
                        ? 'bg-[#29e33c] text-black' 
                        : 'bg-[#1c1c1f] text-[#9a9fa4] border border-white/10'
                    }`}
                    style={client.is_active ? { boxShadow: '0 0 15px rgba(41, 227, 60, 0.3)' } : {}}
                  >
                    {(client.full_name || client.email).charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {client.full_name || client.email}
                    </p>
                    {client.full_name && (
                      <p className="text-[#9a9fa4] text-sm truncate flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {client.email}
                      </p>
                    )}
                    <p className="text-[#9a9fa4] text-xs mt-1">
                      Joined {new Date(client.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleActiveStatus(client.id, client.is_active)}
                    className={`px-4 py-2 rounded-[10px] flex items-center gap-2 font-medium text-sm transition-all ${
                      client.is_active
                        ? 'bg-[#29e33c] text-black'
                        : 'bg-[#1c1c1f] text-[#9a9fa4] hover:bg-[#29e33c]/20 hover:text-[#29e33c] border border-white/10'
                    }`}
                    style={client.is_active ? { boxShadow: '0 0 15px rgba(41, 227, 60, 0.3)' } : {}}
                  >
                    {client.is_active ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Activate
                      </>
                    )}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Import Workout Templates Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#141416] rounded-[21px] overflow-hidden border border-white/5"
        >
          <div className="px-4 py-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Import Workout Templates</h2>
              <span className="text-[#9a9fa4] text-sm">
                Currently loaded: {templateCount} templates
              </span>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Upload JSON File
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="template-file-input"
                />
                <label
                  htmlFor="template-file-input"
                  className="flex items-center gap-2 px-4 py-3 bg-black/20 border border-white/10 rounded-[10px] cursor-pointer hover:bg-black/30 transition-colors"
                >
                  <Upload className="w-5 h-5 text-[#29e33c]" />
                  <span className="text-white text-sm">Choose JSON file</span>
                </label>
              </div>
            </div>

            {/* Textarea Paste */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Or Paste JSON
              </label>
              <textarea
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value)
                  setImportError(null)
                  setImportSuccess(false)
                }}
                placeholder='Paste JSON here, e.g.:\n[\n  {\n    "name": "My Workout",\n    "exercises": [\n      { "name": "Bench Press", "sets": 4, "reps": 12, "weight": 45 }\n    ]\n  }\n]'
                className="w-full h-32 px-4 py-3 bg-black/20 border border-white/10 rounded-[10px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#29e33c]/50 resize-none font-mono text-sm"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              />
            </div>

            {/* Error Message */}
            {importError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-[10px] p-3 flex items-start gap-2"
              >
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-500 text-sm">{importError}</p>
              </motion.div>
            )}

            {/* Success Message */}
            {importSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#29e33c]/10 border border-[#29e33c]/20 rounded-[10px] p-3 flex items-start gap-2"
              >
                <CheckCircle className="w-5 h-5 text-[#29e33c] flex-shrink-0 mt-0.5" />
                <p className="text-[#29e33c] text-sm">Templates imported successfully!</p>
              </motion.div>
            )}

            {/* Import Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleImport}
              disabled={!importText.trim() || templatesLoading}
              className="w-full py-3 bg-[#29e33c] text-black font-semibold rounded-[10px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hp-glow-soft"
            >
              <FileText className="w-5 h-5" />
              {templatesLoading ? 'Importing...' : 'Import Templates'}
            </motion.button>
          </div>
        </motion.div>

        {/* Assign Templates Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-[#141416] rounded-[21px] overflow-hidden border border-white/5"
        >
          <div className="px-4 py-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Assign Templates</h2>
              <span className="text-[#9a9fa4] text-sm">{availableTemplates.length} templates</span>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Client</label>
              <select
                value={selectedClientId}
                onChange={(e) => {
                  setSelectedClientId(e.target.value)
                  setAssignmentStatus(null)
                }}
                className="ui-input w-full px-4 py-3 appearance-none font-medium text-sm cursor-pointer bg-black/20 border-white/10 text-white"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              >
                <option value="" className="bg-[#141416]">Select a client…</option>
                {assignmentClients.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#141416]">
                    {c.email || c.id}
                  </option>
                ))}
              </select>
            </div>

            {selectedClientId && (
              <div className="space-y-2">
                <p className="text-[#9a9fa4] text-sm">Templates</p>

                {availableTemplates.length === 0 ? (
                  <div className="bg-black/20 border border-white/10 rounded-[10px] p-3">
                    <p className="text-[#9a9fa4] text-sm">No templates available to assign yet. Import templates first.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableTemplates.map((t) => {
                      const checked = assignedTemplateIds.includes(t.id)
                      return (
                        <label
                          key={t.id}
                          className="flex items-center gap-3 bg-black/20 border border-white/10 rounded-[10px] px-3 py-2 cursor-pointer hover:bg-black/30 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setAssignmentStatus(null)
                              setAssignedTemplateIds((prev) => {
                                if (e.target.checked) return Array.from(new Set([...prev, t.id]))
                                return prev.filter((id) => id !== t.id)
                              })
                            }}
                            className="accent-[#29e33c]"
                          />
                          <span className="text-white text-sm font-medium">{t.name}</span>
                          <span className="text-[#9a9fa4] text-xs ml-auto">{t.id}</span>
                        </label>
                      )
                    })}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={templatesLoading}
                  onClick={async () => {
                    if (!selectedClientId) return
                    setAssignmentStatus(null)
                    setTemplatesLoading(true)
                    const res = await setAssignmentsForClient(selectedClientId, assignedTemplateIds)
                    setTemplatesLoading(false)
                    if (!res.success) {
                      setAssignmentStatus(res.error || 'Failed to save assignments')
                      return
                    }
                    setAssignmentStatus('Assignments saved.')
                  }}
                  className="w-full py-3 bg-[#29e33c] text-black font-semibold rounded-[10px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hp-glow-soft"
                >
                  {templatesLoading ? 'Saving...' : 'Save Assignments'}
                </motion.button>

                {assignmentStatus && (
                  <div className="bg-black/20 border border-white/10 rounded-[10px] p-3">
                    <p className="text-white text-sm">{assignmentStatus}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        {clients.length > 0 && inactiveClients > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-yellow-500/10 border border-yellow-500/20 rounded-[16px] p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-yellow-500 font-medium text-sm">
                  {inactiveClients} client{inactiveClients > 1 ? 's' : ''} awaiting approval
                </p>
                <p className="text-[#9a9fa4] text-xs mt-1">
                  Activate clients to give them access to the app
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
