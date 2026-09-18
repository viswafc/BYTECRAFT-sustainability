import { PageHeader } from '../layouts/PageHeader'
import { ApiErrorState, Badge, Card, ChartContainer, DataTable, LoadingState, Metric, toneForStatus, type Column } from '../components'
import { useApi } from '../hooks'
import { mlService, systemService } from '../services'
import type { ModelInfo } from '../types/api'
import { fmtDateTime, fmtInt, fmtNum, fmtPct } from '../utils/format'

export default function Analytics() {
  const models = useApi((s) => mlService.models(s), [])
  const data = useApi((s) => systemService.dataHealth(s), [])
  const cols: Column<ModelInfo>[] = [
    { key: 'n', header: 'Model', render: (r) => <span className="telemetry text-primary-soft">{r.name}{r.is_default && <span className="ml-2 text-[10px] uppercase text-primary-strong">default</span>}</span> },
    { key: 's', header: 'Status', render: (r) => <Badge tone={toneForStatus(r.status)}>{r.status}</Badge> },
    { key: 'a', header: 'Acc', className: 'telemetry', render: (r) => fmtNum(r.metrics.accuracy) },
    { key: 'p', header: 'Prec', className: 'telemetry', render: (r) => fmtNum(r.metrics.precision) },
    { key: 'r', header: 'Recall', className: 'telemetry', render: (r) => fmtNum(r.metrics.recall) },
    { key: 'f', header: 'F1', className: 'telemetry', render: (r) => fmtNum(r.metrics.f1) },
    { key: 'auc', header: 'ROC-AUC', className: 'telemetry', render: (r) => fmtNum(r.metrics.roc_auc ?? null) },
    { key: 't', header: 'Trained', className: 'telemetry text-xs text-muted', render: (r) => fmtDateTime(r.trained_at) },
  ]
  return (
    <>
      <PageHeader title="Analytics" description="Measured model metrics (read from training metadata) and baseline dataset health. Consumption analytics arrive with real telemetry." />
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Dataset rows" value={fmtInt(data.data?.rows)} />
        <Metric label="Columns" value={fmtInt(data.data?.columns)} />
        <Metric label="Missing values" value={fmtInt(data.data?.missing_values)} tone={data.data?.missing_values ? 'warning' : 'normal'} />
        <Metric label="Leak label rate" value={fmtPct(data.data?.positive_rate, 2)} tone="aqua" />
      </div>
      {data.error && <div className="mt-3"><ApiErrorState error={data.error} onRetry={data.reload} /></div>}
      <Card title="Model registry" subtitle="All numbers are produced by ml/training/train.py — none are hand-entered." className="mt-4">
        {models.loading && <LoadingState lines={4} />}
        {models.error && <ApiErrorState error={models.error} onRetry={models.reload} />}
        {models.data && <DataTable columns={cols} rows={models.data} rowKey={(r) => r.name} empty="No models registered. Run python -m ml.training.train" />}
      </Card>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartContainer title="Consumption by zone" subtitle="Phase 3+" empty="Historical telemetry will appear once sufficient data is available." />
        <ChartContainer title="Loss volume trend" subtitle="Phase 5+" empty="Water-loss engine is not initialized." />
      </div>
    </>
  )
}
