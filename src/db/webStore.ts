import { ExerciseUpsertInput, WorkoutCreateInput, WorkoutExerciseAddInput } from './types';

type WebWorkoutExercise = WorkoutExerciseAddInput;

const STORAGE_KEY = 'treinos.webStore.v1';

type WebState = {
  exercises: Map<string, ExerciseUpsertInput>;
  favorites: Set<string>;
  workouts: Map<string, WorkoutCreateInput>;
  workoutExercises: Map<string, WebWorkoutExercise[]>;
};

type PersistedWebState = {
  exercises: ExerciseUpsertInput[];
  favorites: string[];
  workouts: WorkoutCreateInput[];
  workoutExercises: Record<string, WebWorkoutExercise[]>;
};

const state: WebState = {
  exercises: new Map(),
  favorites: new Set(),
  workouts: new Map(),
  workoutExercises: new Map(),
};

function canUseStorage() {
  return typeof globalThis !== 'undefined' && !!globalThis.localStorage;
}

function saveState() {
  if (!canUseStorage()) {
    return;
  }

  const payload: PersistedWebState = {
    exercises: Array.from(state.exercises.values()),
    favorites: Array.from(state.favorites.values()),
    workouts: Array.from(state.workouts.values()),
    workoutExercises: Object.fromEntries(state.workoutExercises.entries()),
  };

  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadState() {
  if (!canUseStorage()) {
    return;
  }

  const raw = globalThis.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedWebState;
    state.exercises = new Map((parsed.exercises ?? []).map((item) => [item.id, item]));
    state.favorites = new Set(parsed.favorites ?? []);
    state.workouts = new Map((parsed.workouts ?? []).map((item) => [item.id, item]));
    state.workoutExercises = new Map(Object.entries(parsed.workoutExercises ?? {}));
  } catch {
    globalThis.localStorage.removeItem(STORAGE_KEY);
  }
}

loadState();

export const webStore = {
  clearExercises() {
    state.exercises.clear();
    saveState();
  },

  upsertExercises(items: ExerciseUpsertInput[]) {
    for (const item of items) {
      state.exercises.set(item.id, item);
    }
    saveState();
  },

  listExercises() {
    return Array.from(state.exercises.values());
  },

  isFavorite(exerciseId: string) {
    return state.favorites.has(exerciseId);
  },

  toggleFavorite(exerciseId: string) {
    if (state.favorites.has(exerciseId)) {
      state.favorites.delete(exerciseId);
      saveState();
      return false;
    }

    state.favorites.add(exerciseId);
    saveState();
    return true;
  },

  listFavoriteIds() {
    return Array.from(state.favorites.values());
  },

  createWorkout(workout: WorkoutCreateInput) {
    state.workouts.set(workout.id, workout);
    saveState();
  },

  updateWorkout(workoutId: string, patch: { name: string; note: string }) {
    const current = state.workouts.get(workoutId);
    if (!current) {
      return;
    }

    state.workouts.set(workoutId, { ...current, ...patch, name: patch.name.trim() });
    saveState();
  },

  deleteWorkout(workoutId: string) {
    state.workouts.delete(workoutId);
    state.workoutExercises.delete(workoutId);
    saveState();
  },

  updateWorkoutPerformedAt(workoutId: string, performedAt: string | null) {
    const current = state.workouts.get(workoutId);
    if (!current) {
      return;
    }

    state.workouts.set(workoutId, { ...current, performedAt });
    saveState();
  },

  listWorkouts() {
    return Array.from(state.workouts.values());
  },

  addWorkoutExercise(item: WorkoutExerciseAddInput) {
    const current = state.workoutExercises.get(item.workoutId) ?? [];
    current.push(item);
    state.workoutExercises.set(item.workoutId, current);
    saveState();
  },

  updateWorkoutExercise(
    workoutExerciseId: string,
    patch: Partial<Pick<WorkoutExerciseAddInput, 'sets' | 'reps' | 'restSeconds' | 'notes'>>
  ) {
    for (const [workoutId, items] of state.workoutExercises.entries()) {
      const index = items.findIndex((item) => item.id === workoutExerciseId);
      if (index < 0) {
        continue;
      }

      const current = items[index];
      items[index] = {
        ...current,
        sets: patch.sets ?? current.sets,
        reps: patch.reps ?? current.reps,
        restSeconds: patch.restSeconds ?? current.restSeconds,
        notes: patch.notes ?? current.notes,
      };

      state.workoutExercises.set(workoutId, items);
      saveState();
      return;
    }
  },

  deleteWorkoutExercise(workoutExerciseId: string) {
    for (const [workoutId, items] of state.workoutExercises.entries()) {
      const index = items.findIndex((item) => item.id === workoutExerciseId);
      if (index < 0) {
        continue;
      }

      items.splice(index, 1);
      state.workoutExercises.set(workoutId, items);
      saveState();
      return;
    }
  },

  getWorkoutExercises(workoutId: string) {
    return state.workoutExercises.get(workoutId) ?? [];
  },
};
