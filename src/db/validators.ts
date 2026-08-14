import { ExerciseUpsertInput, WorkoutCreateInput, WorkoutExerciseAddInput } from './types';

function requiredText(value: string, field: string, min = 1, max = 255) {
  const normalized = value?.trim();
  if (!normalized || normalized.length < min || normalized.length > max) {
    throw new Error(`Campo inválido: ${field}`);
  }
}

export function validateExerciseInput(input: ExerciseUpsertInput) {
  requiredText(input.id, 'id', 1, 80);
  requiredText(input.name, 'name', 2, 120);
  requiredText(input.bodyPart, 'bodyPart', 2, 80);
  requiredText(input.target, 'target', 2, 80);
  requiredText(input.equipment, 'equipment', 2, 80);

  if (input.normalizedGroupKey !== undefined) {
    requiredText(input.normalizedGroupKey, 'normalizedGroupKey', 2, 80);
  }

  if (input.normalizedGroupLabel !== undefined) {
    requiredText(input.normalizedGroupLabel, 'normalizedGroupLabel', 2, 80);
  }

  if (input.bodyView !== undefined && !['front', 'back', 'both'].includes(input.bodyView)) {
    throw new Error('bodyView invalido');
  }

  if (!Array.isArray(input.instructions)) {
    throw new Error('instructions deve ser array');
  }

  if (!Array.isArray(input.secondaryMuscles)) {
    throw new Error('secondaryMuscles deve ser array');
  }

  if (!Array.isArray(input.tags)) {
    throw new Error('tags deve ser array');
  }

  input.instructions.forEach((item, index) => requiredText(item, `instructions[${index}]`, 1, 400));
  input.secondaryMuscles.forEach((item, index) => requiredText(item, `secondaryMuscles[${index}]`, 2, 80));
  input.tags.forEach((item, index) => requiredText(item, `tags[${index}]`, 2, 80));
}

export function validateWorkoutCreateInput(input: WorkoutCreateInput) {
  requiredText(input.id, 'id', 1, 80);
  requiredText(input.name, 'name', 2, 80);

  if (input.trainingDays !== undefined) {
    if (!Array.isArray(input.trainingDays)) {
      throw new Error('trainingDays deve ser array');
    }

    const allowedDays = new Set(['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']);
    for (const day of input.trainingDays) {
      if (!allowedDays.has(day)) {
        throw new Error('trainingDays contém valor inválido');
      }
    }
  }
}

export function validateWorkoutExerciseAddInput(input: WorkoutExerciseAddInput) {
  requiredText(input.id, 'id', 1, 80);
  requiredText(input.workoutId, 'workoutId', 1, 80);
  requiredText(input.exerciseId, 'exerciseId', 1, 80);

  if (input.sortOrder < 0) {
    throw new Error('sortOrder inválido');
  }

  if (input.sets !== undefined && input.sets <= 0) {
    throw new Error('sets inválido');
  }

  if (input.reps !== undefined && input.reps <= 0) {
    throw new Error('reps inválido');
  }

  if (input.restSeconds !== undefined && input.restSeconds < 0) {
    throw new Error('restSeconds inválido');
  }
}
