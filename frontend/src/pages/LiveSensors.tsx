import { useState } from 'react'
import { PageHeader } from '../layouts/PageHeader'
import { ApiErrorState, Badge, Button, Card, DataTable, Drawer, EmptyState, LoadingState, toneForStatus, type Column } from '../components'
import { useApi } from '../hooks'
import { sensorService } from '../services'
import { useAppStore } from '../stores/appStore'
import type { Sensor } from '../types/api'
import { fmtDateTime } from '../utils/format'

export default function LiveSensors() {
  const plantId = useAppStore((s) => s.selectedPlantId)
  const { selectedSensorId, selectSensor } = useAppStore()
  const [typeFilter, setTypeFilter] = useState<string>('')
  const sensors = useApi((s) => sensorService.list({ plant_id: plantId ?? undefined, sensor_type: typeFilter || undefined, limit: 500 }, s), [plantId, typeFilter])
  const selected = sensors.data?.find((x) => x.id === selectedSensorId) ?? null
  const latest = useApi((s) => sensorService.latest(selectedSensorId!, s), [selectedSensorId], { enabled: selectedSensorId != null })

  const cols: Column<Sensor>[] = [
    { key: 'code', header: 'Code', className: 'telemetry text-primary-soft', render: (r) => r.sensor_code },
    { key: 'type', header: 'Type', render: (r) => r.sensor_type },
    { key: 'unit', header: 'Unit', className: 'telemetry', render: (r) => r.unit ?? '—' },
    { key: 'machine', header: 'Machine', className: 'telemetry text-muted', render: (r) => `#${r.machine_id}` },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={toneForStatus(r.status)}>{r.status}</Badge> },
    { key: 'value', header: 'Latest value', className: 'telemetry text-muted', render: () => '—' },
    { key: 'act', header: '', render: (r) => <Button size="sm" variant="ghost" onClick={() => selectSensor(r.id)}>Details</Button> },
  ]
  const types = Array.from(new Set(sensors.data?.map((s) => s.sensor_type) ?? []))

  return (
    <>
      <PageHeader title="Live Sensors" description="Sensor inventory from the asset registry. Live values appear once telemetry ingestion starts (Phase 3)."
        actions={
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-md border border-border bg-surface px-2 py-1 text-xs" aria-label="Filter by type">
            <option value="">All types</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        } />
      <Card title="Sensors" subtitle={sensors.data ? `${sensors.data.length} sensors` : undefined}>
        {sensors.loading && <LoadingState lines={6} />}
        {sensors.error && <ApiErrorState error={sensors.error} onRetry={sensors.reload} lastSuccess={sensors.lastSuccess} />}
        {sensors.data && sensors.data.length === 0 && <EmptyState title="No sensors registered" message="Seed the infrastructure or register sensors for this plant." />}
        {sensors.data && sensors.data.length > 0 && <DataTable columns={cols} rows={sensors.data} rowKey={(r) => String(r.id)} />}
      </Card>

      <Drawer open={selected != null} onClose={() => selectSensor(null)} title={selected ? `Sensor ${selected.sensor_code}` : ''}>
        {selected && (
          <div className="space-y-4 text-sm">
            <dl className="grid grid-cols-2 gap-2">
              <dt className="text-muted">Type</dt><dd>{selected.sensor_type}</dd>
              <dt className="text-muted">Unit</dt><dd className="telemetry">{selected.unit ?? '—'}</dd>
              <dt className="text-muted">Status</dt><dd><Badge tone={toneForStatus(selected.status)}>{selected.status}</Badge></dd>
              <dt className="text-muted">Installed</dt><dd className="telemetry">{fmtDateTime(selected.installed_at)}</dd>
              <dt className="text-muted">Machine</dt><dd className="telemetry">#{selected.machine_id}</dd>
            </dl>
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Latest reading</div>
              {latest.loading && <LoadingState lines={1} />}
              {latest.error && <ApiErrorState error={latest.error} onRetry={latest.reload} />}
              {!latest.loading && !latest.error && !latest.data && <EmptyState title="No telemetry" message="Waiting for sensor telemetry." />}
              {latest.data && <div className="telemetry text-2xl text-primary-strong">{latest.data.value} <span className="text-sm text-muted">{selected.unit}</span></div>}
            </div>
          </div>
        )}
      </Drawer>
    </>
  )
}
