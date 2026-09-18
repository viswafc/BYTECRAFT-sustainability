import { useState } from 'react'
import { api, ApiError, type PredictResponse, type SensorReading } from '../lib/api'
import { useApi } from '../lib/useApi'
import { Badge, Button, Card, ChartContainer, ErrorState, LoadingState, Metric, StatusIndicator } from '../components/ui'
import { PageHeader } from '../layout/PageHeader'

const defaults: SensorReading = { Pressure: 45, Flow_Rate: 100, Temperature: 100, Vibration: 3, RPM: 2000, Operational_Hours: 5000 }

export function CommandCenter() {
  const status = useApi(() => api.systemStatus())
  const models = useApi(() => api.models())
  const [form, setForm] = useState<SensorReading>(defaults)
  const [result, setResult] = useState<PredictResponse | null>(null)
  const [predErr, setPredErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const def = models.data?.models.find((m) => m.is_default)
  const m = def?.evaluation_metrics

  async function runPrediction() {
    setBusy(true); setPredErr(null)
    try { setResult(await api.predict([form])) }
    catch (e) { setPredErr(e instanceof ApiError ? e.message : 'Prediction failed.') }
    finally { setBusy(false) }
  }

  return (
    <>
      <PageHeader title="Command Center" description="Foundation view. Live network intelligence, risk timelines and the digital twin arrive in later phases." />
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="System" tone={status.data?.status === 'ok' ? 'normal' : status.error ? 'critical' : 'warning'}
          value={status.loading ? '…' : status.error ? 'Offline' : (status.data?.status ?? '—').toUpperCase()} />
        <Metric label="Baseline model" tone="aqua" value={def ? def.model_name.replace('_', ' ') : status.error ? '—' : '…'} hint={def ? `${def.feature_config} · v${def.version}` : undefined} />
        <Metric label="Recall (leak)" value={m?.recall != null ? m.recall.toFixed(3) : '—'} hint="measured on held-out 20 %" />
        <Metric label="ROC-AUC" value={m?.roc_auc != null ? m.roc_auc.toFixed(3) : '—'} hint="measured on held-out 20 %" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card title="Baseline prediction" subtitle="Single reading through the registered default model" className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {(Object.keys(defaults) as (keyof typeof defaults)[]).map((k) => (
              <label key={k} className="text-xs text-text-muted">
                {k.replace('_', ' ')}
                <input
                  type="number" step="any" value={form[k] as number}
                  onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })}
                  className="mt-1 w-full rounded-md border border-navy-600 bg-navy-800 px-2 py-1.5 font-mono text-sm text-text-primary focus:border-aqua-500 focus:outline-none"
                />
              </label>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button onClick={runPrediction} loading={busy}>Run prediction</Button>
            <Button variant="ghost" size="sm" onClick={() => { setForm(defaults); setResult(null) }}>Reset</Button>
            {result && (
              <span className="ml-auto flex items-center gap-2 text-sm">
                <Badge tone={result.predictions[0].leak_predicted ? 'critical' : 'normal'}>
                  {result.predictions[0].leak_predicted ? 'Leak predicted' : 'No leak'}
                </Badge>
                {result.predictions[0].leak_probability != null && (
                  <span className="font-mono text-text-muted">p = {result.predictions[0].leak_probability.toFixed(3)}</span>
                )}
              </span>
            )}
          </div>
          {predErr && <div className="mt-3"><ErrorState title="Prediction failed" message={predErr} /></div>}
          {result && <div className="mt-2 text-[11px] text-text-muted">model: {result.model}</div>}
        </Card>

        <Card title="Components">
          {status.loading && <LoadingState />}
          {status.error && <ErrorState message={status.error} onRetry={status.reload} />}
          {status.data && (
            <ul className="space-y-3">
              {status.data.components.map((c) => (
                <li key={c.name} className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm capitalize">{c.name}</div>
                    <div className="text-xs text-text-muted">{c.detail}</div>
                  </div>
                  <StatusIndicator status={c.status} badge />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartContainer title="Water-loss timeline" subtitle="Phase 3+ · time-series simulation" />
        <ChartContainer title="Network topology" subtitle="Phase 7+ · leak localization" />
      </div>
    </>
  )
}
