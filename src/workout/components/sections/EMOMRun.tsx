import { useState } from 'react';
import { Timer } from '../../primitives/Timer';
import type { EMOMSection } from '../../types/canonical';

interface Props {
  section: EMOMSection;
  onComplete: () => void;
}

export function EMOMRun({ section, onComplete }: Props) {
  const [currentMinute, setCurrentMinute] = useState(1);
  const [timerKey, setTimerKey] = useState(0);

  const isMinuteA = currentMinute % 2 === 1;
  const currentTasks = isMinuteA ? section.minuteA : section.minuteB;
  const nextStation = isMinuteA ? 'B' : 'A';

  const handleMinuteComplete = () => {
    if (currentMinute < section.durationMinutes) {
      setCurrentMinute(currentMinute + 1);
      setTimerKey(prev => prev + 1); // Force timer reset
    } else {
      onComplete();
    }
  };

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="text-center">
        <div className="text-sm text-white/60 mb-2">
          Minute {currentMinute} / {section.durationMinutes}
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#29e33c] transition-all duration-300"
            style={{ width: `${(currentMinute / section.durationMinutes) * 100}%` }}
          />
        </div>
      </div>

      {/* NOW card */}
      <div className="rounded-xl bg-[#29e33c]/10 border-2 border-[#29e33c] p-6">
        <div className="text-xs font-bold text-[#29e33c] uppercase tracking-wide mb-2">NOW</div>
        <div className="text-2xl font-bold text-white mb-1">Minute {currentMinute}</div>
        <div className="text-sm text-white/60 mb-4">
          Station {isMinuteA ? 'A' : 'B'} (every {isMinuteA ? 'odd' : 'even'} minute)
        </div>

        <div className="space-y-2">
          {currentTasks.map(task => (
            <div key={task.id} className="flex justify-between items-center py-2">
              <span className="text-white font-medium">{task.label}</span>
              <span className="text-[#29e33c] font-semibold">{task.target}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timer */}
      <Timer
        key={timerKey}
        duration={60}
        variant="work"
        autoStart={false}
        allowAdjust={true}
        presetSeconds={[10, 30, 45, 60, 90]}
        onComplete={handleMinuteComplete}
      />

      {/* Next preview */}
      {currentMinute < section.durationMinutes && (
        <div className="text-center text-sm text-white/60">Next: Station {nextStation}</div>
      )}
    </div>
  );
}

