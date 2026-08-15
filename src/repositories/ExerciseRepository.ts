import { db } from '../db';
import { ExerciseUpsertInput } from '../db/types';
import { validateExerciseInput } from '../db/validators';
import { Platform } from 'react-native';
import { webStore } from '../db/webStore';
import { getGroupsForView } from '../features/exercises/normalization';
import {
  filterExercises,
  filterExercisesByGroup,
  groupExercisesByView,
} from '../features/exercises/selectors';
import type { Exercise, ExerciseBodyView, ExerciseGroup } from '../features/exercises/types';

export const ExerciseRepository = {
  count() {
    if (Platform.OS === 'web') {
      return webStore.listExercises().length;
    }

    if (!db) {
      return 0;
    }

    const database = db;
    const row = database.getFirstSync<{ total: number }>('SELECT COUNT(1) as total FROM exercises');
    return row?.total ?? 0;
  },

  upsertMany(items: ExerciseUpsertInput[]) {
    if (!items.length) {
      return;
    }

    if (Platform.OS === 'web') {
      for (const item of items) {
        validateExerciseInput(item);
      }
      webStore.upsertExercises(items);
      return;
    }

    if (!db) {
      return;
    }

    const database = db;

    database.execSync('BEGIN;');
    try {
      for (const item of items) {
        validateExerciseInput(item);

        database.runSync(
          `INSERT INTO exercises (
             id,
             name,
             body_part,
             target,
             equipment,
             normalized_group_key,
             normalized_group_label,
             body_view,
             gif_url,
             gif_local_path,
             source_updated_at,
             updated_at
           )
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
           ON CONFLICT(id) DO UPDATE SET
             name=excluded.name,
             body_part=excluded.body_part,
             target=excluded.target,
             equipment=excluded.equipment,
             normalized_group_key=excluded.normalized_group_key,
             normalized_group_label=excluded.normalized_group_label,
             body_view=excluded.body_view,
             gif_url=excluded.gif_url,
             gif_local_path=excluded.gif_local_path,
             source_updated_at=excluded.source_updated_at,
             updated_at=datetime('now')`,
          [
            item.id,
            item.name.trim(),
            item.bodyPart.trim(),
            item.target.trim(),
            item.equipment.trim(),
            item.normalizedGroupKey ?? null,
            item.normalizedGroupLabel ?? null,
            item.bodyView ?? null,
            item.gifUrl ?? null,
            item.gifLocalPath ?? null,
            item.sourceUpdatedAt ?? null,
          ]
        );

        database.runSync('DELETE FROM exercise_instructions WHERE exercise_id = ?', [item.id]);
        database.runSync('DELETE FROM exercise_secondary_muscles WHERE exercise_id = ?', [item.id]);
        database.runSync('DELETE FROM exercise_tags WHERE exercise_id = ?', [item.id]);

        item.instructions.forEach((instruction, index) => {
          database.runSync(
            'INSERT INTO exercise_instructions (exercise_id, step_order, instruction) VALUES (?, ?, ?)',
            [item.id, index + 1, instruction.trim()]
          );
        });

        item.secondaryMuscles.forEach((muscle) => {
          database.runSync('INSERT INTO exercise_secondary_muscles (exercise_id, muscle) VALUES (?, ?)', [
            item.id,
            muscle.trim(),
          ]);
        });

        item.tags.forEach((tag) => {
          database.runSync('INSERT INTO exercise_tags (exercise_id, tag) VALUES (?, ?)', [item.id, tag.trim()]);
        });
      }

      database.execSync('COMMIT;');
    } catch (error) {
      database.execSync('ROLLBACK;');
      throw error;
    }
  },

  list(params?: { search?: string; bodyPart?: string; limit?: number; offset?: number }) {
    const limit = params?.limit ?? 30;
    const offset = params?.offset ?? 0;
    const search = params?.search?.trim() ?? '';
    const bodyPart = params?.bodyPart?.trim() ?? '';

    if (Platform.OS === 'web') {
      return filterExercises(webStore.listExercises(), { search, bodyPart, limit, offset });
    }

    if (!db) {
      return [];
    }

    const database = db;

    return database.getAllSync<Exercise>(
      `SELECT id, name, body_part as bodyPart, target, equipment, gif_url as gifUrl, gif_local_path as gifLocalPath
       FROM exercises
       WHERE (
         ? = ''
         OR name LIKE '%' || ? || '%'
         OR body_part LIKE '%' || ? || '%'
         OR target LIKE '%' || ? || '%'
         OR equipment LIKE '%' || ? || '%'
       )
         AND (? = '' OR body_part = ?)
       ORDER BY name ASC
       LIMIT ? OFFSET ?`,
      [search, search, search, search, search, bodyPart, bodyPart, limit, offset]
    );
  },

  listGroupsByView(view: ExerciseBodyView, search = ''): ExerciseGroup[] {
    const allowedGroups = getGroupsForView(view);

    if (Platform.OS === 'web') {
      return groupExercisesByView(webStore.listExercises(), view, allowedGroups, search);
    }

    if (!db) {
      return [];
    }

    const database = db;
    const rows = database.getAllSync<ExerciseGroup>(
      `SELECT normalized_group_key as groupKey,
              normalized_group_label as groupLabel,
              ? as bodyView,
              COUNT(1) as total
       FROM exercises
       WHERE (body_view = ? OR body_view = 'both')
         AND (
           ? = ''
           OR name LIKE '%' || ? || '%'
           OR body_part LIKE '%' || ? || '%'
           OR target LIKE '%' || ? || '%'
           OR equipment LIKE '%' || ? || '%'
         )
       GROUP BY normalized_group_key, normalized_group_label`,
      [view, view, search, search, search, search, search]
    );

    const rowsMap = new Map(rows.map((item) => [item.groupKey, item]));
    return allowedGroups
      .map((group) => rowsMap.get(group.key) ?? { groupKey: group.key, groupLabel: group.label, bodyView: view, total: 0 })
      .filter((group) => group.total > 0);
  },

  listByGroup(params: { groupKey: string; bodyView: ExerciseBodyView; search?: string; limit?: number; offset?: number }) {
    const limit = params.limit ?? 30;
    const offset = params.offset ?? 0;
    const search = params.search?.trim() ?? '';
    const groupKey = params.groupKey.trim();

    if (!groupKey) {
      return [];
    }

    if (Platform.OS === 'web') {
      return filterExercisesByGroup(webStore.listExercises(), {
        groupKey,
        bodyView: params.bodyView,
        search,
        limit,
        offset,
      });
    }

    if (!db) {
      return [];
    }

    const database = db;
    return database.getAllSync<Exercise>(
      `SELECT id, name, body_part as bodyPart, target, equipment, gif_url as gifUrl, gif_local_path as gifLocalPath
       FROM exercises
       WHERE normalized_group_key = ?
         AND (body_view = ? OR body_view = 'both')
         AND (
           ? = ''
           OR name LIKE '%' || ? || '%'
           OR body_part LIKE '%' || ? || '%'
           OR target LIKE '%' || ? || '%'
           OR equipment LIKE '%' || ? || '%'
         )
       ORDER BY name ASC
       LIMIT ? OFFSET ?`,
      [groupKey, params.bodyView, search, search, search, search, search, limit, offset]
    );
  },

  listBodyParts() {
    if (Platform.OS === 'web') {
      return Array.from(new Set(webStore.listExercises().map((item) => item.bodyPart))).sort((a, b) =>
        a.localeCompare(b)
      );
    }

    if (!db) {
      return [];
    }

    const database = db;
    const rows = database.getAllSync<{ bodyPart: string }>(
      `SELECT DISTINCT body_part as bodyPart
       FROM exercises
       WHERE body_part IS NOT NULL AND body_part != ''
       ORDER BY body_part ASC`
    );

    return rows.map((row) => row.bodyPart);
  },

  getById(exerciseId: string) {
    if (Platform.OS === 'web') {
      const item = webStore.listExercises().find((entry) => entry.id === exerciseId);
      if (!item) {
        return null;
      }

      return {
        id: item.id,
        name: item.name,
        bodyPart: item.bodyPart,
        target: item.target,
        equipment: item.equipment,
        gifUrl: item.gifUrl ?? null,
        gifLocalPath: item.gifLocalPath ?? null,
        instructions: item.instructions ?? [],
        secondaryMuscles: item.secondaryMuscles ?? [],
        tags: item.tags ?? [],
      };
    }

    if (!db) {
      return null;
    }

    const database = db;
    const item = database.getFirstSync<{
      id: string;
      name: string;
      bodyPart: string;
      target: string;
      equipment: string;
      gifUrl: string | null;
      gifLocalPath?: string | null;
    }>(
      `SELECT id, name, body_part as bodyPart, target, equipment, gif_url as gifUrl, gif_local_path as gifLocalPath
       FROM exercises
       WHERE id = ?
       LIMIT 1`,
      [exerciseId]
    );

    if (!item) {
      return null;
    }

    const instructions = database.getAllSync<{ instruction: string }>(
      `SELECT instruction FROM exercise_instructions
       WHERE exercise_id = ?
       ORDER BY step_order ASC`,
      [exerciseId]
    );

    const secondaryMuscles = database.getAllSync<{ muscle: string }>(
      `SELECT muscle FROM exercise_secondary_muscles
       WHERE exercise_id = ?
       ORDER BY muscle ASC`,
      [exerciseId]
    );

    const tags = database.getAllSync<{ tag: string }>(
      `SELECT tag FROM exercise_tags
       WHERE exercise_id = ?
       ORDER BY tag ASC`,
      [exerciseId]
    );

    return {
      ...item,
      instructions: instructions.map((entry) => entry.instruction),
      secondaryMuscles: secondaryMuscles.map((entry) => entry.muscle),
      tags: tags.map((entry) => entry.tag),
    };
  },
};
