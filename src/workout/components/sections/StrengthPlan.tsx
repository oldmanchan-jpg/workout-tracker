import type { StrengthSection } from '../../types/canonical';

interface Props {
  section: StrengthSection;
}

export function StrengthPlan({ section }: Props) {
  return (
    <div className="space-y-3">
      {section.exercises.map(exercise => (
        <div 
          key={exercise.id}
          className="rounded-lg border border-white/10 bg-white/5 p-4"
        >
          <div className="text-base font-semibold text-white mb-2">
            {exercise.name}
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-white/60">Sets</div>
              <div className="text-white font-medium">{exercise.sets}</div>
            </div>
            <div>
              <div className="text-white/60">Reps</div>
              <div className="text-white font-medium">{exercise.reps}</div>
            </div>
            <div>
              <div className="text-white/60">Weight</div>
              <div className="text-white font-medium">
                {exercise.weight ? `${exercise.weight} kg` : '-'}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
