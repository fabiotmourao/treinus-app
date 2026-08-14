// Arquivo de fallback para o TypeScript.
// Em runtime, o Metro resolve `index.native.ts` (mobile) ou `index.web.ts` (web).
// Este arquivo existe apenas para que o TypeScript consiga resolver o módulo `../db`.
import { Platform } from 'react-native';

export type DbLike = {
  execSync: (query: string) => void;
  runSync: (query: string, params?: unknown[]) => void;
  getAllSync: <T = unknown>(query: string, params?: unknown[]) => T[];
  getFirstSync: <T = unknown>(query: string, params?: unknown[]) => T | null;
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const native = Platform.OS !== 'web' ? (require('./index.native') as { db: DbLike; initDatabase: () => void }) : null;

export const db: DbLike | null = native?.db ?? null;

export function initDatabase() {
  native?.initDatabase();
}
