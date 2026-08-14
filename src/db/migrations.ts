import { normalizeExerciseGroup } from '../features/exercises/normalization';

// Tipo genérico de banco para evitar importar expo-sqlite no web
export type DbLike = {
  execSync: (query: string) => void;
  runSync: (query: string, params?: unknown[]) => void;
  getAllSync: <T = unknown>(query: string, params?: unknown[]) => T[];
  getFirstSync: <T = unknown>(query: string, params?: unknown[]) => T | null;
};

type Migration = {
  version: number;
  name: string;
  up: (db: DbLike) => void;
};

const migrations: Migration[] = [
  {
    version: 1,
    name: 'init_schema',
    up: (db) => {
      db.execSync(`
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS schema_migrations (
          version INTEGER PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS exercises (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL CHECK(length(trim(name)) >= 2),
          body_part TEXT NOT NULL,
          target TEXT NOT NULL,
          equipment TEXT NOT NULL,
          gif_url TEXT,
          source_updated_at TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS exercise_instructions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          exercise_id TEXT NOT NULL,
          step_order INTEGER NOT NULL CHECK(step_order > 0),
          instruction TEXT NOT NULL CHECK(length(trim(instruction)) > 0),
          FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
          UNIQUE(exercise_id, step_order)
        );

        CREATE TABLE IF NOT EXISTS exercise_secondary_muscles (
          exercise_id TEXT NOT NULL,
          muscle TEXT NOT NULL,
          FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
          PRIMARY KEY (exercise_id, muscle)
        );

        CREATE TABLE IF NOT EXISTS exercise_tags (
          exercise_id TEXT NOT NULL,
          tag TEXT NOT NULL,
          FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
          PRIMARY KEY (exercise_id, tag)
        );

        CREATE TABLE IF NOT EXISTS favorites (
          exercise_id TEXT PRIMARY KEY NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS workouts (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 2 AND 80),
          note TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS workout_exercises (
          id TEXT PRIMARY KEY NOT NULL,
          workout_id TEXT NOT NULL,
          exercise_id TEXT NOT NULL,
          sort_order INTEGER NOT NULL CHECK(sort_order >= 0),
          sets INTEGER NOT NULL DEFAULT 3 CHECK(sets > 0),
          reps INTEGER NOT NULL DEFAULT 12 CHECK(reps > 0),
          rest_seconds INTEGER NOT NULL DEFAULT 60 CHECK(rest_seconds >= 0),
          notes TEXT,
          FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
          FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT,
          UNIQUE(workout_id, sort_order)
        );

        CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);
        CREATE INDEX IF NOT EXISTS idx_exercises_body_part ON exercises(body_part);
        CREATE INDEX IF NOT EXISTS idx_exercises_target ON exercises(target);
        CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises(equipment);
        CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON workout_exercises(workout_id);
        CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise_id ON workout_exercises(exercise_id);
      `);
    },
  },
  {
    version: 2,
    name: 'exercise_group_normalization',
    up: (db) => {
      db.execSync(`
        ALTER TABLE exercises ADD COLUMN normalized_group_key TEXT NOT NULL DEFAULT '';
        ALTER TABLE exercises ADD COLUMN normalized_group_label TEXT NOT NULL DEFAULT '';
        ALTER TABLE exercises ADD COLUMN body_view TEXT NOT NULL DEFAULT 'front';

        UPDATE exercises
        SET normalized_group_label = body_part
        WHERE normalized_group_label = '';

        UPDATE exercises
        SET normalized_group_key = lower(replace(normalized_group_label, ' ', '_'))
        WHERE normalized_group_key = '';

        CREATE INDEX IF NOT EXISTS idx_exercises_normalized_group_key ON exercises(normalized_group_key);
        CREATE INDEX IF NOT EXISTS idx_exercises_body_view ON exercises(body_view);
      `);
    },
  },
  {
    version: 3,
    name: 'add_workout_performed_date',
    up: (db) => {
      db.execSync(`
        ALTER TABLE workouts ADD COLUMN performed_at TEXT;

        CREATE INDEX IF NOT EXISTS idx_workouts_performed_at ON workouts(performed_at);
      `);
    },
  },
];

export function runMigrations(db: DbLike) {
  db.execSync('PRAGMA foreign_keys = ON;');
  db.execSync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const appliedRows = db.getAllSync<{ version: number }>(
    'SELECT version FROM schema_migrations ORDER BY version ASC'
  );
  const appliedSet = new Set(appliedRows.map((item) => item.version));

  for (const migration of migrations) {
    if (appliedSet.has(migration.version)) {
      continue;
    }

    db.execSync('BEGIN;');
    try {
      migration.up(db);
      db.runSync('INSERT INTO schema_migrations (version, name) VALUES (?, ?)', [
        migration.version,
        migration.name,
      ]);
      db.execSync('COMMIT;');
    } catch (error) {
      db.execSync('ROLLBACK;');
      throw error;
    }
  }

  backfillNormalizedExerciseGroups(db);
}

function backfillNormalizedExerciseGroups(db: DbLike) {
  const rows = db.getAllSync<{
    id: string;
    bodyPart: string;
    target: string;
    tags: string | null;
  }>(`
    SELECT e.id,
           e.body_part as bodyPart,
           e.target,
           group_concat(t.tag, '|') as tags
    FROM exercises e
    LEFT JOIN exercise_tags t ON t.exercise_id = e.id
    GROUP BY e.id, e.body_part, e.target
  `);

  for (const row of rows) {
    const group = normalizeExerciseGroup({
      bodyPart: row.bodyPart,
      target: row.target,
      tags: row.tags ? row.tags.split('|').filter(Boolean) : [],
    });

    db.runSync(
      `UPDATE exercises
       SET normalized_group_key = ?,
           normalized_group_label = ?,
           body_view = ?
       WHERE id = ?
         AND (
           normalized_group_key != ?
           OR normalized_group_label != ?
           OR body_view != ?
         )`,
      [group.key, group.label, group.bodyView, row.id, group.key, group.label, group.bodyView]
    );
  }
}
