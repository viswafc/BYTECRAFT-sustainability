import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { Button, Card, DataTable, ErrorState, LoadingState, StatusIndicator } from '../components/ui'
import { PageHeader } from '../layout/PageHeader'

const endpoints = [
  { method: 'GET', path: '/health', desc: 'Liveness' },
  { method: 'GET', path: '/api/version', desc: 'Build + API version' },
  { method: 'GET', path: '/api/system/status', desc: 'Component status' },
  { method: 'GET', path: '/api/data/health', desc: 'Dataset integrity' },
  { method: 'GET', path: '/api/models', desc: 'Model registry' },
  { method: 'POST', path: '/api/predict', desc: 'Baseline prediction' },
]

export function ApiHealth() {
  const h = useApi(() => api.health())
  const v = useApi(() => api.version())
  return (
    <>
      <PageHeader title="API Health" description="Connectivity to the AquaRisk backend (proxied through the frontend origin)."
        actions={<Button variant="secondary" size="sm" onClick={() => { h.reload(); v.reload() }}>Re-check</Button>} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Liveness" actions={<StatusIndicator status={h.error ? 'error' : h.data ? 'ok' : 'unknown'} badge />}>
          {h.loading && <LoadingState lines={2} />}
          {h.error && <ErrorState message={h.error} onRetry={h.reload} />}
          {h.data && <pre className="font-mono text-xs text-aqua-300">{JSON.stringify(h.data, null, 2)}</pre>}
        </Card>
        <Card title="Version">
          {v.loading && <LoadingState lines={2} />}
          {v.error && <ErrorState message={v.error} onRetry={v.reload} />}
          {v.data && <pre className="font-mono text-xs text-aqua-300">{JSON.stringify(v.data, null, 2)}</pre>}
        </Card>
      </div>
      <Card title="Endpoints" className="mt-4">
        <DataTable rowKey={(r) => r.path} rows={endpoints} columns={[
          { key: 'm', header: 'Method', className: 'font-mono text-xs', render: (r) => r.method },
          { key: 'p', header: 'Path', className: 'font-mono text-xs text-aqua-300', render: (r) => r.path },
          { key: 'd', header: 'Purpose', render: (r) => <span className="text-text-muted">{r.desc}</span> },
        ]} />
        <p className="mt-3 text-xs text-text-muted">Interactive OpenAPI docs: <code className="text-aqua-300">/docs</code> on the backend port.</p>
      </Card>
    </>
  )
}
