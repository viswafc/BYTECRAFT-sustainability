import { vi } from 'vitest'

export const ok = (data: unknown, meta: Record<string, unknown> = {}) =>
  ({ ok: true, status: 200, json: async () => ({ data, meta: { timestamp: new Date().toISOString(), version: '0.1.0', ...meta } }) }) as Response
export const raw = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response
export const fail = (status: number, code: string, message: string) =>
  ({ ok: false, status, json: async () => ({ error: { code, message } }) }) as Response
export const netFail = () => Promise.reject(new TypeError('Failed to fetch'))

export const plant = { id: 1, code: 'PLT-1', name: 'Test Plant', location: 'X', timezone: 'UTC', latitude: null, longitude: null, status: 'active', created_at: '', updated_at: '' }
export const status = {
  state: 'ONLINE', version: '0.1.0', environment: 'test', uptime_seconds: 1,
  components: [
    { name: 'backend', state: 'ONLINE', detail: 'v0.1.0', info: {} },
    { name: 'database', state: 'ONLINE', detail: 'connected', info: {} },
    { name: 'ml', state: 'ONLINE', detail: 'rf', info: {} },
    { name: 'websocket', state: 'ONLINE', detail: '0 clients', info: {} },
  ],
}

type Handler = () => Promise<Response> | Response

export function mockApi(overrides: Record<string, Handler> = {}) {
  const routes: Record<string, Handler> = {
    '/api/health': () => raw({ status: 'healthy', version: '0.1.0' }),
    '/api/version': () => ok({ name: 'AquaRisk AI', version: '0.1.0', api_version: 'v1', environment: 'test', phase: '2' }),
    '/api/system/status': () => ok(status),
    '/api/plants': () => ok([plant], { count: 1 }),
    '/api/plants/1/summary': () => ok({ plant, zones: 3, lines: 4, machines: 8, sensors: 20, sensors_by_status: { unknown: 20 }, active_incidents: 0 }),
    '/api/telemetry/summary': () => ok({ provider: 'database', sensors_total: 20, sensors_online: 0, sensors_warning: 0, readings_today: 0, last_reading_at: null, note: 'No telemetry has been ingested yet.' }),
    '/api/incidents': () => ok([], { count: 0 }),
    '/api/sensors': () => ok([{ id: 1, machine_id: 1, sensor_code: 'S01', sensor_type: 'pressure', unit: 'bar', status: 'unknown', installed_at: null, latitude: null, longitude: null }], { count: 1 }),
    '/api/zones': () => ok([]), '/api/lines': () => ok([]), '/api/machines': () => ok([]),
    '/api/ml/models': () => ok([]), '/api/ml/health': () => ok({ state: 'ONLINE', ready: true, default_model: 'B/rf', n_registered: 8 }),
    '/api/data/health': () => ok({ state: 'ONLINE', dataset_path: 'x.csv', rows: 5000, columns: 13, missing_values: 0, duplicate_rows: 0, positive_rate: 0.0646, schema_valid: true }),
    ...overrides,
  }
  const calls: string[] = []
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    const path = url.replace(/^https?:\/\/[^/]+/, '').split('?')[0]
    calls.push(path)
    const h = routes[path]
    return Promise.resolve(h ? h() : fail(404, 'NOT_FOUND', `no mock for ${path}`))
  }))
  return calls
}
