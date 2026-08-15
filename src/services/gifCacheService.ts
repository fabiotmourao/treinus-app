import { Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';
import { ExerciseUpsertInput } from '../db/types';

const GIF_DIR_NAME = 'exercise_gifs';

function getGifDirectory(): Directory | null {
  if (Platform.OS === 'web') {
    return null;
  }

  const dir = new Directory(Paths.document, GIF_DIR_NAME);
  if (!dir.exists) {
    dir.create();
  }
  return dir;
}

function getLocalFileName(exerciseId: string, gifUrl: string): string {
  const extMatch = gifUrl.match(/\.(\w{2,5})(\?|$)/);
  const ext = extMatch?.[1] ?? 'gif';
  return `${exerciseId}.${ext}`;
}

async function downloadGif(exerciseId: string, gifUrl: string): Promise<string | null> {
  const dir = getGifDirectory();
  if (!dir) {
    return null;
  }

  const fileName = getLocalFileName(exerciseId, gifUrl);
  const file = new File(dir, fileName);

  if (file.exists) {
    return file.uri;
  }

  try {
    const downloaded = await File.downloadFileAsync(gifUrl, file, { idempotent: true });
    return downloaded.uri;
  } catch {
    return null;
  }
}

export async function cacheExerciseGifs(items: ExerciseUpsertInput[], onProgress?: (done: number, total: number) => void) {
  const withGif = items.filter((item) => item.gifUrl);

  let done = 0;
  const total = withGif.length;

  await Promise.all(
    withGif.map(async (item) => {
      const localPath = await downloadGif(item.id, item.gifUrl!);
      if (localPath) {
        item.gifLocalPath = localPath;
      }
      done += 1;
      onProgress?.(done, total);
    })
  );

  return items;
}
