import type { WorkoutSeriesInput } from '../../db/types';

/**
 * Lógica de negócio pura para workouts: parsing de metadados serializados
 * em JSON e cálculo de métricas estimadas. Independente de SQLite ou webStore.
 */

const DAY_ORDER = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

type WorkoutMetadata = {
  v: 1;
  note: string | null;
  trainingDays: string[];
};

type WorkoutExerciseConfig = {
  v: 1;
  restSeconds: number;
  note: string | null;
  series: WorkoutSeriesInput[];
};

type WorkoutExerciseWithBase = {
  sets: number;
  reps: number;
  restSeconds: number;
  notes: string | null;
};

function normalizeDays(days?: string[]) {
  const source = Array.isArray(days) ? days : [];
  return DAY_ORDER.filter((day) => source.includes(day));
}

export function parseNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

export function defaultSeries(sets = 3, reps = 10) {
  return Array.from({ length: Math.max(1, sets) }).map(() => ({
    reps: Math.max(1, reps),
    loadKg: 10,
  }));
}

export function parseWorkoutMetadata(rawNote?: string | null) {
  if (!rawNote) {
    return { note: null as string | null, trainingDays: [] as string[] };
  }

  try {
    const parsed = JSON.parse(rawNote) as Partial<WorkoutMetadata>;
    if (parsed && parsed.v === 1) {
      return {
        note: typeof parsed.note === 'string' ? parsed.note : null,
        trainingDays: normalizeDays(parsed.trainingDays),
      };
    }
  } catch {
    // Fallback for legacy plain-text notes.
  }

  return { note: rawNote, trainingDays: [] };
}

export function serializeWorkoutMetadata(note: string | null | undefined, trainingDays?: string[]) {
  const payload: WorkoutMetadata = {
    v: 1,
    note: note ?? null,
    trainingDays: normalizeDays(trainingDays),
  };
  return JSON.stringify(payload);
}

export function serializeWorkoutExerciseConfig(
  series: WorkoutSeriesInput[],
  restSeconds: number,
  note?: string | null
) {
  const normalizedSeries = series.length
    ? series.map((item) => ({
        reps: Math.max(1, Math.round(parseNumber(item.reps, 1))),
        loadKg: Math.max(0, parseNumber(item.loadKg, 0)),
      }))
    : defaultSeries(1, 10);

  const payload: WorkoutExerciseConfig = {
    v: 1,
    restSeconds: Math.max(0, Math.round(parseNumber(restSeconds, 60))),
    note: note ?? null,
    series: normalizedSeries,
  };

  return JSON.stringify(payload);
}

export function parseWorkoutExerciseConfig(base: WorkoutExerciseWithBase) {
  try {
    if (base.notes) {
      const parsed = JSON.parse(base.notes) as Partial<WorkoutExerciseConfig>;
      if (parsed && parsed.v === 1 && Array.isArray(parsed.series)) {
        const normalizedSeries = parsed.series.map((item) => ({
          reps: Math.max(1, Math.round(parseNumber(item.reps, base.reps || 10))),
          loadKg: Math.max(0, parseNumber(item.loadKg, 0)),
        }));

        return {
          restSeconds: Math.max(0, Math.round(parseNumber(parsed.restSeconds, base.restSeconds || 60))),
          note: typeof parsed.note === 'string' ? parsed.note : null,
          series: normalizedSeries.length ? normalizedSeries : defaultSeries(base.sets, base.reps),
        };
      }
    }
  } catch {
    // Ignore invalid JSON and fallback.
  }

  return {
    restSeconds: base.restSeconds || 60,
    note: null,
    series: defaultSeries(base.sets, base.reps),
  };
}

export function estimateWorkoutMetrics(
  exercises: Array<{ sets: number; reps: number; restSeconds: number; notes: string | null }>
) {
  let totalLoadKg = 0;
  let totalReps = 0;
  let totalSeconds = 0;

  for (const item of exercises) {
    const config = parseWorkoutExerciseConfig(item);
    const exerciseReps = config.series.reduce((sum, series) => sum + series.reps, 0);
    const exerciseLoad = config.series.reduce((sum, series) => sum + series.reps * series.loadKg, 0);

    totalReps += exerciseReps;
    totalLoadKg += exerciseLoad;
    totalSeconds += config.series.length * 40;
    totalSeconds += Math.max(0, config.series.length - 1) * config.restSeconds;
  }

  const durationMin = Math.max(1, Math.round(totalSeconds / 60));
  const calories = Math.round(totalReps * 0.35 + totalLoadKg * 0.02);

  return {
    durationMin,
    calories,
    totalLoadKg,
    totalReps,
  };
}
