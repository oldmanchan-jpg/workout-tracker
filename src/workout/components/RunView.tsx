import { useState } from 'react';
import type { Section } from '../types/canonical';
import { ChecklistRun } from './sections/ChecklistRun';
import { EMOMRun } from './sections/EMOMRun';
import { CircuitRun } from './sections/CircuitRun';
import { CompletionGate } from '../primitives/CompletionGate';

interface Props {
  sections: Section[];
  onWorkoutComplete: () => void;
}

export function RunView({ sections, onWorkoutComplete }: Props) {
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  const handleSectionComplete = (sectionId: string) => {
    setCompletedSections(new Set([...completedSections, sectionId]));
  };

  const allComplete = sections.every(s => completedSections.has(s.id));

  return (
    <div className="space-y-6">
      {sections.map(section => {
        const isComplete = completedSections.has(section.id);

        if (isComplete) {
          return (
            <div
              key={section.id}
              className="rounded-xl bg-[#29e33c]/10 border border-[#29e33c] p-3"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#29e33c]" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-[#29e33c] text-sm font-medium">Completed</span>
                <h3 className="text-white font-semibold">{section.name}</h3>
              </div>
            </div>
          );
        }

        return (
          <div key={section.id} className="space-y-3">
            <h3 className="text-lg font-semibold text-white">{section.name}</h3>

            {section.type === 'checklist' && (
              <ChecklistRun
                section={section}
                allowSkip={true}
                onComplete={() => handleSectionComplete(section.id)}
              />
            )}

            {section.type === 'emom' && (
              <EMOMRun section={section} onComplete={() => handleSectionComplete(section.id)} />
            )}

            {section.type === 'circuit' && (
              <CircuitRun section={section} onComplete={() => handleSectionComplete(section.id)} />
            )}

            {section.type === 'strength' && (
              <div className="text-center py-8 text-white/40">
                Strength Run mode deferred to P1. Use Plan view.
              </div>
            )}
          </div>
        );
      })}

      {/* Completion gate - only appears when all sections complete */}
      {allComplete && (
        <div className="pt-4">
          <CompletionGate onComplete={onWorkoutComplete} />
        </div>
      )}
    </div>
  );
}

