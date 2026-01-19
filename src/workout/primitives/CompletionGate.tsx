import { useState } from 'react';

interface Props {
  onComplete: () => void;
}

export function CompletionGate({ onComplete }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <div 
        className="sticky bottom-0 pt-4 bg-gradient-to-t from-[#15181d] via-[#15181d]/95 to-transparent -mx-4 px-4 -mb-6 mt-6"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
      >
        <button
          className="w-full rounded-xl bg-[#29e33c] px-4 py-4 text-base font-semibold text-black hover:bg-[#29e33c]/90 transition-colors"
          onClick={() => setShowConfirm(true)}
        >
          Complete Workout
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-[#15181d] rounded-xl border border-white/10 p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-white mb-2">Complete Workout?</h3>
            <p className="text-white/60 mb-6">This will save your workout and return to dashboard.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onComplete}
                className="flex-1 rounded-xl bg-[#29e33c] px-4 py-3 text-sm font-semibold text-black hover:bg-[#29e33c]/90 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

