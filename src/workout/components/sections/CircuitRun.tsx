import { useState } from 'react';
import { Timer } from '../../primitives/Timer';
import type { CircuitSection } from '../../types/canonical';

interface Props {
  section: CircuitSection;
  onComplete: () => void;
}

export function CircuitRun({ section, onComplete }: Props) {
  const [currentRound, setCurrentRound] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [stationStates, setStationStates] = useState(section.stations.map(() => false));
  const [timerKey, setTimerKey] = useState(0);

  const allStationsComplete = stationStates.every(s => s);
  const isLastRound = currentRound === section.rounds;

  const handleCompleteRound = () => {
    if (isLastRound) {
      onComplete();
    } else {
      setIsResting(true);
      setTimerKey(prev => prev + 1);
    }
  };

  const handleRestComplete = () => {
    setIsResting(false);
    setCurrentRound(currentRound + 1);
    setStationStates(section.stations.map(() => false));
  };

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="text-center">
        <div className="text-sm text-white/60 mb-2">
          Round {currentRound} / {section.rounds}
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#29e33c] transition-all duration-300"
            style={{ width: `${(currentRound / section.rounds) * 100}%` }}
          />
        </div>
      </div>

      {!isResting ? (
        <>
          {/* Station checklist */}
          <div className="space-y-2">
            {section.stations.map((station, idx) => (
              <label
                key={station.id}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={stationStates[idx]}
                  onChange={() => {
                    const newStates = [...stationStates];
                    newStates[idx] = !newStates[idx];
                    setStationStates(newStates);
                  }}
                />
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#29e33c]/20 text-[#29e33c] text-xs font-bold shrink-0">
                  {station.order}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{station.label}</div>
                  <div className="text-xs text-white/60">{station.target}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Complete Round button */}
          <button
            disabled={!allStationsComplete}
            onClick={handleCompleteRound}
            className="w-full rounded-xl bg-[#29e33c] px-4 py-4 text-base font-semibold text-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#29e33c]/90 transition-colors"
          >
            {isLastRound ? 'Finish Circuit' : 'Complete Round'}
          </button>
        </>
      ) : (
        <>
          {/* Rest screen */}
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold text-white mb-2">Rest</h3>
            <p className="text-white/60">Prepare for Round {currentRound + 1}</p>
          </div>

          <Timer
            key={timerKey}
            duration={section.restBetweenRoundsSeconds}
            variant="rest"
            autoStart={true}
            onComplete={handleRestComplete}
          />
        </>
      )}
    </div>
  );
}

