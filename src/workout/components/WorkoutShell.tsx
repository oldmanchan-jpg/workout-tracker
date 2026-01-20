import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { normalizeTemplate } from '../adapters/TemplateAdapter';
import { PlanView } from './PlanView';
import { RunView } from './RunView';
import type { CanonicalWorkout } from '../types/canonical';
import NotesModal from '../../components/NotesModal';
import { FileText } from 'lucide-react';

interface Props {
  template: any;
}

export function WorkoutShell({ template }: Props) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'plan' | 'run'>('plan');
  const [workout, setWorkout] = useState<CanonicalWorkout | null>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [hasNotes, setHasNotes] = useState(false);

  useEffect(() => {
    try {
      const normalized = normalizeTemplate(template);
      setWorkout(normalized);
      setViewMode(normalized.defaultMode);
    } catch (error) {
      console.error('Failed to normalize template:', error);
    }
  }, [template]);

  // Set data attributes on body to signal Run mode and workout ID (for BottomNav/NotesModal)
  useEffect(() => {
    if (viewMode === 'run') {
      document.body.setAttribute('data-workout-mode', 'run');
      const workoutId = workout?.id || template?.id || 'workout';
      document.body.setAttribute('data-workout-id', workoutId);
    } else {
      document.body.removeAttribute('data-workout-mode');
      document.body.removeAttribute('data-workout-id');
    }
    return () => {
      document.body.removeAttribute('data-workout-mode');
      document.body.removeAttribute('data-workout-id');
    };
  }, [viewMode, workout, template]);

  // Get notes key for indicator (matches NotesModal logic)
  const getNotesKey = (): string => {
    const today = new Date().toISOString().split('T')[0];
    const workoutId = workout?.id || template?.id || 'workout';
    return `workout_notes::${today}::${workoutId}::run`;
  };

  useEffect(() => {
    if (viewMode === 'run' && workout) {
      const key = getNotesKey();
      const saved = localStorage.getItem(key);
      setHasNotes(!!saved && saved.trim().length > 0);
    } else {
      setHasNotes(false);
    }
  }, [viewMode, workout, isNotesModalOpen]);

  if (!workout) {
    return <div className="text-white">Loading workout...</div>;
  }

  return (
    <div className="max-w-[420px] mx-auto px-4 pb-28 pt-4">
      {/* Header with Plan/Run toggle */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">{workout.name}</h2>
        <div className="flex gap-2 items-center">
          {viewMode === 'run' && (
            <button
              onClick={() => setIsNotesModalOpen(true)}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 text-white/70 hover:text-white hover:bg-white/15 transition-colors"
              aria-label="Open notes"
            >
              {hasNotes && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#f87171] border border-[#0b0d10]" />
              )}
              <FileText size={18} strokeWidth={2} />
            </button>
          )}
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

      {/* Notes Modal */}
      <NotesModal isOpen={isNotesModalOpen} onClose={() => setIsNotesModalOpen(false)} />
    </div>
  );
}
