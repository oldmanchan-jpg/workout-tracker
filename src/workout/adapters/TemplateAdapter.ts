import type { CanonicalWorkout, Section, ChecklistSection, StrengthSection, EMOMSection, CircuitSection } from '../types/canonical';

export function normalizeTemplate(raw: any): CanonicalWorkout {
  const type = (raw.type ?? 'strength') as 'strength' | 'emom' | 'circuit';
  
  const workout: CanonicalWorkout = {
    id: raw.id,
    name: raw.name,
    type,
    defaultMode: type === 'strength' ? 'plan' : 'run',
    sections: [],
  };

  switch (type) {
    case 'strength':
      workout.sections = normalizeStrength(raw);
      break;
    case 'emom':
      workout.sections = normalizeEMOM(raw);
      break;
    case 'circuit':
      workout.sections = normalizeCircuit(raw);
      break;
  }

  return workout;
}

function normalizeStrength(raw: any): Section[] {
  return [{
    id: 'strength-main',
    name: 'Strength Exercises',
    type: 'strength',
    exercises: raw.exercises.map((ex: any, idx: number) => ({
      id: `ex-${idx}`,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      completedSets: 0,
    })),
  }] as Section[];
}

function normalizeEMOM(raw: any): Section[] {
  const sections: Section[] = [];

  if (raw.warmup && raw.warmup.length > 0) {
    sections.push({
      id: 'warmup',
      name: 'Warmup',
      type: 'checklist',
      items: raw.warmup.map((item: any, idx: number) => ({
        id: `warmup-${idx}`,
        label: item.label,
        target: item.target,
        completed: false,
      })),
    } as ChecklistSection);
  }

  sections.push({
    id: 'emom-main',
    name: `EMOM - ${raw.durationMinutes} Minutes`,
    type: 'emom',
    durationMinutes: raw.durationMinutes,
    minuteA: raw.minuteA.map((task: any, idx: number) => ({
      id: `minuteA-${idx}`,
      label: task.label,
      target: task.target,
      completed: false,
    })),
    minuteB: raw.minuteB.map((task: any, idx: number) => ({
      id: `minuteB-${idx}`,
      label: task.label,
      target: task.target,
      completed: false,
    })),
    currentMinute: 1,
  } as EMOMSection);

  if (raw.extras && raw.extras.length > 0) {
    sections.push({
      id: 'extras',
      name: 'Extras (Optional)',
      type: 'checklist',
      items: raw.extras.map((item: any, idx: number) => ({
        id: `extra-${idx}`,
        label: item.label,
        target: item.target,
        completed: false,
      })),
    } as ChecklistSection);
  }

  return sections;
}

function normalizeCircuit(raw: any): Section[] {
  const sections: Section[] = [];

  if (raw.warmup && raw.warmup.length > 0) {
    sections.push({
      id: 'warmup',
      name: 'Warmup',
      type: 'checklist',
      items: raw.warmup.map((item: any, idx: number) => ({
        id: `warmup-${idx}`,
        label: item.label,
        target: item.target,
        completed: false,
      })),
    } as ChecklistSection);
  }

  sections.push({
    id: 'circuit-main',
    name: `Circuit - ${raw.rounds} Rounds`,
    type: 'circuit',
    rounds: raw.rounds,
    restBetweenRoundsSeconds: raw.restBetweenRoundsSeconds,
    stations: raw.stations.map((station: any) => ({
      id: `station-${station.order}`,
      order: station.order,
      label: station.label,
      target: station.target,
      completed: false,
    })),
    completedRounds: 0,
  } as CircuitSection);

  return sections;
}
