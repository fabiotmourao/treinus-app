import { SyncService } from '../../services/sync/SyncService';
import { exercisesFeatureRepository } from '../exercises/repository';

export async function needsInitialSync(): Promise<boolean> {
  return exercisesFeatureRepository.count() === 0;
}

export async function runInitialSync(onProgress?: (loaded: number) => void) {
  const result = await SyncService.syncExercises();
  onProgress?.(result.totalSaved);
  return result;
}
