import { apiClient, qs } from './apiClient'
import type { Sensor, SensorReading, TelemetrySummary } from '../types/api'

export interface SensorFilters { plant_id?: number; machine_id?: number; sensor_type?: string; status?: string; limit?: number; offset?: number }

export const sensorService = {
  list: (f: SensorFilters = {}, signal?: AbortSignal) => apiClient.get<Sensor[]>(`/api/sensors${qs({ ...f })}`, { signal }),
  get: (id: number, signal?: AbortSignal) => apiClient.get<Sensor>(`/api/sensors/${id}`, { signal }),
  telemetrySummary: (plantId?: number, signal?: AbortSignal) =>
    apiClient.get<TelemetrySummary>(`/api/telemetry/summary${qs({ plant_id: plantId })}`, { signal }),
  latest: (id: number, signal?: AbortSignal) => apiClient.get<SensorReading | null>(`/api/telemetry/sensors/${id}/latest`, { signal }),
  history: (id: number, limit = 500, signal?: AbortSignal) =>
    apiClient.get<SensorReading[]>(`/api/telemetry/sensors/${id}/history${qs({ limit })}`, { signal }),
}
