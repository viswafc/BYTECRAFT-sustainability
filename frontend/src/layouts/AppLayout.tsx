import { Suspense, useCallback, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/navigation/Sidebar'
import { TopBar } from '../components/navigation/TopBar'
import { LoadingState, Toaster } from '../components'
import { useAppStore } from '../stores/appStore'
import { useApi, useWebSocket } from '../hooks'
import { plantService, systemService } from '../services'
import type { WsFrame } from '../types/api'
import { toast } from '../stores/toastStore'

const STATUS_POLL_MS = 30_000

export function AppLayout() {
  const { setPlants, setSystemStatus, setSystemStateFromWs, setWsState } = useAppStore()

  const status = useApi((s) => systemService.status(s), [], { pollMs: STATUS_POLL_MS })
  const plants = useApi((s) => plantService.list(s), [])

  useEffect(() => { if (status.data) setSystemStatus(status.data); else if (status.error) setSystemStatus(null) }, [status.data, status.error, setSystemStatus])
  useEffect(() => { if (plants.data) setPlants(plants.data) }, [plants.data, setPlants])
  useEffect(() => {
    if (plants.error && plants.error.code !== 'DATABASE_UNAVAILABLE') toast.warning('Plants unavailable', plants.error.message)
  }, [plants.error])

  const onFrame = useCallback((f: WsFrame) => {
    if (f.type === 'system_heartbeat') setSystemStateFromWs(f.status.toUpperCase() as never, f.timestamp)
  }, [setSystemStateFromWs])
  const ws = useWebSocket('/api/ws/system', onFrame)
  useEffect(() => { setWsState(ws) }, [ws, setWsState])

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-6 py-6">
            <Suspense fallback={<LoadingState lines={5} />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  )
}
