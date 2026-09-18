/** Shared API contract types (mirror backend/app/schemas). */

export type HealthState = 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'UNKNOWN'

export interface Meta {
  timestamp: string
  version: string
  count?: number | null
  limit?: number | null
  offset?: number | null
  source?: string | null
}
export interface Envelope<T> { data: T; meta: Meta }
export interface ApiErrorBody { error: { code: string; message: string; details?: unknown } }

export interface HealthResponse { status: 'healthy'; version: string }
export interface VersionResponse { name: string; version: string; api_version: string; environment: string; phase: string }

export interface ComponentHealth { name: string; state: HealthState; detail?: string | null; info: Record<string, unknown> }
export interface SystemStatus {
  state: HealthState; version: string; environment: string; uptime_seconds: number; components: ComponentHealth[]
}

export interface Plant {
  id: number; code: string; name: string; location: string | null; timezone: string
  latitude: number | null; longitude: number | null; status: string; created_at: string; updated_at: string
}
export interface Zone { id: number; plant_id: number; code: string; name: string; status: string; latitude: number | null; longitude: number | null }
export interface Line { id: number; zone_id: number; code: string; name: string; line_type: string | null; status: string }
export interface Machine { id: number; line_id: number; code: string; name: string; machine_type: string | null; status: string }
export interface Sensor {
  id: number; machine_id: number; sensor_code: string; sensor_type: string; unit: string | null
  status: string; installed_at: string | null; latitude: number | null; longitude: number | null
}
export interface PlantSummary {
  plant: Plant; zones: number; lines: number; machines: number; sensors: number
  sensors_by_status: Record<string, number>; active_incidents: number
}

export interface SensorReading { id: number | null; sensor_id: number; timestamp: string; value: number; quality: string | null }
export interface TelemetrySummary {
  provider: string; sensors_total: number; sensors_online: number; sensors_warning: number
  readings_today: number; last_reading_at: string | null; note: string | null
}

export interface Incident {
  id: number; plant_id: number; zone_id: number | null; line_id: number | null; machine_id: number | null; sensor_id: number | null
  title: string; incident_type: string; severity: string; status: string; started_at: string; ended_at: string | null; summary: string | null
}

export interface ModelMetrics { accuracy?: number; precision?: number; recall?: number; f1?: number; roc_auc?: number | null; pr_auc?: number | null }
export interface ModelInfo {
  name: string; version: string; model_type: string; status: string; path: string; features: string[]; target: string
  training_dataset: string; trained_at: string; metrics: ModelMetrics & Record<string, unknown>; is_default: boolean
}
export interface ModelHealth { state: HealthState; ready: boolean; detail?: string | null; default_model?: string | null; n_registered: number }

export interface SensorReadingInput {
  Pressure: number; Flow_Rate: number; Temperature: number; Vibration: number; RPM: number; Operational_Hours: number
  Latitude?: number; Longitude?: number; Zone?: string; Block?: string; Pipe?: string; Location_Code?: string
}
export interface PredictResponse { model: string; predictions: { leak_predicted: boolean; leak_probability: number | null }[]; disclaimer: string }

export interface DataHealth {
  state: HealthState; dataset_path: string; rows?: number | null; columns?: number | null; missing_values?: number | null
  duplicate_rows?: number | null; positive_rate?: number | null; schema_valid?: boolean | null; detail?: string | null
}

/* websocket frames */
export interface WsHeartbeat { type: 'system_heartbeat'; timestamp: string; status: string; components: Record<string, HealthState> }
export interface WsConnected { type: 'connected'; channel: string; timestamp: string }
export interface WsPong { type: 'pong'; timestamp: string }
export type WsFrame = WsHeartbeat | WsConnected | WsPong
