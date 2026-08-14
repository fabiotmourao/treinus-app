import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workoutsFeatureRepository } from './repository';
import type { WorkoutCreateInput, WorkoutExerciseAddInput, WorkoutSeriesInput } from '../../db/types';

export function useWorkouts() {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: () => workoutsFeatureRepository.list(),
  });
}

export function useWorkoutDetails(workoutId: string) {
  return useQuery({
    queryKey: ['workout-details', workoutId],
    queryFn: () => workoutsFeatureRepository.getDetails(workoutId),
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: WorkoutCreateInput) => workoutsFeatureRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}

export function useAddWorkoutExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: WorkoutExerciseAddInput) => workoutsFeatureRepository.addExercise(input),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ['workout-details', input.workoutId] });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}

export function useUpdateWorkoutExerciseConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      workoutExerciseId: string;
      workoutId: string;
      series: WorkoutSeriesInput[];
      restSeconds: number;
      note?: string | null;
    }) => workoutsFeatureRepository.updateExerciseConfig(payload.workoutExerciseId, payload),
    onSuccess: (_data, payload) => {
      queryClient.invalidateQueries({ queryKey: ['workout-details', payload.workoutId] });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}

export function useUpdateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; name: string; trainingDays: string[] }) =>
      workoutsFeatureRepository.update(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workoutId: string) => workoutsFeatureRepository.delete(workoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}
