import { useState } from 'react'
import { PageHeader } from '../layouts/PageHeader'
import { ApiErrorState, Badge, Button, Card, ModuleNotInitialized } from '../components'
import { mlService, ApiError } from '../services'
import type { PredictResponse, SensorReadingInput } from '../types/api'
import { toast } from '../stores/toastStore'

const defaults: SensorReadingInput = { Pressure: 45, Flow_Rate: 100, Temperature: 100, Vibration: 3, RPM: 2000, Operational_Hours: 5000 }

/** Phase 2: exposes the verified Phase-1 baseline classifier. The counterfactual engine comes later. */
export default function WhatIfLab() {
  const [form, setForm] = useState(defaults)
  const [result, setResult] = useState<PredictResponse | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [busy, setBusy] = useState(false)

  async function run() {
    setBusy(true); setError(null)
    try { setResult(await mlService.predict([form])) }
    catch (e) { const err = e instanceof ApiError ? e : new ApiError(0, 'UNKNOWN', 'Prediction failed.'); setError(err); toast.danger('Prediction failed', err.message) }
    finally { setBusy(false) }
  }

  return (
    <>
      <PageHeader title="What-if Lab" description="Counterfactual simulation is a later phase. Available now: the baseline leak classifier from Phase 1, clearly labelled." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Baseline classifier probe" subtitle="Single reading → registered default model" className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {(Object.keys(defaults) as (keyof typeof defaults)[]).map((k) => (
              <label key={k} className="text-xs text-muted">{k.replace('_', ' ')}
                <input type="number" step="any" value={form[k] as number} onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })}
                  className="telemetry mt-1 w-full rounded-md border border-border-strong bg-surface px-2 py-1.5 text-sm text-text focus:border-primary focus:outline-none" />
              </label>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button onClick={run} loading={busy}>Run prediction</Button>
            <Button variant="ghost" size="sm" onClick={() => { setForm(defaults); setResult(null); setError(null) }}>Reset</Button>
            {result && (
              <span className="ml-auto flex items-center gap-2 text-sm">
                <Badge tone={result.predictions[0].leak_predicted ? 'critical' : 'normal'}>{result.predictions[0].leak_predicted ? 'Leak predicted' : 'No leak'}</Badge>
                {result.predictions[0].leak_probability != null && <span className="telemetry text-muted">p = {result.predictions[0].leak_probability.toFixed(3)}</span>}
              </span>
            )}
          </div>
          {error && <div className="mt-3"><ApiErrorState error={error} /></div>}
          {result && <p className="mt-3 text-[11px] text-muted"><span className="telemetry">{result.model}</span> — {result.disclaimer}</p>}
        </Card>
        <Card title="Counterfactual engine">
          <ModuleNotInitialized module="Counterfactual simulator" phase="a later phase" description="Scenario branching (e.g. “what if this valve was closed 2 h earlier”) needs the timeline engine first." />
        </Card>
      </div>
    </>
  )
}
