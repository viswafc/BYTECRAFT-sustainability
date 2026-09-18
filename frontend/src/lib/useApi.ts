import { useCallback, useEffect, useState } from 'react'
import { ApiError } from './api'

export interface AsyncState<T> { data: T | null; error: string | null; loading: boolean; reload: () => void }

/** Minimal data-fetching hook: loading / error / data with manual reload. */
export function useApi<T>(fn: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    fn().then(
      (d) => { if (alive) { setData(d); setLoading(false) } },
      (e: unknown) => {
        if (!alive) return
        setError(e instanceof ApiError ? e.message : 'Something went wrong while loading data.')
        setLoading(false)
      },
    )
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { data, error, loading, reload }
}
