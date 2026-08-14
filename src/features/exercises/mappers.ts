import { normalizeExerciseGroup, translateApiTerm } from './normalization';
import type { ExerciseUpsertInput } from '../../db/types';

function toText(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return fallback;
}

function toStringArray(value: unknown): string[] {
  if (typeof value === 'string') {
    const item = toText(value);
    return item ? [item] : [];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => toText(item)).filter(Boolean);
}

export function mapApiExercise(raw: Record<string, unknown>): ExerciseUpsertInput | null {
  const bodyParts = toStringArray(raw.bodyParts ?? raw.bodyPart ?? raw.body_part);
  const equipments = toStringArray(raw.equipments ?? raw.equipment);
  const targetMuscles = toStringArray(raw.targetMuscles ?? raw.target);

  const id = toText(raw.exerciseId ?? raw.id);
  const name = toText(raw.name);
  const rawBodyPart = toText(raw.bodyPart ?? raw.body_part ?? bodyParts[0]);
  const rawTarget = toText(raw.target ?? targetMuscles[0]);
  const rawEquipment = toText(raw.equipment ?? equipments[0]);
  const gifUrl = toText(raw.gifUrl ?? raw.gif_url) || null;

  if (!id || !name || !rawBodyPart || !rawTarget || !rawEquipment) {
    return null;
  }

  const group = normalizeExerciseGroup({
    bodyPart: rawBodyPart,
    target: rawTarget,
    tags: [...bodyParts, ...targetMuscles],
  });

  const bodyPart = group.label;
  const target = translateApiTerm(rawTarget);
  const equipment = translateApiTerm(rawEquipment);

  const normalizedTags = toStringArray(raw.tags).length
    ? toStringArray(raw.tags)
    : Array.from(new Set([...bodyParts, ...equipments, ...targetMuscles])).filter(Boolean);

  return {
    id,
    name,
    bodyPart,
    target,
    equipment,
    normalizedGroupKey: group.key,
    normalizedGroupLabel: group.label,
    bodyView: group.bodyView,
    gifUrl,
    instructions: toStringArray(raw.instructions),
    secondaryMuscles: toStringArray(raw.secondaryMuscles ?? raw.secondary_muscles),
    tags: [...normalizedTags, `group:${group.key}`, `view:${group.bodyView}`],
    sourceUpdatedAt: null,
  };
}
