import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile, Profile } from '../hooks/useProfile'
import { supabase } from '../lib/supabase'
import { Users, Shield, CheckCircle, XCircle } from 'lucide-react'

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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">Manage your clients</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">Total Clients</span>
            </div>
            <p className="text-2xl font-bold text-white">{clients.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Active Clients</span>
            </div>
            <p className="text-2xl font-bold text-green-500">
              {clients.filter(c => c.is_active).length}
            </p>
          </div>
        </div>

        {/* Client List */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Clients</h2>
          </div>

          {clients.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No clients yet. They'll appear here when they sign up.
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {clients.map(client => (
                <div key={client.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">
                      {client.full_name || client.email}
                    </p>
                    {client.full_name && (
                      <p className="text-gray-400 text-sm">{client.email}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                      Joined {new Date(client.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleActiveStatus(client.id, client.is_active)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      client.is_active
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                    }`}
                  >
                    {client.is_active ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Inactive
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
