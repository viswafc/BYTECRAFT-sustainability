import { useState } from 'react'
import { PageHeader } from '../layouts/PageHeader'
import { ApiErrorState, Badge, Card, DataTable, EmptyState, LoadingState, toneForStatus, type Column } from '../components'
import { useApi } from '../hooks'
import { incidentService } from '../services'
import { useAppStore } from '../stores/appStore'
import type { Incident } from '../types/api'
import { fmtDateTime } from '../utils/format'

export default function Incidents() {
  const plantId = useAppStore((s) => s.selectedPlantId)
  const [activeOnly, setActiveOnly] = useState(true)
  const q = useApi((s) => incidentService.list({ plant_id: plantId ?? undefined, active_only: activeOnly }, s), [plantId, activeOnly])

  const cols: Column<Incident>[] = [
    { key: 'title', header: 'Title', render: (r) => r.title },
    { key: 'type', header: 'Type', render: (r) => r.incident_type },
    { key: 'sev', header: 'Severity', render: (r) => <Badge tone={toneForStatus(r.severity)}>{r.severity}</Badge> },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={toneForStatus(r.status)}>{r.status}</Badge> },
    { key: 'start', header: 'Started', className: 'telemetry text-muted', render: (r) => fmtDateTime(r.started_at) },
  ]
  return (
    <>
      <PageHeader title="Incidents" description="Incident register. Automatic detection and diagnosis are added in later phases; nothing here is simulated."
        actions={<label className="flex items-center gap-2 text-xs text-muted"><input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} /> Active only</label>} />
      <Card>
        {q.loading && <LoadingState lines={4} />}
        {q.error && <ApiErrorState error={q.error} onRetry={q.reload} lastSuccess={q.lastSuccess} />}
        {q.data && q.data.length === 0 && <EmptyState icon="✓" title="No active incidents" message="No active incidents. The monitoring system is currently stable." />}
        {q.data && q.data.length > 0 && <DataTable columns={cols} rows={q.data} rowKey={(r) => String(r.id)} />}
      </Card>
    </>
  )
}
