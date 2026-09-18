import React from 'react';
import { DigitalTwinNode } from '../../types';

interface Plant01TopologyProps {
  nodes: DigitalTwinNode[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
  showPressureHeatmap: boolean;
  isV104Isolated: boolean;
}

export const Plant01Topology: React.FC<Plant01TopologyProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  showPressureHeatmap,
  isV104Isolated
}) => {
  const getNode = (id: string) => nodes.find(n => n.id === id);
  const tank = getNode('NODE-TANK-01');
  const pump = getNode('NODE-PUMP-01');
  const manifold = getNode('NODE-J1');
  const valveA = getNode('NODE-V101');
  const segA = getNode('NODE-SEG-S02');
  const termA = getNode('NODE-TERM-A');
  const valveB = getNode('NODE-V103');
  const segB = getNode('NODE-SEG-S05');
  const valveB104 = getNode('NODE-V104');
  const termB = getNode('NODE-TERM-B');
  const returnSeg = getNode('NODE-SEG-S07');

  const isBBreached = segB ? segB.status === 'critical' && !isV104Isolated : !isV104Isolated;
  const isBWarning = segB ? segB.status === 'warning' && !isV104Isolated : false;
  const isBNominal = segB ? segB.status === 'nominal' && !isV104Isolated : false;

  return (
    <svg 
      viewBox="0 0 960 520" 
      className="w-full h-auto select-none"
      style={{ filter: 'drop-shadow(0 0 10px rgba(40, 215, 255, 0.08))' }}
    >
      <defs>
        {/* Pipe fluid gradients */}
        <linearGradient id="pipeFluidNominal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#007EA7" />
          <stop offset="100%" stopColor="#28D7FF" />
        </linearGradient>

        <linearGradient id="pipeFluidBreach" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF5B67" />
          <stop offset="100%" stopColor="#d63040" />
        </linearGradient>

        <linearGradient id="pipeFluidWarning" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        <linearGradient id="pipeFluidIsolated" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2A4B63" />
          <stop offset="100%" stopColor="#1B3245" />
        </linearGradient>

        <linearGradient id="pipeWallGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e3e57" />
          <stop offset="50%" stopColor="#0c1e2d" />
          <stop offset="100%" stopColor="#1a354b" />
        </linearGradient>

        <linearGradient id="tankFluidP1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#28D7FF" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#003459" stopOpacity="0.95" />
        </linearGradient>

        <radialGradient id="acousticPulse" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF5B67" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#FF5B67" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FF5B67" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Industrial Grid Lines */}
      <g opacity="0.06" stroke="#28D7FF" strokeWidth="1">
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`x-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="520" />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`y-${i}`} x1="0" y1={i * 50} x2="960" y2={i * 50} />
        ))}
      </g>

      {/* Pipe Schedule & Zone Boundaries */}
      <rect x="290" y="55" width="650" height="180" rx="14" fill="#061522" opacity="0.4" stroke="#163044" strokeDasharray="4 4" />
      <text x="305" y="75" fill="#6c8699" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">ZONE 2: LINE A PASTEURIZER & BOTTLING (DN150 SS316)</text>

      <rect x="290" y="250" width="650" height="255" rx="14" fill="#061522" opacity="0.4" stroke="#163044" strokeDasharray="4 4" />
      <text x="305" y="270" fill="#6c8699" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">ZONE 3: LINE B HIGH-PRESSURE CIP (DN200 SCH40)</text>

      {/* ================= PIPING CASINGS & CORES ================= */}

      {/* Pipe 1: Tank T-100 to Pump P-01 (DN250 Main Suction) */}
      <g>
        <path d="M 125 240 L 195 240" fill="none" stroke="url(#pipeWallGradient)" strokeWidth="16" strokeLinecap="round" />
        <path d="M 125 240 L 195 240" fill="none" stroke="url(#pipeFluidNominal)" strokeWidth="8" />
        <path d="M 125 240 L 195 240" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" />
        {/* Bolted Flanges */}
        <line x1="130" y1="230" x2="130" y2="250" stroke="#487294" strokeWidth="4" />
        <line x1="190" y1="230" x2="190" y2="250" stroke="#487294" strokeWidth="4" />
      </g>

      {/* Pipe 2: Pump P-01 to Primary Manifold J-01 (DN200 Discharge) */}
      <g>
        <path d="M 245 240 L 320 240" fill="none" stroke="url(#pipeWallGradient)" strokeWidth="16" />
        <path d="M 245 240 L 320 240" fill="none" stroke="url(#pipeFluidNominal)" strokeWidth="8" />
        <path d="M 245 240 L 320 240" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" />
        {/* Check Valve Symbol */}
        <polygon points="270,234 270,246 280,240" fill="#28D7FF" />
        <line x1="280" y1="233" x2="280" y2="247" stroke="#28D7FF" strokeWidth="2" />
        <text x="275" y="228" fill="#6c8699" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono">NRV</text>
      </g>

      {/* Manifold Splitter J-01 branching into Line A (up) and Line B (down) */}
      <g>
        {/* Upward to Line A */}
        <path d="M 345 240 L 345 130 L 415 130" fill="none" stroke="url(#pipeWallGradient)" strokeWidth="14" strokeLinejoin="round" />
        <path d="M 345 240 L 345 130 L 415 130" fill="none" stroke="url(#pipeFluidNominal)" strokeWidth="7" strokeLinejoin="round" />
        <path d="M 345 240 L 345 130 L 415 130" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" strokeLinejoin="round" />

        {/* Downward to Line B */}
        <path d="M 345 240 L 345 340 L 415 340" fill="none" stroke="url(#pipeWallGradient)" strokeWidth="16" strokeLinejoin="round" />
        <path 
          d="M 345 240 L 345 340 L 415 340" 
          fill="none" 
          stroke={isBNominal ? 'url(#pipeFluidNominal)' : isBWarning ? 'url(#pipeFluidWarning)' : isBBreached ? 'url(#pipeFluidBreach)' : 'url(#pipeFluidIsolated)'} 
          strokeWidth="8" 
          strokeLinejoin="round" 
        />
        <path 
          d="M 345 240 L 345 340 L 415 340" 
          fill="none" 
          stroke={isBNominal ? '#FFFFFF' : isBWarning ? '#f59e0b' : isBBreached ? '#FF5B67' : '#2A4B63'} 
          strokeWidth="2" 
          className={isBNominal ? 'pipe-flow-cyan' : isBWarning ? 'pipe-flow-slow' : isBBreached ? 'pipe-flow-red' : ''} 
          strokeLinejoin="round" 
        />

        {/* Return Loop branch (down right to S07) */}
        <path d="M 345 340 L 345 460 L 520 460" fill="none" stroke="url(#pipeWallGradient)" strokeWidth="10" strokeLinejoin="round" />
        <path d="M 345 460 L 520 460" fill="none" stroke="#007ea7" strokeWidth="5" />
        <path d="M 345 460 L 520 460" fill="none" stroke="#FFFFFF" strokeWidth="1.5" className="pipe-flow-slow" />
      </g>

      {/* LINE A PIPING (Top) */}
      {/* V-101 to Pasteurizer Segment S02 to Terminal A */}
      <g>
        <path d="M 455 130 L 540 130" fill="none" stroke="url(#pipeWallGradient)" strokeWidth="14" />
        <path d="M 455 130 L 540 130" fill="none" stroke="url(#pipeFluidNominal)" strokeWidth="7" />
        <path d="M 455 130 L 540 130" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" />

        <path d="M 640 130 L 780 130" fill="none" stroke="url(#pipeWallGradient)" strokeWidth="14" />
        <path d="M 640 130 L 780 130" fill="none" stroke="url(#pipeFluidNominal)" strokeWidth="7" />
        <path d="M 640 130 L 780 130" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" />
      </g>

      {/* LINE B PIPING (Bottom Crisis / Restored Flow) */}
      {/* V-103 to Segment S05 to V-104 to Terminal B */}
      <g>
        <path d="M 455 340 L 530 340" fill="none" stroke="url(#pipeWallGradient)" strokeWidth="16" />
        <path 
          d="M 455 340 L 530 340" 
          fill="none" 
          stroke={isBNominal ? 'url(#pipeFluidNominal)' : isBWarning ? 'url(#pipeFluidWarning)' : isBBreached ? 'url(#pipeFluidBreach)' : 'url(#pipeFluidIsolated)'} 
          strokeWidth="8" 
        />
        <path 
          d="M 455 340 L 530 340" 
          fill="none" 
          stroke={isBNominal ? '#FFFFFF' : isBWarning ? '#f59e0b' : isBBreached ? '#FFFFFF' : '#2A4B63'} 
          strokeWidth="2" 
          className={isBNominal ? 'pipe-flow-cyan' : isBWarning ? 'pipe-flow-slow' : isBBreached ? 'pipe-flow-red' : ''} 
        />

        <path d="M 640 340 L 700 340" fill="none" stroke="url(#pipeWallGradient)" strokeWidth="16" />
        <path 
          d="M 640 340 L 700 340" 
          fill="none" 
          stroke={isBNominal ? 'url(#pipeFluidNominal)' : isBWarning ? 'url(#pipeFluidWarning)' : isBBreached ? 'url(#pipeFluidBreach)' : 'url(#pipeFluidIsolated)'} 
          strokeWidth="8" 
        />
        <path 
          d="M 640 340 L 700 340" 
          fill="none" 
          stroke={isBNominal ? '#FFFFFF' : isBWarning ? '#f59e0b' : isBBreached ? '#FF5B67' : '#1e3344'} 
          strokeWidth="2" 
          className={isBNominal ? 'pipe-flow-cyan' : isBWarning ? 'pipe-flow-slow' : isBBreached ? 'pipe-flow-red' : ''} 
        />

        <path d="M 740 340 L 800 340" fill="none" stroke="url(#pipeWallGradient)" strokeWidth="16" />
        <path 
          d="M 740 340 L 800 340" 
          fill="none" 
          stroke={isBNominal ? 'url(#pipeFluidNominal)' : isBWarning ? 'url(#pipeFluidWarning)' : isBBreached ? '#007ea7' : '#142533'} 
          strokeWidth="8" 
        />
        {(isBNominal || isBWarning || isBBreached) && (
          <path 
            d="M 740 340 L 800 340" 
            fill="none" 
            stroke="#FFFFFF" 
            strokeWidth="2" 
            className={isBNominal ? 'pipe-flow-cyan' : 'pipe-flow-slow'} 
          />
        )}
      </g>

      {/* Return Loop to Cooling Towers */}
      <g>
        <path d="M 620 460 L 800 460" fill="none" stroke="url(#pipeWallGradient)" strokeWidth="10" />
        <path d="M 620 460 L 800 460" fill="none" stroke="#007ea7" strokeWidth="5" />
        <path d="M 620 460 L 800 460" fill="none" stroke="#FFFFFF" strokeWidth="1.5" className="pipe-flow-slow" />
      </g>

      {/* ================= EQUIPMENT & VESSELS ================= */}

      {/* 1. TANK T-100 */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-TANK-01')}
      >
        <rect 
          x="25" y="150" width="100" height="180" rx="14" 
          fill="#061826" 
          stroke={selectedNodeId === 'NODE-TANK-01' ? '#28D7FF' : '#1a374d'} 
          strokeWidth={selectedNodeId === 'NODE-TANK-01' ? '3' : '1.5'}
        />
        {/* Fluid level */}
        <rect x="31" y="195" width="88" height="128" rx="8" fill="url(#tankFluidP1)" />
        <path d="M 31 195 Q 53 191, 75 195 T 119 195" fill="none" stroke="#28D7FF" strokeWidth="2" />
        {/* Sight Glass Level Column */}
        <rect x="110" y="165" width="6" height="150" fill="#08141f" stroke="#28d7ff" strokeWidth="1" />
        <rect x="111" y="195" width="4" height="118" fill="#31d48c" />
        {/* Level text */}
        <text x="75" y="176" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          TANK T-100
        </text>
        <text x="75" y="245" fill="#FFFFFF" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
          84.5%
        </text>
        <text x="75" y="265" fill="#28D7FF" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono">
          620.5 L/m
        </text>
        <text x="75" y="282" fill="#8ba2b2" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          {showPressureHeatmap ? '4.6 Bar (Nom)' : '211,250 L'}
        </text>
      </g>

      {/* 2. BOOSTER PUMP P-01 (With Spinning Rotor Animation) */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-PUMP-01')}
      >
        {/* Electric Motor Housing */}
        <rect x="195" y="210" width="22" height="60" rx="3" fill="#0c2336" stroke="#1d425f" strokeWidth="1.5" />
        <line x1="198" y1="218" x2="198" y2="262" stroke="#28d7ff" strokeWidth="1" opacity="0.6" />
        <line x1="203" y1="218" x2="203" y2="262" stroke="#28d7ff" strokeWidth="1" opacity="0.6" />
        <line x1="208" y1="218" x2="208" y2="262" stroke="#28d7ff" strokeWidth="1" opacity="0.6" />

        {/* Pump Volute Casing */}
        <circle 
          cx="230" cy="240" r="26" 
          fill="#0a1d2c" 
          stroke={selectedNodeId === 'NODE-PUMP-01' ? '#28D7FF' : '#28D7FF'} 
          strokeWidth={selectedNodeId === 'NODE-PUMP-01' ? '3' : '2'}
        />
        {/* Spinning Impeller Blades */}
        <g transform="translate(230, 240)">
          <g className="spin-rotor">
            <circle cx="0" cy="0" r="5" fill="#28D7FF" />
            <line x1="-15" y1="0" x2="15" y2="0" stroke="#28D7FF" strokeWidth="3" strokeLinecap="round" />
            <line x1="0" y1="-15" x2="0" y2="15" stroke="#28D7FF" strokeWidth="3" strokeLinecap="round" />
            <line x1="-11" y1="-11" x2="11" y2="11" stroke="#28D7FF" strokeWidth="2" strokeLinecap="round" />
            <line x1="-11" y1="11" x2="11" y2="-11" stroke="#28D7FF" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>
        <text x="230" y="280" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          PUMP P-01
        </text>
        <text x="230" y="294" fill="#31D48C" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono" fontWeight="bold">
          4.8 Bar
        </text>
      </g>

      {/* 3. PRIMARY MANIFOLD J-01 */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-J1')}
      >
        <circle 
          cx="345" cy="240" r="18" 
          fill="#0a1e2e" 
          stroke={selectedNodeId === 'NODE-J1' ? '#28D7FF' : '#244b68'} 
          strokeWidth={selectedNodeId === 'NODE-J1' ? '3' : '2'}
        />
        <circle cx="345" cy="240" r="6" fill="#28D7FF" />
        <text x="345" y="216" fill="#e6f3fa" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
          MANIFOLD J-01
        </text>
        <text x="345" y="270" fill="#8ba2b2" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          4.5 Bar
        </text>
      </g>

      {/* 4. LINE A: ISOLATION VALVE V-101 */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-V101')}
      >
        {/* Valve body (bowtie) */}
        <polygon points="415,120 455,140 455,120 415,140" fill="#0d2538" stroke={selectedNodeId === 'NODE-V101' ? '#28D7FF' : '#31d48c'} strokeWidth="2" />
        {/* Actuator stem & handwheel */}
        <line x1="435" y1="120" x2="435" y2="105" stroke="#31d48c" strokeWidth="2" />
        <circle cx="435" cy="103" r="7" fill="#0b1a26" stroke="#31d48c" strokeWidth="1.5" />
        <text x="435" y="93" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
          V-101 (100%)
        </text>
        <text x="435" y="156" fill="#31d48c" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          OPEN • 3.4 Bar
        </text>
      </g>

      {/* 5. LINE A: PASTEURIZER FEED (SEGMENT S02) */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-SEG-S02')}
      >
        <rect 
          x="540" y="102" width="100" height="56" rx="8" 
          fill="#091d2c" 
          stroke={selectedNodeId === 'NODE-SEG-S02' ? '#28D7FF' : '#1d425f'} 
          strokeWidth={selectedNodeId === 'NODE-SEG-S02' ? '3' : '1.5'}
        />
        {/* Heat recovery plates internal symbol */}
        <line x1="555" y1="112" x2="555" y2="148" stroke="#28d7ff" strokeWidth="1.5" strokeDasharray="3 2" />
        <line x1="565" y1="112" x2="565" y2="148" stroke="#31d48c" strokeWidth="1.5" strokeDasharray="3 2" />
        <line x1="575" y1="112" x2="575" y2="148" stroke="#28d7ff" strokeWidth="1.5" strokeDasharray="3 2" />
        <line x1="585" y1="112" x2="585" y2="148" stroke="#31d48c" strokeWidth="1.5" strokeDasharray="3 2" />
        <text x="610" y="124" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="Outfit">
          SEGMENT S02
        </text>
        <text x="610" y="137" fill="#8ba2b2" fontSize="9" fontFamily="JetBrains Mono">
          Pasteurizer
        </text>
        <text x="610" y="149" fill="#31d48c" fontSize="9" fontFamily="JetBrains Mono">
          285.0 L/m
        </text>
      </g>

      {/* 6. LINE A: BOTTLING PACKAGING TERMINAL A */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-TERM-A')}
      >
        <rect 
          x="780" y="100" width="130" height="60" rx="10" 
          fill="#061826" 
          stroke={selectedNodeId === 'NODE-TERM-A' ? '#28D7FF' : '#28d7ff'} 
          strokeWidth={selectedNodeId === 'NODE-TERM-A' ? '3' : '1.5'}
        />
        <text x="845" y="122" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          BOTTLING LINE A
        </text>
        <text x="845" y="138" fill="#31d48c" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono">
          NOMINAL • 284.8 L/m
        </text>
        <text x="845" y="151" fill="#8ba2b2" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          P: 3.2 Bar | H: 95%
        </text>
      </g>

      {/* 7. LINE B: MASTER VALVE V-103 */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-V103')}
      >
        <polygon points="415,330 455,350 455,330 415,350" fill="#0d2538" stroke={selectedNodeId === 'NODE-V103' ? '#28D7FF' : '#f59e0b'} strokeWidth="2" />
        <line x1="435" y1="330" x2="435" y2="315" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="435" cy="313" r="7" fill="#0b1a26" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="435" y="303" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
          V-103 (100%)
        </text>
        <text x="435" y="366" fill="#f59e0b" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          WARM • 3.8 Bar
        </text>
      </g>

      {/* 8. LINE B: CRITICAL BREACH SEGMENT S05 (WITH ACOUSTIC WAVES & LEAK SPRAY) */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-SEG-S05')}
      >
        <rect 
          x="530" y="310" width="110" height="60" rx="10" 
          fill={isBNominal ? '#081724' : isBWarning ? '#1f1608' : isBBreached ? '#1f0d11' : '#081724'} 
          stroke={selectedNodeId === 'NODE-SEG-S05' ? '#28D7FF' : isBNominal ? '#31d48c' : isBWarning ? '#f59e0b' : isBBreached ? '#FF5B67' : '#1e3d54'} 
          strokeWidth={selectedNodeId === 'NODE-SEG-S05' ? '3' : '2'}
        />

        {/* Acoustic Hydrophone Sensor Clamp */}
        <rect x="580" y="305" width="10" height="70" rx="2" fill="#28d7ff" opacity="0.7" />
        <circle cx="585" cy="298" r="5" fill="#28d7ff" />
        <text x="585" y="290" fill="#28d7ff" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono">SEN-AC-05</text>

        {isBBreached && (
          <>
            {/* Pulsing acoustic radar waves */}
            <circle cx="585" cy="340" r="16" fill="none" stroke="#FF5B67" strokeWidth="1.5" className="ultrasonic-wave" />
            <circle cx="585" cy="340" r="28" fill="none" stroke="#FF5B67" strokeWidth="1" className="ultrasonic-wave" style={{ animationDelay: '0.5s' }} />
            
            {/* Leak spray mist dots */}
            <circle cx="595" cy="326" r="2" fill="#FF5B67" />
            <circle cx="602" cy="320" r="1.5" fill="#28d7ff" />
            <circle cx="598" cy="314" r="1" fill="#FFFFFF" />
          </>
        )}

        {isBWarning && (
          <>
            <circle cx="585" cy="340" r="14" fill="none" stroke="#f59e0b" strokeWidth="1.2" className="ultrasonic-wave" />
            <circle cx="595" cy="326" r="1.5" fill="#f59e0b" />
          </>
        )}

        <text x="585" y="332" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          SEGMENT S05
        </text>
        <text 
          x="585" 
          y="347" 
          fill={isBNominal ? '#31d48c' : isBWarning ? '#f59e0b' : isBBreached ? '#FF5B67' : '#31d48c'} 
          fontSize="10" 
          fontWeight="bold" 
          textAnchor="middle" 
          fontFamily="JetBrains Mono"
        >
          {isBNominal ? 'NOMINAL' : isBWarning ? '10% SEEPAGE' : isBBreached ? 'CRITICAL LEAK' : 'ISOLATED'}
        </text>
        <text x="585" y="361" fill="#cce4f2" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          {isBNominal ? 'P: 4.4 Bar | 14 dB | 380 L/m' : isBWarning ? 'P: 3.8 Bar | 33 dB' : isBBreached ? 'P: 2.15 Bar | 58 dB' : 'P: 0.0 Bar | 0 L/m'}
        </text>
      </g>

      {/* 9. QUICK ISOLATION VALVE V-104 */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-V104')}
      >
        <polygon 
          points="700,330 740,350 740,330 700,350" 
          fill={isV104Isolated ? '#112233' : isBNominal ? '#0a231b' : '#260f13'} 
          stroke={selectedNodeId === 'NODE-V104' ? '#28D7FF' : isV104Isolated ? '#31d48c' : isBNominal ? '#31d48c' : isBWarning ? '#f59e0b' : '#FF5B67'} 
          strokeWidth="2.5" 
        />
        {/* Solenoid Actuator Box */}
        <rect x="713" y="308" width="14" height="18" rx="2" fill={isV104Isolated ? '#31d48c' : isBNominal ? '#31d48c' : isBWarning ? '#f59e0b' : '#FF5B67'} />
        <line x1="720" y1="326" x2="720" y2="330" stroke="#FFFFFF" strokeWidth="2" />
        <text x="720" y="302" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
          V-104 ({isV104Isolated ? '0%' : '100%'})
        </text>
        <text 
          x="720" 
          y="366" 
          fill={isV104Isolated ? '#31d48c' : isBNominal ? '#31d48c' : isBWarning ? '#f59e0b' : '#FF5B67'} 
          fontSize="9" 
          fontWeight="bold" 
          textAnchor="middle" 
          fontFamily="JetBrains Mono"
        >
          {isV104Isolated ? 'SHUT (ISOLATED)' : isBNominal ? 'OPEN (FLOWING)' : isBWarning ? 'WARNING 10%' : 'ACTIVE BLEED'}
        </text>
      </g>

      {/* 10. LINE B CIP TERMINAL */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-TERM-B')}
      >
        <rect 
          x="800" y="310" width="135" height="60" rx="10" 
          fill="#061826" 
          stroke={selectedNodeId === 'NODE-TERM-B' ? '#28D7FF' : isBNominal ? '#31d48c' : isBWarning ? '#f59e0b' : '#FF5B67'} 
          strokeWidth={selectedNodeId === 'NODE-TERM-B' ? '3' : '1.5'}
        />
        <text x="867" y="332" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          LINE B CIP FILLING
        </text>
        <text 
          x="867" 
          y="348" 
          fill={isBNominal ? '#31d48c' : isBWarning ? '#f59e0b' : '#FF5B67'} 
          fontSize="10" 
          textAnchor="middle" 
          fontFamily="JetBrains Mono"
        >
          {isBNominal ? 'NOMINAL • 380 L/m' : isBWarning ? 'WARNING • 175 L/m' : isBBreached ? 'PRESSURE DEFICIT' : 'STANDBY READY'}
        </text>
        <text x="867" y="361" fill="#8ba2b2" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          {isBNominal ? 'P: 4.4 Bar | Full Flow' : 'P: 1.8 Bar | 215 L/m'}
        </text>
      </g>

      {/* 11. RECIRCULATION & COOLING RETURN S07 */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-SEG-S07')}
      >
        <rect 
          x="520" y="440" width="100" height="40" rx="8" 
          fill="#081724" 
          stroke={selectedNodeId === 'NODE-SEG-S07' ? '#28D7FF' : '#193952'} 
          strokeWidth={selectedNodeId === 'NODE-SEG-S07' ? '3' : '1.5'}
        />
        <text x="570" y="457" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          SEGMENT S07
        </text>
        <text x="570" y="471" fill="#31d48c" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          Cooling Return (145 L/m)
        </text>

        {/* Cooling Tower Terminal */}
        <rect x="800" y="435" width="135" height="50" rx="8" fill="#081b2b" stroke="#244b68" strokeWidth="1.5" />
        <text x="867" y="456" fill="#e6f3fa" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          COOLING TOWERS
        </text>
        <text x="867" y="471" fill="#28d7ff" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          Delta-T: 6.4°C • Nominal
        </text>
      </g>

      {/* Live Pressure Gradient Legend when toggled */}
      {showPressureHeatmap && (
        <g transform="translate(30, 475)">
          <rect x="0" y="0" width="220" height="32" rx="6" fill="#07131e" stroke="#1d425f" strokeWidth="1" />
          <text x="10" y="14" fill="#6c8699" fontSize="8" fontFamily="JetBrains Mono">HYDRAULIC PRESSURE HEATMAP</text>
          <rect x="10" y="19" width="40" height="6" fill="#31d48c" />
          <rect x="50" y="19" width="50" height="6" fill="#28d7ff" />
          <rect x="100" y="19" width="50" height="6" fill="#f59e0b" />
          <rect x="150" y="19" width="60" height="6" fill="#ff5b67" />
          <text x="10" y="31" fill="#8ba2b2" fontSize="7" fontFamily="JetBrains Mono">5.0 Bar</text>
          <text x="95" y="31" fill="#8ba2b2" fontSize="7" fontFamily="JetBrains Mono">3.5 Bar</text>
          <text x="190" y="31" fill="#8ba2b2" fontSize="7" fontFamily="JetBrains Mono">1.8 Bar</text>
        </g>
      )}
    </svg>
  );
};
