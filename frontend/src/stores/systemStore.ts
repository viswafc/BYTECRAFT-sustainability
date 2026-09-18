import { create } from 'zustand';

interface SystemState {
  systemStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'UNKNOWN';
  mlModelLoaded: boolean;
  selectedPlantId: number | null;
  setSystemStatus: (status: 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'UNKNOWN') => void;
  setMlModelLoaded: (loaded: boolean) => void;
  setSelectedPlantId: (id: number | null) => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  systemStatus: 'UNKNOWN',
  mlModelLoaded: false,
  selectedPlantId: null,
  setSystemStatus: (status) => set({ systemStatus: status }),
  setMlModelLoaded: (loaded) => set({ mlModelLoaded: loaded }),
  setSelectedPlantId: (id) => set({ selectedPlantId: id }),
}));
