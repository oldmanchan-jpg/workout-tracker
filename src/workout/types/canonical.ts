export interface CanonicalWorkout {
  id: string;
  name: string;
  type: 'strength' | 'emom' | 'circuit';
  defaultMode: 'plan' | 'run';
  sections: Section[];
}

export type Section =
  | ChecklistSection
  | StrengthSection
  | EMOMSection
  | CircuitSection;

interface BaseSection {
  id: string;
  name: string;
  type: 'checklist' | 'strength' | 'emom' | 'circuit';
}

export interface ChecklistSection extends BaseSection {
  type: 'checklist';
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  target: string;
  completed: boolean;
}

export interface StrengthSection extends BaseSection {
  type: 'strength';
  exercises: StrengthExercise[];
}

export interface StrengthExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  completedSets: number;
}

export interface EMOMSection extends BaseSection {
  type: 'emom';
  durationMinutes: number;
  minuteA: EMOMTask[];
  minuteB: EMOMTask[];
  currentMinute: number;
}

export interface EMOMTask {
  id: string;
  label: string;
  target: string;
  completed: boolean;
}

export interface CircuitSection extends BaseSection {
  type: 'circuit';
  rounds: number;
  restBetweenRoundsSeconds: number;
  stations: CircuitStation[];
  completedRounds: number;
}

export interface CircuitStation {
  id: string;
  order: number;
  label: string;
  target: string;
  completed: boolean;
}

export interface WorkoutSession {
  workoutId: string;
  startedAt: Date;
  sections: Section[];
  canComplete: boolean;
}
