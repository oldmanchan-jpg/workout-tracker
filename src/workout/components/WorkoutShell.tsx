import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { normalizeTemplate } from '../adapters/TemplateAdapter';
import { PlanView } from './PlanView';
import { RunView } from './RunView';
import type { CanonicalWorkout } from '../types/canonical';

interface Props {
  template: any;
}

export function WorkoutShell({ template }: Props) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'plan' | 'run'>('plan');
  const [workout, setWorkout] = useState<CanonicalWorkout | null>(null);

  useEffect(() => {
    try {
      const normalized = normalizeTemplate(template);
      setWorkout(normalized);
      setViewMode(normalized.defaultMode);
    } catch (error) {
      console.error('Failed to normalize template:', error);
    }
  }, [template]);

  if (!workout) {
    return <div className="text-white">Loading workout...</div>;
  }

  return (
    <div className="max-w-[420px] mx-auto px-4 pb-28 pt-4">
      {/* Header with Plan/Run toggle */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">{workout.name}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('plan')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'plan'
                ? 'bg-[#29e33c] text-black'
                : 'bg-white/10 text-white/60'
            }`}
          >
            Plan
          </button>
          <button
            onClick={() => setViewMode('run')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'run'
                ? 'bg-[#29e33c] text-black'
                : 'bg-white/10 text-white/60'
            }`}
          >
            Run
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'run' ? (
        <RunView
          sections={workout.sections}
          onWorkoutComplete={() => {
            // Navigate back to dashboard
            navigate('/dashboard');
          }}
        />
      ) : (
        <PlanView sections={workout.sections} />
      )}
    </div>
  );
}
