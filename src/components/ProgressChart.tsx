import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Workout } from '@/types'

type Metric = 'volume' | 'topSet'

function weekKey(d: Date) {
  const dt = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const firstDay = new Date(Date.UTC(dt.getUTCFullYear(),0,1))
  const dayOfYear = Math.floor((dt.getTime()-firstDay.getTime())/(1000*60*60*24))+1
  const week = Math.ceil(dayOfYear/7)
  return `${dt.getUTCFullYear()}-W${String(week).padStart(2,'0')}`
}

export default function ProgressChart({
  workouts,
  exerciseName,
  metric,
}: {
  workouts: Workout[]
  exerciseName: string
  metric: Metric
}) {
  const data = useMemo(() => {
    const map = new Map<string, number>()
    workouts.forEach(w => {
      const wk = weekKey(new Date(w.date))
      const sets = w.exercises
        .filter(e => e.name.toLowerCase().includes(exerciseName.toLowerCase()))
        .flatMap(e => e.sets)
      let value = 0
      if (metric === 'volume') {
        value = sets.reduce((acc, s) => acc + (s.reps * (s.weight || 0)), 0)
        map.set(wk, (map.get(wk) || 0) + value)
      } else {
        value = sets.reduce((acc, s) => Math.max(acc, s.weight || 0), 0)
        map.set(wk, Math.max(map.get(wk) || 0, value))
      }
    })
    return Array.from(map.entries())
      .sort((a,b)=>a[0].localeCompare(b[0]))
      .map(([name, value]) => ({ name, value }))
  }, [workouts, exerciseName, metric])

  return (
    <div className="bg-white rounded-2xl shadow-soft p-4">
      <h3 className="font-semibold mb-3">
        {metric === 'volume' ? 'Weekly Volume' : 'Weekly Top Set'} — {exerciseName || 'All'}
      </h3>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {data.length === 0 && (
        <div className="text-gray-500 text-sm mt-2">
          {metric === 'volume' 
            ? `Log workouts with ${exerciseName || 'exercises'} (including reps and weight) to see volume progress.`
            : `Log workouts with ${exerciseName || 'exercises'} to see your top set progress.`
          }
        </div>
      )}
    </div>
  )
}
