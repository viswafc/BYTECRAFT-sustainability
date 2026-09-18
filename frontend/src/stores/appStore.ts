/** Global app state (Zustand). Only genuinely cross-cutting state lives here. */
import { create } from 'zustand'
import type { HealthState, Plant, SystemStatus } from '../types/api'

export type WsState = 'connecting' | 'open' | 'closed' | 'error'

interface AppState {
  plants: Plant[]
  selectedPlantId: number | null
  systemStatus: SystemStatus | null
  systemState: HealthState
  lastSync: string | null
  wsState: WsState
  sidebarCollapsed: boolean
  selectedSensorId: number | null
  selectedIncidentId: number | null

  setPlants: (plants: Plant[]) => void
  selectPlant: (id: number | null) => void
  setSystemStatus: (s: SystemStatus | null) => void
  setSystemStateFromWs: (state: HealthState, ts: string) => void
  setWsState: (s: WsState) => void
  toggleSidebar: () => void
  selectSensor: (id: number | null) => void
  selectIncident: (id: number | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  plants: [],
  selectedPlantId: null,
  systemStatus: null,
  systemState: 'UNKNOWN',
  lastSync: null,
  wsState: 'closed',
  sidebarCollapsed: false,
  selectedSensorId: null,
  selectedIncidentId: null,

  setPlants: (plants) => set((s) => ({
    plants,
    selectedPlantId: s.selectedPlantId ?? plants[0]?.id ?? null,
  })),
  selectPlant: (id) => set({ selectedPlantId: id }),
  setSystemStatus: (systemStatus) => set({
    systemStatus, systemState: systemStatus?.state ?? 'OFFLINE',
    lastSync: systemStatus ? new Date().toISOString() : null,
  }),
  setSystemStateFromWs: (state, ts) => set({ systemState: state, lastSync: ts }),
  setWsState: (wsState) => set({ wsState }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  selectSensor: (selectedSensorId) => set({ selectedSensorId }),
  selectIncident: (selectedIncidentId) => set({ selectedIncidentId }),
}))
