import { apiClient, qs } from './apiClient'
import type { Incident } from '../types/api'

export interface IncidentFilters { plant_id?: number; status?: string; severity?: string; active_only?: boolean }

export const incidentService = {
  list: (f: IncidentFilters = {}, signal?: AbortSignal) => apiClient.get<Incident[]>(`/api/incidents${qs({ ...f })}`, { signal }),
  get: (id: number, signal?: AbortSignal) => apiClient.get<Incident>(`/api/incidents/${id}`, { signal }),
}
