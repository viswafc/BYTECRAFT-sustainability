import { useEffect, useRef, useState } from 'react'
import type { WsFrame } from '../types/api'
import type { WsState } from '../stores/appStore'
import { logger } from '../utils/logger'

/** Resolve ws(s):// URL for a same-origin path (the dev server / nginx proxies /api/ws). */
export function wsUrl(path: string): string {
  const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) || window.location.origin
  const u = new URL(path, base)
  u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:'
  return u.toString()
}

/**
 * Single WebSocket subscription with exponential-backoff reconnect.
 * Cleans up on unmount (no leaked sockets/timers). Frames go to `onFrame`.
 */
export function useWebSocket(path: string, onFrame: (f: WsFrame) => void, enabled = true) {
  const [state, setState] = useState<WsState>('closed')
  const onFrameRef = useRef(onFrame)
  onFrameRef.current = onFrame

  useEffect(() => {
    if (!enabled) return
    let ws: WebSocket | null = null
    let attempt = 0
    let closedByUs = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const connect = () => {
      setState('connecting')
      try { ws = new WebSocket(wsUrl(path)) } catch (e) { logger.warn('ws construct failed', e); setState('error'); return }
      ws.onopen = () => { attempt = 0; setState('open') }
      ws.onmessage = (ev) => { try { onFrameRef.current(JSON.parse(ev.data)) } catch (e) { logger.warn('ws bad frame', e) } }
      ws.onerror = () => setState('error')
      ws.onclose = () => {
        setState('closed')
        if (closedByUs) return
        const delay = Math.min(30_000, 1000 * 2 ** attempt++)
        timer = setTimeout(connect, delay)
      }
    }
    connect()
    return () => { closedByUs = true; if (timer) clearTimeout(timer); ws?.close() }
  }, [path, enabled])

  return state
}
