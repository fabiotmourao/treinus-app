import { runMigrations } from './migrations';

type DbLike = {
  execSync: (query: string) => void;
  runSync: (query: string, params?: unknown[]) => void;
  getAllSync: <T = unknown>(query: string, params?: unknown[]) => T[];
  getFirstSync: <T = unknown>(query: string, params?: unknown[]) => T | null;
};

export let db: DbLike | null = null;

const SQLite = require('expo-sqlite');
db = SQLite.openDatabaseSync('treinos.db');

export function initDatabase() {
  if (!db) {
    return;
  }

  runMigrations(db as any);
}
