import type { EMOMSection } from '../../types/canonical';

interface Props {
  section: EMOMSection;
}

export function EMOMPlan({ section }: Props) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-white/80">
        Total Duration: {section.durationMinutes} minutes
      </div>
      
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-white mb-2">
          Minute A (Odd: 1, 3, 5...)
        </div>
        <div className="space-y-2">
          {section.minuteA.map(task => (
            <div key={task.id} className="flex justify-between text-sm">
              <span className="text-white/90">{task.label}</span>
              <span className="text-white/60">{task.target}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-white mb-2">
          Minute B (Even: 2, 4, 6...)
        </div>
        <div className="space-y-2">
          {section.minuteB.map(task => (
            <div key={task.id} className="flex justify-between text-sm">
              <span className="text-white/90">{task.label}</span>
              <span className="text-white/60">{task.target}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
