import { create } from 'zustand';

type AppState = {
  lastSyncAt: string | null;
  setLastSyncAt: (value: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
  lastSyncAt: null,
  setLastSyncAt: (value) => set({ lastSyncAt: value }),
}));
