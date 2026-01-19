import type { Section } from '../types/canonical';
import { ChecklistPlan } from './sections/ChecklistPlan';
import { StrengthPlan } from './sections/StrengthPlan';
import { EMOMPlan } from './sections/EMOMPlan';
import { CircuitPlan } from './sections/CircuitPlan';

interface Props {
  sections: Section[];
}

export function PlanView({ sections }: Props) {
  return (
    <div className="space-y-6">
      {sections.map(section => (
        <div key={section.id}>
          <h3 className="text-lg font-semibold text-white mb-3">
            {section.name}
          </h3>
          {section.type === 'checklist' && <ChecklistPlan section={section} />}
          {section.type === 'strength' && <StrengthPlan section={section} />}
          {section.type === 'emom' && <EMOMPlan section={section} />}
          {section.type === 'circuit' && <CircuitPlan section={section} />}
        </div>
      ))}
    </div>
  );
}
