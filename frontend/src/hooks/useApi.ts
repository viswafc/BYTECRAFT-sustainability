import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '../services/apiClient'

export interface AsyncState<T> {
  data: T | null
  error: ApiError | null
  loading: boolean
  lastSuccess: string | null
  reload: () => void
}

/**
 * Fetch hook with cancellation on unmount / dependency change, optional polling
 * and a stable `reload`. `fn` receives an AbortSignal it must forward to the service.
 */
export function useApi<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  deps: readonly unknown[] = [],
  opts: { enabled?: boolean; pollMs?: number } = {},
): AsyncState<T> {
  const { enabled = true, pollMs } = opts
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [lastSuccess, setLastSuccess] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    if (!enabled) { setLoading(false); return }
    const ctrl = new AbortController()
    let alive = true
    setLoading(true)
    fnRef.current(ctrl.signal).then(
      (d) => { if (!alive) return; setData(d); setError(null); setLastSuccess(new Date().toISOString()); setLoading(false) },
      (e: unknown) => {
        if (!alive || (e instanceof DOMException && e.name === 'AbortError')) return
        setError(e instanceof ApiError ? e : new ApiError(0, 'UNKNOWN', 'Something went wrong while loading data.'))
        setLoading(false)
      },
    )
    let timer: ReturnType<typeof setInterval> | undefined
    if (pollMs) timer = setInterval(() => setTick((t) => t + 1), pollMs)
    return () => { alive = false; ctrl.abort(); if (timer) clearInterval(timer) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, enabled, pollMs, ...deps])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { data, error, loading, lastSuccess, reload }
}
