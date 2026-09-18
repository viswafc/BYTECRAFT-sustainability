/** Typed API client. All calls are relative so the dev-server/nginx proxy handles routing. */

export type Status = 'ok' | 'degraded' | 'error' | 'unknown'

export interface HealthResponse { status: 'healthy'; version: string }
export interface VersionResponse {
  name: string; version: string; api_version: string; environment: string; phase: string
}
export interface ComponentStatus { name: string; status: Status; detail?: string | null; info: Record<string, unknown> }
export interface SystemStatusResponse { status: Status; version: string; timestamp: string; components: ComponentStatus[] }
export interface DataHealthResponse {
  status: Status; dataset_path: string; rows?: number | null; columns?: number | null
  missing_values?: number | null; duplicate_rows?: number | null; positive_rate?: number | null
  schema_valid?: boolean | null; detail?: string | null
}
export interface ModelInfo {
  model_name: string; feature_config: string; version: string; training_timestamp: string
  features: string[]; target: string; training_dataset: string
  evaluation_metrics: Record<string, unknown> & {
    accuracy?: number; precision?: number; recall?: number; f1?: number; roc_auc?: number | null; pr_auc?: number | null
  }
  is_default: boolean
}
export interface ModelListResponse { default: string | null; models: ModelInfo[] }
export interface SensorReading {
  Pressure: number; Flow_Rate: number; Temperature: number; Vibration: number; RPM: number; Operational_Hours: number
  Latitude?: number; Longitude?: number; Zone?: string; Block?: string; Pipe?: string; Location_Code?: string
}
export interface PredictResponse { model: string; predictions: { leak_predicted: boolean; leak_probability: number | null }[] }

export class ApiError extends Error {
  status: number
  code: string
  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(BASE + path, { headers: { 'Content-Type': 'application/json' }, ...init })
  } catch {
    throw new ApiError(0, 'network_error', 'Cannot reach the AquaRisk API. Is the backend running?')
  }
  if (!res.ok) {
    let msg = `Request failed (${res.status})`
    let code = 'http_error'
    try {
      const body = await res.json()
      if (body?.error?.message) { msg = body.error.message; code = body.error.code ?? code }
    } catch { /* non-JSON error body */ }
    throw new ApiError(res.status, code, msg)
  }
  return res.json() as Promise<T>
}

export const api = {
  health: () => request<HealthResponse>('/health'),
  version: () => request<VersionResponse>('/api/version'),
  systemStatus: () => request<SystemStatusResponse>('/api/system/status'),
  dataHealth: () => request<DataHealthResponse>('/api/data/health'),
  models: () => request<ModelListResponse>('/api/models'),
  predict: (readings: SensorReading[], feature_config?: string, model_name?: string) =>
    request<PredictResponse>('/api/predict', {
      method: 'POST',
      body: JSON.stringify({ readings, feature_config, model_name }),
    }),
}
