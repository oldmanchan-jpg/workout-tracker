import { useEffect, useRef, useState } from 'react';

interface Props {
  values: number[];
  value: number;
  onChange: (value: number) => void;
  label: string;
}

const ITEM_H = 44;
const WHEEL_H = 220;
const PAD = WHEEL_H / 2 - ITEM_H / 2;

export function WheelPicker({ values, value, onChange, label }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const debounceTimerRef = useRef<number | null>(null);

  // Scroll to initial position on mount/open only
  useEffect(() => {
    if (scrollRef.current) {
      const initialIndex = values.indexOf(value);
      if (initialIndex >= 0) {
        const scrollTop = initialIndex * ITEM_H;
        scrollRef.current.scrollTo({ top: scrollTop, behavior: 'auto' });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const handleScroll = () => {
    setIsScrolling(true);
    
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce scroll end detection
    debounceTimerRef.current = window.setTimeout(() => {
      setIsScrolling(false);
      updateSelection();
    }, 150);
  };

  const updateSelection = () => {
    const el = scrollRef.current;
    if (!el) return;

    // Calculate center line
    const centerY = el.scrollTop + WHEEL_H / 2;
    
    // Calculate index based on center line
    const index = Math.round((centerY - PAD - ITEM_H / 2) / ITEM_H);
    
    // Clamp index
    const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
    const selectedValue = values[clampedIndex];

    // Update if changed
    if (selectedValue !== value) {
      onChange(selectedValue);
    }
  };

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center">
      <label className="block text-sm text-white/60 mb-2 text-center">{label}</label>
      <div className="relative w-full" style={{ height: WHEEL_H }}>
        {/* Center selection band */}
        <div
          className="absolute left-0 right-0 pointer-events-none z-10"
          style={{
            top: PAD,
            height: ITEM_H,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 0 8px rgba(41, 227, 60, 0.15)',
          }}
        />
        
        {/* Top fade mask */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none z-20"
          style={{
            height: PAD,
            background: 'linear-gradient(to bottom, rgba(17, 24, 39, 0.95), transparent)',
          }}
        />
        
        {/* Bottom fade mask */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none z-20"
          style={{
            height: PAD,
            background: 'linear-gradient(to top, rgba(17, 24, 39, 0.95), transparent)',
          }}
        />

        {/* Scrollable wheel */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="w-full h-full overflow-y-auto snap-y snap-mandatory"
          style={{
            paddingTop: PAD,
            paddingBottom: PAD,
          }}
        >
          {values.map((val, idx) => {
            const isSelected = val === value && !isScrolling;
            return (
              <div
                key={val}
                className="snap-center flex items-center justify-center"
                style={{
                  height: ITEM_H,
                }}
              >
                <div
                  className={`text-center transition-all ${
                    isSelected
                      ? 'text-white text-2xl font-bold'
                      : 'text-white/50 text-xl font-medium'
                  }`}
                >
                  {val.toString().padStart(2, '0')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
