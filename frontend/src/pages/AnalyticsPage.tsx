import React, { useState } from 'react';

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30D');

  return (
    <div className="flex-1 p-8 max-w-7xl w-full mx-auto flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg text-text-main tracking-tight">Water Analytics</h1>
          <p className="text-body-md text-text-secondary mt-0.5">Water usage and loss trends across plant operations.</p>
        </div>
        <div className="inline-flex p-1 bg-surface-subtle border border-surface-border rounded self-start md:self-auto">
          {['24H', '7D', '30D'].map(t => (
            <button key={t} onClick={() => setTimeRange(t)} className={`px-3 py-1 rounded text-label-lg transition-colors ${timeRange === t ? 'bg-surface-container border border-primary text-primary font-semibold' : 'text-text-secondary hover:text-text-main'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Consumption', value: '1.42M L', icon: 'water', iconColor: 'text-text-muted', badge: 'Baseline: Normal', badgeColor: 'text-status-operational', dot: 'bg-status-operational' },
          { label: 'Water Lost', value: '94,600 L', icon: 'opacity', iconColor: 'text-status-warning', badge: 'Elevated deficit', badgeColor: 'text-status-warning', dot: 'bg-status-warning rotate-45' },
          { label: 'Leak Incidents', value: '06', icon: 'report_problem', iconColor: 'text-status-critical', badge: 'Detected this month', badgeColor: 'text-text-secondary', dot: 'bg-status-critical animate-pulse' },
          { label: 'Financial Impact', value: '₹2,27,040', icon: 'currency_rupee', iconColor: 'text-text-muted', badge: 'Estimated total bleed', badgeColor: 'text-status-critical', dot: '' },
        ].map((m, i) => (
          <div key={i} className="bg-surface-card border border-surface-border rounded p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-label-sm tracking-wider uppercase text-text-muted">{m.label}</span>
              <span className={`material-symbols-outlined text-[18px] ${m.iconColor}`}>{m.icon}</span>
            </div>
            <div className="my-4">
              <div className="text-metric-display text-text-main tracking-tight">{m.value}</div>
            </div>
            <div className="flex items-center gap-1.5">
              {m.dot && <span className={`w-2 h-2 rounded-full ${m.dot} inline-block`}></span>}
              <span className={`text-label-sm ${m.badgeColor}`}>{m.badge}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Primary Chart */}
      <section className="bg-surface-card border border-surface-border rounded p-6 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-headline-md text-text-main tracking-tight">Expected vs Actual Water Consumption</h2>
            <p className="text-body-sm text-text-secondary mt-0.5">30-day cumulative flow telemetry with volumetric deviation tracking</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 border-t-2 border-dashed border-text-secondary inline-block"></span>
              <span className="text-label-sm text-text-secondary">Expected Baseline</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 bg-primary inline-block"></span>
              <span className="text-label-sm text-primary font-semibold">Actual Water Intake</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-status-critical/10 border border-status-critical/30 text-status-critical text-label-sm">
              <span className="w-1.5 h-1.5 bg-status-critical inline-block"></span>
              <span>Active Rupture Period (Line B)</span>
            </div>
          </div>
        </div>
        <div className="relative w-full h-[320px] select-none">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-text-muted text-label-sm">
            {['60k L', '45k L', '30k L', '15k L', '0 L'].map((l, i) => (
              <div key={i} className="flex items-center w-full">
                <span className="w-14 text-right pr-3">{l}</span>
                <div className="flex-1 border-b border-surface-border/50"></div>
              </div>
            ))}
          </div>
          <svg className="absolute inset-0 w-full h-full pl-14 pb-6 overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 280">
            <defs>
              <linearGradient id="ruptureGlow" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#FF5B67" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#FF5B67" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="actualFlowFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#28D7FF" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#28D7FF" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <rect fill="url(#ruptureGlow)" height="260" stroke="#FF5B67" strokeDasharray="3 3" strokeWidth="1" width="135" x="860" y="10" />
            <path d="M 0 160 L 70 155 L 140 162 L 210 150 L 280 158 L 350 148 L 420 152 L 490 145 L 560 150 L 630 142 L 700 145 L 770 140 L 840 135 L 880 110 L 920 60 L 965 25 L 1000 30 L 1000 270 L 0 270 Z" fill="url(#actualFlowFill)" />
            <path d="M 0 160 L 70 158 L 140 160 L 210 156 L 280 158 L 350 155 L 420 157 L 490 154 L 560 156 L 630 152 L 700 154 L 770 150 L 840 152 L 910 148 L 950 150 L 1000 148" fill="none" stroke="#8EA7B7" strokeDasharray="6 4" strokeWidth="2" />
            <path d="M 0 160 L 70 155 L 140 162 L 210 150 L 280 158 L 350 148 L 420 152 L 490 145 L 560 150 L 630 142 L 700 145 L 770 140 L 840 135 L 880 110 L 920 60 L 965 25 L 1000 30" fill="none" stroke="#28D7FF" strokeWidth="2.5" />
            <circle cx="965" cy="150" fill="#8EA7B7" r="3" />
            <circle className="animate-pulse" cx="965" cy="25" fill="#28D7FF" r="5" />
            <circle cx="965" cy="25" fill="none" opacity="0.6" r="9" stroke="#28D7FF" strokeWidth="1.5" />
            <line stroke="#FF5B67" strokeDasharray="2 2" strokeWidth="1.5" x1="965" x2="965" y1="25" y2="270" />
          </svg>
          <div className="absolute top-2 right-4 md:right-8 bg-surface-container border border-status-critical p-2 rounded flex flex-col gap-0.5 z-10">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-status-critical"></span>
              <span className="text-label-sm text-status-critical font-bold">DAY 29 SURGE (+54.2k L)</span>
            </div>
            <span className="text-body-sm text-text-main">Pipe Rupture on Line B</span>
          </div>
        </div>
        <div className="flex justify-between pl-14 pt-2 text-text-muted text-label-sm">
          {['Day 01', 'Day 05', 'Day 10', 'Day 15', 'Day 20', 'Day 25'].map(d => <span key={d}>{d}</span>)}
          <span className="text-status-critical font-semibold">Day 29 (Peak)</span>
          <span>Day 30</span>
        </div>
      </section>

      {/* Two Side-by-Side Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Water Loss by Zone */}
        <div className="bg-surface-card border border-surface-border rounded p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-headline-md text-text-main tracking-tight">Water Loss by Zone</h3>
              <p className="text-body-sm text-text-secondary mt-0.5">Distribution of isolated metric loss volume</p>
            </div>
            <span className="text-label-sm px-2 py-0.5 rounded bg-surface-subtle border border-surface-border text-text-secondary">Monthly Total</span>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { zone: 'Zone B Utility Corridor', pct: 72, vol: '68,112 L', color: 'bg-status-critical', textColor: 'text-status-critical' },
              { zone: 'Zone A Bottling', pct: 12, vol: '11,352 L', color: 'bg-primary', textColor: 'text-text-secondary' },
              { zone: 'Zone C Cooling', pct: 10, vol: '9,460 L', color: 'bg-primary/70', textColor: 'text-text-secondary' },
              { zone: 'Zone D Storage', pct: 6, vol: '5,676 L', color: 'bg-primary/40', textColor: 'text-text-secondary' },
            ].map((z, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-body-sm">
                  <span className="text-text-main font-medium">{z.zone}</span>
                  <span className={`font-mono font-semibold ${z.textColor}`}>{z.pct}% ({z.vol})</span>
                </div>
                <div className="w-full h-2.5 bg-surface-subtle rounded overflow-hidden">
                  <div className={`h-full ${z.color} rounded`} style={{ width: `${z.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incidents Over Time */}
        <div className="bg-surface-card border border-surface-border rounded p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-headline-md text-text-main tracking-tight">Incidents Over Time</h3>
              <p className="text-body-sm text-text-secondary mt-0.5">Weekly detected anomaly distribution</p>
            </div>
            <span className="text-label-sm px-2 py-0.5 rounded bg-surface-subtle border border-surface-border text-text-secondary">4 Weeks</span>
          </div>
          <div className="flex items-end justify-between gap-4 h-36 pt-4 px-2">
            {[
              { week: 'Week 1', count: 1, pct: 25, critical: false },
              { week: 'Week 2', count: 1, pct: 25, critical: false },
              { week: 'Week 3', count: 1, pct: 25, critical: false },
              { week: 'Week 4', count: 3, pct: 75, critical: true },
            ].map((w, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className={`font-mono text-metric-tabular ${w.critical ? 'text-status-critical font-bold' : 'text-text-secondary'}`}>{w.count}</span>
                <div className={`w-full max-w-[48px] ${w.critical ? 'bg-status-critical hover:bg-status-critical/80' : 'bg-primary/40 hover:bg-primary'} transition-colors rounded-t`} style={{ height: `${w.pct}%` }}></div>
                <span className={`text-label-sm ${w.critical ? 'text-status-critical font-semibold' : 'text-text-muted'} mt-1`}>{w.week}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Insight Banner */}
      <section className="bg-surface-card border border-surface-border rounded p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
        <div className="flex items-start gap-4 pl-1">
          <div className="w-10 h-10 rounded bg-surface-subtle border border-surface-border flex items-center justify-center text-primary shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-headline-md font-semibold text-text-main">AquaRisk AI Insight</span>
              <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary text-label-sm">High Confidence</span>
            </div>
            <p className="text-body-md text-text-secondary mt-1 max-w-3xl">
              Water consumption increased 42% faster than factory production during the selected period, with the largest volumetric deviation isolated to Line B (Segment S05–S06).
            </p>
          </div>
        </div>
        <div className="shrink-0 self-end md:self-center pl-1 md:pl-0">
          <button className="px-6 py-2.5 rounded bg-primary text-background text-label-lg font-semibold hover:bg-primary-hover transition-colors active:scale-[0.98] flex items-center gap-2">
            VIEW INCIDENT
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </section>
    </div>
  );
};
