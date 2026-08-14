import { Platform } from 'react-native';
import { db } from '../db';
import { webStore } from '../db/webStore';

const LAST_SYNC_KEY = 'lastSyncAt';

export const AppMetaRepository = {
  getLastSyncAt(): string | null {
    if (Platform.OS === 'web') {
      return webStore.getLastSyncAt();
    }

    if (!db) {
      return null;
    }

    const row = db.getFirstSync<{ value: string }>(
      'SELECT value FROM app_meta WHERE key = ? LIMIT 1',
      [LAST_SYNC_KEY]
    );
    return row?.value ?? null;
  },

  setLastSyncAt(value: string) {
    if (Platform.OS === 'web') {
      webStore.setLastSyncAt(value);
      return;
    }

    if (!db) {
      return;
    }

    db.runSync(
      `INSERT INTO app_meta (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
      [LAST_SYNC_KEY, value]
    );
  },
};
