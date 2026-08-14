import { WorkoutRepository } from '../../repositories/WorkoutRepository';
import type { WorkoutCreateInput, WorkoutExerciseAddInput, WorkoutSeriesInput } from '../../db/types';

export type Workout = {
  id: string;
  name: string;
  note: string | null;
  trainingDays: string[];
  createdAt: string | null;
  updatedAt: string | null;
  performedAt?: string | null;
};

export type WorkoutExercise = {
  id: string;
  sortOrder: number;
  sets: number;
  reps: number;
  restSeconds: number;
  notes: string | null;
  exerciseId: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string | null;
};

export type WorkoutDetails = {
  workout: Workout | null;
  exercises: WorkoutExercise[];
};

export const workoutsFeatureRepository = {
  list(): Workout[] {
    return WorkoutRepository.list() as Workout[];
  },

  getDetails(workoutId: string): WorkoutDetails {
    const details = WorkoutRepository.getDetails(workoutId);
    return {
      workout: details.workout as Workout | null,
      exercises: details.exercises as WorkoutExercise[],
    };
  },

  create(input: WorkoutCreateInput): void {
    WorkoutRepository.create(input);
  },

  update(input: { id: string; name: string; trainingDays: string[] }): void {
    WorkoutRepository.update(input);
  },

  delete(workoutId: string): void {
    WorkoutRepository.delete(workoutId);
  },

  addExercise(input: WorkoutExerciseAddInput): void {
    WorkoutRepository.addExercise(input);
  },

  updateExerciseConfig(
    workoutExerciseId: string,
    payload: { series: WorkoutSeriesInput[]; restSeconds: number; note?: string | null }
  ): void {
    WorkoutRepository.updateExerciseConfig(workoutExerciseId, payload);
  },

  deleteWorkoutExercise(workoutExerciseId: string): void {
    WorkoutRepository.deleteWorkoutExercise(workoutExerciseId);
  },
};
