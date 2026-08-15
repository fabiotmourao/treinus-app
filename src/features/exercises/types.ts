export type Exercise = {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string | null;
  gifLocalPath?: string | null;
};

export type ExerciseDetails = Exercise & {
  instructions: string[];
  secondaryMuscles: string[];
  tags: string[];
};

export type ExerciseBodyView = 'front' | 'back';

export type ExerciseGroup = {
  groupKey: string;
  groupLabel: string;
  bodyView: ExerciseBodyView;
  total: number;
};

export type ExerciseFilters = {
  search?: string;
  bodyPart?: string;
  limit?: number;
  offset?: number;
};

export type GroupExerciseFilters = {
  groupKey: string;
  bodyView: ExerciseBodyView;
  search?: string;
  limit?: number;
  offset?: number;
};
