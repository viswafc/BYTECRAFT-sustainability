import { apiClient } from './apiClient'
import type { DataHealth, HealthResponse, SystemStatus, VersionResponse } from '../types/api'

export const systemService = {
  health: (signal?: AbortSignal) => apiClient.get<HealthResponse>('/api/health', { raw: true, signal }),
  version: (signal?: AbortSignal) => apiClient.get<VersionResponse>('/api/version', { signal }),
  status: (signal?: AbortSignal) => apiClient.get<SystemStatus>('/api/system/status', { signal }),
  dataHealth: (signal?: AbortSignal) => apiClient.get<DataHealth>('/api/data/health', { signal }),
}
