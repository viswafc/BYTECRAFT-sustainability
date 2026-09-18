import React, { useState, useEffect } from 'react';

export const IncidentCenter: React.FC = () => {
  const [decision, setDecision] = useState<any>(null);
  const [impact, setImpact] = useState<any>(null);
  const [filter, setFilter] = useState('critical');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [decRes, impRes] = await Promise.all([
          fetch("http://localhost:8000/api/decisions/current"),
          fetch("http://localhost:8000/api/impact/current"),
        ]);
        if (decRes.ok) { const d = await decRes.json(); if (d) setDecision(d); }
        if (impRes.ok) { const d = await impRes.json(); if (d) setImpact(d); }
      } catch (e) { console.error(e); }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const recentIncidents = [
    { severity: 'Critical Leak', sevColor: 'status-critical', name: 'Line B S05–S06', location: 'Flange #4 Manifold', loss: '2,840 L/h', lossColor: 'text-status-critical', time: '14:27 UTC', status: 'Investigating', statusColor: 'status-warning' },
    { severity: 'High Usage', sevColor: 'status-warning', name: 'Cooling Line Manifold', location: 'Sector C Pump Bay', loss: '820 L/h', lossColor: 'text-status-warning', time: '13:18 UTC', status: 'Monitoring', statusColor: 'status-info' },
    { severity: 'Resolved', sevColor: 'status-operational', name: 'Line A Bottling Feed', location: 'Sub-station Intake #2', loss: '420 L/h', lossColor: 'text-text-secondary', time: '11:40 UTC', status: 'Resolved', statusColor: 'status-operational' },
    { severity: 'Resolved', sevColor: 'status-operational', name: 'Storage Tank T-01 Seal', location: 'Perimeter Tank Farm', loss: '180 L/h', lossColor: 'text-text-secondary', time: 'Yesterday', status: 'Resolved', statusColor: 'status-operational' },
  ];

  return (
    <div className="flex-1 p-8 flex flex-col gap-8 max-w-7xl w-full mx-auto">
      {/* Page Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-surface-border/50">
        <div>
          <h1 className="text-display-lg font-bold text-text-main tracking-tight">Incident Center</h1>
          <p className="text-body-lg text-text-secondary mt-1">Active and recent water-loss events requiring operator triage.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-60">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-text-muted">search</span>
            <input className="w-full h-9 pl-8 pr-3 rounded bg-surface-subtle border border-surface-border text-text-main text-body-sm placeholder:text-text-muted focus:outline-none focus:border-primary" placeholder="Search incidents..." type="text" />
          </div>
          <button className="flex items-center gap-1.5 h-9 px-3 rounded bg-surface-card border border-surface-border hover:border-primary text-text-secondary hover:text-primary text-body-sm transition-colors">
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Export Report</span>
          </button>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-card border border-surface-border rounded-lg p-6 flex flex-col justify-between">
          <span className="text-label-sm uppercase text-text-secondary tracking-wider">Active Incidents</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-metric-display text-text-main font-bold">01</span>
            <span className="text-body-sm text-text-muted">High priority</span>
          </div>
        </div>
        <div className="bg-surface-card border border-surface-border rounded-lg p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label-sm uppercase text-text-secondary tracking-wider">Critical Severity</span>
            <span className="px-2 py-0.5 rounded text-label-sm bg-status-critical/15 text-status-critical border border-status-critical/30 font-semibold uppercase">Immediate Action</span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-metric-display text-status-critical font-bold">01</span>
            <span className="text-body-sm text-status-critical flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-status-critical animate-ping"></span>
              Uncontained
            </span>
          </div>
        </div>
        <div className="bg-surface-card border border-surface-border rounded-lg p-6 flex flex-col justify-between">
          <span className="text-label-sm uppercase text-text-secondary tracking-wider">Water Loss Today</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-metric-display text-primary font-bold">18,420 L</span>
            <span className="text-body-sm text-status-warning flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              +14% vs avg
            </span>
          </div>
        </div>
      </section>

      {/* Filter Row */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-surface-subtle border border-surface-border rounded max-w-fit">
          {['all', 'critical', 'active', 'resolved'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded text-body-sm transition-colors ${filter === f ? 'text-primary bg-surface-container font-medium border border-primary/40' : 'text-text-muted hover:text-text-main'}`}>
              {f === 'all' ? 'All' : f === 'critical' ? 'Critical (1)' : f === 'active' ? 'Active (1)' : 'Resolved (2)'}
            </button>
          ))}
        </div>
        <div className="text-text-secondary text-body-sm">Showing 1 of 1 attention-critical alert</div>
      </section>

      {/* Main Split: 8-col Incident + 4-col Diagnostic */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Active Incident Card */}
        <div className="lg:col-span-8 bg-surface-card border border-surface-border rounded-lg p-8 flex flex-col justify-between relative overflow-hidden" style={{ boxShadow: 'inset 0 0 16px rgba(255, 91, 103, 0.08)' }}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-status-critical"></div>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-status-critical/15 text-status-critical border border-status-critical text-label-lg font-bold">
                <span className="w-2 h-2 rounded-full bg-status-critical animate-pulse"></span>
                CRITICAL WATER LEAK
              </span>
              <span className="text-text-secondary text-body-sm font-mono">Detected at 14:27 UTC (18 mins ago)</span>
            </div>
            <h2 className="text-headline-lg font-bold text-text-main tracking-tight mb-6">
              Rupture on Line B — Segment S05–S06
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 bg-background rounded border border-surface-border/80 mb-8">
              <div className="flex flex-col">
                <span className="text-label-sm text-text-secondary uppercase">Leak Confidence</span>
                <span className="text-headline-lg font-bold text-primary mt-1">{decision ? (decision.confidence * 100 || 94.2).toFixed(1) : '94.2'}%</span>
                <span className="text-label-sm text-status-operational mt-0.5">High ML Match</span>
              </div>
              <div className="flex flex-col">
                <span className="text-label-sm text-text-secondary uppercase">Water Loss</span>
                <span className="text-headline-lg font-bold text-status-critical mt-1">{impact?.loss_rate_lph?.toLocaleString() ?? '2,840'} <span className="text-body-sm font-normal text-text-secondary">L/h</span></span>
                <span className="text-label-sm text-status-critical mt-0.5">Escalating</span>
              </div>
              <div className="flex flex-col">
                <span className="text-label-sm text-text-secondary uppercase">Financial Impact</span>
                <span className="text-headline-lg font-bold text-text-main mt-1">₹{impact?.financial_impact?.total_cost?.toLocaleString() ?? '1,61,280'}</span>
                <span className="text-label-sm text-text-muted mt-0.5">Per 24h cycle</span>
              </div>
              <div className="flex flex-col">
                <span className="text-label-sm text-text-secondary uppercase">Status</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-status-warning"></span>
                  <span className="text-headline-lg font-bold text-status-warning">Investigating</span>
                </div>
                <span className="text-label-sm text-text-muted mt-0.5">Operator assigned</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-surface-subtle rounded border border-surface-border mb-8 text-body-md text-text-secondary">
              <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">info</span>
              <div>
                <strong className="text-text-main">System Hypothesis:</strong> Sudden pressure drop (-18%) coupled with continuous flow anomaly (+42%) at junction S05 points to mechanical seal failure at Flange #4. Secondary damage to Bottling Line C imminent within 40 minutes if unisolated.
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-surface-border/50">
            <div className="flex items-center gap-3">
              <button className="px-5 py-2.5 rounded bg-primary hover:bg-primary-hover text-background text-label-lg font-bold flex items-center gap-2 transition-colors active:scale-[0.98]">
                <span className="material-symbols-outlined text-[18px]">travel_explore</span>
                INVESTIGATE
              </button>
              <button className="px-4 py-2.5 rounded bg-transparent border border-surface-border hover:border-primary text-text-main hover:text-primary text-label-lg font-semibold flex items-center gap-2 transition-colors active:scale-[0.98]">
                <span className="material-symbols-outlined text-[18px]">science</span>
                SIMULATE
              </button>
            </div>
            <span className="text-text-muted text-body-sm font-mono">Telemetry Source: Sensor NODE-B42</span>
          </div>
        </div>

        {/* Diagnostic Drawer */}
        <div className="lg:col-span-4 bg-surface-subtle border border-surface-border rounded-lg p-6 flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">quick_reference</span>
                <h3 className="text-headline-md font-bold text-text-main">Incident Diagnostic</h3>
              </div>
              <span className="text-label-sm text-primary uppercase bg-primary/10 px-2 py-0.5 rounded border border-primary/30">Live Sync</span>
            </div>
            <div className="space-y-4 text-body-md">
              <div>
                <span className="text-label-sm uppercase text-text-secondary block mb-1">What happened?</span>
                <p className="text-text-main font-medium">Leak detected on Line B.</p>
              </div>
              <div>
                <span className="text-label-sm uppercase text-text-secondary block mb-1">Where?</span>
                <div className="flex items-center gap-1.5 text-text-main font-medium">
                  <span className="material-symbols-outlined text-primary text-[16px]">location_on</span>
                  <span>S05–S06 (Flange #4)</span>
                </div>
              </div>
              <div>
                <span className="text-label-sm uppercase text-text-secondary block mb-1">Why?</span>
                <div className="flex flex-wrap gap-1.5 font-mono text-body-sm">
                  <span className="px-2 py-0.5 rounded bg-status-critical/10 text-status-critical border border-status-critical/30">Flow +42%</span>
                  <span className="px-2 py-0.5 rounded bg-status-critical/10 text-status-critical border border-status-critical/30">Pressure -18%</span>
                  <span className="px-2 py-0.5 rounded bg-background text-text-secondary border border-surface-border">Production +3%</span>
                </div>
              </div>
              <div>
                <span className="text-label-sm uppercase text-text-secondary block mb-1">Impact</span>
                <p className="text-text-main font-mono font-medium">2,840 L/hour • ₹1,61,280/day</p>
              </div>
              <div className="p-4 bg-background rounded border border-surface-border">
                <span className="text-label-sm uppercase text-status-operational block mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Recommended Action
                </span>
                <p className="text-text-main text-body-sm leading-relaxed">
                  Inspect S05–S06 & isolate valve <code className="px-1 py-0.5 rounded bg-surface-card border border-surface-border text-primary font-mono text-body-sm">BV-102</code>.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-6 border-t border-surface-border mt-4">
            <button className="w-full py-2 rounded bg-surface-elevated hover:bg-surface-card border border-surface-border hover:border-primary text-text-main text-label-lg transition-colors active:scale-[0.98] flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">science</span>
              SIMULATE
            </button>
            <button className="w-full py-2 rounded bg-status-operational/15 hover:bg-status-operational/25 border border-status-operational text-status-operational text-label-lg font-semibold transition-colors active:scale-[0.98] flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              MARK RESOLVED
            </button>
          </div>
        </div>
      </section>

      {/* Recent Incidents Table */}
      <section className="bg-surface-card border border-surface-border rounded-lg p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-headline-md font-bold text-text-main">Recent Incidents</h3>
            <p className="text-body-sm text-text-secondary">Chronological telemetry audit log for Plant 01</p>
          </div>
          <span className="text-label-sm text-text-muted uppercase">Showing past 24 hours</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-border text-text-secondary text-label-sm uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Severity</th>
                <th className="py-3 px-4 font-semibold">Incident</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold">Water Loss</th>
                <th className="py-3 px-4 font-semibold">Time</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50 text-body-md text-text-main">
              {recentIncidents.map((inc, i) => (
                <tr key={i} className="hover:bg-surface-elevated/70 transition-colors h-[48px]">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-label-sm bg-${inc.sevColor}/15 text-${inc.sevColor} border border-${inc.sevColor}/40 font-semibold`}>
                      <span className={`w-1.5 h-1.5 rounded-full bg-${inc.sevColor}`}></span>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium whitespace-nowrap">{inc.name}</td>
                  <td className="py-3 px-4 text-text-secondary whitespace-nowrap">{inc.location}</td>
                  <td className={`py-3 px-4 font-mono font-semibold ${inc.lossColor} whitespace-nowrap`}>{inc.loss}</td>
                  <td className="py-3 px-4 font-mono text-text-secondary whitespace-nowrap">{inc.time}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`text-${inc.statusColor} font-medium flex items-center gap-1.5`}>
                      <span className={`w-1.5 h-1.5 rounded-full bg-${inc.statusColor}`}></span>
                      {inc.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button className="px-2.5 py-1 rounded border border-surface-border hover:border-primary text-text-secondary hover:text-primary text-label-sm transition-colors">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
