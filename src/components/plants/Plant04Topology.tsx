import React from 'react';
import { DigitalTwinNode } from '../../types';

interface Plant04TopologyProps {
  nodes: DigitalTwinNode[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
  showPressureHeatmap: boolean;
}

export const Plant04Topology: React.FC<Plant04TopologyProps> = ({
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
        <linearGradient id="p4FluidHotWFI" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f77f00" />
          <stop offset="50%" stopColor="#fcbf49" />
          <stop offset="100%" stopColor="#f77f00" />
        </linearGradient>

        <linearGradient id="p4FluidPureSteam" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e0e1dd" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#778da9" stopOpacity="0.7" />
        </linearGradient>

        <linearGradient id="p4SanitarySS316" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#415a77" />
          <stop offset="50%" stopColor="#1b263b" />
          <stop offset="100%" stopColor="#415a77" />
        </linearGradient>
      </defs>

      {/* Grid */}
      <g opacity="0.06" stroke="#28D7FF" strokeWidth="1">
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`p4-x-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="520" />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`p4-y-${i}`} x1="0" y1={i * 50} x2="960" y2={i * 50} />
        ))}
      </g>

      {/* Zone Annotations */}
      <rect x="250" y="45" width="690" height="200" rx="12" fill="#061522" opacity="0.4" stroke="#163044" strokeDasharray="4 4" />
      <text x="265" y="65" fill="#6c8699" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">ZONE 2: MULTI-EFFECT DISTILLATION & 85°C STERILE WFI VESSEL (SS316L ELECTROPOLISHED)</text>

      <rect x="250" y="260" width="690" height="245" rx="12" fill="#061522" opacity="0.4" stroke="#163044" strokeDasharray="4 4" />
      <text x="265" y="280" fill="#6c8699" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">ZONE 3: CONTINUOUS SANITARY RECIRCULATION LOOP & ASEPTIC FILLING (TRI-CLAMP ZERO DEADLEG)</text>

      {/* ================= PIPING PATHS ================= */}

      {/* Tank T-401 to Multi-Effect Still MEDS-401 */}
      <g>
        <path d="M 115 180 L 180 180" fill="none" stroke="url(#p4SanitarySS316)" strokeWidth="14" />
        <path d="M 115 180 L 180 180" fill="none" stroke="#28d7ff" strokeWidth="6" />
        <path d="M 115 180 L 180 180" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" />
        {/* Sanitary Tri-Clamp Ferrules */}
        <line x1="125" y1="172" x2="125" y2="188" stroke="#778da9" strokeWidth="3" />
        <line x1="170" y1="172" x2="170" y2="188" stroke="#778da9" strokeWidth="3" />
      </g>

      {/* Multi-Effect Still to Sterile 85°C WFI Tank T-402 */}
      <g>
        <path d="M 270 180 L 340 180" fill="none" stroke="url(#p4SanitarySS316)" strokeWidth="16" />
        <path d="M 270 180 L 340 180" fill="none" stroke="url(#p4FluidHotWFI)" strokeWidth="8" />
        <path d="M 270 180 L 340 180" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" />
      </g>

      {/* Tank T-402 to Sanitary Mag-Drive Pump P-401 */}
      <g>
        <path d="M 450 180 L 510 180" fill="none" stroke="url(#p4SanitarySS316)" strokeWidth="16" />
        <path d="M 450 180 L 510 180" fill="none" stroke="url(#p4FluidHotWFI)" strokeWidth="8" />
        <path d="M 450 180 L 510 180" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" />
      </g>

      {/* Pump P-401 into Sanitary Distribution Loop */}
      <g>
        {/* From Pump P-401 down to Zone 3 */}
        <path d="M 570 180 L 640 180 L 640 340 L 710 340" fill="none" stroke="url(#p4SanitarySS316)" strokeWidth="16" strokeLinejoin="round" />
        <path d="M 570 180 L 640 180 L 640 340 L 710 340" fill="none" stroke="url(#p4FluidHotWFI)" strokeWidth="8" strokeLinejoin="round" />
        <path d="M 570 180 L 640 180 L 640 340 L 710 340" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" strokeLinejoin="round" />

        {/* Through Zero-Deadleg Valve DV-401 to Subcooler HX-401 */}
        <path d="M 750 340 L 790 340" fill="none" stroke="url(#p4SanitarySS316)" strokeWidth="16" />
        <path d="M 750 340 L 790 340" fill="none" stroke="url(#p4FluidHotWFI)" strokeWidth="8" />
        <path d="M 750 340 L 790 340" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" />

        {/* Subcooler to Aseptic Vial Filling Suite */}
        <path d="M 910 340 L 910 430 L 780 430" fill="none" stroke="url(#p4SanitarySS316)" strokeWidth="16" strokeLinejoin="round" />
        <path d="M 910 340 L 910 430 L 780 430" fill="none" stroke="url(#p4FluidHotWFI)" strokeWidth="8" strokeLinejoin="round" />
        <path d="M 910 370 L 910 430 L 780 430" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" strokeLinejoin="round" />

        {/* Recirculation Return back to Tank T-402 (Complete closed loop) */}
        <path d="M 640 430 L 400 430 L 400 260" fill="none" stroke="url(#p4SanitarySS316)" strokeWidth="14" strokeLinejoin="round" />
        <path d="M 640 430 L 400 430 L 400 260" fill="none" stroke="url(#p4FluidHotWFI)" strokeWidth="7" strokeLinejoin="round" />
        <path d="M 640 430 L 400 430 L 400 260" fill="none" stroke="#FFFFFF" strokeWidth="2" className="pipe-flow-cyan" strokeLinejoin="round" />
      </g>

      {/* ================= VESSELS & EQUIPMENT ================= */}

      {/* 1. PURIFIED FEED WATER TANK T-401 */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P4-FEED-TANK')}
      >
        <rect x="25" y="110" width="90" height="140" rx="14" fill="#081827" stroke={selectedNodeId === 'NODE-P4-FEED-TANK' ? '#28D7FF' : '#1d3e57'} strokeWidth="2" />
        {/* Hydrophobic vent filter top */}
        <rect x="58" y="96" width="24" height="14" rx="2" fill="#0c2336" stroke="#28d7ff" strokeWidth="1.5" />
        <text x="70" y="90" fill="#28d7ff" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono">0.2µm VENT</text>
        <rect x="31" y="150" width="78" height="94" rx="8" fill="#028090" opacity="0.6" />
        <text x="70" y="135" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          TANK T-401
        </text>
        <text x="70" y="185" fill="#FFFFFF" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
          88.0%
        </text>
        <text x="70" y="202" fill="#28D7FF" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          Purified Water
        </text>
        <text x="70" y="218" fill="#8ba2b2" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono">
          Cond: 0.8 µS/cm
        </text>
      </g>

      {/* 2. MULTI-EFFECT DISTILLATION COLUMN MEDS-401 */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P4-DISTILLATION')}
      >
        <rect x="180" y="100" width="90" height="160" rx="12" fill="#0c1e2d" stroke={selectedNodeId === 'NODE-P4-DISTILLATION' ? '#28D7FF' : '#f77f00'} strokeWidth="2.5" />
        {/* 4 distillation effect stages */}
        <line x1="185" y1="140" x2="265" y2="140" stroke="#f77f00" strokeWidth="1.5" strokeDasharray="3 2" />
        <line x1="185" y1="180" x2="265" y2="180" stroke="#f77f00" strokeWidth="1.5" strokeDasharray="3 2" />
        <line x1="185" y1="220" x2="265" y2="220" stroke="#f77f00" strokeWidth="1.5" strokeDasharray="3 2" />
        <text x="225" y="125" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          STILL MEDS-401
        </text>
        <text x="225" y="160" fill="#f77f00" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
          165°C / 98.5°C
        </text>
        <text x="225" y="200" fill="#31d48c" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          4-Effect Pure Steam
        </text>
        <text x="225" y="245" fill="#cce4f2" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono">
          Output: 180 L/m
        </text>
      </g>

      {/* 3. STERILE 85°C WFI JACKETED STORAGE TANK T-402 */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P4-WFI-TANK')}
      >
        {/* Thermal insulation outer jacket */}
        <rect x="335" y="90" width="120" height="170" rx="16" fill="#141a22" stroke={selectedNodeId === 'NODE-P4-WFI-TANK' ? '#28D7FF' : '#fcbf49'} strokeWidth="2.5" />
        {/* Inner mirror chamber */}
        <rect x="345" y="120" width="100" height="130" rx="10" fill="#241708" />
        <rect x="348" y="145" width="94" height="100" rx="8" fill="url(#p4FluidHotWFI)" opacity="0.8" />
        {/* Sanitary Spray ball top */}
        <circle cx="395" cy="110" r="6" fill="#fcbf49" />
        <line x1="395" y1="102" x2="395" y2="118" stroke="#FFFFFF" strokeWidth="1.5" />
        <text x="395" y="105" fill="#fcbf49" fontSize="7" textAnchor="middle" fontFamily="JetBrains Mono">CIP SPRAY</text>

        <text x="395" y="136" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          WFI TANK T-402
        </text>
        <text x="395" y="175" fill="#FFFFFF" fontSize="15" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
          85.4°C
        </text>
        <text x="395" y="195" fill="#31d48c" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
          SELF-SANITIZING
        </text>
        <text x="395" y="215" fill="#fcbf49" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          92.4% • 18,480 L
        </text>
      </g>

      {/* 4. SANITARY MAG-DRIVE PUMP P-401 */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P4-MAG-PUMP')}
      >
        <circle cx="540" cy="180" r="26" fill="#0b2338" stroke={selectedNodeId === 'NODE-P4-MAG-PUMP' ? '#28D7FF' : '#31d48c'} strokeWidth="2.5" />
        <g transform="translate(540, 180)">
          <g className="spin-rotor">
            <circle cx="0" cy="0" r="4" fill="#31d48c" />
            <line x1="-14" y1="0" x2="14" y2="0" stroke="#31d48c" strokeWidth="3" />
            <line x1="0" y1="-14" x2="0" y2="14" stroke="#31d48c" strokeWidth="3" />
            <line x1="-10" y1="-10" x2="10" y2="10" stroke="#31d48c" strokeWidth="2" />
          </g>
        </g>
        <text x="540" y="135" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          MAG-DRIVE P-401
        </text>
        <text x="540" y="222" fill="#31d48c" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono">
          4.1 Bar • 175 L/m
        </text>
      </g>

      {/* 5. ZERO DEADLEG DIAPHRAGM VALVE DV-401 */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P4-VALVE-DV401')}
      >
        <polygon points="710,330 750,350 750,330 710,350" fill="#132333" stroke={selectedNodeId === 'NODE-P4-VALVE-DV401' ? '#28D7FF' : '#31d48c'} strokeWidth="2" />
        {/* Pneumatic Dome */}
        <path d="M 723 325 Q 730 315, 737 325 Z" fill="#31d48c" />
        <line x1="730" y1="325" x2="730" y2="335" stroke="#31d48c" strokeWidth="2" />
        <text x="730" y="310" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
          DV-401 (100%)
        </text>
        <text x="730" y="366" fill="#31d48c" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono">
          ZERO-DEADLEG
        </text>
      </g>

      {/* 6. DOUBLE-TUBE-SHEET SUBCOOLER HX-401 */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P4-SUBCOOLER')}
      >
        <rect x="790" y="310" width="120" height="60" rx="10" fill="#0c1f2f" stroke={selectedNodeId === 'NODE-P4-SUBCOOLER' ? '#28D7FF' : '#28d7ff'} strokeWidth="2" />
        {/* Double tube sheets with leak detection weep space */}
        <line x1="810" y1="315" x2="810" y2="365" stroke="#28d7ff" strokeWidth="2" />
        <line x1="820" y1="315" x2="820" y2="365" stroke="#31d48c" strokeWidth="1.5" strokeDasharray="3 2" />
        <line x1="880" y1="315" x2="880" y2="365" stroke="#31d48c" strokeWidth="1.5" strokeDasharray="3 2" />
        <line x1="890" y1="315" x2="890" y2="365" stroke="#28d7ff" strokeWidth="2" />
        <text x="850" y="332" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          SUBCOOLER HX-401
        </text>
        <text x="850" y="347" fill="#31d48c" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          Double-Tube-Sheet
        </text>
        <text x="850" y="360" fill="#8ba2b2" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono">
          Weep Port: Dry (OK)
        </text>
      </g>

      {/* 7. ASEPTIC VIAL FILLING SUITE TERMINAL */}
      <g 
        className="cursor-pointer group"
        onClick={() => onSelectNode('NODE-P4-ASEPTIC-FILL')}
      >
        <rect x="640" y="405" width="140" height="52" rx="10" fill="#051928" stroke={selectedNodeId === 'NODE-P4-ASEPTIC-FILL' ? '#28D7FF' : '#31d48c'} strokeWidth="2.5" />
        <text x="710" y="426" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
          ASEPTIC VIAL FILLING
        </text>
        <text x="710" y="440" fill="#31d48c" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
          GRADE A ISOLATOR
        </text>
        <text x="710" y="451" fill="#8ba2b2" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono">
          TOC: 6.2 ppb • 0.6 µS/cm
        </text>
      </g>
    </svg>
  );
};
