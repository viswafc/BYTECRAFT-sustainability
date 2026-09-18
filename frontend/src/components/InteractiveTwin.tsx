import React, { useState } from 'react';

// Hardcoded topology coordinates matching Phase 6 layout
const nodes = [
    { id: 'MAIN', x: 400, y: 50, label: 'Main Inlet', type: 'source' },
    { id: 'ZA', x: 200, y: 150, label: 'Zone A', type: 'zone' },
    { id: 'ZB', x: 600, y: 150, label: 'Zone B', type: 'zone' },
    { id: 'L1', x: 100, y: 250, label: 'Line 1', type: 'line' },
    { id: 'L2', x: 300, y: 250, label: 'Line 2', type: 'line' },
    { id: 'L3', x: 500, y: 250, label: 'Line 3', type: 'line' },
    { id: 'L4', x: 700, y: 250, label: 'Line 4', type: 'line' },
    { id: 'M1', x: 50, y: 350, label: 'Machine 1', type: 'endpoint' },
    { id: 'M2', x: 150, y: 350, label: 'Machine 2', type: 'endpoint' },
    { id: 'M3', x: 250, y: 350, label: 'Machine 3', type: 'endpoint' },
    { id: 'M4', x: 350, y: 350, label: 'Machine 4', type: 'endpoint' },
    { id: 'M5', x: 450, y: 350, label: 'Machine 5', type: 'endpoint' },
    { id: 'M6', x: 550, y: 350, label: 'Machine 6', type: 'endpoint' },
    { id: 'M7', x: 650, y: 350, label: 'Machine 7', type: 'endpoint' },
    { id: 'M8', x: 750, y: 350, label: 'Machine 8', type: 'endpoint' },
];

const edges = [
    { id: 'E1', source: 'MAIN', target: 'ZA', label: 'P-001' },
    { id: 'E2', source: 'MAIN', target: 'ZB', label: 'P-002' },
    { id: 'E3', source: 'ZA', target: 'L1', label: 'P-101' },
    { id: 'E4', source: 'ZA', target: 'L2', label: 'P-102' },
    { id: 'E5', source: 'ZB', target: 'L3', label: 'P-103' },
    { id: 'E6', source: 'ZB', target: 'L4', label: 'P-104' },
    { id: 'E7', source: 'L1', target: 'M1', label: 'P-101-1' },
    { id: 'E8', source: 'L1', target: 'M2', label: 'P-101-2' },
    { id: 'E9', source: 'L2', target: 'M3', label: 'P-102-1' },
    { id: 'E10', source: 'L2', target: 'M4', label: 'P-102-2' },
    { id: 'E11', source: 'L3', target: 'M5', label: 'P-103-1' },
    { id: 'E12', source: 'L3', target: 'M6', label: 'P-103-2' },
    { id: 'E13', source: 'L4', target: 'M7', label: 'P-104-1' },
    { id: 'E14', source: 'L4', target: 'M8', label: 'P-104-2' },
];

interface InteractiveTwinProps {
    activeSegment?: string;
    riskState?: string;
    onSegmentClick?: (segment: string) => void;
}

export const InteractiveTwin: React.FC<InteractiveTwinProps> = ({ activeSegment, riskState, onSegmentClick }) => {
    
    const getEdgeColor = (segmentName: string) => {
        if (segmentName === activeSegment) {
            if (riskState === 'CRITICAL_RISK') return '#ef4444'; // Red
            if (riskState === 'HIGH_RISK') return '#f97316'; // Orange
            if (riskState === 'EARLY_WARNING') return '#f59e0b'; // Amber
            if (riskState === 'RESOLVED') return '#10b981'; // Green
            return '#ef4444'; // Default to red if active but no specific state
        }
        return '#0ea5e9'; // Aqua normal
    };

    const getEdgeAnimation = (segmentName: string) => {
        if (segmentName === activeSegment && riskState !== 'RESOLVED') {
            return 'animate-[pulse_1s_infinite]';
        }
        return 'animate-none';
    };

    return (
        <div className="w-full h-full relative bg-[#0B1C29] rounded-xl border border-[#1B3A4A] overflow-hidden flex items-center justify-center">
            {/* Legend */}
            <div className="absolute top-4 left-4 bg-slate-900/80 p-3 rounded text-xs border border-slate-700 shadow-xl z-10">
                <h4 className="text-slate-400 font-bold mb-2 uppercase tracking-widest">Network Status</h4>
                <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-sky-500 rounded-full"></div> Normal Flow</div>
                <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div> Active Leak / Critical</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div> Recovered</div>
            </div>

            <svg viewBox="0 0 800 450" className="w-full h-full p-4" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="28" refY="3" orient="auto" markerUnits="strokeWidth">
                      <path d="M0,0 L0,6 L9,3 z" fill="#1B3A4A" />
                    </marker>
                    {/* Animated flow gradient */}
                    <linearGradient id="flow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="#28D7FF" stopOpacity="1" />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.2" />
                    </linearGradient>
                </defs>

                {/* Edges */}
                {edges.map(e => {
                    const source = nodes.find(n => n.id === e.source);
                    const target = nodes.find(n => n.id === e.target);
                    if (!source || !target) return null;
                    
                    const color = getEdgeColor(e.label);
                    const isAnim = getEdgeAnimation(e.label);
                    
                    return (
                        <g key={e.id} onClick={() => onSegmentClick && onSegmentClick(e.label)} className="cursor-pointer">
                            <line 
                                x1={source.x} y1={source.y} x2={target.x} y2={target.y} 
                                stroke="#1B3A4A" strokeWidth="12" strokeLinecap="round"
                            />
                            {/* Inner Pipe */}
                            <line 
                                x1={source.x} y1={source.y} x2={target.x} y2={target.y} 
                                stroke={color} strokeWidth="4" strokeLinecap="round"
                                className={`transition-all duration-500 ${isAnim}`}
                            />
                            <text 
                                x={(source.x + target.x)/2} y={((source.y + target.y)/2) - 10} 
                                fill="#8EA7B7" fontSize="10" textAnchor="middle" className="font-mono tracking-widest"
                            >
                                {e.label}
                            </text>
                        </g>
                    )
                })}

                {/* Nodes */}
                {nodes.map(n => {
                    let fill = "#102635";
                    let stroke = "#1B3A4A";
                    let size = 20;

                    if (n.type === 'source') { fill = "#0ea5e9"; size = 24; stroke = "#0284c7"; }
                    if (n.type === 'zone') { fill = "#1e293b"; size = 22; }
                    if (n.type === 'line') { size = 18; }
                    if (n.type === 'endpoint') { size = 14; }

                    return (
                        <g key={n.id}>
                            <circle cx={n.x} cy={n.y} r={size} fill={fill} stroke={stroke} strokeWidth="3" />
                            <text x={n.x} y={n.y + size + 14} fill="#F4F8FB" fontSize="11" textAnchor="middle" className="font-bold">
                                {n.label}
                            </text>
                        </g>
                    )
                })}
            </svg>
        </div>
    );
};
