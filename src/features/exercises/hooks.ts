import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { exercisesFeatureRepository } from './repository';
import type { ExerciseBodyView, ExerciseFilters, GroupExerciseFilters } from './types';

export function useExercises(filters: ExerciseFilters = {}) {
  return useQuery({
    queryKey: ['exercises', filters],
    queryFn: () => exercisesFeatureRepository.list(filters),
  });
}

export function useExercise(exerciseId: string) {
  return useQuery({
    queryKey: ['exercise', exerciseId],
    queryFn: () => exercisesFeatureRepository.getById(exerciseId),
  });
}

export function useExerciseBodyParts() {
  return useQuery({
    queryKey: ['exercise-body-parts'],
    queryFn: () => exercisesFeatureRepository.getBodyParts(),
  });
}

export function useExercisesCount() {
  return useQuery({
    queryKey: ['exercise-count'],
    queryFn: () => exercisesFeatureRepository.count(),
  });
}

export function useExerciseGroupsByView(view: ExerciseBodyView, search = '') {
  return useQuery({
    queryKey: ['exercise-groups', view, search],
    queryFn: () => exercisesFeatureRepository.listGroupsByView(view, search),
  });
}

export function useExercisesByGroup(filters: GroupExerciseFilters) {
  return useQuery({
    queryKey: ['exercise-group-items', filters],
    queryFn: () => exercisesFeatureRepository.listByGroup(filters),
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => exercisesFeatureRepository.listFavorites(),
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exerciseId: string) => exercisesFeatureRepository.toggleFavorite(exerciseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      queryClient.invalidateQueries({ queryKey: ['exercise-count'] });
      queryClient.invalidateQueries({ queryKey: ['exercise-group-items'] });
      queryClient.invalidateQueries({ queryKey: ['exercise-groups'] });
    },
  });
}
