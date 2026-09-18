import React, { useState } from 'react';

interface ScenarioConfig {
  leakRate: number;
  delayHours: number;
  productionState: string;
}

export const WhatIfLab: React.FC = () => {
  const [config, setConfig] = useState<ScenarioConfig>({ leakRate: 2840, delayHours: 6, productionState: 'standard' });
  const [hasRun, setHasRun] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const waterLoss = config.leakRate * config.delayHours;
  const financialCost = waterLoss * 2.4;
  const infraRisk = config.delayHours >= 12 ? 'CRITICAL' : config.delayHours >= 6 ? 'HIGH' : config.delayHours >= 1 ? 'MODERATE' : 'LOW';
  const infraColor = infraRisk === 'CRITICAL' ? 'text-status-critical' : infraRisk === 'HIGH' ? 'text-status-warning' : infraRisk === 'MODERATE' ? 'text-status-info' : 'text-status-operational';
  const productionMultiplier = config.productionState === 'peak' ? 1.4 : config.productionState === 'reduced' ? 0.6 : 1.0;

  const runSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setHasRun(true);
    }, 1500);
  };

  const resetSimulation = () => {
    setConfig({ leakRate: 2840, delayHours: 6, productionState: 'standard' });
    setHasRun(false);
  };

  const baselineWater = 24000 * config.delayHours;
  const simulatedWater = baselineWater + waterLoss;

  return (
    <div className="flex-1 p-8 max-w-7xl w-full mx-auto flex flex-col gap-8">
      {/* Page Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-surface-border/50">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-display-lg font-bold text-text-main tracking-tight">What-If Lab</h1>
            <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary text-label-sm font-semibold">Counterfactual Engine</span>
          </div>
          <p className="text-body-lg text-text-secondary mt-1">Simulate delay scenarios and project water loss, financial exposure, and infrastructure risk.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={resetSimulation} className="px-4 py-2 rounded bg-surface-card border border-surface-border text-text-main hover:text-primary hover:border-primary text-label-lg transition-colors flex items-center gap-2 active:scale-[0.98]">
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            RESET
          </button>
          <button onClick={runSimulation} disabled={isRunning} className="px-6 py-2 rounded bg-gradient-to-r from-primary to-[#007EA7] text-background font-bold text-label-lg hover:shadow-[0_0_15px_rgba(40,215,255,0.4)] transition-all flex items-center gap-2 active:scale-[0.98] disabled:opacity-50 hover-lift">
            <span className="material-symbols-outlined text-[16px]">{isRunning ? 'hourglass_empty' : 'play_arrow'}</span>
            {isRunning ? 'SIMULATING...' : 'RUN SIMULATION'}
          </button>
        </div>
      </section>

      {/* Config + Results */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Scenario Builder (5 cols) */}
        <div className="lg:col-span-5 glass-panel border border-surface-border rounded-lg p-6 flex flex-col gap-6 hover-lift delay-100">
          <div className="flex items-center gap-2 pb-3 border-b border-surface-border">
            <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
            <h2 className="text-headline-md text-text-main font-bold">Scenario Builder</h2>
          </div>

          {/* Leak Rate */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center justify-between">
              <span className="text-label-sm uppercase text-text-secondary tracking-wider">Leak Rate</span>
              <span className="font-mono text-base font-bold text-text-main">{config.leakRate.toLocaleString()} L/h</span>
            </label>
            <input type="range" min="0" max="10000" step="100" value={config.leakRate} onChange={e => setConfig({ ...config, leakRate: Number(e.target.value) })} className="w-full accent-primary h-2 rounded cursor-pointer bg-surface-subtle" />
            <div className="flex justify-between text-label-sm text-text-muted">
              <span>0 L/h</span><span>5,000</span><span>10,000 L/h</span>
            </div>
          </div>

          {/* Response Delay */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center justify-between">
              <span className="text-label-sm uppercase text-text-secondary tracking-wider">Response Delay</span>
              <span className="font-mono text-base font-bold text-text-main">{config.delayHours}h</span>
            </label>
            <input type="range" min="0" max="24" step="1" value={config.delayHours} onChange={e => setConfig({ ...config, delayHours: Number(e.target.value) })} className="w-full accent-primary h-2 rounded cursor-pointer bg-surface-subtle" />
            <div className="flex justify-between text-label-sm text-text-muted">
              <span>NOW</span><span>6h</span><span>12h</span><span>18h</span><span>24h</span>
            </div>
          </div>

          {/* Production State */}
          <div className="flex flex-col gap-2">
            <span className="text-label-sm uppercase text-text-secondary tracking-wider">Production State</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'reduced', label: 'Reduced', sub: '60% capacity' },
                { id: 'standard', label: 'Standard', sub: '100% capacity' },
                { id: 'peak', label: 'Peak', sub: '140% demand' },
              ].map(o => (
                <button key={o.id} onClick={() => setConfig({ ...config, productionState: o.id })} className={`p-3 rounded text-center border transition-colors ${config.productionState === o.id ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-subtle border-surface-border text-text-secondary hover:text-text-main hover:border-primary/40'}`}>
                  <div className="text-label-lg font-bold">{o.label}</div>
                  <div className="text-label-sm text-text-muted mt-0.5">{o.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-background p-4 rounded border border-surface-border text-body-sm text-text-secondary flex flex-col gap-1">
            <strong className="text-text-main">Scenario Summary:</strong>
            <span>Simulating a <strong className="text-status-critical">{config.leakRate.toLocaleString()} L/h</strong> leak for <strong className="text-primary">{config.delayHours}h</strong> at <strong className="text-text-main">{config.productionState}</strong> production.</span>
          </div>
        </div>

        {/* RIGHT: Projected Outcomes (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Projected Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface-card border border-surface-border rounded-lg p-6 flex flex-col gap-2 hover-lift delay-100">
              <span className="text-label-sm uppercase text-text-secondary tracking-wider">Projected Water Loss</span>
              <span className="text-metric-display text-status-critical font-mono">{waterLoss.toLocaleString()} L</span>
              <span className="text-label-sm text-text-muted">Over {config.delayHours}h delay window</span>
            </div>
            <div className="bg-surface-card border border-surface-border rounded-lg p-6 flex flex-col gap-2 hover-lift delay-200">
              <span className="text-label-sm uppercase text-text-secondary tracking-wider">Projected Financial Cost</span>
              <span className="text-metric-display text-status-warning font-mono">₹{Math.round(financialCost * productionMultiplier).toLocaleString()}</span>
              <span className="text-label-sm text-text-muted">Including tariff + penalty</span>
            </div>
            <div className="bg-surface-card border border-surface-border rounded-lg p-6 flex flex-col gap-2 hover-lift delay-300">
              <span className="text-label-sm uppercase text-text-secondary tracking-wider">Infrastructure Risk</span>
              <span className={`text-metric-display font-bold ${infraColor}`}>{infraRisk}</span>
              <span className="text-label-sm text-text-muted">Foundation erosion risk</span>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="glass-panel border border-surface-border rounded-lg p-6 hover-lift delay-300">
            <div className="flex items-center gap-2 pb-3 border-b border-surface-border mb-4">
              <span className="material-symbols-outlined text-primary text-[18px]">compare_arrows</span>
              <h3 className="text-headline-md text-text-main font-bold">Baseline vs Scenario Comparison</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-border text-text-secondary text-label-sm uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">Metric</th>
                    <th className="py-3 px-4 font-semibold">Baseline (Normal)</th>
                    <th className="py-3 px-4 font-semibold">Simulated Scenario</th>
                    <th className="py-3 px-4 font-semibold">Δ Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/50 text-body-md">
                  <tr className="hover:bg-surface-elevated/50">
                    <td className="py-3 px-4 text-text-main font-medium">Water Consumed</td>
                    <td className="py-3 px-4 font-mono text-text-secondary">{baselineWater.toLocaleString()} L</td>
                    <td className="py-3 px-4 font-mono text-status-critical font-semibold">{simulatedWater.toLocaleString()} L</td>
                    <td className="py-3 px-4 font-mono text-status-critical font-semibold">+{waterLoss.toLocaleString()} L</td>
                  </tr>
                  <tr className="hover:bg-surface-elevated/50">
                    <td className="py-3 px-4 text-text-main font-medium">Financial Cost</td>
                    <td className="py-3 px-4 font-mono text-text-secondary">₹{Math.round(baselineWater * 2.4).toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-status-warning font-semibold">₹{Math.round(simulatedWater * 2.4 * productionMultiplier).toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-status-warning font-semibold">+₹{Math.round(financialCost * productionMultiplier).toLocaleString()}</td>
                  </tr>
                  <tr className="hover:bg-surface-elevated/50">
                    <td className="py-3 px-4 text-text-main font-medium">Production Impact</td>
                    <td className="py-3 px-4 font-mono text-status-operational">None</td>
                    <td className="py-3 px-4 font-mono text-text-main">{config.delayHours >= 12 ? 'Bay B Shutdown' : config.delayHours >= 6 ? 'Bay B Throttled' : 'Minimal'}</td>
                    <td className={`py-3 px-4 font-mono font-semibold ${config.delayHours >= 12 ? 'text-status-critical' : config.delayHours >= 6 ? 'text-status-warning' : 'text-status-operational'}`}>{config.delayHours >= 12 ? 'SEVERE' : config.delayHours >= 6 ? 'MODERATE' : 'LOW'}</td>
                  </tr>
                  <tr className="hover:bg-surface-elevated/50">
                    <td className="py-3 px-4 text-text-main font-medium">Infrastructure Risk</td>
                    <td className="py-3 px-4 font-mono text-status-operational">Nominal</td>
                    <td className={`py-3 px-4 font-mono font-bold ${infraColor}`}>{infraRisk}</td>
                    <td className={`py-3 px-4 font-mono font-semibold ${infraColor}`}>{infraRisk !== 'LOW' ? '▲ Elevated' : '— No Change'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Insight */}
          {hasRun && (
            <div className="glass-panel border border-primary/40 rounded-lg p-5 flex items-start gap-4 animate-fade-in">
              <div className="w-10 h-10 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-headline-md font-bold text-text-main">Simulation Result</span>
                  <span className="px-2 py-0.5 rounded bg-status-operational/10 border border-status-operational/30 text-status-operational text-label-sm">Complete</span>
                </div>
                <p className="text-body-md text-text-secondary">
                  With a {config.leakRate.toLocaleString()} L/h leak and {config.delayHours}h delay at {config.productionState} production,
                  you'd lose <strong className="text-status-critical">{waterLoss.toLocaleString()} litres</strong> costing approximately 
                  <strong className="text-status-warning"> ₹{Math.round(financialCost * productionMultiplier).toLocaleString()}</strong>.
                  {config.delayHours >= 12 && <span className="text-status-critical"> Cooling Bay B would shut down, requiring 4-hour restart procedure.</span>}
                  {config.delayHours >= 6 && config.delayHours < 12 && <span className="text-status-warning"> Bay B cooling would be throttled, reducing output by ~30%.</span>}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
