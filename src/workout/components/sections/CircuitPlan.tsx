import type { CircuitSection } from '../../types/canonical';

interface Props {
  section: CircuitSection;
}

export function CircuitPlan({ section }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-sm">
        <div>
          <span className="text-white/60">Rounds:</span>
          <span className="text-white font-semibold ml-2">{section.rounds}</span>
        </div>
        <div>
          <span className="text-white/60">Rest:</span>
          <span className="text-white font-semibold ml-2">
            {section.restBetweenRoundsSeconds}s
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {section.stations.map(station => (
          <div 
            key={station.id}
            className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#29e33c]/20 text-[#29e33c] text-xs font-bold">
              {station.order}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{station.label}</div>
              <div className="text-xs text-white/60">{station.target}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
