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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0b' }}>
        <div className="text-center">
          <div 
            className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: '#22d3ee', borderTopColor: 'transparent' }}
          />
          <p style={{ color: '#52525b' }}>Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#0a0a0b' }}>
      <div className="max-w-lg mx-auto space-y-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 text-center"
          style={{ backgroundColor: '#141416', border: '1px solid #27272a' }}
        >
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ 
              background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
              boxShadow: '0 0 30px rgba(129, 140, 248, 0.3)'
            }}
          >
            <Shield className="w-8 h-8" style={{ color: '#0a0a0b' }} />
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#fafafa' }}>
            Admin Panel
          </h1>
          <p style={{ color: '#52525b' }}>Manage your clients</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-4"
            style={{ backgroundColor: '#141416', border: '1px solid #27272a' }}
          >
            <Users className="w-5 h-5 mb-2" style={{ color: '#22d3ee' }} />
            <div className="text-3xl font-bold" style={{ color: '#fafafa' }}>
              {clients.length}
            </div>
            <p className="text-sm" style={{ color: '#52525b' }}>Total Clients</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl p-4"
            style={{ backgroundColor: '#141416', border: '1px solid #27272a' }}
          >
            <CheckCircle className="w-5 h-5 mb-2" style={{ color: '#4ade80' }} />
            <div className="text-3xl font-bold" style={{ color: '#4ade80' }}>
              {clients.filter(c => c.is_active).length}
            </div>
            <p className="text-sm" style={{ color: '#52525b' }}>Active</p>
          </motion.div>
        </div>

        {/* Client List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: '#141416', border: '1px solid #27272a' }}
        >
          <div className="p-4" style={{ borderBottom: '1px solid #27272a' }}>
            <h2 className="font-semibold flex items-center gap-2" style={{ color: '#fafafa' }}>
              <Users className="w-5 h-5" style={{ color: '#22d3ee' }} />
              Clients
            </h2>
          </div>

          {clients.length === 0 ? (
            <div className="p-8 text-center">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <UserPlus className="w-16 h-16 mx-auto" style={{ color: '#27272a' }} />
              </motion.div>
              <p className="font-medium mb-1" style={{ color: '#a1a1aa' }}>No clients yet</p>
              <p className="text-sm" style={{ color: '#52525b' }}>
                They'll appear here when they sign up
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: '#1c1c1f' }}>
              {clients.map((client, index) => (
                <motion.div 
                  key={client.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (index * 0.1) }}
                  className="p-4 flex items-center gap-3"
                >
                  {/* Avatar */}
                  <div 
                    className="w-11 h-11 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                    style={{ 
                      backgroundColor: client.is_active ? 'rgba(74, 222, 128, 0.2)' : '#1c1c1f',
                      color: client.is_active ? '#4ade80' : '#52525b'
                    }}
                  >
                    {(client.full_name || client.email).charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: '#fafafa' }}>
                      {client.full_name || client.email}
                    </p>
                    {client.full_name && (
                      <p className="text-sm truncate" style={{ color: '#52525b' }}>
                        {client.email}
                      </p>
                    )}
                    <p className="text-xs" style={{ color: '#3f3f46' }}>
                      Joined {new Date(client.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Toggle Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleActiveStatus(client.id, client.is_active)}
                    className="px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 flex-shrink-0"
                    style={
                      client.is_active
                        ? { 
                            background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                            color: '#0a0a0b'
                          }
                        : { 
                            backgroundColor: '#1c1c1f',
                            border: '1px solid #3f3f46',
                            color: '#a1a1aa'
                          }
                    }
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
      </div>
    </div>
  )
}
