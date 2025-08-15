
import React from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '@/firebase'

export default function TopBar() {
  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="font-semibold">Workout App</div>
        <button onClick={()=>signOut(auth)} className="text-sm px-3 py-1 rounded-lg border">Sign out</button>
      </div>
    </div>
  )
}
