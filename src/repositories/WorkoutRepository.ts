import { db } from '../db';
import { WorkoutCreateInput, WorkoutExerciseAddInput, WorkoutSeriesInput } from '../db/types';
import { validateWorkoutCreateInput, validateWorkoutExerciseAddInput } from '../db/validators';
import { Platform } from 'react-native';
import { webStore } from '../db/webStore';
import {
  parseWorkoutMetadata,
  serializeWorkoutMetadata,
  parseWorkoutExerciseConfig,
  serializeWorkoutExerciseConfig,
  estimateWorkoutMetrics,
  parseNumber,
  defaultSeries,
} from '../features/workouts/selectors';

export { parseWorkoutExerciseConfig, estimateWorkoutMetrics };

export const WorkoutRepository = {
  create(input: WorkoutCreateInput) {
    validateWorkoutCreateInput(input);

    const metadata = serializeWorkoutMetadata(input.note, input.trainingDays);

    if (Platform.OS === 'web') {
      webStore.createWorkout({ ...input, note: metadata });
      return;
    }

    if (!db) {
      return;
    }

    db.runSync('INSERT INTO workouts (id, name, note, performed_at) VALUES (?, ?, ?, ?)', [
      input.id,
      input.name.trim(),
      metadata,
      input.performedAt ?? null,
    ]);
  },

  list() {
    if (Platform.OS === 'web') {
      return webStore.listWorkouts().map((item) => {
        const metadata = parseWorkoutMetadata(item.note ?? null);
        return {
          id: item.id,
          name: item.name,
          note: metadata.note,
          trainingDays: metadata.trainingDays,
          performedAt: item.performedAt ?? null,
          createdAt: null,
          updatedAt: null,
        };
      });
    }

    if (!db) {
      return [];
    }

    const rows = db.getAllSync<{
      id: string;
      name: string;
      note: string | null;
      createdAt: string;
      updatedAt: string;
      performedAt: string | null;
    }>(
      `SELECT id, name, note, created_at as createdAt, updated_at as updatedAt, performed_at as performedAt
       FROM workouts
       ORDER BY created_at DESC`
    );

    return rows.map((item) => {
      const metadata = parseWorkoutMetadata(item.note);
      return {
        id: item.id,
        name: item.name,
        note: metadata.note,
        trainingDays: metadata.trainingDays,
        performedAt: item.performedAt,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });
  },

  addExercise(input: WorkoutExerciseAddInput) {
    validateWorkoutExerciseAddInput(input);

    const notes =
      input.notes ??
      serializeWorkoutExerciseConfig(
        defaultSeries(input.sets ?? 3, input.reps ?? 10),
        input.restSeconds ?? 60,
        null
      );

    if (Platform.OS === 'web') {
      webStore.addWorkoutExercise({
        ...input,
        notes,
      });
      return;
    }

    if (!db) {
      return;
    }

    db.runSync(
      `INSERT INTO workout_exercises
       (id, workout_id, exercise_id, sort_order, sets, reps, rest_seconds, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.id,
        input.workoutId,
        input.exerciseId,
        input.sortOrder,
        input.sets ?? 3,
        input.reps ?? 12,
        input.restSeconds ?? 60,
        notes,
      ]
    );
  },

  updateExerciseConfig(
    workoutExerciseId: string,
    payload: { series: WorkoutSeriesInput[]; restSeconds: number; note?: string | null }
  ) {
    const normalizedSeries =
      payload.series.length > 0
        ? payload.series.map((item) => ({
            reps: Math.max(1, Math.round(parseNumber(item.reps, 1))),
            loadKg: Math.max(0, parseNumber(item.loadKg, 0)),
          }))
        : defaultSeries(1, 10);

    const reps = normalizedSeries[0]?.reps ?? 10;
    const sets = normalizedSeries.length;
    const restSeconds = Math.max(0, Math.round(parseNumber(payload.restSeconds, 60)));
    const notes = serializeWorkoutExerciseConfig(normalizedSeries, restSeconds, payload.note);

    if (Platform.OS === 'web') {
      webStore.updateWorkoutExercise(workoutExerciseId, {
        sets,
        reps,
        restSeconds,
        notes,
      });
      return;
    }

    if (!db) {
      return;
    }

    db.runSync(
      `UPDATE workout_exercises
       SET sets = ?, reps = ?, rest_seconds = ?, notes = ?
       WHERE id = ?`,
      [sets, reps, restSeconds, notes, workoutExerciseId]
    );
  },

  update(input: { id: string; name: string; trainingDays: string[] }) {
    const metadata = serializeWorkoutMetadata(null, input.trainingDays);

    if (Platform.OS === 'web') {
      webStore.updateWorkout(input.id, { name: input.name.trim(), note: metadata });
      return;
    }

    if (!db) {
      return;
    }

    db.runSync('UPDATE workouts SET name = ?, note = ? WHERE id = ?', [
      input.name.trim(),
      metadata,
      input.id,
    ]);
  },

  delete(workoutId: string) {
    if (Platform.OS === 'web') {
      webStore.deleteWorkout(workoutId);
      return;
    }

    if (!db) {
      return;
    }

    db.runSync('DELETE FROM workouts WHERE id = ?', [workoutId]);
  },

  deleteWorkoutExercise(workoutExerciseId: string) {
    if (Platform.OS === 'web') {
      webStore.deleteWorkoutExercise(workoutExerciseId);
      return;
    }

    if (!db) {
      return;
    }

    db.runSync('DELETE FROM workout_exercises WHERE id = ?', [workoutExerciseId]);
  },

  getDetails(workoutId: string) {
    if (Platform.OS === 'web') {
      const workoutRaw = webStore.listWorkouts().find((item) => item.id === workoutId) ?? null;
      const metadata = parseWorkoutMetadata(workoutRaw?.note ?? null);
      const workout = workoutRaw
        ? {
            id: workoutRaw.id,
            name: workoutRaw.name,
            note: metadata.note,
            trainingDays: metadata.trainingDays,
            createdAt: null,
            updatedAt: null,
          }
        : null;

      const exerciseMap = new Map(webStore.listExercises().map((item) => [item.id, item]));
      const exercises = webStore.getWorkoutExercises(workoutId).map((item) => {
        const exercise = exerciseMap.get(item.exerciseId);
        return {
          ...item,
          name: exercise?.name ?? 'Exercício',
          bodyPart: exercise?.bodyPart ?? '',
          target: exercise?.target ?? '',
          equipment: exercise?.equipment ?? '',
          gifUrl: exercise?.gifUrl ?? null,
        };
      });
      return { workout, exercises };
    }

    if (!db) {
      return { workout: null, exercises: [] };
    }

    const workoutRaw = db.getFirstSync<{
      id: string;
      name: string;
      note: string | null;
      createdAt: string;
      updatedAt: string;
      performedAt: string | null;
    }>(
      `SELECT id, name, note, created_at as createdAt, updated_at as updatedAt, performed_at as performedAt
       FROM workouts WHERE id = ?`,
      [workoutId]
    );

    const metadata = parseWorkoutMetadata(workoutRaw?.note ?? null);
    const workout = workoutRaw
      ? {
          id: workoutRaw.id,
          name: workoutRaw.name,
          note: metadata.note,
          trainingDays: metadata.trainingDays,
          performedAt: workoutRaw.performedAt,
          createdAt: workoutRaw.createdAt,
          updatedAt: workoutRaw.updatedAt,
        }
      : null;

    const exercises = db.getAllSync(
      `SELECT we.id, we.sort_order as sortOrder, we.sets, we.reps, we.rest_seconds as restSeconds, we.notes,
              e.id as exerciseId, e.name, e.body_part as bodyPart, e.target, e.equipment, e.gif_url as gifUrl
       FROM workout_exercises we
       JOIN exercises e ON e.id = we.exercise_id
       WHERE we.workout_id = ?
       ORDER BY we.sort_order ASC`,
      [workoutId]
    );

    return { workout, exercises };
  },
};
