import { create } from 'zustand';
import { defaultFilters } from '../utils/filters';
import { LaunchFilters } from '../types/spacex';

type MissionState = {
  filters: LaunchFilters;
  lastSyncedAt: string | null;
  syncError: string | null;
  setFilters: (filters: Partial<LaunchFilters>) => void;
  resetFilters: () => void;
  setSyncState: (lastSyncedAt: string | null, syncError: string | null) => void;
};

export const useMissionStore = create<MissionState>((set) => ({
  filters: defaultFilters,
  lastSyncedAt: null,
  syncError: null,
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),
  setSyncState: (lastSyncedAt, syncError) => set({ lastSyncedAt, syncError }),
}));
