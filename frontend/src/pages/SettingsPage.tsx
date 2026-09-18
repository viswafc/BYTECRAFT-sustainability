import React, { useState, useEffect } from 'react';

type SettingsTab = 'plant' | 'sensors' | 'safety' | 'system' | 'twin';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('plant');
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [sensors, setSensors] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/system/status')
      .then(r => r.json())
      .then(d => setSystemStatus(d))
      .catch(() => setSystemStatus({ status: 'offline', Backend: 'OFFLINE', Database: 'OFFLINE', ML: 'OFFLINE', WebSocket: 'OFFLINE' }));

    fetch('http://localhost:8000/api/sensors')
      .then(r => r.json())
      .then(d => {
        if (d && d.data) setSensors(d.data);
        else if (Array.isArray(d)) setSensors(d);
      })
      .catch(() => {});
  }, []);

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'plant', label: 'Plant Profile', icon: 'factory' },
    { id: 'sensors', label: 'Sensor Config', icon: 'sensors' },
    { id: 'safety', label: 'Safety Rules', icon: 'shield' },
    { id: 'system', label: 'System', icon: 'dns' },
    { id: 'twin', label: '3D Digital Twin', icon: 'view_in_ar' },
  ];

  const statusColor = (s: string) => {
    if (!s) return 'text-text-muted';
    const u = s.toUpperCase();
    if (u === 'ONLINE' || u === 'READY' || u === 'OPERATIONAL') return 'text-status-operational';
    if (u === 'OFFLINE' || u === 'ERROR') return 'text-status-critical';
    return 'text-status-warning';
  };

  const statusDot = (s: string) => {
    if (!s) return 'bg-text-muted';
    const u = s.toUpperCase();
    if (u === 'ONLINE' || u === 'READY' || u === 'OPERATIONAL') return 'bg-status-operational';
    if (u === 'OFFLINE' || u === 'ERROR') return 'bg-status-critical';
    return 'bg-status-warning';
  };

  return (
    <div className="flex-1 p-8 max-w-7xl w-full mx-auto flex flex-col gap-8">
      {/* Page Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-surface-border/50">
        <div>
          <h1 className="text-display-lg font-bold text-text-main tracking-tight">Settings</h1>
          <p className="text-body-lg text-text-secondary mt-1">Plant management, sensor configuration, safety rules, and system diagnostics.</p>
        </div>
        <button className="px-5 py-2 rounded bg-gradient-to-r from-primary to-[#007EA7] text-background font-bold text-label-lg hover:shadow-[0_0_15px_rgba(40,215,255,0.4)] transition-all active:scale-[0.98] flex items-center gap-2 self-start md:self-auto hover-lift">
          <span className="material-symbols-outlined text-[16px]">save</span>
          SAVE CHANGES
        </button>
      </section>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 bg-surface-subtle border border-surface-border rounded max-w-fit overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-3 py-2 rounded text-label-lg whitespace-nowrap transition-colors ${activeTab === t.id ? 'bg-surface-container border border-primary/50 text-primary font-semibold shadow-[0_0_10px_rgba(40,215,255,0.15)]' : 'text-text-secondary hover:text-text-main hover:bg-surface-elevated'}`}>
            <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {/* ── PLANT PROFILE ── */}
        {activeTab === 'plant' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel border border-surface-border rounded-lg p-6 flex flex-col gap-5 hover-lift delay-100 animate-fade-in-up">
              <div className="flex items-center gap-2 pb-3 border-b border-surface-border">
                <span className="material-symbols-outlined text-primary text-[20px]">factory</span>
                <h2 className="text-headline-md font-bold text-text-main">Plant Information</h2>
              </div>
              {[
                { label: 'Plant Name', value: 'VSB Plant 01', icon: 'badge' },
                { label: 'Location', value: 'Visakhapatnam, AP, India', icon: 'location_on' },
                { label: 'Operating Hours', value: '24/7 Continuous', icon: 'schedule' },
                { label: 'Commissioning Date', value: '2019-03-15', icon: 'calendar_month' },
                { label: 'Water Source', value: 'Municipal Supply + Borewell', icon: 'water' },
                { label: 'Network Type', value: 'Closed-loop Recirculation', icon: 'device_hub' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <span className="material-symbols-outlined text-text-muted text-[18px]">{f.icon}</span>
                  <div className="flex-1">
                    <span className="text-label-sm uppercase text-text-secondary tracking-wider block">{f.label}</span>
                    <span className="text-body-lg text-text-main font-medium">{f.value}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="glass-panel border border-surface-border rounded-lg p-6 flex flex-col gap-5 hover-lift delay-100 animate-fade-in-up">
              <div className="flex items-center gap-2 pb-3 border-b border-surface-border">
                <span className="material-symbols-outlined text-primary text-[20px]">speed</span>
                <h2 className="text-headline-md font-bold text-text-main">Capacity & Performance</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Tank Capacity', value: '850,000 L', sub: 'Main Storage T-01' },
                  { label: 'Daily Throughput', value: '~580,000 L', sub: 'Average 30-day' },
                  { label: 'Active Sensors', value: `${sensors.length || 14}`, sub: 'Connected nodes' },
                  { label: 'Distribution Lines', value: '2', sub: 'Line A + Line B' },
                  { label: 'Production Bays', value: '2', sub: 'Bottling A, Cooling B' },
                  { label: 'NRW Baseline', value: '4.2%', sub: 'Non-revenue water' },
                ].map((m, i) => (
                  <div key={i} className="bg-background p-3 rounded border border-surface-border">
                    <span className="text-label-sm text-text-secondary uppercase block mb-1">{m.label}</span>
                    <span className="text-headline-md font-bold text-text-main font-mono block">{m.value}</span>
                    <span className="text-label-sm text-text-muted">{m.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SENSOR CONFIG ── */}
        {activeTab === 'sensors' && (
          <div className="glass-panel border border-surface-border rounded-lg p-6 flex flex-col gap-4 hover-lift delay-100 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">sensors</span>
                <h2 className="text-headline-md font-bold text-text-main">Sensor Configuration</h2>
              </div>
              <span className="text-label-sm text-text-muted uppercase">{sensors.length || 14} sensors registered</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-border text-text-secondary text-label-sm uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">Sensor ID</th>
                    <th className="py-3 px-4 font-semibold">Type</th>
                    <th className="py-3 px-4 font-semibold">Location</th>
                    <th className="py-3 px-4 font-semibold">Min Threshold</th>
                    <th className="py-3 px-4 font-semibold">Max Threshold</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/50 text-body-md">
                  {(sensors.length > 0 ? sensors : [
                    { sensor_id: 'S01', sensor_type: 'Ultrasonic Flow', zone_id: 'Line A Intake', min_threshold: 20000, max_threshold: 30000 },
                    { sensor_id: 'S02', sensor_type: 'Pressure', zone_id: 'Line A Mid', min_threshold: 3.0, max_threshold: 5.0 },
                    { sensor_id: 'S03', sensor_type: 'Ultrasonic Flow', zone_id: 'Line A Output', min_threshold: 18000, max_threshold: 28000 },
                    { sensor_id: 'S04', sensor_type: 'Temperature', zone_id: 'Tank T-01', min_threshold: 15, max_threshold: 35 },
                    { sensor_id: 'S05', sensor_type: 'Ultrasonic Flow', zone_id: 'Line B Intake', min_threshold: 20000, max_threshold: 30000 },
                    { sensor_id: 'S06', sensor_type: 'Pressure', zone_id: 'Line B Output', min_threshold: 3.0, max_threshold: 5.0 },
                    { sensor_id: 'S07', sensor_type: 'Vibration', zone_id: 'Pump P-104', min_threshold: 0, max_threshold: 4.5 },
                  ]).map((s: any, i: number) => (
                    <tr key={i} className="hover:bg-surface-elevated/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{s.sensor_id}</td>
                      <td className="py-3 px-4 text-text-main">{s.sensor_type || 'Flow Meter'}</td>
                      <td className="py-3 px-4 text-text-secondary">{s.zone_id || s.location || 'Zone A'}</td>
                      <td className="py-3 px-4 font-mono text-text-secondary">{s.min_threshold ?? '—'}</td>
                      <td className="py-3 px-4 font-mono text-text-secondary">{s.max_threshold ?? '—'}</td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1.5 text-status-operational text-label-lg font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-operational"></span>
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SAFETY RULES ── */}
        {activeTab === 'safety' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel border border-surface-border rounded-lg p-6 flex flex-col gap-4 hover-lift delay-100 animate-fade-in-up">
              <div className="flex items-center gap-2 pb-3 border-b border-surface-border">
                <span className="material-symbols-outlined text-status-warning text-[20px]">notifications_active</span>
                <h2 className="text-headline-md font-bold text-text-main">Alert Thresholds</h2>
              </div>
              {[
                { label: 'Flow Deviation Alert', threshold: '±15% from baseline', severity: 'Warning', sevColor: 'status-warning' },
                { label: 'Flow Deviation Critical', threshold: '±30% from baseline', severity: 'Critical', sevColor: 'status-critical' },
                { label: 'Pressure Drop Alert', threshold: '< 2.5 bar', severity: 'Warning', sevColor: 'status-warning' },
                { label: 'Pressure Drop Critical', threshold: '< 2.0 bar', severity: 'Critical', sevColor: 'status-critical' },
                { label: 'Tank Level Low', threshold: '< 25%', severity: 'Warning', sevColor: 'status-warning' },
                { label: 'Tank Level Critical', threshold: '< 10%', severity: 'Critical', sevColor: 'status-critical' },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-surface-border/30 last:border-0">
                  <div>
                    <span className="text-body-md text-text-main font-medium block">{r.label}</span>
                    <span className="text-body-sm text-text-muted font-mono">{r.threshold}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-label-sm bg-${r.sevColor}/15 text-${r.sevColor} border border-${r.sevColor}/30 font-semibold`}>{r.severity}</span>
                </div>
              ))}
            </div>
            <div className="glass-panel border border-surface-border rounded-lg p-6 flex flex-col gap-4 hover-lift delay-100 animate-fade-in-up">
              <div className="flex items-center gap-2 pb-3 border-b border-surface-border">
                <span className="material-symbols-outlined text-status-critical text-[20px]">emergency</span>
                <h2 className="text-headline-md font-bold text-text-main">Emergency Protocols</h2>
              </div>
              {[
                { label: 'Auto-Isolation', desc: 'Automatically close upstream valve when leak confidence > 90%', enabled: true },
                { label: 'Emergency Dispatch', desc: 'Auto-generate work order and notify maintenance team', enabled: true },
                { label: 'Production Halt', desc: 'Shut down affected production bay on critical pressure loss', enabled: false },
                { label: 'Municipal Alert', desc: 'Notify water authority when loss exceeds 5,000 L/h', enabled: false },
              ].map((p, i) => (
                <div key={i} className="flex items-start justify-between py-2 border-b border-surface-border/30 last:border-0">
                  <div className="flex-1">
                    <span className="text-body-md text-text-main font-medium block">{p.label}</span>
                    <span className="text-body-sm text-text-muted">{p.desc}</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${p.enabled ? 'bg-primary justify-end' : 'bg-surface-elevated border border-surface-border justify-start'}`}>
                    <div className={`w-4 h-4 rounded-full ${p.enabled ? 'bg-background' : 'bg-text-muted'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SYSTEM DIAGNOSTICS ── */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel border border-surface-border rounded-lg p-6 flex flex-col gap-4 hover-lift delay-100 animate-fade-in-up">
              <div className="flex items-center gap-2 pb-3 border-b border-surface-border">
                <span className="material-symbols-outlined text-primary text-[20px]">dns</span>
                <h2 className="text-headline-md font-bold text-text-main">Service Status</h2>
              </div>
              {systemStatus ? (
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Backend API', status: systemStatus.Backend || 'OFFLINE', icon: 'cloud' },
                    { label: 'Database (SQLite)', status: systemStatus.Database || 'OFFLINE', icon: 'storage' },
                    { label: 'ML Engine', status: systemStatus.ML || 'OFFLINE', icon: 'psychology' },
                    { label: 'WebSocket', status: systemStatus.WebSocket || 'OFFLINE', icon: 'sync_alt' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-background rounded border border-surface-border">
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined text-[20px] ${statusColor(s.status)}`}>{s.icon}</span>
                        <span className="text-body-lg text-text-main font-medium">{s.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${statusDot(s.status)}`}></span>
                        <span className={`font-mono text-label-lg font-bold ${statusColor(s.status)}`}>{s.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-text-muted">
                  <span className="material-symbols-outlined text-[24px] animate-spin mr-2">progress_activity</span>
                  Loading system status...
                </div>
              )}
            </div>
            <div className="glass-panel border border-surface-border rounded-lg p-6 flex flex-col gap-4 hover-lift delay-100 animate-fade-in-up">
              <div className="flex items-center gap-2 pb-3 border-b border-surface-border">
                <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                <h2 className="text-headline-md font-bold text-text-main">System Information</h2>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Platform Version', value: 'AquaRisk AI v1.0.0' },
                  { label: 'API Endpoint', value: 'http://localhost:8000' },
                  { label: 'Frontend', value: 'React 18 + Vite 4 + Tailwind 3' },
                  { label: 'Backend', value: 'FastAPI + SQLAlchemy' },
                  { label: 'ML Pipeline', value: '11-Stage Predictive Engine' },
                  { label: 'Database', value: 'SQLite (aquarisk.db)' },
                  { label: 'Data Refresh', value: 'Every 3 seconds (WebSocket)' },
                ].map((i, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-surface-border/30 last:border-0">
                    <span className="text-body-md text-text-secondary">{i.label}</span>
                    <span className="text-body-md text-text-main font-mono font-medium">{i.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 3D DIGITAL TWIN PREVIEW ── */}
        {activeTab === 'twin' && (
          <div className="glass-panel border border-surface-border rounded-lg p-6 flex flex-col gap-4 hover-lift delay-100 animate-fade-in-up">
            <div className="flex items-center gap-2 pb-3 border-b border-surface-border">
              <span className="material-symbols-outlined text-primary text-[20px]">view_in_ar</span>
              <h2 className="text-headline-md font-bold text-text-main">3D Digital Twin Preview</h2>
            </div>
            <div className="bg-background border border-surface-border rounded-lg min-h-[400px] flex flex-col items-center justify-center gap-4 text-text-muted">
              <span className="material-symbols-outlined text-[56px] opacity-30">view_in_ar</span>
              <div className="text-center">
                <p className="text-headline-md text-text-main font-semibold">3D Plant Visualization</p>
                <p className="text-body-md text-text-secondary mt-1">Interactive 3D model of VSB Plant 01 water distribution network.</p>
                <p className="text-body-sm text-text-muted mt-2">Three.js integration — Coming in v2.0</p>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                {[
                  { label: 'Pipe Segments', value: '24', icon: 'timeline' },
                  { label: 'Sensor Nodes', value: '14', icon: 'sensors' },
                  { label: 'Control Valves', value: '6', icon: 'valve' },
                ].map((m, i) => (
                  <div key={i} className="bg-surface-subtle p-3 rounded border border-surface-border">
                    <span className="material-symbols-outlined text-primary text-[20px]">{m.icon}</span>
                    <div className="text-headline-md font-bold text-text-main font-mono mt-1">{m.value}</div>
                    <span className="text-label-sm text-text-muted">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
