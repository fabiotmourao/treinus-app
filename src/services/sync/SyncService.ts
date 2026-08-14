import { exerciseDbClient } from '../api/exerciseDbClient';
import { ExerciseRepository } from '../../repositories/ExerciseRepository';
import { ExerciseUpsertInput } from '../../db/types';
import { mapApiExercise } from '../../features/exercises/mappers';

type SyncResult = {
  totalReceived: number;
  totalSaved: number;
  syncedAt: string;
};

type ApiMeta = {
  total?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  nextCursor?: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractItems(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload as Record<string, unknown>[];
  }

  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    if (Array.isArray(data.data)) {
      return data.data as Record<string, unknown>[];
    }
    if (Array.isArray(data.results)) {
      return data.results as Record<string, unknown>[];
    }
    if (Array.isArray(data.exercises)) {
      return data.exercises as Record<string, unknown>[];
    }
  }

  return [];
}

function extractMeta(payload: unknown): ApiMeta {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  const data = payload as Record<string, unknown>;
  if (!data.meta || typeof data.meta !== 'object') {
    return {};
  }

  return data.meta as ApiMeta;
}

async function withRetry<T>(run: () => Promise<T>, retries = 2, delayMs = 700): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

async function fetchPage(params: { after?: string; limit: number }) {
  let attempt = 0;

  while (attempt < 6) {
    try {
      return await exerciseDbClient.get('/exercises', {
        params: {
          limit: params.limit,
          ...(params.after ? { after: params.after } : {}),
        },
      });
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; headers?: Record<string, string>; data?: Record<string, unknown> };
      };

      const status = err.response?.status ?? 0;
      const retryAfterHeader = err.response?.headers?.['retry-after'];
      const retryAfterBody = err.response?.data?.retry_after;

      if (status === 429) {
        const waitSeconds = Number(retryAfterHeader ?? retryAfterBody ?? 15);
        const waitMs = Number.isFinite(waitSeconds) ? waitSeconds * 1000 : 15000;
        await sleep(waitMs);
        attempt += 1;
        continue;
      }

      if (attempt < 5) {
        await sleep(1200 * (attempt + 1));
        attempt += 1;
        continue;
      }

      throw error;
    }
  }

  throw new Error('Não foi possível buscar exercícios da API após múltiplas tentativas.');
}

function splitInBatches<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
}

export const SyncService = {
  async syncExercises(): Promise<SyncResult> {
    const rawItems: Record<string, unknown>[] = [];
    const visitedCursors = new Set<string>();
    let after: string | undefined;

    for (let page = 0; page < 80; page += 1) {
      let response;
      try {
        response = await withRetry(() => fetchPage({ limit: 100, after }));
      } catch (error) {
        if (!rawItems.length) {
          throw error;
        }
        break;
      }

      const pageItems = extractItems(response.data);
      rawItems.push(...pageItems);

      const meta = extractMeta(response.data);
      const hasNextPage = !!meta.hasNextPage;
      const nextCursor = typeof meta.nextCursor === 'string' ? meta.nextCursor : '';

      if (!hasNextPage || !nextCursor || visitedCursors.has(nextCursor)) {
        break;
      }

      visitedCursors.add(nextCursor);
      after = nextCursor;
      await sleep(220);
    }

    const mappedItems = rawItems.map(mapApiExercise).filter((item): item is ExerciseUpsertInput => !!item);
    const uniqueMappedItems = Array.from(new Map(mappedItems.map((item) => [item.id, item])).values());
    const batches = splitInBatches(uniqueMappedItems, 200);

    for (const batch of batches) {
      ExerciseRepository.upsertMany(batch);
    }

    return {
      totalReceived: rawItems.length,
      totalSaved: uniqueMappedItems.length,
      syncedAt: new Date().toISOString(),
    };
  },
};
