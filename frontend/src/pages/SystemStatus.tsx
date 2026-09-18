import { api, type ComponentStatus } from '../lib/api'
import { useApi } from '../lib/useApi'
import { Button, Card, DataTable, ErrorState, LoadingState, StatusIndicator, type Column } from '../components/ui'
import { PageHeader } from '../layout/PageHeader'

const cols: Column<ComponentStatus>[] = [
  { key: 'name', header: 'Component', render: (r) => <span className="capitalize">{r.name}</span> },
  { key: 'status', header: 'Status', render: (r) => <StatusIndicator status={r.status} badge /> },
  { key: 'detail', header: 'Detail', render: (r) => <span className="text-text-muted">{r.detail ?? '—'}</span> },
  { key: 'info', header: 'Info', className: 'font-mono text-xs', render: (r) => Object.entries(r.info ?? {}).filter(([, v]) => v != null).map(([k, v]) => `${k}=${typeof v === 'number' ? v.toFixed(3) : String(v)}`).join('  ') || '—' },
]

export function SystemStatus() {
  const s = useApi(() => api.systemStatus())
  const models = useApi(() => api.models())
  return (
    <>
      <PageHeader title="System Status" description="Backend components and registered ML models."
        actions={<Button variant="secondary" size="sm" onClick={() => { s.reload(); models.reload() }}>Refresh</Button>} />
      <Card title="Components" subtitle={s.data ? `Overall: ${s.data.status} · ${new Date(s.data.timestamp).toLocaleString()}` : undefined}>
        {s.loading && <LoadingState />}
        {s.error && <ErrorState message={s.error} onRetry={s.reload} />}
        {s.data && <DataTable columns={cols} rows={s.data.components} rowKey={(r) => r.name} />}
      </Card>
      <Card title="Model registry" subtitle="Metrics are read from the artifact metadata written by ml/train.py" className="mt-4">
        {models.loading && <LoadingState />}
        {models.error && <ErrorState message={models.error} onRetry={models.reload} />}
        {models.data && (
          <DataTable
            rowKey={(r) => `${r.feature_config}/${r.model_name}`}
            rows={models.data.models}
            columns={[
              { key: 'm', header: 'Model', render: (r) => <span>{r.model_name}{r.is_default && <span className="ml-2 text-[10px] uppercase text-aqua-400">default</span>}</span> },
              { key: 'c', header: 'Config', render: (r) => <span className="text-text-muted">{r.feature_config}</span> },
              { key: 'a', header: 'Acc', className: 'font-mono', render: (r) => r.evaluation_metrics.accuracy?.toFixed(3) },
              { key: 'p', header: 'Prec', className: 'font-mono', render: (r) => r.evaluation_metrics.precision?.toFixed(3) },
              { key: 'r', header: 'Recall', className: 'font-mono', render: (r) => r.evaluation_metrics.recall?.toFixed(3) },
              { key: 'f', header: 'F1', className: 'font-mono', render: (r) => r.evaluation_metrics.f1?.toFixed(3) },
              { key: 'auc', header: 'ROC-AUC', className: 'font-mono', render: (r) => r.evaluation_metrics.roc_auc?.toFixed(3) ?? 'n/a' },
              { key: 't', header: 'Trained', className: 'text-xs text-text-muted', render: (r) => new Date(r.training_timestamp).toLocaleString() },
            ]}
          />
        )}
      </Card>
    </>
  )
}
