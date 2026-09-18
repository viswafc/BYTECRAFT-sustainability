/**
 * Central API client. Owns: base URL, timeouts, cancellation, envelope parsing,
 * error normalisation and (future) auth headers. Components never call fetch directly.
 */
import type { ApiErrorBody, Envelope } from '../types/api'
import { logger } from '../utils/logger'

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
  get isNetwork() { return this.status === 0 && this.code === 'NETWORK_ERROR' }
  get isTimeout() { return this.code === 'TIMEOUT' }
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''
const DEFAULT_TIMEOUT_MS = 10_000

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  timeoutMs?: number
  /** Skip envelope unwrapping (for plain endpoints like /health). */
  raw?: boolean
}

let authToken: string | null = null
/** Reserved for later phases; kept here so auth never leaks into components. */
export function setAuthToken(token: string | null) { authToken = token }

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { body, timeoutMs = DEFAULT_TIMEOUT_MS, raw = false, signal, headers, ...init } = opts
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(new DOMException('timeout', 'TimeoutError')), timeoutMs)
  signal?.addEventListener('abort', () => controller.abort(signal.reason))

  let res: Response
  try {
    res = await fetch(BASE_URL + path, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (e) {
    clearTimeout(timer)
    if (e instanceof DOMException && (e.name === 'TimeoutError' || (e.name === 'AbortError' && controller.signal.reason?.name === 'TimeoutError'))) {
      throw new ApiError(0, 'TIMEOUT', 'The request timed out. The backend may be busy or unreachable.')
    }
    if (e instanceof DOMException && e.name === 'AbortError') throw e // caller cancelled
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the AquaRisk API. Is the backend running?')
  }
  clearTimeout(timer)

  if (!res.ok) {
    let code = 'HTTP_ERROR'
    let message = `Request failed (${res.status})`
    let details: unknown
    try {
      const b = (await res.json()) as ApiErrorBody
      if (b?.error) { code = b.error.code ?? code; message = b.error.message ?? message; details = b.error.details }
    } catch { /* non-JSON body */ }
    logger.warn('api error', { path, status: res.status, code })
    throw new ApiError(res.status, code, message, details)
  }
  if (res.status === 204) return undefined as T
  const json = await res.json()
  return raw ? (json as T) : (json as Envelope<T>).data
}

export const apiClient = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'POST', body }),
  /** Full envelope (data + meta) when the caller needs meta (counts, source). */
  getEnvelope: <T>(path: string, opts?: RequestOptions) => request<Envelope<T>>(path, { ...opts, method: 'GET', raw: true }),
}

/** Build a query string, dropping undefined/null values. */
export function qs(params: Record<string, string | number | boolean | null | undefined>): string {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') p.set(k, String(v))
  const s = p.toString()
  return s ? `?${s}` : ''
}
