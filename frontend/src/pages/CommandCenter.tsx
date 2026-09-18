import { PageHeader } from '../layouts/PageHeader'
import { ApiErrorState, Card, ChartContainer, EmptyState, LoadingState, Metric, StatusIndicator } from '../components'
import { useApi } from '../hooks'
import { incidentService, plantService, sensorService } from '../services'
import { useAppStore } from '../stores/appStore'
import { fmtInt, fmtTime } from '../utils/format'

export default function CommandCenter() {
  const plantId = useAppStore((s) => s.selectedPlantId)
  const systemStatus = useAppStore((s) => s.systemStatus)
  const enabled = plantId != null

  const summary = useApi((s) => plantService.summary(plantId!, s), [plantId], { enabled })
  const telemetry = useApi((s) => sensorService.telemetrySummary(plantId!, s), [plantId], { enabled })
  const incidents = useApi((s) => incidentService.list({ plant_id: plantId!, active_only: true }, s), [plantId], { enabled })

  const online = systemStatus?.components.filter((c) => c.state === 'ONLINE').length ?? 0
  const total = systemStatus?.components.length ?? 0
  const healthPct = total ? Math.round((online / total) * 100) : null

  return (
    <>
      <PageHeader title="Command Center" description="Real system health and infrastructure baseline. Live intelligence (baseline, anomalies, risk) is added in later phases." />

      {!enabled && (
        <div className="mb-4">
          <EmptyState title="No plant available" message="No plants were returned by the API. Seed the database (python database/seeds/seed_infrastructure.py) or check the database connection in Settings." />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-5">
        <Metric label="Connected sensors" value={summary.data ? fmtInt(summary.data.sensors) : '—'} tone="aqua" hint={summary.data ? `${summary.data.machines} machines · ${summary.data.lines} lines` : undefined} />
        <Metric label="Online" value={telemetry.data ? fmtInt(telemetry.data.sensors_online) : '—'} tone={telemetry.data?.sensors_online ? 'normal' : 'default'} hint={telemetry.data ? `${fmtInt(telemetry.data.sensors_total - telemetry.data.sensors_online)} not reporting` : undefined} />
        <Metric label="Warnings" value={telemetry.data ? fmtInt(telemetry.data.sensors_warning) : '—'} tone={telemetry.data?.sensors_warning ? 'warning' : 'default'} />
        <Metric label="Data points today" value={telemetry.data ? fmtInt(telemetry.data.readings_today) : '—'} hint={telemetry.data?.last_reading_at ? `last ${fmtTime(telemetry.data.last_reading_at)}` : 'no telemetry ingested'} />
        <Metric label="System health" value={healthPct != null ? `${healthPct}%` : '—'} tone={healthPct == null ? 'default' : healthPct === 100 ? 'normal' : healthPct >= 60 ? 'warning' : 'critical'} hint={total ? `${online}/${total} components online` : undefined} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card title="Active incidents" className="lg:col-span-2">
          {incidents.loading && <LoadingState />}
          {incidents.error && <ApiErrorState error={incidents.error} onRetry={incidents.reload} lastSuccess={incidents.lastSuccess} />}
          {!enabled && !incidents.loading && <EmptyState title="No plant selected" />}
          {incidents.data && incidents.data.length === 0 && (
            <EmptyState icon="✓" title="No active incidents" message="The monitoring system is currently stable. Awaiting live intelligence data." />
          )}
          {incidents.data && incidents.data.length > 0 && (
            <ul className="space-y-2">
              {incidents.data.map((i) => (
                <li key={i.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                  <span>{i.title}</span><span className="text-muted">{i.severity} · {i.status}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Components">
          {!systemStatus && <LoadingState />}
          {systemStatus && (
            <ul className="space-y-3">
              {systemStatus.components.map((c) => (
                <li key={c.name} className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm capitalize">{c.name}</div>
                    <div className="text-xs text-muted">{c.detail}</div>
                  </div>
                  <StatusIndicator state={c.state} badge />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartContainer title="Water-loss timeline" subtitle="Phase 3+ · time-series telemetry" empty="Waiting for sensor telemetry." />
        <ChartContainer title="Expected vs actual consumption" subtitle="Phase 4+ · production-aware baseline" empty="Baseline engine is not initialized." />
      </div>

      {summary.error && <div className="mt-4"><ApiErrorState error={summary.error} onRetry={summary.reload} lastSuccess={summary.lastSuccess} /></div>}
    </>
  )
}
