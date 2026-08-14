import { db } from '../db';
import { Platform } from 'react-native';
import { webStore } from '../db/webStore';

export const FavoritesRepository = {
  isFavorite(exerciseId: string) {
    if (Platform.OS === 'web') {
      return webStore.isFavorite(exerciseId);
    }

    if (!db) {
      return false;
    }

    const row = db.getFirstSync<{ exists: number }>(
      'SELECT 1 as exists FROM favorites WHERE exercise_id = ? LIMIT 1',
      [exerciseId]
    );
    return !!row;
  },

  toggle(exerciseId: string) {
    if (Platform.OS === 'web') {
      return webStore.toggleFavorite(exerciseId);
    }

    if (!db) {
      return false;
    }

    if (this.isFavorite(exerciseId)) {
      db.runSync('DELETE FROM favorites WHERE exercise_id = ?', [exerciseId]);
      return false;
    }

    db.runSync('INSERT INTO favorites (exercise_id) VALUES (?)', [exerciseId]);
    return true;
  },

  list() {
    if (Platform.OS === 'web') {
      const favorites = new Set(webStore.listFavoriteIds());
      return webStore
        .listExercises()
        .filter((item) => favorites.has(item.id))
        .map((item) => ({
          id: item.id,
          name: item.name,
          bodyPart: item.bodyPart,
          target: item.target,
          equipment: item.equipment,
          gifUrl: item.gifUrl ?? null,
        }));
    }

    if (!db) {
      return [];
    }

    return db.getAllSync(
      `SELECT e.id, e.name, e.body_part as bodyPart, e.target, e.equipment, e.gif_url as gifUrl
       FROM favorites f
       JOIN exercises e ON e.id = f.exercise_id
       ORDER BY f.created_at DESC`
    );
  },
};
