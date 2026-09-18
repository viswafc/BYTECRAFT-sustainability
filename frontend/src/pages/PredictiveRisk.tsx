import { PageHeader } from '../layouts/PageHeader'
import { ApiErrorState, Card, LoadingState, ModuleNotInitialized, StatusIndicator } from '../components'
import { useApi } from '../hooks'
import { mlService } from '../services'

export default function PredictiveRisk() {
  const h = useApi((s) => mlService.health(s), [])
  return (
    <>
      <PageHeader title="Predictive Risk" description="Forward-looking leak/loss risk per asset. Not initialized in Phase 2." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Risk timeline" className="lg:col-span-2">
          <ModuleNotInitialized module="Predictive risk engine" phase="a later phase" description="Requires the time-series pipeline (Phase 3) and production-aware baseline before any risk score can be computed honestly." />
        </Card>
        <Card title="Prediction service">
          {h.loading && <LoadingState lines={2} />}
          {h.error && <ApiErrorState error={h.error} onRetry={h.reload} />}
          {h.data && (
            <div className="space-y-2 text-sm">
              <StatusIndicator state={h.data.state} text={h.data.ready ? 'Baseline classifier ready' : 'MODEL_NOT_READY'} />
              <div className="telemetry text-xs text-muted">{h.data.default_model ?? h.data.detail}</div>
              <p className="text-xs text-muted">The registered baseline is a leak classifier on the legacy dataset, not a risk model. Try it in the What-if Lab.</p>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
