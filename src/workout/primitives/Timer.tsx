import { useState, useEffect, useRef } from 'react';

interface Props {
  duration: number; // seconds
  onComplete?: () => void;
  variant?: 'work' | 'rest';
  autoStart?: boolean;
  allowAdjust?: boolean;
  presetSeconds?: number[]; // Preset values in seconds
}

export function Timer({ duration, onComplete, variant = 'work', autoStart = false, allowAdjust = false, presetSeconds = [] }: Props) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<number | null>(null);
  const timeLeftRef = useRef(timeLeft);
  const onCompleteRef = useRef(onComplete);
  const hasCompletedRef = useRef(false);

  // Sync refs with latest values
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Handle duration changes when not running
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(duration);
      hasCompletedRef.current = false;
    }
  }, [duration, isRunning]);

  // Single interval controlled by isRunning
  useEffect(() => {
    if (isRunning && timeLeftRef.current > 0) {
      intervalRef.current = window.setInterval(() => {
        const current = timeLeftRef.current;
        const next = Math.max(current - 1, 0);
        
        setTimeLeft(next);
        timeLeftRef.current = next;
        
        if (next === 0 && !hasCompletedRef.current) {
          hasCompletedRef.current = true;
          setIsRunning(false);
          onCompleteRef.current?.();
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

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

  const adjustTime = (deltaSeconds: number) => {
    if (isRunning) return; // Only allow adjustment when paused
    
    const newTimeLeft = Math.max(0, timeLeft + deltaSeconds);
    setTimeLeft(newTimeLeft);
    timeLeftRef.current = newTimeLeft;
    
    if (newTimeLeft > 0) {
      hasCompletedRef.current = false;
    }
  };

  const setPresetTime = (presetSeconds: number) => {
    if (isRunning) return; // Only allow adjustment when paused
    
    const newTimeLeft = Math.max(0, presetSeconds);
    setTimeLeft(newTimeLeft);
    timeLeftRef.current = newTimeLeft;
    
    if (newTimeLeft > 0) {
      hasCompletedRef.current = false;
    }
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
            timeLeftRef.current = duration;
            setIsRunning(false);
            hasCompletedRef.current = false;
          }}
          className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
        >
          Reset
        </button>
      </div>
      {allowAdjust && !isRunning && (
        <div className="mt-3 space-y-2">
          {presetSeconds.length > 0 && (
            <div className="flex gap-2 justify-center flex-wrap">
              {presetSeconds.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setPresetTime(preset)}
                  className="min-h-[44px] px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
                >
                  {preset}s
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => adjustTime(-10)}
              className="min-h-[44px] px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
            >
              -10s
            </button>
            <button
              onClick={() => adjustTime(10)}
              className="min-h-[44px] px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
            >
              +10s
            </button>
            <button
              onClick={() => adjustTime(-60)}
              className="min-h-[44px] px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
            >
              -1m
            </button>
            <button
              onClick={() => adjustTime(60)}
              className="min-h-[44px] px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
            >
              +1m
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

