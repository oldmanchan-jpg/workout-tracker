import { useState, useMemo } from 'react';
import type { ChecklistSection } from '../../types/canonical';

interface Props {
  section: ChecklistSection;
  onComplete: () => void;
  allowSkip?: boolean;
}

export function ChecklistRun({ section, onComplete, allowSkip = true }: Props) {
  const initial = useMemo(() => section.items.map(i => !!i.completed), [section.id]);
  const [checked, setChecked] = useState<boolean[]>(initial);

  const allChecked = checked.length === 0 ? true : checked.every(Boolean);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {section.items.map((item, idx) => (
          <label
            key={item.id}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 cursor-pointer hover:bg-white/10 transition-colors"
          >
            <input
              type="checkbox"
              className="mt-1"
              checked={checked[idx] || false}
              onChange={() => {
                const next = [...checked];
                next[idx] = !next[idx];
                setChecked(next);
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-white/90">{item.label}</div>
              <div className="text-xs text-white/60">{item.target}</div>
            </div>
          </label>
        ))}
      </div>

      <div className="flex gap-2">
        {allowSkip && (
          <button
            type="button"
            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80 hover:bg-white/10 transition-colors"
            onClick={onComplete}
          >
            Skip
          </button>
        )}

        <button
          type="button"
          disabled={!allChecked}
          className="flex-1 rounded-xl bg-[#29e33c] px-4 py-3 text-sm font-semibold text-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#29e33c]/90 transition-colors"
          onClick={onComplete}
        >
          Done
        </button>
      </div>
    </div>
  );
}

