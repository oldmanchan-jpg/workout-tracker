import { useState, useEffect, useRef } from 'react';

interface Props {
  duration: number; // seconds
  onComplete?: () => void;
  variant?: 'work' | 'rest';
  autoStart?: boolean;
}

export function Timer({ duration, onComplete, variant = 'work', autoStart = false }: Props) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isWarning = timeLeft <= 10 && timeLeft > 0;
  const isComplete = timeLeft === 0;

  const getStateLabel = () => {
    if (timeLeft === 0) return 'Complete';
    if (isRunning) return 'Running';
    return 'Paused';
  };

  return (
    <div
      className={`rounded-xl p-6 text-center ${
        variant === 'rest'
          ? 'bg-blue-500/20 border border-blue-500/30'
          : isComplete
            ? 'bg-[#29e33c]/20 border border-[#29e33c]/30'
            : isWarning
              ? 'bg-red-500/20 border border-red-500/30'
              : 'bg-white/5 border border-white/10'
      }`}
    >
      <div className="text-sm font-medium text-white/60 mb-2">{getStateLabel()}</div>
      <div
        className={`text-4xl font-bold mb-4 ${
          isComplete ? 'text-[#29e33c]' : isWarning ? 'text-red-500' : 'text-white'
        }`}
      >
        {formatTime(timeLeft)}
      </div>
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={() => {
            setTimeLeft(duration);
            setIsRunning(false);
          }}
          className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

