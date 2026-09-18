import { PageHeader } from '../layouts/PageHeader'
import { ApiErrorState, Card, DataTable, LoadingState, StatusIndicator, type Column } from '../components'
import { useApi } from '../hooks'
import { systemService } from '../services'
import { useAppStore } from '../stores/appStore'
import type { ComponentHealth } from '../types/api'

export default function Settings() {
  const version = useApi((s) => systemService.version(s), [])
  const status = useAppStore((s) => s.systemStatus)
  const wsState = useAppStore((s) => s.wsState)
  const cols: Column<ComponentHealth>[] = [
    { key: 'n', header: 'Component', render: (r) => <span className="capitalize">{r.name}</span> },
    { key: 's', header: 'State', render: (r) => <StatusIndicator state={r.state} badge /> },
    { key: 'd', header: 'Detail', render: (r) => <span className="text-muted">{r.detail ?? '—'}</span> },
    { key: 'i', header: 'Info', className: 'telemetry text-xs', render: (r) => Object.entries(r.info ?? {}).filter(([, v]) => v != null && typeof v !== 'object').map(([k, v]) => `${k}=${String(v)}`).join('  ') || '—' },
  ]
  return (
    <>
      <PageHeader title="Settings" description="Environment, build and component diagnostics. Secrets are never exposed here." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Build">
          {version.loading && <LoadingState lines={2} />}
          {version.error && <ApiErrorState error={version.error} onRetry={version.reload} />}
          {version.data && <pre className="telemetry text-xs text-primary-soft">{JSON.stringify(version.data, null, 2)}</pre>}
          <div className="mt-3 text-xs text-muted">WebSocket: <span className="telemetry">{wsState}</span> · API docs: <code className="text-primary-soft">/docs</code></div>
        </Card>
        <Card title="Components" className="lg:col-span-2">
          {!status && <LoadingState lines={4} />}
          {status && <DataTable columns={cols} rows={status.components} rowKey={(r) => r.name} />}
        </Card>
      </div>
    </>
  )
}
