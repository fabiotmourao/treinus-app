import { normalizeExerciseGroup } from './normalization';
import type { Exercise, ExerciseBodyView, ExerciseGroup } from './types';

/**
 * Lógica de negócio pura para filtragem e agrupamento de exercícios.
 * Opera em arrays de dados crus (independente de SQLite ou webStore),
 * eliminando a duplicidade entre os dois caminhos de persistência.
 */

type RawExercise = {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl?: string | null;
  tags?: string[];
};

function toExercise(item: RawExercise): Exercise {
  return {
    id: item.id,
    name: item.name,
    bodyPart: item.bodyPart,
    target: item.target,
    equipment: item.equipment,
    gifUrl: item.gifUrl ?? null,
  };
}

function matchesSearch(item: RawExercise, search: string): boolean {
  if (!search) {
    return true;
  }
  const lowered = search.toLowerCase();
  return (
    item.name.toLowerCase().includes(lowered) ||
    item.bodyPart.toLowerCase().includes(lowered) ||
    item.target.toLowerCase().includes(lowered) ||
    item.equipment.toLowerCase().includes(lowered)
  );
}

function matchesBodyPart(item: RawExercise, bodyPart: string): boolean {
  return !bodyPart || item.bodyPart === bodyPart;
}

function matchesGroup(item: RawExercise, groupKey: string, bodyView: ExerciseBodyView): boolean {
  const normalized = normalizeExerciseGroup({
    bodyPart: item.bodyPart,
    target: item.target,
    tags: item.tags,
  });
  return normalized.key === groupKey && (normalized.bodyView === bodyView || normalized.bodyView === 'both');
}

export function filterExercises(
  items: RawExercise[],
  params: { search?: string; bodyPart?: string; limit?: number; offset?: number }
): Exercise[] {
  const search = params.search?.trim() ?? '';
  const bodyPart = params.bodyPart?.trim() ?? '';
  const limit = params.limit ?? 30;
  const offset = params.offset ?? 0;

  return items
    .filter((item) => matchesSearch(item, search) && matchesBodyPart(item, bodyPart))
    .sort((first, second) => first.name.localeCompare(second.name))
    .slice(offset, offset + limit)
    .map(toExercise);
}

export function filterExercisesByGroup(
  items: RawExercise[],
  params: { groupKey: string; bodyView: ExerciseBodyView; search?: string; limit?: number; offset?: number }
): Exercise[] {
  const search = params.search?.trim() ?? '';
  const limit = params.limit ?? 30;
  const offset = params.offset ?? 0;

  if (!params.groupKey.trim()) {
    return [];
  }

  return items
    .filter((item) => matchesGroup(item, params.groupKey, params.bodyView) && matchesSearch(item, search))
    .sort((first, second) => first.name.localeCompare(second.name))
    .slice(offset, offset + limit)
    .map(toExercise);
}

export function groupExercisesByView(
  items: RawExercise[],
  view: ExerciseBodyView,
  allowedGroups: Array<{ key: string; label: string }>,
  search = ''
): ExerciseGroup[] {
  const loweredSearch = search.trim().toLowerCase();
  const grouped = new Map<string, ExerciseGroup>();

  for (const item of items) {
    const normalized = normalizeExerciseGroup({
      bodyPart: item.bodyPart,
      target: item.target,
      tags: item.tags,
    });

    if (normalized.bodyView !== view && normalized.bodyView !== 'both') {
      continue;
    }

    if (loweredSearch) {
      const content = `${item.name} ${item.bodyPart} ${item.target} ${item.equipment}`.toLowerCase();
      if (!content.includes(loweredSearch)) {
        continue;
      }
    }

    const current = grouped.get(normalized.key);
    if (!current) {
      grouped.set(normalized.key, {
        groupKey: normalized.key,
        groupLabel: normalized.label,
        bodyView: view,
        total: 1,
      });
    } else {
      grouped.set(normalized.key, { ...current, total: current.total + 1 });
    }
  }

  return allowedGroups
    .map((group) => grouped.get(group.key) ?? { groupKey: group.key, groupLabel: group.label, bodyView: view, total: 0 })
    .filter((group) => group.total > 0);
}
