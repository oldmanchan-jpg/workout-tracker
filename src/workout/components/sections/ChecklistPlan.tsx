import type { ChecklistSection } from '../../types/canonical';

interface Props {
  section: ChecklistSection;
}

export function ChecklistPlan({ section }: Props) {
  return (
    <div className="space-y-2">
      {section.items.map(item => (
        <div 
          key={item.id}
          className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3"
        >
          <input 
            type="checkbox"
            disabled
            className="mt-1 opacity-50"
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-white">{item.label}</div>
            <div className="text-xs text-white/60">{item.target}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
