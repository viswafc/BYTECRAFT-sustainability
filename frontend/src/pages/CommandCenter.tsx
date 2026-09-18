import React, { useState, useEffect } from 'react';

interface WaitData {
  label: string; hours: number; water: string; money: string; context: string;
}

const waitData: WaitData[] = [
  { label: "NOW", hours: 0, water: "2,840 Litres", money: "₹6,816", context: "Immediate intervention required to prevent downstream factory shutdown." },
  { label: "1 HOUR", hours: 1, water: "2,840 Litres", money: "₹6,816", context: "Reservoir level begins steady decay; minor Cooling Bay B throttling." },
  { label: "6 HOURS", hours: 6, water: "17,040 Litres", money: "₹40,896", context: "Trench flooding begins. Machine Bay B loses primary cooling pressure." },
  { label: "12 HOURS", hours: 12, water: "34,080 Litres", money: "₹81,792", context: "Production halted at Cooling Bay B. Municipal penalty tier invoked." },
  { label: "24 HOURS", hours: 24, water: "67,200 Litres", money: "₹1,61,280", context: "Catastrophic water loss. Significant foundation erosion and factory shutdown." },
];

export const CommandCenter: React.FC = () => {
  const [risk, setRisk] = useState<any>(null);
  const [impact, setImpact] = useState<any>(null);
  const [decision, setDecision] = useState<any>(null);
  const [sliderValue, setSliderValue] = useState(0);
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [showInvestigationModal, setShowInvestigationModal] = useState(false);
  const [modalData, setModalData] = useState({ title: '', status: '', flow: '', pressure: '', loss: '' });

  const fetchData = async () => {
    try {
      const [riskRes, impRes, decRes] = await Promise.all([
        fetch("http://localhost:8000/api/risk/current"),
        fetch("http://localhost:8000/api/impact/current"),
        fetch("http://localhost:8000/api/decisions/current"),
      ]);
      if (riskRes.ok) { const d = await riskRes.json(); if (d) setRisk(d); }
      if (impRes.ok) { const d = await impRes.json(); if (d) setImpact(d); }
      if (decRes.ok) { const d = await decRes.json(); if (d) setDecision(d); }
    } catch (e) { console.error("Fetch error", e); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleIsolation = () => {
    fetch('http://localhost:8000/api/simulator/intervene', { method: 'POST' })
      .then(() => {
        alert('AUTOMATED MITIGATION EXECUTED:\n\n• Valve BV-102 commanded to ISOLATE.\n• Line B isolated to stop 2,840 L/h leak.\n• Emergency dispatch ticket #WO-891 assigned.');
        setShowSegmentModal(false);
        setShowInvestigationModal(false);
        fetchData();
      });
  };

  const openSegmentDetails = () => {
    setModalData({ title: 'Breach Segment S05–S06', status: 'CRITICAL LEAK', flow: '24,440 L/h', pressure: '1.82 bar', loss: '2,840 L/h' });
    setShowSegmentModal(true);
  };

  const showQuickModal = (name: string, status: string, flow: string, pressure: string, loss: string) => {
    setModalData({ title: name, status, flow, pressure, loss });
    setShowSegmentModal(true);
  };

  const isNominal = (s: string) => s.includes('OK') || s.includes('Nominal');
  const sim = waitData[sliderValue];

  const lossRate = impact?.loss_rate_lph ?? 2840;
  const financialPerDay = impact?.financial_impact?.total_cost ?? 161280;
  const riskScore = risk?.risk_score ? (risk.risk_score * 100).toFixed(1) : '94.2';

  return (
    <div className="flex flex-col gap-0 bg-background min-h-full">
      {/* ═══ CRITICAL INCIDENT BANNER ═══ */}
      <section className="p-5 pb-2">
        <div className="bg-gradient-to-r from-[#200B11] via-[#151D29] to-[#0D2230] border-2 border-status-critical/80 rounded-lg p-4 shadow-[0_4px_24px_rgba(255,91,103,0.18)]">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-border/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-status-critical/20 border border-status-critical flex items-center justify-center text-status-critical alert-glow">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold tracking-widest text-status-critical uppercase bg-status-critical/20 px-2 py-0.5 rounded">
                    CRITICAL WATER LEAK DETECTED
                  </span>
                  <span className="text-xs font-mono text-text-muted">ID: INC-9821</span>
                </div>
                <h1 className="text-xl font-bold text-text-main tracking-tight mt-0.5">
                  Rupture on <span className="text-status-critical font-mono font-bold">Line B</span> at{' '}
                  <span className="text-primary font-mono font-bold underline cursor-pointer" onClick={openSegmentDetails}>Segment S05–S06</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-text-secondary">System Confidence:</span>
              <span className="bg-status-critical font-mono text-background text-xs font-bold px-2 py-1 rounded">
                {riskScore}% URGENT
              </span>
            </div>
          </div>

          {/* 4 High-Impact Stat Anchors */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
            <div className="bg-surface-container/90 p-2.5 rounded border border-status-critical/50 flex flex-col">
              <div className="flex items-center justify-between text-text-muted text-xs">
                <span>Current Water Loss Rate</span>
                <span className="text-status-critical font-mono font-bold text-[11px]">CRITICAL</span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-mono font-bold text-status-critical">{lossRate.toLocaleString()}</span>
                <span className="text-xs font-mono text-text-muted">L / hour</span>
              </div>
              <span className="text-[11px] text-status-critical/90 font-mono mt-0.5">Continuous unmetered loss</span>
            </div>
            <div className="bg-surface-container/90 p-2.5 rounded border border-surface-border flex flex-col">
              <div className="flex items-center justify-between text-text-muted text-xs">
                <span>Projected 24h Loss</span>
                <span className="text-status-warning font-mono font-bold text-[11px]">HIGH</span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-mono font-bold text-text-main">67,200</span>
                <span className="text-xs font-mono text-text-muted">Litres</span>
              </div>
              <span className="text-[11px] text-text-muted font-mono mt-0.5">If not isolated today</span>
            </div>
            <div className="bg-surface-container/90 p-2.5 rounded border border-surface-border flex flex-col">
              <div className="flex items-center justify-between text-text-muted text-xs">
                <span>Direct Financial Bleed</span>
                <span className="text-primary font-mono text-[11px]">COST / DAY</span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-mono font-bold text-status-warning">₹{financialPerDay.toLocaleString()}</span>
                <span className="text-xs font-mono text-text-muted">/ day</span>
              </div>
              <span className="text-[11px] text-text-muted font-mono mt-0.5">+ escalated municipal tariff</span>
            </div>
            <div className="bg-surface-container/90 p-2.5 rounded border border-primary/40 flex flex-col justify-between">
              <div className="text-xs text-primary font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">assistant_direction</span>
                Action Required Now
              </div>
              <div className="text-xs font-semibold text-text-main leading-tight mt-1">
                Inspect <span className="text-status-critical font-mono font-bold">S05–S06</span> & isolate valve <span className="text-primary font-mono">BV-102</span>
              </div>
              <div className="mt-2 flex gap-1.5">
                <button className="flex-1 py-1 bg-primary text-background font-bold text-[11px] rounded hover:brightness-110" onClick={() => setShowInvestigationModal(true)}>
                  Investigate
                </button>
                <button className="flex-1 py-1 bg-status-critical/20 border border-status-critical text-status-critical font-bold text-[11px] rounded hover:bg-status-critical/30" onClick={handleIsolation}>
                  Isolate BV-102
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ INCIDENT DETECTION STORY PROGRESSION ═══ */}
      <section className="px-5 py-2">
        <div className="bg-surface-container border border-surface-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">history</span>
              <span className="text-xs font-bold uppercase tracking-wider text-text-main">Incident Detection Story Progression</span>
            </div>
            <span className="text-[11px] font-mono text-text-muted">From Normal to Critical in 17 minutes</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {[
              { time: '14:10 UTC', title: 'Nominal Steady Flow', desc: 'Line B operating at standard baseline (24k L/h).', color: 'tertiary', border: 'border-status-operational/40' },
              { time: '14:18 UTC', title: 'Flow Surge (+42%)', desc: 'S05 reports sudden rise without demand request.', color: 'primary', border: 'border-surface-border' },
              { time: '14:21 UTC', title: 'Pressure Drop (-18%)', desc: 'S06 drops to 1.82 bar, confirming hydraulic collapse.', color: 'status-warning', border: 'border-status-warning/50' },
              { time: '14:25 UTC', title: 'Leak Suspected', desc: 'Machine production checked: only +3% (ruling out usage).', color: 'status-critical', border: 'border-status-critical/50' },
            ].map((step, i) => (
              <div key={i} className={`bg-surface-container-lowest p-2.5 rounded border ${step.border}`}>
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-xs font-bold text-${step.color}`}>{step.time}</span>
                  <span className={`w-2 h-2 rounded-full bg-${step.color}`}></span>
                </div>
                <div className="text-xs font-bold text-text-main mt-1">{step.title}</div>
                <p className="text-[11px] text-text-muted mt-0.5">{step.desc}</p>
              </div>
            ))}
            <div className="bg-status-critical/15 p-2.5 rounded border-2 border-status-critical shadow-[0_0_12px_rgba(255,91,103,0.3)]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-status-critical">14:27 UTC (NOW)</span>
                <span className="w-2.5 h-2.5 rounded-full bg-status-critical beacon"></span>
              </div>
              <div className="text-xs font-bold text-text-main mt-1">Critical Rupture Confirmed</div>
              <p className="text-[11px] text-status-critical font-mono mt-0.5">2,840 L/h continuous leak on S05–S06.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MAIN CORE: DIGITAL TWIN + WHY PANEL ═══ */}
      <main className="p-5 pt-2 grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* LEFT: DIGITAL TWIN (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-3">
          <div className="bg-surface-container border border-surface-border rounded-lg p-4 flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-surface-border/60 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">account_tree</span>
                <div>
                  <h2 className="text-sm font-bold text-text-main">Digital Twin: Facility Flow Routing</h2>
                  <p className="text-[11px] text-text-muted">Simplified schematic • Click on any node or the breach segment</p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="flex items-center gap-1 text-status-operational font-bold">
                  <span className="w-2 h-2 rounded-full bg-status-operational"></span> Line A (Nominal)
                </span>
                <span className="flex items-center gap-1 text-status-critical font-bold ml-2">
                  <span className="w-2 h-2 rounded-full bg-status-critical beacon"></span> Line B (Ruptured)
                </span>
              </div>
            </div>

            {/* SVG DIGITAL TWIN */}
            <div className="relative bg-surface-container-lowest rounded border border-surface-border flex-1 min-h-[360px] flex items-center justify-center p-3 select-none overflow-hidden">
              <svg className="w-full h-full max-h-[400px]" viewBox="0 0 760 360">
                <defs>
                  <linearGradient id="tankGrad" x1="0" x2="0" y1="1" y2="0">
                    <stop offset="0%" stopColor="#00adc5" stopOpacity="0.8" />
                    <stop offset="90%" stopColor="#28d7ff" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#163447" stopOpacity="0.2" />
                  </linearGradient>
                  <filter id="leakGlow" width="140%" height="140%" x="-20%" y="-20%">
                    <feGaussianBlur result="blur" stdDeviation="4" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                {/* Grid */}
                <g stroke="#163447" strokeDasharray="3 3" strokeWidth="0.5">
                  <line x1="20" x2="740" y1="90" y2="90" /><line x1="20" x2="740" y1="180" y2="180" /><line x1="20" x2="740" y1="270" y2="270" />
                </g>
                {/* MAIN TANK */}
                <g className="cursor-pointer" onClick={() => showQuickModal('MAIN STORAGE TANK T-01', 'Nominal', '48,240 L/h total output', '4.2 bar head pressure', '0 L unmetered')} transform="translate(40, 95)">
                  <rect fill="#102635" height="170" rx="6" stroke="#7891A0" strokeWidth="2" width="110" x="0" y="0" className="hover:stroke-primary transition-colors" />
                  <rect fill="url(#tankGrad)" height="136" rx="4" width="102" x="4" y="30" />
                  <ellipse cx="55" cy="15" fill="#163447" rx="45" ry="8" stroke="#7891A0" strokeWidth="1.5" />
                  <text fill="#E6F3FA" fontFamily="Inter" fontSize="11" fontWeight="bold" textAnchor="middle" x="55" y="55">MAIN TANK</text>
                  <text fill="#28D7FF" fontFamily="'JetBrains Mono'" fontSize="20" fontWeight="bold" textAnchor="middle" x="55" y="75">92%</text>
                  <text fill="#A2BDCC" fontFamily="'JetBrains Mono'" fontSize="9" textAnchor="middle" x="55" y="95">782,000 Litres</text>
                  <rect fill="#040d15" height="16" rx="3" stroke="#31D48C" strokeWidth="1" width="66" x="22" y="115" />
                  <text fill="#31D48C" fontFamily="'JetBrains Mono'" fontSize="8.5" fontWeight="bold" textAnchor="middle" x="55" y="126">SUPPLY OK</text>
                </g>
                {/* Main Trunk */}
                <path d="M 150 180 L 210 180" fill="none" stroke="#163447" strokeWidth="10" />
                <path className="pipe-flow-green" d="M 150 180 L 210 180" fill="none" stroke="#28D7FF" strokeWidth="3" />
                <circle cx="210" cy="180" fill="#28D7FF" r="8" stroke="#E6F3FA" strokeWidth="2" />
                {/* LINE A (GREEN) */}
                <path d="M 210 180 L 210 100 L 480 100 L 590 100" fill="none" stroke="#163447" strokeWidth="8" />
                <path className="pipe-flow-green" d="M 210 180 L 210 100 L 480 100 L 590 100" fill="none" stroke="#31D48C" strokeWidth="3.5" />
                <rect fill="#07131E" height="18" rx="3" stroke="#31D48C" strokeWidth="1" width="130" x="230" y="80" />
                <text fill="#31D48C" fontFamily="'JetBrains Mono'" fontSize="9.5" fontWeight="bold" textAnchor="middle" x="295" y="92.5">LINE A • 23,800 L/h (OK)</text>
                {/* Sensor S01 */}
                <g className="cursor-pointer" onClick={() => showQuickModal('SENSOR S01 (Line A)', 'Nominal', '23,800 L/h', '3.8 bar', '0 L/h loss')} transform="translate(390, 88)">
                  <circle cx="12" cy="12" fill="#102635" r="12" stroke="#31D48C" strokeWidth="2" />
                  <text fill="#E6F3FA" fontFamily="'JetBrains Mono'" fontSize="8.5" fontWeight="bold" textAnchor="middle" x="12" y="16">S01</text>
                </g>
                {/* Bay A */}
                <g transform="translate(590, 75)">
                  <rect fill="#102635" height="50" rx="4" stroke="#31D48C" strokeWidth="1.5" width="120" />
                  <text fill="#E6F3FA" fontFamily="Inter" fontSize="10" fontWeight="bold" textAnchor="middle" x="60" y="20">BOTTLING BAY A</text>
                  <rect fill="#07131E" height="14" rx="2" width="90" x="15" y="28" />
                  <text fill="#31D48C" fontFamily="'JetBrains Mono'" fontSize="8.5" fontWeight="bold" textAnchor="middle" x="60" y="38">RUNNING NORMAL</text>
                </g>
                {/* LINE B (RED) - Upstream */}
                <path d="M 210 180 L 210 260 L 320 260" fill="none" stroke="#163447" strokeWidth="8" />
                <path className="pipe-flow-green" d="M 210 180 L 210 260 L 320 260" fill="none" stroke="#53d7f0" strokeWidth="3.5" />
                {/* Valve BV-102 */}
                <g className="cursor-pointer" onClick={handleIsolation} transform="translate(235, 248)">
                  <rect fill="#102635" height="24" rx="3" stroke="#53d7f0" strokeWidth="1.5" width="46" className="hover:stroke-primary" />
                  <text fill="#53d7f0" fontFamily="'JetBrains Mono'" fontSize="8.5" fontWeight="bold" textAnchor="middle" x="23" y="15.5">BV-102</text>
                  <text fill="#7891A0" fontFamily="Inter" fontSize="7.5" textAnchor="middle" x="23" y="32">ISOLATE</text>
                </g>
                {/* Sensor S05 */}
                <g className="cursor-pointer" onClick={() => showQuickModal('SENSOR S05 (Line B Intake)', 'Flow Anomaly', '24,440 L/h (+42%)', '2.9 bar (Decaying)', 'Surge Point')} transform="translate(320, 248)">
                  <circle cx="12" cy="12" fill="#163447" r="13" stroke="#FF5B67" strokeWidth="2.5" />
                  <text fill="#E6F3FA" fontFamily="'JetBrains Mono'" fontSize="9" fontWeight="bold" textAnchor="middle" x="12" y="16">S05</text>
                  <text fill="#FF5B67" fontFamily="'JetBrains Mono'" fontSize="8" fontWeight="bold" textAnchor="middle" x="12" y="-4">+42% FLOW</text>
                </g>
                {/* CRITICAL BREACH */}
                <g className="cursor-pointer" onClick={openSegmentDetails}>
                  <rect className="alert-glow" fill="#FF5B67" fillOpacity="0.15" height="28" rx="4" stroke="#FF5B67" strokeDasharray="4 2" strokeWidth="1.5" width="135" x="345" y="246" />
                  <line stroke="#FF5B67" strokeWidth="7" x1="345" x2="480" y1="260" y2="260" />
                  <line className="pipe-flow-red" stroke="#FFFFFF" strokeWidth="2.5" x1="345" x2="480" y1="260" y2="260" />
                  <g transform="translate(412, 215)">
                    <rect fill="#FF5B67" filter="url(#leakGlow)" height="24" rx="4" stroke="#FFFFFF" strokeWidth="1.5" width="130" x="-65" y="-12" />
                    <text fill="#07131E" fontFamily="'JetBrains Mono'" fontSize="10" fontWeight="bold" textAnchor="middle" x="0" y="3">⚡ RUPTURE DETECTED</text>
                    <polygon fill="#FF5B67" points="0,12 -5,17 5,17" />
                  </g>
                  <circle className="beacon" cx="412" cy="260" fill="#FFFFFF" r="7" />
                  <text fill="#FF5B67" fontFamily="'JetBrains Mono'" fontSize="9" fontWeight="bold" textAnchor="middle" x="412" y="290">CLICK TO INSPECT (2,840 L/h)</text>
                </g>
                {/* Sensor S06 */}
                <g className="cursor-pointer" onClick={() => showQuickModal('SENSOR S06 (Line B Starvation)', 'Pressure Alert', 'Starvation deficit', '1.82 bar (-18%)', '2,840 L/h breach')} transform="translate(480, 248)">
                  <circle className="alert-glow" cx="12" cy="12" fill="#FF5B67" r="14" stroke="#FFFFFF" strokeWidth="2" />
                  <text fill="#07131E" fontFamily="'JetBrains Mono'" fontSize="9" fontWeight="bold" textAnchor="middle" x="12" y="16">S06</text>
                  <text fill="#FF5B67" fontFamily="'JetBrains Mono'" fontSize="8" fontWeight="bold" textAnchor="middle" x="12" y="-4">-18% PRESS</text>
                </g>
                {/* Bay B */}
                <path d="M 504 260 L 590 260" fill="none" stroke="#163447" strokeWidth="8" />
                <path d="M 504 260 L 590 260" fill="none" stroke="#FF5B67" strokeDasharray="4 4" strokeWidth="2" />
                <g transform="translate(590, 235)">
                  <rect fill="#102635" height="50" rx="4" stroke="#FF5B67" strokeWidth="1.5" width="120" />
                  <text fill="#E6F3FA" fontFamily="Inter" fontSize="10" fontWeight="bold" textAnchor="middle" x="60" y="20">COOLING BAY B</text>
                  <rect fill="#FF5B67" fillOpacity="0.2" height="14" rx="2" width="90" x="15" y="28" />
                  <text fill="#FF5B67" fontFamily="'JetBrains Mono'" fontSize="8.5" fontWeight="bold" textAnchor="middle" x="60" y="38">FEED DEFICIT (LOW P)</text>
                </g>
              </svg>
              <div className="absolute bottom-2 left-2 bg-surface-container/90 border border-surface-border px-2.5 py-1 rounded text-[11px] text-text-muted flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[14px]">touch_app</span>
                <span>Click any node or <strong className="text-status-critical underline cursor-pointer" onClick={openSegmentDetails}>Breach S05–S06</strong> for telemetry</span>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: WHY + WAIT SIMULATOR (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          {/* WHY DID THIS HAPPEN */}
          <div className="bg-surface-container border border-surface-border rounded-lg p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-surface-border/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                <h2 className="text-sm font-bold text-text-main">Why Did AquaRisk Flag This?</h2>
              </div>
              <span className="text-[11px] font-mono text-primary font-bold">Signal Triangulation</span>
            </div>
            <p className="text-xs text-text-secondary">
              AquaRisk AI combines 3 uncorrelated physical signals to eliminate false alarms and confirm real pipe rupture:
            </p>
            <div className="flex flex-col gap-2 font-mono text-xs">
              {[
                { icon: 'trending_up', label: '1. Flow Surge', sub: 'Line B Intake S05', value: '+42%', valueSub: 'Abnormally High', color: 'status-critical' },
                { icon: 'compress', label: '2. Pressure Drop', sub: 'Downstream S06', value: '-18%', valueSub: 'Hydraulic Loss', color: 'status-critical' },
                { icon: 'precision_manufacturing', label: '3. Factory Production', sub: 'Bay B Machine Load', value: '+3%', valueSub: 'Normal (Not consuming)', color: 'status-operational' },
              ].map((s, i) => (
                <div key={i} className={`bg-surface-container-lowest p-2.5 rounded border ${s.color === 'status-critical' ? 'border-status-critical/50' : 'border-status-operational/40'} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-${s.color} text-[18px]`}>{s.icon}</span>
                    <div>
                      <div className="font-sans font-bold text-text-main">{s.label}</div>
                      <div className="text-[10px] text-text-muted">{s.sub}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-${s.color} font-bold text-sm`}>{s.value}</span>
                    <span className="text-[10px] text-text-muted block">{s.valueSub}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2.5 rounded bg-primary/10 border border-primary/40 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-primary font-mono text-[11px]">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                AQUARISK VERDICT:
              </div>
              <p className="text-text-main mt-1 leading-snug">
                Since machines are only up <strong>+3%</strong>, the <strong>+42% flow</strong> combined with <strong>-18% pressure drop</strong> cannot be consumption. A physical pipe rupture exists on <strong>Line B (Flange #4)</strong>.
              </p>
            </div>
          </div>

          {/* WHAT HAPPENS IF WE WAIT */}
          <div className="bg-surface-container border border-surface-border rounded-lg p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-surface-border/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-status-warning text-[19px]">timelapse</span>
                <h2 className="text-sm font-bold text-text-main">What Happens If We Wait?</h2>
              </div>
              <span className="text-[10px] font-mono text-status-warning bg-status-warning/10 px-1.5 py-0.5 rounded font-bold">TIME HORIZON</span>
            </div>
            <p className="text-xs text-text-secondary">Adjust the slider to see water loss and financial penalties compound:</p>
            <div className="flex flex-col gap-1.5 pt-1">
              <input
                className="w-full accent-primary bg-surface-container-lowest h-2 rounded cursor-pointer"
                max="4" min="0" step="1" type="range"
                value={sliderValue}
                onChange={(e) => setSliderValue(parseInt(e.target.value))}
              />
              <div className="flex justify-between text-[11px] font-mono text-text-muted px-0.5">
                {['NOW', '1h', '6h', '12h', '24h'].map((label, i) => (
                  <span key={i} className={`cursor-pointer ${sliderValue === i ? 'font-bold text-primary' : ''}`} onClick={() => setSliderValue(i)}>{label}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-surface-container-lowest p-2.5 rounded border border-surface-border font-mono">
              <div>
                <span className="text-[10px] text-text-muted block font-sans">WATER LOSS:</span>
                <span className="text-base font-bold text-status-critical">{sim.water}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted block font-sans">FINANCIAL IMPACT:</span>
                <span className="text-base font-bold text-status-warning">{sim.money}</span>
              </div>
            </div>
            <div className="text-[11px] text-text-muted font-mono">{sim.context}</div>
            <div className="flex gap-2 pt-1">
              <button className="flex-1 py-2 bg-primary text-background font-bold text-xs rounded hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1" onClick={() => setShowInvestigationModal(true)}>
                <span className="material-symbols-outlined text-[16px]">search</span>
                INVESTIGATE INCIDENT
              </button>
              <button className="flex-1 py-2 bg-surface-elevated border border-surface-border hover:border-status-critical text-status-critical font-bold text-xs rounded transition-all flex items-center justify-center gap-1" onClick={handleIsolation}>
                <span className="material-symbols-outlined text-[16px]">power_settings_new</span>
                ISOLATE VALVE NOW
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ═══ SEGMENT MODAL ═══ */}
      {showSegmentModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowSegmentModal(false)}>
          <div className="bg-surface-container border-2 border-status-critical rounded-lg p-5 w-full max-w-md shadow-2xl flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-surface-border pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-status-critical beacon"></span>
                <div>
                  <h3 className="text-base font-bold text-text-main">{modalData.title}</h3>
                  <span className="text-xs font-mono text-text-muted">Line B Sub-Distribution Trench</span>
                </div>
              </div>
              <button className="text-text-muted hover:text-text-main p-1" onClick={() => setShowSegmentModal(false)}>
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5 font-mono">
              <div className="bg-surface-container-lowest p-2.5 rounded border border-status-critical/50">
                <span className="text-[10px] text-text-muted font-sans block">1. SEGMENT STATUS</span>
                <span className={`text-base font-bold ${isNominal(modalData.status) ? 'text-status-operational' : 'text-status-critical'}`}>{modalData.status}</span>
              </div>
              <div className="bg-surface-container-lowest p-2.5 rounded border border-surface-border">
                <span className="text-[10px] text-text-muted font-sans block">2. CURRENT FLOW</span>
                <span className="text-base font-bold text-text-main">{modalData.flow}</span>
              </div>
              <div className="bg-surface-container-lowest p-2.5 rounded border border-surface-border">
                <span className="text-[10px] text-text-muted font-sans block">3. PRESSURE</span>
                <span className="text-base font-bold text-text-main">{modalData.pressure}</span>
              </div>
              <div className="bg-surface-container-lowest p-2.5 rounded border border-status-critical/50">
                <span className="text-[10px] text-text-muted font-sans block">4. LOSS RATE</span>
                <span className="text-base font-bold text-status-critical">{modalData.loss}</span>
              </div>
            </div>
            <div className="bg-primary/10 border border-primary/40 p-2.5 rounded text-xs">
              <span className="text-primary font-bold font-mono text-[11px] block">RECOMMENDED ACTION:</span>
              <p className="text-text-main mt-0.5">Isolate upstream gate valve <strong>BV-102</strong> and send emergency inspection to flange fitting #4.</p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-surface-border">
              <button className="px-3 py-1.5 text-xs rounded bg-surface-elevated text-text-main hover:text-primary" onClick={() => setShowSegmentModal(false)}>Dismiss</button>
              <button className="px-3 py-1.5 text-xs rounded bg-primary text-background font-bold hover:brightness-110" onClick={() => { setShowSegmentModal(false); setShowInvestigationModal(true); }}>Full Incident Dossier</button>
              <button className="px-3 py-1.5 text-xs rounded bg-status-critical text-background font-bold hover:brightness-110" onClick={handleIsolation}>Execute Valve Isolation</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ INVESTIGATION MODAL ═══ */}
      {showInvestigationModal && (
        <div className="fixed inset-0 bg-background/85 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowInvestigationModal(false)}>
          <div className="bg-surface-container border border-surface-border rounded-lg p-6 w-full max-w-2xl shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-[24px]">troubleshoot</span>
                <div>
                  <h3 className="text-lg font-bold text-text-main">Incident Investigation: INC-9821-B</h3>
                  <p className="text-xs text-text-muted font-mono">Location: Line B • Manifold S05–S06 • Flange #4</p>
                </div>
              </div>
              <button className="text-text-muted hover:text-text-main p-1" onClick={() => setShowInvestigationModal(false)}>
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
              <div className="bg-surface-container-lowest p-2 rounded border border-status-critical/50">
                <span className="text-text-muted text-[10px] block font-sans">WHAT HAPPENED</span>
                <span className="text-status-critical font-bold text-sm">Critical Water Rupture</span>
              </div>
              <div className="bg-surface-container-lowest p-2 rounded border border-surface-border">
                <span className="text-text-muted text-[10px] block font-sans">LOSS VELOCITY</span>
                <span className="text-text-main font-bold text-sm">2,840 L / hr</span>
              </div>
              <div className="bg-surface-container-lowest p-2 rounded border border-surface-border">
                <span className="text-text-muted text-[10px] block font-sans">EST. DAMAGE / DAY</span>
                <span className="text-status-warning font-bold text-sm">₹1,61,280</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Root Cause Deduction Chain:</span>
              {[
                { num: '01', color: 'text-status-operational', text: <><strong className="text-text-main">Factory machines checked:</strong> Bottling & cooling lines are running at standard operating rate (+3%), which requires only 24,000 L/h.</> },
                { num: '02', color: 'text-status-critical', text: <><strong className="text-status-critical">Abnormal flow surge detected:</strong> Ultrasonic meter at S05 detected 48,240 L/h total plant demand (+42% spike).</> },
                { num: '03', color: 'text-status-critical', text: <><strong className="text-status-critical">Downstream pressure starved:</strong> Sensor S06 dropped from 4.1 bar to 1.82 bar (-18%), proving fluid is exiting through an unmetered rupture before reaching Bay B.</> },
              ].map((item, i) => (
                <div key={i} className={`bg-surface-container-lowest p-2.5 rounded flex items-start gap-2 border ${item.color === 'text-status-critical' ? 'border-status-critical/50' : 'border-surface-border/60'}`}>
                  <span className={`${item.color} font-bold font-mono`}>{item.num}</span>
                  <div className="text-xs text-text-secondary">{item.text}</div>
                </div>
              ))}
            </div>
            <div className="bg-surface-container-lowest p-3 rounded border border-surface-border flex flex-col gap-2">
              <span className="text-xs font-bold text-primary font-mono uppercase">Immediate Mitigation Plan:</span>
              <div className="text-xs text-text-main">
                1. Automated isolation command will restrict <strong>Valve BV-102</strong>.<br/>
                2. Line B downstream pressure will safely vent.<br/>
                3. Work Order #WO-891 will dispatch ground maintenance to trench segment S05–S06.
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-border">
              <button className="px-4 py-2 text-xs rounded bg-surface-elevated text-text-main hover:text-primary" onClick={() => setShowInvestigationModal(false)}>Close</button>
              <button className="px-4 py-2 text-xs rounded bg-primary text-background font-bold hover:brightness-110 shadow-[0_0_12px_rgba(40,215,255,0.4)]" onClick={handleIsolation}>
                Authorize Valve Isolation & Dispatch Crew
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
