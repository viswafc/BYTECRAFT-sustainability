import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { Button, Card, ErrorState, LoadingState, Metric, StatusIndicator } from '../components/ui'
import { PageHeader } from '../layout/PageHeader'

export function DataHealth() {
  const d = useApi(() => api.dataHealth())
  return (
    <>
      <PageHeader title="Data Health" description="Baseline dataset availability and integrity as seen by the backend."
        actions={<Button variant="secondary" size="sm" onClick={d.reload}>Refresh</Button>} />
      {d.loading && <Card><LoadingState /></Card>}
      {d.error && <ErrorState message={d.error} onRetry={d.reload} />}
      {d.data && (
        <>
          <Card title="Dataset" subtitle={d.data.dataset_path} actions={<StatusIndicator status={d.data.status} badge />}>
            {d.data.detail && <p className="mb-3 text-sm text-status-warning">{d.data.detail}</p>}
            <div className="grid gap-3 md:grid-cols-5">
              <Metric label="Rows" value={d.data.rows ?? '—'} />
              <Metric label="Columns" value={d.data.columns ?? '—'} />
              <Metric label="Missing" value={d.data.missing_values ?? '—'} tone={d.data.missing_values ? 'warning' : 'normal'} />
              <Metric label="Duplicates" value={d.data.duplicate_rows ?? '—'} tone={d.data.duplicate_rows ? 'warning' : 'normal'} />
              <Metric label="Leak rate" value={d.data.positive_rate != null ? (d.data.positive_rate * 100).toFixed(2) : '—'} unit="%" tone="aqua" />
            </div>
          </Card>
          <p className="mt-4 text-xs text-text-muted">
            Full data-quality findings live in <code className="text-aqua-300">reports/data_quality_report.md</code>; the field reference is in <code className="text-aqua-300">docs/DATA_DICTIONARY.md</code>.
          </p>
        </>
      )}
    </>
  )
}
