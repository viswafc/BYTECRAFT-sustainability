import { PageHeader } from '../layouts/PageHeader'
import { ApiErrorState, Badge, Card, EmptyState, LoadingState, ModuleNotInitialized, toneForStatus } from '../components'
import { useApi } from '../hooks'
import { plantService, sensorService } from '../services'
import { useAppStore } from '../stores/appStore'

/** Phase 2: static asset hierarchy from the registry. Live twin simulation arrives later. */
export default function DigitalTwin() {
  const plantId = useAppStore((s) => s.selectedPlantId)
  const enabled = plantId != null
  const zones = useApi((s) => plantService.zones(plantId!, s), [plantId], { enabled })
  const lines = useApi((s) => plantService.lines(plantId!, s), [plantId], { enabled })
  const machines = useApi((s) => plantService.machines(plantId!, s), [plantId], { enabled })
  const sensors = useApi((s) => sensorService.list({ plant_id: plantId!, limit: 500 }, s), [plantId], { enabled })
  const loading = zones.loading || lines.loading || machines.loading || sensors.loading
  const error = zones.error ?? lines.error ?? machines.error ?? sensors.error

  return (
    <>
      <PageHeader title="Digital Twin" description="Asset topology from the registry (plant → zone → line → machine → sensor). Network simulation and hydraulic state arrive in a later phase." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Topology" className="lg:col-span-2">
          {!enabled && <EmptyState title="No plant selected" />}
          {loading && <LoadingState lines={6} />}
          {error && <ApiErrorState error={error} onRetry={() => { zones.reload(); lines.reload(); machines.reload(); sensors.reload() }} />}
          {zones.data && zones.data.length === 0 && <EmptyState title="No topology" message="This plant has no zones registered." />}
          {zones.data && lines.data && machines.data && sensors.data && (() => { const L = lines.data, M = machines.data, S = sensors.data; return (
            <ul className="space-y-3">
              {zones.data.map((z) => (
                <li key={z.id} className="rounded-md border border-border p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold"><span className="telemetry text-primary-soft">{z.code}</span>{z.name}<Badge tone={toneForStatus(z.status)}>{z.status}</Badge></div>
                  <ul className="mt-2 space-y-2 pl-4">
                    {L.filter((l) => l.zone_id === z.id).map((l) => (
                      <li key={l.id}>
                        <div className="text-sm"><span className="telemetry text-muted">{l.code}</span> {l.name} <span className="text-xs text-muted-soft">({l.line_type})</span></div>
                        <ul className="mt-1 flex flex-wrap gap-2 pl-4">
                          {M.filter((m) => m.line_id === l.id).map((m) => (
                            <li key={m.id} className="rounded border border-border bg-surface/60 px-2 py-1 text-xs">
                              <span className="text-text">{m.name}</span>
                              <span className="telemetry ml-2 text-muted">{S.filter((s) => s.machine_id === m.id).map((s) => s.sensor_code).join(' ')}</span>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) })()}
        </Card>
        <Card title="Twin state">
          <ModuleNotInitialized module="Digital water twin" phase="a later phase" description="Hydraulic state, flow balance and interactive network graph will render here." />
        </Card>
      </div>
    </>
  )
}
