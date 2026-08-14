export type ExerciseUpsertInput = {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  normalizedGroupKey?: string;
  normalizedGroupLabel?: string;
  bodyView?: 'front' | 'back' | 'both';
  gifUrl?: string | null;
  instructions: string[];
  secondaryMuscles: string[];
  tags: string[];
  sourceUpdatedAt?: string | null;
};

export type WorkoutCreateInput = {
  id: string;
  name: string;
  note?: string | null;
  trainingDays?: string[];
  performedAt?: string | null;
};

export type WorkoutSeriesInput = {
  reps: number;
  loadKg: number;
};

export type WorkoutExerciseAddInput = {
  id: string;
  workoutId: string;
  exerciseId: string;
  sortOrder: number;
  sets?: number;
  reps?: number;
  restSeconds?: number;
  notes?: string | null;
};
