import { ExerciseRepository } from '../../repositories/ExerciseRepository';
import { FavoritesRepository } from '../../repositories/FavoritesRepository';
import type { Exercise, ExerciseBodyView, ExerciseDetails, ExerciseFilters, ExerciseGroup, GroupExerciseFilters } from './types';

export const exercisesFeatureRepository = {
  list(filters: ExerciseFilters = {}): Exercise[] {
    const items = ExerciseRepository.list({
      search: filters.search ?? '',
      bodyPart: filters.bodyPart ?? '',
      limit: filters.limit ?? 30,
      offset: filters.offset ?? 0,
    }) as Exercise[];

    return items;
  },

  getById(exerciseId: string): ExerciseDetails | null {
    return ExerciseRepository.getById(exerciseId) as ExerciseDetails | null;
  },

  getBodyParts(): string[] {
    return ExerciseRepository.listBodyParts();
  },

  count(): number {
    return ExerciseRepository.count();
  },

  listGroupsByView(view: ExerciseBodyView, search = ''): ExerciseGroup[] {
    return ExerciseRepository.listGroupsByView(view, search) as ExerciseGroup[];
  },

  listByGroup(filters: GroupExerciseFilters): Exercise[] {
    return ExerciseRepository.listByGroup({
      groupKey: filters.groupKey,
      bodyView: filters.bodyView,
      search: filters.search ?? '',
      limit: filters.limit ?? 30,
      offset: filters.offset ?? 0,
    }) as Exercise[];
  },

  listFavorites(): Exercise[] {
    return FavoritesRepository.list() as Exercise[];
  },

  toggleFavorite(exerciseId: string): boolean {
    return FavoritesRepository.toggle(exerciseId);
  },
};
