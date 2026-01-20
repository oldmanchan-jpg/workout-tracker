import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { WheelPicker } from './WheelPicker';

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
  const [selectedMinutes, setSelectedMinutes] = useState(0);
  const [selectedSeconds, setSelectedSeconds] = useState(0);
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
      // Initialize picker values from current timeLeft
      // Round seconds to nearest 5, clamp 0..55
      const mins = Math.min(10, Math.max(0, Math.floor(timeLeft / 60)));
      const secs = Math.min(55, Math.max(0, Math.round((timeLeft % 60) / 5) * 5));
      setSelectedMinutes(mins);
      setSelectedSeconds(secs);
      setShowPicker(true);
    }
  };

  const handleMinutesChange = (minutes: number) => {
    setSelectedMinutes(minutes);
    const totalSeconds = minutes * 60 + selectedSeconds;
    setTimeLeft(totalSeconds);
    timeLeftRef.current = totalSeconds;
    
    if (totalSeconds > 0) {
      hasCompletedRef.current = false;
    }
  };

  const handleSecondsChange = (seconds: number) => {
    setSelectedSeconds(seconds);
    const totalSeconds = selectedMinutes * 60 + seconds;
    setTimeLeft(totalSeconds);
    timeLeftRef.current = totalSeconds;
    
    if (totalSeconds > 0) {
      hasCompletedRef.current = false;
    }
  };

  const closePicker = () => {
    setShowPicker(false);
  };

  // Lock background scroll when picker is open
  useEffect(() => {
    if (showPicker) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showPicker]);

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
      {showPicker &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-end bg-black/60 backdrop-blur-sm"
            onClick={closePicker}
          >
            <div
              className="w-full bg-gray-900/95 backdrop-blur-xl rounded-t-2xl p-6 border-t border-white/10"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="text-lg font-semibold text-white">Adjust Timer</div>
                <button
                  onClick={closePicker}
                  className="px-4 py-2 rounded-lg bg-[#29e33c]/20 hover:bg-[#29e33c]/30 text-[#29e33c] text-sm font-medium transition-colors"
                >
                  Done
                </button>
              </div>
              <div className="flex gap-4 justify-center items-start">
                <WheelPicker
                  values={Array.from({ length: 11 }, (_, i) => i)}
                  value={selectedMinutes}
                  onChange={handleMinutesChange}
                  label="Minutes"
                />
                <div className="text-2xl font-bold text-white/60 pt-12">:</div>
                <WheelPicker
                  values={Array.from({ length: 12 }, (_, i) => i * 5)}
                  value={selectedSeconds}
                  onChange={handleSecondsChange}
                  label="Seconds"
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

