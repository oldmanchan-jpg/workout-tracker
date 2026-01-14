import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile, Profile } from '../hooks/useProfile'
import { supabase } from '../lib/supabase'
import { Users, Shield, CheckCircle, XCircle, UserPlus } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Admin() {
  const navigate = useNavigate()
  const { isAdmin, loading: profileLoading } = useProfile()
  const [clients, setClients] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <p className="text-gray-900 font-bold text-lg">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header - WHITE CARD */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-6 sm:p-8 shadow-2xl border-2 border-orange-100"
        >
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-700 text-base sm:text-lg font-medium">Manage your clients and their access</p>
            </div>
          </div>
        </motion.div>

        {/* Stats - WHITE CARDS */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border-2 border-gray-200"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 mx-auto">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900 mb-1">{clients.length}</p>
              <p className="text-sm font-bold text-gray-600 uppercase">Total Clients</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border-2 border-gray-200"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 mx-auto">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600 mb-1">
                {clients.filter(c => c.is_active).length}
              </p>
              <p className="text-sm font-bold text-gray-600 uppercase">Active Now</p>
            </div>
          </motion.div>
        </div>

        {/* Client List - WHITE CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200"
        >
          <div className="p-5 sm:p-6 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-6 h-6 text-orange-600" />
              Client List
            </h2>
          </div>

          {clients.length === 0 ? (
            <div className="p-12 text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="mb-6"
              >
                <UserPlus className="w-24 h-24 text-gray-300 mx-auto" />
              </motion.div>
              <p className="text-gray-600 font-bold text-xl mb-2">No clients yet</p>
              <p className="text-gray-500 text-base">
                Clients will appear here when they sign up and await your approval.
              </p>
            </div>
          ) : (
            <div className="divide-y-2 divide-gray-200">
              {clients.map((client, index) => (
                <motion.div 
                  key={client.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (index * 0.1), duration: 0.4 }}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-lg ${
                      client.is_active ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                      {(client.full_name || client.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-bold text-lg">
                        {client.full_name || client.email}
                      </p>
                      {client.full_name && (
                        <p className="text-gray-600 text-sm font-medium">{client.email}</p>
                      )}
                      <p className="text-gray-500 text-sm font-semibold mt-1">
                        Joined {new Date(client.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleActiveStatus(client.id, client.is_active)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-base transition-all shadow-lg ${
                      client.is_active
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/30'
                        : 'bg-gray-600 hover:bg-gray-700 text-white shadow-gray-600/30'
                    }`}
                  >
                    {client.is_active ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        Activate
                      </>
                    )}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
