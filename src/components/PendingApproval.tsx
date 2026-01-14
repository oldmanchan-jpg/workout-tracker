import { LogOut, Clock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function PendingApproval() {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)' }}>
          <Clock className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">
          Account Pending Approval
        </h1>
        
        <p className="text-gray-400 mb-6">
          Your account is waiting for trainer approval. You'll be able to access your workouts once approved.
        </p>
        
        <button
          onClick={signOut}
          className="flex items-center justify-center gap-2 w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
