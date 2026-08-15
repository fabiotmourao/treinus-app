import { create } from 'zustand';
import { AppMetaRepository } from '../repositories/AppMetaRepository';

type AppState = {
  lastSyncAt: string | null;
  setLastSyncAt: (value: string) => void;
  loadLastSyncAt: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  lastSyncAt: null,
  setLastSyncAt: (value) => {
    AppMetaRepository.setLastSyncAt(value);
    set({ lastSyncAt: value });
  },
  loadLastSyncAt: () => set({ lastSyncAt: AppMetaRepository.getLastSyncAt() }),
}));
