import React from 'react';
import { DigitalTwinNode } from '../../types';

interface Plant03TopologyProps {
  nodes: DigitalTwinNode[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
  showPressureHeatmap: boolean;
}

export const Plant03Topology: React.FC<Plant03TopologyProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  showPressureHeatmap
}) => {
  return (
    <svg 
      viewBox="0 0 960 520" 
      className="w-full h-auto select-none"
      style={{ filter: 'drop-shadow(0 0 10px rgba(40, 215, 255, 0.08))' }}
    >
      <defs>
        <linearGradient id="p3FluidUPW" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00A896" />
          <stop offset="100%" stopColor="#02C39A" />
        </linearGradient>

        <linearGradient id="p3FluidRO" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#028090" />
          <stop offset="100%" stopColor="#28D7FF" />
        </linearGradient>

        <linearGradient id="p3FluidBreach" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF5B67" />
          <stop offset="100%" stopColor="#e63946" />
        </linearGradient>

        <linearGradient id="p3UvGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9d4edd" />
          <stop offset="50%" stopColor="#c77dff" />
          <stop offset="100%" stopColor="#7b2cbf" />
        </linearGradient>

        <linearGradient id="p3PVDFPipe" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#264653" />
          <stop offset="50%" stopColor="#122c37" />
          <stop offset="100%" stopColor="#1f3b47" />
        </linearGradient>
      </defs>

      {/* Grid */}
      <g opacity="0.06" stroke="#28D7FF" strokeWidth="1">
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`p3-x-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="520" />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`p3-y-${i}`} x1="0" y1={i * 50} x2="960" y2={i * 50} />
        ))}
      </g>

      {/* Process Train Annotations */}
      <rect x="250" y="45" width="690" height="200" rx="12" fill="#061522" opacity="0.4" stroke="#163044" strokeDasharray="4 4" />
      <text x="265" y="65" fill="#6c8699" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">ZONE 2: HIGH-PRESSURE RO MEMBRANE RACKS (9.5 BAR • PVDF ORBITAL PIPING)</text>

      <rect x="250" y="260" width="690" height="245" rx="12" fill="#061522" opacity="0.4" stroke="#163044" strokeDasharray="4 4" />
      <text x="265" y="280" fill="#6c8699" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">ZONE 3: POLISHING (VACUUM DEGASIFIER, UV TOC DESTRUCTOR, EDI & WAFER FAB)</text>

      {/* ================= PIPING PATHS ================= */}

      {/* Surge Tank T-301 to Multi-Media Filter MMF-301 */}
      <g>
        <path d="M 120 180 L 175 180" fill="none" stroke="url(#p3PVDFPipe)" strokeWidth="16" />
        <path d="M 120 180 L 175 180" fill="none" stroke="url(#p3FluidRO)" strokeWidth="8" />
        <path d="M 120 180 L 175 180" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" />
      </g>

      {/* Filter MMF-301 to High-Pressure Booster Pump P-302 */}
      <g>
        <path d="M 255 180 L 305 180" fill="none" stroke="url(#p3PVDFPipe)" strokeWidth="16" />
        <path d="M 255 180 L 305 180" fill="none" stroke="url(#p3FluidRO)" strokeWidth="8" />
        <path d="M 255 180 L 305 180" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" />
      </g>

      {/* High-Pressure Pump P-302 (9.5 Bar) to RO Skids Rack-01 (top) and Rack-02 (bottom) */}
      <g>
        <path d="M 365 180 L 410 180" fill="none" stroke="url(#p3PVDFPipe)" strokeWidth="18" />
        <path d="M 365 180 L 410 180" fill="none" stroke="url(#p3FluidRO)" strokeWidth="9" />
        <path d="M 365 180 L 410 180" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" />

        {/* Branch to Rack 01 (up) */}
        <path d="M 410 180 L 410 120 L 460 120" fill="none" stroke="url(#p3PVDFPipe)" strokeWidth="14" strokeLinejoin="round" />
        <path d="M 410 180 L 410 120 L 460 120" fill="none" stroke="url(#p3FluidRO)" strokeWidth="7" strokeLinejoin="round" />
        <path d="M 410 120 L 460 120" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" />

        {/* Branch to Rack 02 (down - Breach Train) */}
        <path d="M 410 180 L 410 210 L 460 210" fill="none" stroke="url(#p3PVDFPipe)" strokeWidth="14" strokeLinejoin="round" />
        <path d="M 410 180 L 410 210 L 460 210" fill="none" stroke="url(#p3FluidBreach)" strokeWidth="7" strokeLinejoin="round" />
        <path d="M 410 210 L 460 210" fill="none" stroke="#FF5B67" strokeWidth="2" className="pipe-flow-red" />
      </g>

      {/* RO Permeate manifold to Vacuum Degasifier VMD-301 */}
      <g>
        {/* Rack 01 permeate */}
        <path d="M 590 120 L 630 120 L 630 350 L 670 350" fill="none" stroke="url(#p3PVDFPipe)" strokeWidth="14" strokeLinejoin="round" />
        <path d="M 590 120 L 630 120 L 630 350 L 670 350" fill="none" stroke="url(#p3FluidUPW)" strokeWidth="7" strokeLinejoin="round" />
        <path d="M 630 200 L 630 350 L 670 350" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" strokeLinejoin="round" />

        {/* Rack 02 permeate (leaking header) */}
        <path d="M 590 210 L 630 210" fill="none" stroke="url(#p3PVDFPipe)" strokeWidth="14" />
        <path d="M 590 210 L 630 210" fill="none" stroke="url(#p3FluidBreach)" strokeWidth="7" />
        <path d="M 590 210 L 630 210" fill="none" stroke="#FF5B67" strokeWidth="2" className="pipe-flow-red" />
      </g>

      {/* Vacuum Degasifier to UV TOC Destructor to EDI to Wafer Fab */}
      <g>
        {/* VMD to UV */}
        <path d="M 720 350 L 760 350" fill="none" stroke="url(#p3PVDFPipe)" strokeWidth="14" />
        <path d="M 720 350 L 760 350" fill="none" stroke="url(#p3FluidUPW)" strokeWidth="7" />
        <path d="M 720 350 L 760 350" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" />

        {/* UV to EDI */}
        <path d="M 830 350 L 860 350 L 860 430 L 780 430" fill="none" stroke="url(#p3PVDFPipe)" strokeWidth="14" strokeLinejoin="round" />
        <path d="M 830 350 L 860 350 L 860 430 L 780 430" fill="none" stroke="url(#p3FluidUPW)" strokeWidth="7" strokeLinejoin="round" />
        <path d="M 860 380 L 860 430 L 780 430" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" strokeLinejoin="round" />

        {/* EDI to Wafer Fab */}
        <path d="M 710 430 L 610 430" fill="none" stroke="url(#p3PVDFPipe)" strokeWidth="14" />
        <path d="M 710 430 L 610 430" fill="none" stroke="url(#p3FluidUPW)" strokeWidth="7" />
        <path d="M 710 430 L 610 430" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" />
      </g>

      {/* ================= VESSELS & EQUIPMENT ================= */}

      {/* 1. PRE-TREATMENT RAW SURGE TANK T-301 */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P3-RAW-TANK')}
      >
        <rect x="25" y="110" width="95" height="150" rx="14" fill="#081827" stroke={selectedNodeId === 'NODE-P3-RAW-TANK' ? '#28D7FF' : '#1d3e57'} strokeWidth="2" />
        {/* Fluid level */}
        <rect x="31" y="150" width="83" height="104" rx="8" fill="#028090" opacity="0.65" />
        {/* N2 blanket dome */}
        <ellipse cx="72" cy="112" rx="46" ry="10" fill="#0f2b3d" stroke="#28d7ff" strokeWidth="1.5" />
        <text x="72" y="132" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          TANK T-301
        </text>
        <text x="72" y="185" fill="#FFFFFF" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
          91.2%
        </text>
        <text x="72" y="202" fill="#28D7FF" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          480 L/m • N2 Sealed
        </text>
        <text x="72" y="217" fill="#8ba2b2" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono">
          Resist: 2.1 MΩ
        </text>
      </g>

      {/* 2. DUAL MULTI-MEDIA SAND FILTER MMF-301 */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P3-SAND-FILTER')}
      >
        <rect x="175" y="125" width="80" height="110" rx="10" fill="#071b2b" stroke={selectedNodeId === 'NODE-P3-SAND-FILTER' ? '#28D7FF' : '#1b3b54'} strokeWidth="2" />
        {/* Graded media layers */}
        <rect x="180" y="165" width="70" height="20" fill="#14344d" />
        <rect x="180" y="185" width="70" height="25" fill="#1b4965" />
        <rect x="180" y="210" width="70" height="20" fill="#245a7d" />
        <text x="215" y="145" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          MMF-301
        </text>
        <text x="215" y="160" fill="#31d48c" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          Sand/Carbon
        </text>
        <text x="215" y="200" fill="#cce4f2" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono">
          DP: 0.4 Bar
        </text>
      </g>

      {/* 3. HIGH-PRESSURE RO FEED PUMP P-302 (9.5 BAR) */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P3-HP-PUMP')}
      >
        {/* Multi-stage vertical motor casing */}
        <rect x="305" y="135" width="18" height="90" rx="2" fill="#0d2538" stroke="#28d7ff" strokeWidth="1.5" />
        <circle cx="340" cy="180" r="25" fill="#0b2033" stroke={selectedNodeId === 'NODE-P3-HP-PUMP' ? '#28D7FF' : '#28d7ff'} strokeWidth="2.5" />
        <g transform="translate(340, 180)">
          <g className="spin-rotor-fast">
            <circle cx="0" cy="0" r="4" fill="#28d7ff" />
            <line x1="-13" y1="0" x2="13" y2="0" stroke="#28d7ff" strokeWidth="3" />
            <line x1="0" y1="-13" x2="0" y2="13" stroke="#28d7ff" strokeWidth="3" />
            <line x1="-9" y1="-9" x2="9" y2="9" stroke="#28d7ff" strokeWidth="2" />
          </g>
        </g>
        <text x="340" y="125" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          HP PUMP P-302
        </text>
        <text x="340" y="222" fill="#31d48c" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono" fontWeight="bold">
          9.5 Bar High-P
        </text>
      </g>

      {/* 4. RO MEMBRANE RACK 01 (NOMINAL) */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P3-RO-RACK1')}
      >
        <rect x="460" y="95" width="130" height="50" rx="8" fill="#082030" stroke={selectedNodeId === 'NODE-P3-RO-RACK1' ? '#28D7FF' : '#02c39a'} strokeWidth="2" />
        {/* Horizontal membrane tubes */}
        <line x1="470" y1="110" x2="580" y2="110" stroke="#02c39a" strokeWidth="3" strokeDasharray="6 3" />
        <line x1="470" y1="130" x2="580" y2="130" stroke="#02c39a" strokeWidth="3" strokeDasharray="6 3" />
        <text x="525" y="108" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          RO RACK-01 (NOM)
        </text>
        <text x="525" y="142" fill="#02c39a" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          240 L/m • 8.4 Bar
        </text>
      </g>

      {/* 5. RO MEMBRANE RACK 02 (CRITICAL FISSURE / O-RING BREACH) */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P3-RO-RACK2')}
      >
        <rect x="460" y="185" width="130" height="50" rx="8" fill="#210c12" stroke={selectedNodeId === 'NODE-P3-RO-RACK2' ? '#FF5B67' : '#FF5B67'} strokeWidth="3" />
        <line x1="470" y1="200" x2="580" y2="200" stroke="#FF5B67" strokeWidth="3" strokeDasharray="6 3" />
        <line x1="470" y1="220" x2="580" y2="220" stroke="#FF5B67" strokeWidth="3" strokeDasharray="6 3" />

        {/* Ultrasonic leak waves */}
        <circle cx="585" cy="210" r="14" fill="none" stroke="#FF5B67" strokeWidth="1.5" className="ultrasonic-wave" />
        <circle cx="585" cy="210" r="24" fill="none" stroke="#FF5B67" strokeWidth="1" className="ultrasonic-wave" style={{ animationDelay: '0.4s' }} />

        <text x="525" y="198" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          RO RACK-02 (LEAK)
        </text>
        <text x="525" y="232" fill="#FF5B67" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
          O-RING BREACH • 62.8 dB
        </text>
      </g>

      {/* 6. VACUUM MEMBRANE DEGASIFIER VMD-301 */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P3-DEGASIFIER')}
      >
        <rect x="670" y="300" width="50" height="100" rx="10" fill="#071b2a" stroke={selectedNodeId === 'NODE-P3-DEGASIFIER' ? '#28D7FF' : '#1e405b'} strokeWidth="2" />
        {/* Vacuum duct top */}
        <path d="M 685 300 L 685 285 L 705 285 L 705 300" fill="none" stroke="#28d7ff" strokeWidth="2" />
        <text x="695" y="280" fill="#28d7ff" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono">VAC EXH</text>
        <text x="695" y="340" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          VMD-301
        </text>
        <text x="695" y="355" fill="#31d48c" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono">
          -0.9 Bar Vac
        </text>
        <text x="695" y="370" fill="#cce4f2" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono">
          DO &lt; 1 ppb
        </text>
      </g>

      {/* 7. 185nm UV TOC PHOTOLYSIS CHAMBER UV-301 */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P3-UV-TOC')}
      >
        <rect x="760" y="325" width="70" height="50" rx="8" fill="#130921" stroke={selectedNodeId === 'NODE-P3-UV-TOC' ? '#c77dff' : '#9d4edd'} strokeWidth="2" />
        {/* UV Quartz Lamp glow */}
        <rect x="770" y="343" width="50" height="14" rx="4" fill="url(#p3UvGlow)" />
        <text x="795" y="340" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          UV-301 (185nm)
        </text>
        <text x="795" y="370" fill="#c77dff" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono">
          TOC &lt; 0.5 ppb
        </text>
      </g>

      {/* 8. CONTINUOUS ELECTRO-DEIONIZATION EDI-301 */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P3-EDI-POLISHER')}
      >
        <rect x="710" y="410" width="70" height="42" rx="6" fill="#082333" stroke={selectedNodeId === 'NODE-P3-EDI-POLISHER' ? '#28D7FF' : '#02c39a'} strokeWidth="2" />
        <text x="745" y="427" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          EDI-301
        </text>
        <text x="745" y="442" fill="#02c39a" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono">
          18.2 MΩ•cm
        </text>
      </g>

      {/* 9. CLEANROOM WAFER FAB RINSE TERMINAL */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P3-WAFER-FAB')}
      >
        <rect x="470" y="405" width="140" height="52" rx="10" fill="#051928" stroke={selectedNodeId === 'NODE-P3-WAFER-FAB' ? '#28D7FF' : '#28d7ff'} strokeWidth="2.5" />
        <text x="540" y="426" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          FAB WAFER POLISH BAY
        </text>
        <text x="540" y="440" fill="#31d48c" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          CLEANROOM GRADE 1
        </text>
        <text x="540" y="451" fill="#8ba2b2" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono">
          225 L/m • Ultra-Pure
        </text>
      </g>
    </svg>
  );
};
