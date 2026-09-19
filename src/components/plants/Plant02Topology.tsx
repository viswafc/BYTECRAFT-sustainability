import React from 'react';
import { DigitalTwinNode } from '../../types';

interface Plant02TopologyProps {
  nodes: DigitalTwinNode[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
  showPressureHeatmap: boolean;
}

export const Plant02Topology: React.FC<Plant02TopologyProps> = ({
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
        {/* Gradients */}
        <linearGradient id="p2FluidMain" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#007EA7" />
          <stop offset="100%" stopColor="#28D7FF" />
        </linearGradient>

        <linearGradient id="p2FluidHotProcess" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF7A00" />
          <stop offset="100%" stopColor="#FF5B67" />
        </linearGradient>

        <linearGradient id="p2FluidAnomalous" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#FF5B67" />
        </linearGradient>

        <linearGradient id="p2PipeWall" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#224259" />
          <stop offset="50%" stopColor="#0d1f2e" />
          <stop offset="100%" stopColor="#1a354b" />
        </linearGradient>
      </defs>

      {/* Grid */}
      <g opacity="0.06" stroke="#28D7FF" strokeWidth="1">
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`p2-x-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="520" />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`p2-y-${i}`} x1="0" y1={i * 50} x2="960" y2={i * 50} />
        ))}
      </g>

      {/* Zone Annotations */}
      <rect x="250" y="45" width="690" height="200" rx="12" fill="#061522" opacity="0.4" stroke="#163044" strokeDasharray="4 4" />
      <text x="265" y="65" fill="#6c8699" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">ZONE 2: DUAL BOOSTER SKID & UTILITY DISTRIBUTION (DN300 SCH40)</text>

      <rect x="250" y="260" width="690" height="245" rx="12" fill="#061522" opacity="0.4" stroke="#163044" strokeDasharray="4 4" />
      <text x="265" y="280" fill="#6c8699" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">ZONE 3: REFINERY EXCHANGER BANK & CATALYTIC COOLING (DN250 CS)</text>

      {/* ================= PIPING PATHS ================= */}

      {/* Clarifier C-200 to Dual Pump Intake Manifold */}
      <g>
        <path d="M 125 220 L 180 220" fill="none" stroke="url(#p2PipeWall)" strokeWidth="18" />
        <path d="M 125 220 L 180 220" fill="none" stroke="url(#p2FluidMain)" strokeWidth="10" />
        <path d="M 125 220 L 180 220" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" />
        {/* Split to Pump A (up) and Pump B (down) */}
        <path d="M 180 220 L 180 140 L 220 140" fill="none" stroke="url(#p2PipeWall)" strokeWidth="14" />
        <path d="M 180 220 L 180 140 L 220 140" fill="none" stroke="url(#p2FluidMain)" strokeWidth="7" />
        <path d="M 180 140 L 220 140" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" />

        <path d="M 180 220 L 180 220 L 220 220" fill="none" stroke="url(#p2PipeWall)" strokeWidth="14" />
        <path d="M 180 220 L 220 220" fill="none" stroke="url(#p2FluidMain)" strokeWidth="7" />
        <path d="M 180 220 L 220 220" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" />
      </g>

      {/* Dual Pumps Discharge through Check Valves into Main Manifold M-201 */}
      <g>
        {/* Pump A discharge */}
        <path d="M 270 140 L 330 140 L 330 180" fill="none" stroke="url(#p2PipeWall)" strokeWidth="14" />
        <path d="M 270 140 L 330 140 L 330 180" fill="none" stroke="url(#p2FluidMain)" strokeWidth="7" />
        <path d="M 270 140 L 330 140 L 330 180" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" />
        {/* Pump A Check Valve */}
        <polygon points="285,135 285,145 295,140" fill="#28D7FF" />
        <line x1="295" y1="134" x2="295" y2="146" stroke="#28D7FF" strokeWidth="2" />

        {/* Pump B discharge */}
        <path d="M 270 220 L 330 220 L 330 180" fill="none" stroke="url(#p2PipeWall)" strokeWidth="14" />
        <path d="M 270 220 L 330 220 L 330 180" fill="none" stroke="url(#p2FluidMain)" strokeWidth="7" />
        <path d="M 270 220 L 330 220 L 330 180" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" />
        {/* Pump B Check Valve */}
        <polygon points="285,215 285,225 295,220" fill="#28D7FF" />
        <line x1="295" y1="214" x2="295" y2="226" stroke="#28D7FF" strokeWidth="2" />

        {/* Common Main Header to M-201 with Expansion U-Loop */}
        <path d="M 330 180 L 370 180 L 370 160 L 400 160 L 400 180 L 430 180" fill="none" stroke="url(#p2PipeWall)" strokeWidth="18" strokeLinejoin="round" />
        <path d="M 330 180 L 370 180 L 370 160 L 400 160 L 400 180 L 430 180" fill="none" stroke="url(#p2FluidMain)" strokeWidth="10" strokeLinejoin="round" />
        <path d="M 330 180 L 370 180 L 370 160 L 400 160 L 400 180 L 430 180" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" strokeLinejoin="round" />
        <text x="385" y="152" fill="#6c8699" fontSize="7" textAnchor="middle" fontFamily="JetBrains Mono">EXP-LOOP</text>
      </g>

      {/* Manifold M-201 splitting into Exchanger Bank A (HX-201) and Exchanger Bank B (HX-202) */}
      <g>
        {/* To Exchanger HX-201 */}
        <path d="M 450 180 L 510 180" fill="none" stroke="url(#p2PipeWall)" strokeWidth="16" />
        <path d="M 450 180 L 510 180" fill="none" stroke="url(#p2FluidMain)" strokeWidth="8" />
        <path d="M 450 180 L 510 180" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" />

        {/* To Exchanger HX-202 (Down to Zone 3) */}
        <path d="M 440 190 L 440 350 L 510 350" fill="none" stroke="url(#p2PipeWall)" strokeWidth="16" strokeLinejoin="round" />
        <path d="M 440 190 L 440 350 L 510 350" fill="none" stroke="url(#p2FluidAnomalous)" strokeWidth="8" strokeLinejoin="round" />
        <path d="M 440 190 L 440 350 L 510 350" fill="none" stroke="#FF5B67" strokeWidth="2" className="pipe-flow-red" strokeLinejoin="round" />

        {/* Bypass line around HX-202 to BV-202 */}
        <path d="M 470 350 L 470 410 L 620 410" fill="none" stroke="url(#p2PipeWall)" strokeWidth="12" strokeLinejoin="round" />
        <path d="M 470 350 L 470 410 L 620 410" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinejoin="round" />
        <path d="M 470 410 L 620 410" fill="none" stroke="#FFFFFF" strokeWidth="1.5" className="pipe-flow-slow" strokeLinejoin="round" />
      </g>

      {/* Exchangers to Cooling Towers CT-201/202 */}
      <g>
        {/* From HX-201 */}
        <path d="M 640 180 L 760 180" fill="none" stroke="url(#p2PipeWall)" strokeWidth="16" />
        <path d="M 640 180 L 760 180" fill="none" stroke="url(#p2FluidMain)" strokeWidth="8" />
        <path d="M 640 180 L 760 180" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" />

        {/* From HX-202 and Bypass Junction */}
        <path d="M 640 350 L 710 350 L 710 200 L 760 200" fill="none" stroke="url(#p2PipeWall)" strokeWidth="16" strokeLinejoin="round" />
        <path d="M 640 350 L 710 350 L 710 200 L 760 200" fill="none" stroke="url(#p2FluidAnomalous)" strokeWidth="8" strokeLinejoin="round" />
        <path d="M 640 350 L 710 350 L 710 200 L 760 200" fill="none" stroke="#FF5B67" strokeWidth="2" className="pipe-flow-red" strokeLinejoin="round" />

        {/* Bypass reconnect */}
        <path d="M 670 410 L 710 410 L 710 350" fill="none" stroke="url(#p2PipeWall)" strokeWidth="12" strokeLinejoin="round" />
        <path d="M 670 410 L 710 410 L 710 350" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinejoin="round" />
      </g>

      {/* Condensate Return Loop (Bottom) */}
      <g>
        <path d="M 830 240 L 830 460 L 530 460" fill="none" stroke="url(#p2PipeWall)" strokeWidth="14" strokeLinejoin="round" />
        <path d="M 830 240 L 830 460 L 530 460" fill="none" stroke="url(#p2FluidHotProcess)" strokeWidth="7" strokeLinejoin="round" />
        <path d="M 830 460 L 530 460" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" strokeLinejoin="round" />
      </g>

      {/* ================= VESSELS & EQUIPMENT ================= */}

      {/* 1. CLARIFIER C-200 (Conical settling basin) */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P2-CLARIFIER')}
      >
        {/* Basin wall */}
        <rect x="25" y="140" width="100" height="110" rx="6" fill="#061826" stroke={selectedNodeId === 'NODE-P2-CLARIFIER' ? '#28D7FF' : '#1d3e57'} strokeWidth="2" />
        {/* Conical bottom */}
        <polygon points="25,250 125,250 75,290" fill="#071b2b" stroke={selectedNodeId === 'NODE-P2-CLARIFIER' ? '#28D7FF' : '#1d3e57'} strokeWidth="2" />
        {/* Settled sludge line */}
        <polygon points="45,250 105,250 75,285" fill="#14344d" />
        {/* Water layer */}
        <rect x="30" y="170" width="90" height="75" fill="#007ea7" opacity="0.6" />
        {/* Rake bridge */}
        <line x1="20" y1="140" x2="130" y2="140" stroke="#487294" strokeWidth="4" />
        <circle cx="75" cy="140" r="5" fill="#28D7FF" />
        {/* Labels */}
        <text x="75" y="160" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          CLARIFIER C-200
        </text>
        <text x="75" y="200" fill="#28D7FF" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
          1,450 L/m
        </text>
        <text x="75" y="218" fill="#cce4f2" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          Turbidity: 4.2 NTU
        </text>
        <text x="75" y="235" fill="#8ba2b2" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          2.2 Bar • River Narmada
        </text>
      </g>

      {/* 2. DUTY BOOSTER PUMP P-201A */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P2-PUMP-A')}
      >
        <rect x="210" y="115" width="20" height="50" rx="3" fill="#0a1f30" stroke="#1d425f" strokeWidth="1.5" />
        <line x1="213" y1="122" x2="213" y2="158" stroke="#28d7ff" strokeWidth="1" opacity="0.6" />
        <line x1="218" y1="122" x2="218" y2="158" stroke="#28d7ff" strokeWidth="1" opacity="0.6" />
        <circle cx="245" cy="140" r="25" fill="#0b2338" stroke={selectedNodeId === 'NODE-P2-PUMP-A' ? '#28D7FF' : '#31d48c'} strokeWidth="2.5" />
        <g transform="translate(245, 140)">
          <g className="spin-rotor">
            <circle cx="0" cy="0" r="5" fill="#31d48c" />
            <line x1="-14" y1="0" x2="14" y2="0" stroke="#31d48c" strokeWidth="3" />
            <line x1="0" y1="-14" x2="0" y2="14" stroke="#31d48c" strokeWidth="3" />
            <line x1="-10" y1="-10" x2="10" y2="10" stroke="#31d48c" strokeWidth="2" />
          </g>
        </g>
        <text x="245" y="98" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          PUMP P-201A (DUTY)
        </text>
        <text x="245" y="110" fill="#31d48c" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          880 L/m • 6.8 Bar
        </text>
      </g>

      {/* 3. STANDBY BOOSTER PUMP P-201B */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P2-PUMP-B')}
      >
        <rect x="210" y="195" width="20" height="50" rx="3" fill="#0a1f30" stroke="#1d425f" strokeWidth="1.5" />
        <circle cx="245" cy="220" r="25" fill="#0b2338" stroke={selectedNodeId === 'NODE-P2-PUMP-B' ? '#28D7FF' : '#28d7ff'} strokeWidth="2" />
        <g transform="translate(245, 220)">
          <g className="spin-rotor-fast">
            <circle cx="0" cy="0" r="5" fill="#28d7ff" />
            <line x1="-14" y1="0" x2="14" y2="0" stroke="#28d7ff" strokeWidth="3" />
            <line x1="0" y1="-14" x2="0" y2="14" stroke="#28d7ff" strokeWidth="3" />
          </g>
        </g>
        <text x="245" y="258" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          PUMP P-201B (STANDBY)
        </text>
        <text x="245" y="271" fill="#28d7ff" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          570 L/m • 6.8 Bar
        </text>
      </g>

      {/* 4. HIGH-PRESSURE SPLITTER MANIFOLD M-201 */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P2-MANIFOLD')}
      >
        <circle cx="440" cy="180" r="18" fill="#0a1d2c" stroke={selectedNodeId === 'NODE-P2-MANIFOLD' ? '#28D7FF' : '#244b68'} strokeWidth="2.5" />
        <circle cx="440" cy="180" r="7" fill="#28D7FF" />
        <text x="440" y="145" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
          MANIFOLD M-201
        </text>
        <text x="440" y="210" fill="#31d48c" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          6.6 Bar Total
        </text>
      </g>

      {/* 5. PRIMARY SHELL-AND-TUBE EXCHANGER HX-201 (Catalytic Cracker Feed) */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P2-HX201')}
      >
        {/* Shell */}
        <rect x="510" y="150" width="130" height="60" rx="14" fill="#081c2c" stroke={selectedNodeId === 'NODE-P2-HX201' ? '#28D7FF' : '#1e3e57'} strokeWidth="2.5" />
        {/* Internal tube bundle & baffles */}
        <line x1="535" y1="155" x2="535" y2="195" stroke="#28d7ff" strokeWidth="2" />
        <line x1="560" y1="165" x2="560" y2="205" stroke="#28d7ff" strokeWidth="2" />
        <line x1="585" y1="155" x2="585" y2="195" stroke="#28d7ff" strokeWidth="2" />
        <line x1="610" y1="165" x2="610" y2="205" stroke="#28d7ff" strokeWidth="2" />
        <text x="575" y="172" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          EXCHANGER HX-201
        </text>
        <text x="575" y="187" fill="#31d48c" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono">
          NOMINAL • 720 L/m
        </text>
        <text x="575" y="200" fill="#8ba2b2" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          P: 5.8 Bar • Tin 38°C
        </text>
      </g>

      {/* 6. SECONDARY SHELL-AND-TUBE EXCHANGER HX-202 (CAVITATION / TUBE-SHEET BREACH) */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P2-HX202')}
      >
        <rect 
          x="510" y="320" width="130" height="60" rx="14" 
          fill="#1c0e12" 
          stroke={selectedNodeId === 'NODE-P2-HX202' ? '#FF5B67' : '#FF5B67'} 
          strokeWidth="3" 
        />
        {/* Tube baffles */}
        <line x1="535" y1="325" x2="535" y2="365" stroke="#FF5B67" strokeWidth="2" strokeDasharray="3 2" />
        <line x1="560" y1="335" x2="560" y2="375" stroke="#FF5B67" strokeWidth="2" strokeDasharray="3 2" />
        <line x1="585" y1="325" x2="585" y2="365" stroke="#FF5B67" strokeWidth="2" strokeDasharray="3 2" />
        
        {/* Ultrasonic Cavitation hydrophone beacon */}
        <circle cx="595" cy="340" r="14" fill="none" stroke="#FF5B67" strokeWidth="1.5" className="ultrasonic-wave" />
        <circle cx="595" cy="340" r="24" fill="none" stroke="#FF5B67" strokeWidth="1" className="ultrasonic-wave" style={{ animationDelay: '0.4s' }} />

        <text x="575" y="342" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          EXCHANGER HX-202
        </text>
        <text x="575" y="356" fill="#FF5B67" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
          DELTA-P CAVITATION
        </text>
        <text x="575" y="370" fill="#cce4f2" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          DP: 2.9 Bar • 49.2 dB
        </text>
      </g>

      {/* 7. MODULATING BYPASS VALVE BV-202 */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P2-BYPASS-VALVE')}
      >
        <polygon points="620,400 655,420 655,400 620,420" fill="#1f1406" stroke={selectedNodeId === 'NODE-P2-BYPASS-VALVE' ? '#28D7FF' : '#f59e0b'} strokeWidth="2" />
        {/* Pneumatic Diaphragm Actuator Dome */}
        <path d="M 630 395 Q 637 385, 645 395 Z" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1="637" y1="395" x2="637" y2="408" stroke="#f59e0b" strokeWidth="2" />
        <text x="637" y="378" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
          BYPASS BV-202
        </text>
        <text x="637" y="434" fill="#f59e0b" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
          STUCK AT 42%
        </text>
      </g>

      {/* 8. CATALYTIC CRACKER COOLING TOWERS CT-201/202 */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P2-COOLING-TOWER')}
      >
        <rect x="760" y="140" width="160" height="100" rx="10" fill="#081827" stroke={selectedNodeId === 'NODE-P2-COOLING-TOWER' ? '#28D7FF' : '#1f4563'} strokeWidth="2.5" />
        {/* Cooling pack louvers */}
        <line x1="775" y1="180" x2="905" y2="180" stroke="#28d7ff" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
        <line x1="775" y1="195" x2="905" y2="195" stroke="#28d7ff" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
        <line x1="775" y1="210" x2="905" y2="210" stroke="#28d7ff" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
        {/* Induced draft fan deck */}
        <ellipse cx="840" cy="140" rx="35" ry="8" fill="#0f2b40" stroke="#28d7ff" strokeWidth="1.5" />
        <text x="840" y="162" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          COOLING TOWER BANK
        </text>
        <text x="840" y="177" fill="#31d48c" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono">
          CT-201 / CT-202
        </text>
        <text x="840" y="230" fill="#8ba2b2" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          1,210 L/m • Basin Temp 32°C
        </text>
      </g>

      {/* 9. CONDENSATE RECIRCULATION LOOP S-208 */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P2-CONDENSATE-RETURN')}
      >
        <rect x="430" y="440" width="100" height="42" rx="8" fill="#0c1e2d" stroke={selectedNodeId === 'NODE-P2-CONDENSATE-RETURN' ? '#28D7FF' : '#244b68'} strokeWidth="1.5" />
        <text x="480" y="457" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          CONDENSATE S-208
        </text>
        <text x="480" y="471" fill="#ff7a00" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          Hot Return 46.5°C
        </text>
      </g>
    </svg>
  );
};
