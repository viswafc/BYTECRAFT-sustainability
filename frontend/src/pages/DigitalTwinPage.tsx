import React, { useState, useEffect } from 'react';

export const DigitalTwinPage: React.FC = () => {
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/network/telemetry");
        if (res.ok) setTelemetry(await res.json());
      } catch (e) { console.error(e); }
    };
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  const nodeInfo: Record<string, { title: string; type: string; flow: string; pressure: string; status: string; statusColor: string }> = {
    'tank': { title: 'MAIN STORAGE TANK T-01', type: 'Storage', flow: '48,240 L/h output', pressure: '4.2 bar', status: 'SUPPLY OK', statusColor: 'text-status-operational' },
    'splitter': { title: 'DISTRIBUTION MANIFOLD', type: 'Splitter Node', flow: '48,240 L/h distributed', pressure: '4.0 bar', status: 'NOMINAL', statusColor: 'text-status-operational' },
    's01': { title: 'SENSOR S01 (Line A)', type: 'Ultrasonic Flow Meter', flow: '23,800 L/h', pressure: '3.8 bar', status: 'NOMINAL', statusColor: 'text-status-operational' },
    's05': { title: 'SENSOR S05 (Line B Intake)', type: 'Ultrasonic Flow Meter', flow: '24,440 L/h (+42%)', pressure: '2.9 bar (Decaying)', status: 'FLOW ANOMALY', statusColor: 'text-status-critical' },
    's06': { title: 'SENSOR S06 (Line B Output)', type: 'Pressure Transducer', flow: 'Starvation Deficit', pressure: '1.82 bar (-18%)', status: 'PRESSURE ALERT', statusColor: 'text-status-critical' },
    'bayA': { title: 'BOTTLING BAY A', type: 'Production Line', flow: '23,800 L/h feed', pressure: '3.6 bar', status: 'RUNNING NORMAL', statusColor: 'text-status-operational' },
    'bayB': { title: 'COOLING BAY B', type: 'Cooling System', flow: 'Insufficient feed', pressure: '1.82 bar (LOW)', status: 'FEED DEFICIT', statusColor: 'text-status-critical' },
    'valve': { title: 'VALVE BV-102', type: 'Gate Valve (Manual)', flow: 'Line B upstream', pressure: 'Full bore open', status: 'OPEN — ISOLATE?', statusColor: 'text-status-warning' },
    'breach': { title: 'BREACH SEGMENT S05–S06', type: 'Pipe Rupture', flow: '2,840 L/h loss', pressure: 'Collapsed (1.82 bar)', status: 'CRITICAL RUPTURE', statusColor: 'text-status-critical' },
  };

  const currentNode = selectedNode ? nodeInfo[selectedNode] : null;

  return (
    <div className="flex-1 p-8 max-w-7xl w-full mx-auto flex flex-col gap-6">
      {/* Page Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-surface-border/50">
        <div>
          <h1 className="text-headline-lg font-bold text-text-main tracking-tight">Digital Twin</h1>
          <p className="text-body-md text-text-secondary mt-0.5">Interactive schematic of VSB Plant 01 water distribution network.</p>
        </div>
        <div className="flex items-center gap-4 font-mono text-label-sm">
          <span className="flex items-center gap-1.5 text-status-operational font-bold">
            <span className="w-2 h-2 rounded-full bg-status-operational"></span> Line A (Nominal)
          </span>
          <span className="flex items-center gap-1.5 text-status-critical font-bold">
            <span className="w-2 h-2 rounded-full bg-status-critical beacon"></span> Line B (Ruptured)
          </span>
          <span className="flex items-center gap-1.5 text-primary">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Live Telemetry
          </span>
        </div>
      </section>

      {/* Twin + Inspector */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* SVG Twin */}
        <div className="lg:col-span-8 glass-panel border border-surface-border rounded-lg p-5 flex items-center justify-center min-h-[500px] hover-lift delay-100 shadow-[inset_0_0_50px_rgba(40,215,255,0.03)]">
          <svg className="w-full h-full max-h-[500px]" viewBox="0 0 860 420">
            <defs>
              <linearGradient id="tankGrad2" x1="0" x2="0" y1="1" y2="0">
                <stop offset="0%" stopColor="#00adc5" stopOpacity="0.8" /><stop offset="90%" stopColor="#28d7ff" stopOpacity="0.4" /><stop offset="100%" stopColor="#163447" stopOpacity="0.2" />
              </linearGradient>
              <filter id="glow2" width="150%" height="150%" x="-25%" y="-25%"><feGaussianBlur stdDeviation="5" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
            </defs>
            <g stroke="#163447" strokeDasharray="3 3" strokeWidth="0.5">
              <line x1="20" x2="840" y1="105" y2="105" /><line x1="20" x2="840" y1="210" y2="210" /><line x1="20" x2="840" y1="315" y2="315" />
            </g>

            {/* TANK */}
            <g className="cursor-pointer" onClick={() => setSelectedNode('tank')} transform="translate(30, 100)">
              <rect fill="#102635" height="210" rx="8" stroke={selectedNode === 'tank' ? '#28D7FF' : '#7891A0'} strokeWidth={selectedNode === 'tank' ? 3 : 2} width="140" />
              <rect fill="url(#tankGrad2)" height="170" rx="5" width="130" x="5" y="35" />
              <text fill="#E6F3FA" fontFamily="Inter" fontSize="13" fontWeight="bold" textAnchor="middle" x="70" y="65">MAIN TANK</text>
              <text fill="#28D7FF" fontFamily="'JetBrains Mono'" fontSize="24" fontWeight="bold" textAnchor="middle" x="70" y="92">92%</text>
              <text fill="#A2BDCC" fontFamily="'JetBrains Mono'" fontSize="10" textAnchor="middle" x="70" y="115">782,000 Litres</text>
              <rect fill="#040d15" height="20" rx="3" stroke="#31D48C" strokeWidth="1" width="80" x="30" y="140" />
              <text fill="#31D48C" fontFamily="'JetBrains Mono'" fontSize="10" fontWeight="bold" textAnchor="middle" x="70" y="154">SUPPLY OK</text>
            </g>

            {/* Main Trunk */}
            <path d="M 170 210 L 260 210" fill="none" stroke="#163447" strokeWidth="12" />
            <path className="pipe-flow-green" d="M 170 210 L 260 210" fill="none" stroke="#28D7FF" strokeWidth="4" />

            {/* Splitter */}
            <g className="cursor-pointer" onClick={() => setSelectedNode('splitter')}>
              <circle cx="260" cy="210" fill="#28D7FF" r="10" stroke="#E6F3FA" strokeWidth={selectedNode === 'splitter' ? 3 : 2} />
              <text fill="#E6F3FA" fontFamily="'JetBrains Mono'" fontSize="9" fontWeight="bold" textAnchor="middle" x="260" y="190">SPLITTER</text>
            </g>

            {/* LINE A */}
            <path d="M 260 210 L 260 120 L 560 120 L 680 120" fill="none" stroke="#163447" strokeWidth="10" />
            <path className="pipe-flow-green" d="M 260 210 L 260 120 L 560 120 L 680 120" fill="none" stroke="#31D48C" strokeWidth="4" />
            <rect fill="#07131E" height="20" rx="3" stroke="#31D48C" strokeWidth="1" width="160" x="290" y="98" />
            <text fill="#31D48C" fontFamily="'JetBrains Mono'" fontSize="10.5" fontWeight="bold" textAnchor="middle" x="370" y="112">LINE A • 23,800 L/h (OK)</text>

            {/* S01 */}
            <g className="cursor-pointer" onClick={() => setSelectedNode('s01')} transform="translate(475, 108)">
              <circle cx="14" cy="14" fill="#102635" r="16" stroke={selectedNode === 's01' ? '#28D7FF' : '#31D48C'} strokeWidth={selectedNode === 's01' ? 3 : 2} />
              <text fill="#E6F3FA" fontFamily="'JetBrains Mono'" fontSize="10" fontWeight="bold" textAnchor="middle" x="14" y="18">S01</text>
            </g>

            {/* Bay A */}
            <g className="cursor-pointer" onClick={() => setSelectedNode('bayA')} transform="translate(680, 90)">
              <rect fill="#102635" height="60" rx="5" stroke={selectedNode === 'bayA' ? '#28D7FF' : '#31D48C'} strokeWidth={selectedNode === 'bayA' ? 3 : 2} width="140" />
              <text fill="#E6F3FA" fontFamily="Inter" fontSize="12" fontWeight="bold" textAnchor="middle" x="70" y="25">BOTTLING BAY A</text>
              <rect fill="#07131E" height="18" rx="3" width="110" x="15" y="34" />
              <text fill="#31D48C" fontFamily="'JetBrains Mono'" fontSize="10" fontWeight="bold" textAnchor="middle" x="70" y="47">RUNNING NORMAL</text>
            </g>

            {/* LINE B */}
            <path d="M 260 210 L 260 310 L 360 310" fill="none" stroke="#163447" strokeWidth="10" />
            <path className="pipe-flow-green" d="M 260 210 L 260 310 L 360 310" fill="none" stroke="#53d7f0" strokeWidth="4" />

            {/* BV-102 */}
            <g className="cursor-pointer" onClick={() => setSelectedNode('valve')} transform="translate(280, 295)">
              <rect fill="#102635" height="30" rx="4" stroke={selectedNode === 'valve' ? '#28D7FF' : '#53d7f0'} strokeWidth={selectedNode === 'valve' ? 3 : 2} width="55" />
              <text fill="#53d7f0" fontFamily="'JetBrains Mono'" fontSize="10" fontWeight="bold" textAnchor="middle" x="27.5" y="18">BV-102</text>
            </g>

            {/* S05 */}
            <g className="cursor-pointer" onClick={() => setSelectedNode('s05')} transform="translate(360, 296)">
              <circle cx="14" cy="14" fill="#163447" r="16" stroke={selectedNode === 's05' ? '#28D7FF' : '#FF5B67'} strokeWidth={selectedNode === 's05' ? 3 : 2.5} />
              <text fill="#E6F3FA" fontFamily="'JetBrains Mono'" fontSize="10" fontWeight="bold" textAnchor="middle" x="14" y="18">S05</text>
              <text fill="#FF5B67" fontFamily="'JetBrains Mono'" fontSize="9" fontWeight="bold" textAnchor="middle" x="14" y="-4">+42%</text>
            </g>

            {/* BREACH */}
            <g className="cursor-pointer" onClick={() => setSelectedNode('breach')}>
              <rect className="alert-glow" fill="#FF5B67" fillOpacity="0.15" height="32" rx="5" stroke="#FF5B67" strokeDasharray="4 2" strokeWidth="2" width="160" x="395" y="294" />
              <line stroke="#FF5B67" strokeWidth="8" x1="395" x2="555" y1="310" y2="310" />
              <line className="pipe-flow-red" stroke="#FFFFFF" strokeWidth="3" x1="395" x2="555" y1="310" y2="310" />
              <g transform="translate(475, 260)">
                <rect fill="#FF5B67" filter="url(#glow2)" height="26" rx="4" stroke="#FFFFFF" strokeWidth="1.5" width="150" x="-75" y="-13" />
                <text fill="#07131E" fontFamily="'JetBrains Mono'" fontSize="11" fontWeight="bold" textAnchor="middle" x="0" y="3">⚡ RUPTURE DETECTED</text>
                <polygon fill="#FF5B67" points="0,13 -6,19 6,19" />
              </g>
              <circle className="beacon" cx="475" cy="310" fill="#FFFFFF" r="8" />
            </g>

            {/* S06 */}
            <g className="cursor-pointer" onClick={() => setSelectedNode('s06')} transform="translate(555, 296)">
              <circle className="alert-glow" cx="14" cy="14" fill="#FF5B67" r="16" stroke={selectedNode === 's06' ? '#28D7FF' : '#FFFFFF'} strokeWidth={selectedNode === 's06' ? 3 : 2} />
              <text fill="#07131E" fontFamily="'JetBrains Mono'" fontSize="10" fontWeight="bold" textAnchor="middle" x="14" y="18">S06</text>
              <text fill="#FF5B67" fontFamily="'JetBrains Mono'" fontSize="9" fontWeight="bold" textAnchor="middle" x="14" y="-4">-18%</text>
            </g>

            {/* Bay B */}
            <path d="M 583 310 L 680 310" fill="none" stroke="#163447" strokeWidth="10" />
            <path d="M 583 310 L 680 310" fill="none" stroke="#FF5B67" strokeDasharray="5 5" strokeWidth="2.5" />
            <g className="cursor-pointer" onClick={() => setSelectedNode('bayB')} transform="translate(680, 280)">
              <rect fill="#102635" height="60" rx="5" stroke={selectedNode === 'bayB' ? '#28D7FF' : '#FF5B67'} strokeWidth={selectedNode === 'bayB' ? 3 : 2} width="140" />
              <text fill="#E6F3FA" fontFamily="Inter" fontSize="12" fontWeight="bold" textAnchor="middle" x="70" y="25">COOLING BAY B</text>
              <rect fill="#FF5B67" fillOpacity="0.2" height="18" rx="3" width="110" x="15" y="34" />
              <text fill="#FF5B67" fontFamily="'JetBrains Mono'" fontSize="10" fontWeight="bold" textAnchor="middle" x="70" y="47">FEED DEFICIT</text>
            </g>
          </svg>
        </div>

        {/* Inspector Panel */}
        <div className="lg:col-span-4 glass-panel border border-surface-border rounded-lg p-6 flex flex-col hover-lift delay-200">
          <div className="flex items-center gap-2 pb-3 border-b border-surface-border mb-4">
            <span className="material-symbols-outlined text-primary text-[20px]">info</span>
            <h3 className="text-headline-md font-bold text-text-main">Node Inspector</h3>
          </div>
          {!currentNode ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-text-muted gap-3 py-12">
              <span className="material-symbols-outlined text-[40px] opacity-50">touch_app</span>
              <p className="text-body-md">Click any node, sensor, or segment on the schematic to inspect its live telemetry.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <div className="text-label-sm uppercase text-text-secondary tracking-wider">Selected Component</div>
                <h4 className="text-headline-md font-bold text-text-main mt-1">{currentNode.title}</h4>
                <span className="text-body-sm text-text-muted">{currentNode.type}</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { label: 'FLOW RATE', value: currentNode.flow },
                  { label: 'PRESSURE', value: currentNode.pressure },
                ].map((m, i) => (
                  <div key={i} className="bg-background p-3 rounded border border-surface-border">
                    <span className="text-label-sm text-text-secondary uppercase block mb-1">{m.label}</span>
                    <span className="text-body-lg font-mono font-semibold text-text-main">{m.value}</span>
                  </div>
                ))}
                <div className={`p-3 rounded border ${currentNode.statusColor.includes('critical') ? 'bg-status-critical/10 border-status-critical/40' : currentNode.statusColor.includes('warning') ? 'bg-status-warning/10 border-status-warning/40' : 'bg-status-operational/10 border-status-operational/40'}`}>
                  <span className="text-label-sm text-text-secondary uppercase block mb-1">STATUS</span>
                  <span className={`text-body-lg font-mono font-bold ${currentNode.statusColor}`}>{currentNode.status}</span>
                </div>
              </div>
              <button onClick={() => setSelectedNode(null)} className="mt-2 w-full py-2 rounded border border-surface-border text-text-secondary hover:text-primary hover:border-primary text-label-lg transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[16px]">close</span>
                Clear Selection
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
