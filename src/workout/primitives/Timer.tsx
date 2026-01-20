import { useState, useEffect, useRef } from 'react';

interface Props {
  duration: number; // seconds
  onComplete?: () => void;
  variant?: 'work' | 'rest';
  autoStart?: boolean;
  allowAdjust?: boolean;
}

export function Timer({ duration, onComplete, variant = 'work', autoStart = false, allowAdjust = false }: Props) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [showPicker, setShowPicker] = useState(false);
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

  const handleTimeTap = () => {
    if (allowAdjust && !isRunning) {
      setShowPicker(true);
    }
  };

  const handlePickerChange = (minutes: number, seconds: number) => {
    const totalSeconds = minutes * 60 + seconds;
    setTimeLeft(totalSeconds);
    timeLeftRef.current = totalSeconds;
    
    if (totalSeconds > 0) {
      hasCompletedRef.current = false;
    }
  };

  const closePicker = () => {
    setShowPicker(false);
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
        onClick={handleTimeTap}
        className={`text-4xl font-bold mb-2 ${
          isComplete ? 'text-[#29e33c]' : isWarning ? 'text-red-500' : 'text-white'
        } ${
          allowAdjust && !isRunning ? 'cursor-pointer active:opacity-70 transition-opacity' : ''
        }`}
      >
        {formatTime(timeLeft)}
      </div>
      {allowAdjust && !isRunning && (
        <div className="text-xs text-white/40 mb-4">Tap time to adjust</div>
      )}
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
      {showPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/50"
          onClick={closePicker}
        >
          <div
            className="w-full bg-gray-900 rounded-t-2xl p-6 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="text-lg font-semibold text-white">Adjust Timer</div>
              <button
                onClick={closePicker}
                className="text-white/60 hover:text-white text-sm font-medium"
              >
                Done
              </button>
            </div>
            <div className="flex gap-8 justify-center items-center">
              <div className="flex-1">
                <label className="block text-sm text-white/60 mb-2 text-center">Minutes</label>
                <select
                  value={Math.floor(timeLeft / 60)}
                  onChange={(e) => {
                    const minutes = parseInt(e.target.value, 10);
                    const currentSeconds = timeLeft % 60;
                    const roundedSeconds = Math.round(currentSeconds / 5) * 5;
                    handlePickerChange(minutes, roundedSeconds);
                  }}
                  className="w-full text-2xl font-bold text-white bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-center appearance-none"
                  style={{ WebkitAppearance: 'none', appearance: 'none' }}
                >
                  {Array.from({ length: 11 }, (_, i) => (
                    <option key={i} value={i} className="bg-gray-900 text-white">
                      {i}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-2xl font-bold text-white/60">:</div>
              <div className="flex-1">
                <label className="block text-sm text-white/60 mb-2 text-center">Seconds</label>
                <select
                  value={Math.min(55, Math.round((timeLeft % 60) / 5) * 5)}
                  onChange={(e) => {
                    const seconds = parseInt(e.target.value, 10);
                    const minutes = Math.floor(timeLeft / 60);
                    handlePickerChange(minutes, seconds);
                  }}
                  className="w-full text-2xl font-bold text-white bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-center appearance-none"
                  style={{ WebkitAppearance: 'none', appearance: 'none' }}
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const value = i * 5;
                    return (
                      <option key={value} value={value} className="bg-gray-900 text-white">
                        {value.toString().padStart(2, '0')}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

