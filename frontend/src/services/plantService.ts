import { apiClient, qs } from './apiClient'
import type { Line, Machine, Plant, PlantSummary, Zone } from '../types/api'

export const plantService = {
  list: (signal?: AbortSignal) => apiClient.get<Plant[]>('/api/plants', { signal }),
  get: (id: number, signal?: AbortSignal) => apiClient.get<Plant>(`/api/plants/${id}`, { signal }),
  summary: (id: number, signal?: AbortSignal) => apiClient.get<PlantSummary>(`/api/plants/${id}/summary`, { signal }),
  zones: (plantId?: number, signal?: AbortSignal) => apiClient.get<Zone[]>(`/api/zones${qs({ plant_id: plantId })}`, { signal }),
  lines: (plantId?: number, signal?: AbortSignal) => apiClient.get<Line[]>(`/api/lines${qs({ plant_id: plantId })}`, { signal }),
  machines: (plantId?: number, signal?: AbortSignal) => apiClient.get<Machine[]>(`/api/machines${qs({ plant_id: plantId })}`, { signal }),
}
