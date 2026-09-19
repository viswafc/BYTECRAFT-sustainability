import React, { useState, useEffect } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { DigitalTwinNode, PageId, PlantId } from '../../types';
import { Plant01Topology } from '../plants/Plant01Topology';
import { Plant02Topology } from '../plants/Plant02Topology';
import { Plant03Topology } from '../plants/Plant03Topology';
import { Plant04Topology } from '../plants/Plant04Topology';
import { 
  Workflow, 
  Droplet, 
  Activity, 
  Gauge, 
  Sliders, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Factory, 
  Zap, 
  ChevronRight,
  Radio,
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';

interface DigitalTwinProps {
  onNavigate: (page: PageId) => void;
}

export const DigitalTwin: React.FC<DigitalTwinProps> = ({ onNavigate }) => {
  const { 
    currentPlantId,
    currentPlant,
    plants,
    setCurrentPlantId,
    digitalTwinNodes, 
    toggleValveState, 
    emergencyTriggered,
    isV104Isolated,
    isolateLineB,
    selectedTwinNodeId,
    setSelectedTwinNodeId
  } = useTelemetry();

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showPressureHeatmap, setShowPressureHeatmap] = useState<boolean>(false);

  // Fallback if node not found or switching plants
  const validSelectedNode = digitalTwinNodes.find(n => n.id === selectedTwinNodeId) || digitalTwinNodes[0] || {
    id: 'NODE-01',
    name: 'Primary Intake Node',
    type: 'pipe' as const,
    flowLpm: 0,
    pressureBar: 0,
    acousticKhz: 0,
    healthPercent: 100,
    status: 'nominal' as const,
    line: 'Main Conveyance',
    vibrationMmS: 0.5,
    healthIndex: 98
  };

  const selectedNode = validSelectedNode;
  const selectedNodeId = selectedNode.id;

  // Auto-sync node selection when plant changes if current selected node doesn't exist in new plant
  useEffect(() => {
    if (!digitalTwinNodes.some(n => n.id === selectedTwinNodeId)) {
      if (digitalTwinNodes.length > 0) {
        // Prefer selecting an anomalous node if present, else first node
        const criticalNode = digitalTwinNodes.find(n => n.status === 'critical' || n.status === 'warning');
        setSelectedTwinNodeId(criticalNode ? criticalNode.id : digitalTwinNodes[0].id);
      }
    }
  }, [currentPlantId, digitalTwinNodes, selectedTwinNodeId, setSelectedTwinNodeId]);

  const handleValveThrottle = (percent: number) => {
    if (selectedNode && selectedNode.type === 'valve') {
      if (selectedNode.id === 'NODE-V104') {
        isolateLineB(percent === 0);
      } else {
        toggleValveState(selectedNode.id, percent);
      }
    }
  };

  return (
    <div className="py-3 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Plant Navigation Tabs Strip */}
      <div className="bg-[#091826] border border-[#1a3a54] rounded-2xl p-2 sm:p-2.5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 px-2">
            <Factory className="w-4 h-4 text-[#28d7ff]" />
            <span className="text-xs font-bold tracking-wider text-[#8ba2b2] uppercase">
              Facility Selection:
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 max-w-4xl">
            {plants.map(plant => {
              const isActive = plant.id === currentPlantId;
              return (
                <button
                  key={plant.id}
                  onClick={() => setCurrentPlantId(plant.id)}
                  className={`px-3 py-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'bg-[#122e47] border-[#28d7ff] shadow-[0_0_12px_rgba(40,215,255,0.2)]'
                      : 'bg-[#0b1c2c]/80 border-[#16334a] hover:bg-[#0e253b] hover:border-[#224b6d]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-[#e6f3fa] truncate">
                      {plant.shortName}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${
                      plant.status === 'critical' ? 'bg-[#ff5b67] beacon' : plant.status === 'warning' ? 'bg-amber-400' : 'bg-[#31d48c]'
                    }`} />
                  </div>
                  <div className="text-[10px] text-[#6c8699] font-mono mt-0.5 truncate">
                    {plant.location.split(',')[0]} • {plant.flowRateNominalLpm} L/m
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#e6f3fa]">
              {currentPlant.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#28d7ff]/15 text-[#28d7ff] text-xs font-mono font-bold border border-[#28d7ff]/30">
              {currentPlant.code} SCADA
            </span>
          </div>
          <p className="text-sm text-[#8ba2b2] mt-1">
            Real-world hydrodynamic model • {currentPlant.facilityType} • {currentPlant.location}
          </p>
        </div>

        {/* View Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowPressureHeatmap(!showPressureHeatmap)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              showPressureHeatmap 
                ? 'bg-amber-400/20 border-amber-400 text-amber-400' 
                : 'bg-[#0c1c2b] border-[#1a374d] text-[#8ba2b2] hover:text-white'
            }`}
          >
            {showPressureHeatmap ? 'PRESSURE GRADIENT: ON' : 'PRESSURE GRADIENT: OFF'}
          </button>

          <div className="flex items-center bg-[#0c1c2b] border border-[#1a374d] rounded-xl p-1">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.4))}
              className="p-1.5 text-[#6e899c] hover:text-white rounded cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-[#8ba2b2] px-2">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.7))}
              className="p-1.5 text-[#6e899c] hover:text-white rounded cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 text-[#6e899c] hover:text-white rounded cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: SVG Canvas (Left 8 cols) & Node Inspector (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Visualization Canvas */}
        <div className="lg:col-span-8 bg-[#0c1c2b] rounded-2xl p-5 lg:p-6 border border-[#1a374d] relative overflow-hidden flex flex-col justify-between min-h-[580px]">
          {/* Top Canvas Legend & Stats */}
          <div className="flex flex-wrap items-center justify-between pb-3.5 border-b border-white/5 gap-2 z-10">
            <div className="flex items-center space-x-4 text-xs font-mono">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-[#31d48c] rounded-full" />
                <span className="text-[#8ba2b2]">Nominal Flow</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-[#ff5b67] rounded-full beacon" />
                <span className="text-[#ff5b67]">{currentPlant.statusLabel}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                <span className="text-amber-400">Throttled / Bypass</span>
              </div>
            </div>

            <div className="text-xs text-[#6e899c]">
              Click any node, vessel, or valve to inspect telemetry
            </div>
          </div>

          {/* Interactive SVG Schematics for Current Plant */}
          <div className="w-full flex-1 flex items-center justify-center my-4 overflow-hidden">
            <div 
              className="transition-transform duration-300 w-full"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            >
              {currentPlantId === 'plant-01' && (
                <Plant01Topology
                  nodes={digitalTwinNodes}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedTwinNodeId}
                  showPressureHeatmap={showPressureHeatmap}
                  isV104Isolated={isV104Isolated}
                />
              )}

              {currentPlantId === 'plant-02' && (
                <Plant02Topology
                  nodes={digitalTwinNodes}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedTwinNodeId}
                  showPressureHeatmap={showPressureHeatmap}
                />
              )}

              {currentPlantId === 'plant-03' && (
                <Plant03Topology
                  nodes={digitalTwinNodes}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedTwinNodeId}
                  showPressureHeatmap={showPressureHeatmap}
                />
              )}

              {currentPlantId === 'plant-04' && (
                <Plant04Topology
                  nodes={digitalTwinNodes}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedTwinNodeId}
                  showPressureHeatmap={showPressureHeatmap}
                />
              )}
            </div>
          </div>

          {/* Bottom Quick-Action Shortcuts adapted per plant */}
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-gray-400 gap-2">
            <span className="font-mono">
              Facility: <span className="text-white font-bold">{currentPlant.shortName}</span> | <span className="text-[#28d7ff] font-bold">{currentPlant.facilityType}</span>
            </span>

            <div className="flex items-center space-x-2">
              {currentPlantId === 'plant-01' && (
                <>
                  <button
                    onClick={() => setSelectedTwinNodeId('NODE-SEG-S05')}
                    className="px-2.5 py-1 rounded-lg bg-[#FF5B67]/20 text-[#FF5B67] border border-[#FF5B67]/40 font-mono hover:bg-[#FF5B67] hover:text-white transition-colors cursor-pointer"
                  >
                    Focus Leak S05
                  </button>
                  <button
                    onClick={() => setSelectedTwinNodeId('NODE-V104')}
                    className="px-2.5 py-1 rounded-lg bg-[#28D7FF]/20 text-[#28D7FF] border border-[#28D7FF]/40 font-mono hover:bg-[#28D7FF] hover:text-[#040F16] transition-colors cursor-pointer"
                  >
                    Focus Valve V-104
                  </button>
                </>
              )}

              {currentPlantId === 'plant-02' && (
                <>
                  <button
                    onClick={() => setSelectedTwinNodeId('NODE-P2-HX202')}
                    className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-400 border border-amber-400/40 font-mono hover:bg-amber-400 hover:text-black transition-colors cursor-pointer"
                  >
                    Focus Exchanger HX-202
                  </button>
                  <button
                    onClick={() => setSelectedTwinNodeId('NODE-P2-BYPASS-VALVE')}
                    className="px-2.5 py-1 rounded-lg bg-[#28D7FF]/20 text-[#28D7FF] border border-[#28D7FF]/40 font-mono hover:bg-[#28D7FF] hover:text-[#040F16] transition-colors cursor-pointer"
                  >
                    Focus Bypass BV-202
                  </button>
                </>
              )}

              {currentPlantId === 'plant-03' && (
                <>
                  <button
                    onClick={() => setSelectedTwinNodeId('NODE-P3-RO-RACK2')}
                    className="px-2.5 py-1 rounded-lg bg-[#FF5B67]/20 text-[#FF5B67] border border-[#FF5B67]/40 font-mono hover:bg-[#FF5B67] hover:text-white transition-colors cursor-pointer"
                  >
                    Focus RO Rack-02 Leak
                  </button>
                  <button
                    onClick={() => setSelectedTwinNodeId('NODE-P3-HP-PUMP')}
                    className="px-2.5 py-1 rounded-lg bg-[#28D7FF]/20 text-[#28D7FF] border border-[#28D7FF]/40 font-mono hover:bg-[#28D7FF] hover:text-[#040F16] transition-colors cursor-pointer"
                  >
                    Focus HP Pump P-302
                  </button>
                </>
              )}

              {currentPlantId === 'plant-04' && (
                <>
                  <button
                    onClick={() => setSelectedTwinNodeId('NODE-P4-WFI-TANK')}
                    className="px-2.5 py-1 rounded-lg bg-[#fcbf49]/20 text-[#fcbf49] border border-[#fcbf49]/40 font-mono hover:bg-[#fcbf49] hover:text-black transition-colors cursor-pointer"
                  >
                    Focus 85°C WFI Tank
                  </button>
                  <button
                    onClick={() => setSelectedTwinNodeId('NODE-P4-DISTILLATION')}
                    className="px-2.5 py-1 rounded-lg bg-[#28D7FF]/20 text-[#28D7FF] border border-[#28D7FF]/40 font-mono hover:bg-[#28D7FF] hover:text-[#040F16] transition-colors cursor-pointer"
                  >
                    Focus Still MEDS-401
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Node Inspector Side Panel (4 cols) */}
        <div className="lg:col-span-4 bg-[#0c1c2b] rounded-2xl p-5 border border-[#1a374d] flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            {/* Inspector Header */}
            <div className="pb-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-widest text-[#28D7FF] uppercase">
                  NODE INSPECTOR CONSOLE
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  selectedNode.status === 'critical'
                    ? 'bg-[#FF5B67]/20 text-[#FF5B67] border border-[#FF5B67]/40 animate-pulse'
                    : selectedNode.status === 'warning'
                    ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                    : 'bg-[#31d48c]/20 text-[#31d48c] border border-[#31d48c]/40'
                }`}>
                  {selectedNode.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1 font-['Outfit']">
                {selectedNode.name}
              </h3>
              <p className="text-xs text-[#8ba2b2] font-mono mt-0.5">
                Asset ID: {selectedNode.id} • Line: {selectedNode.line || 'Main Line'}
              </p>
            </div>

            {/* Live Telemetry Grid */}
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-[#081521] rounded-xl border border-white/10">
                  <span className="text-[10px] text-gray-400 font-mono">FLOW RATE</span>
                  <p className="text-base font-bold font-mono text-white mt-0.5">
                    {selectedNode.flowLpm} <span className="text-xs font-sans text-gray-400">L/min</span>
                  </p>
                </div>
                <div className="p-3 bg-[#081521] rounded-xl border border-white/10">
                  <span className="text-[10px] text-gray-400 font-mono">PRESSURE HEAD</span>
                  <p className="text-base font-bold font-mono text-[#28D7FF] mt-0.5">
                    {selectedNode.pressureBar} <span className="text-xs font-sans text-gray-400">Bar</span>
                  </p>
                </div>
                <div className="p-3 bg-[#081521] rounded-xl border border-white/10">
                  <span className="text-[10px] text-gray-400 font-mono">ACOUSTIC FREQ</span>
                  <p className="text-base font-bold font-mono text-[#FFC837] mt-0.5">
                    {selectedNode.acousticKhz} <span className="text-xs font-sans text-gray-400">kHz</span>
                  </p>
                </div>
                <div className="p-3 bg-[#081521] rounded-xl border border-white/10">
                  <span className="text-[10px] text-gray-400 font-mono">VIBRATION</span>
                  <p className="text-base font-bold font-mono text-white mt-0.5">
                    {selectedNode.vibrationMmS ?? 0.8} <span className="text-xs font-sans text-gray-400">mm/s</span>
                  </p>
                </div>
              </div>

              {/* Health Degradation Index */}
              <div className="p-3.5 bg-[#081624] rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300 font-mono">Asset Health Index</span>
                  <span className={`font-mono font-bold ${
                    (selectedNode.healthIndex ?? 95) < 50 ? 'text-[#FF5B67]' : (selectedNode.healthIndex ?? 95) < 85 ? 'text-amber-400' : 'text-[#31d48c]'
                  }`}>
                    {selectedNode.healthIndex ?? 95}%
                  </span>
                </div>
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      (selectedNode.healthIndex ?? 95) < 50 ? 'bg-[#FF5B67]' : (selectedNode.healthIndex ?? 95) < 85 ? 'bg-amber-400' : 'bg-[#31d48c]'
                    }`}
                    style={{ width: `${selectedNode.healthIndex ?? 95}%` }}
                  />
                </div>
              </div>

              {/* Interactive Valve Controls if node is a valve */}
              {selectedNode.type === 'valve' && (
                <div className="p-4 bg-[#0e1f30] rounded-xl border border-[#28D7FF]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono flex items-center space-x-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#28D7FF]" />
                      <span>SCADA SOLENOID ACTUATION</span>
                    </span>
                    <span className="text-xs font-mono text-[#28D7FF] font-bold">
                      {selectedNode.valveOpenPercent ?? 100}%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleValveThrottle(0)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        selectedNode.valveOpenPercent === 0
                          ? 'bg-[#FF5B67] text-white shadow-md'
                          : 'bg-white/5 hover:bg-[#FF5B67]/20 text-gray-300 hover:text-[#FF5B67] border border-white/10'
                      }`}
                    >
                      SHUT (0%)
                    </button>
                    <button
                      onClick={() => handleValveThrottle(50)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        selectedNode.valveOpenPercent === 50
                          ? 'bg-amber-400 text-black shadow-md'
                          : 'bg-white/5 hover:bg-amber-400/20 text-gray-300 hover:text-amber-400 border border-white/10'
                      }`}
                    >
                      50% THROTTLE
                    </button>
                    <button
                      onClick={() => handleValveThrottle(100)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        selectedNode.valveOpenPercent === 100
                          ? 'bg-[#31d48c] text-[#040F16] shadow-md'
                          : 'bg-white/5 hover:bg-[#31d48c]/20 text-gray-300 hover:text-[#31d48c] border border-white/10'
                      }`}
                    >
                      100% OPEN
                    </button>
                  </div>
                </div>
              )}

              {/* Plant 01 Special Isolation Card for S05 */}
              {currentPlantId === 'plant-01' && selectedNode.id === 'NODE-SEG-S05' && (
                <div className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all duration-300 ${
                  isV104Isolated 
                    ? 'bg-[#0b251d] border-[#31d48c]/60 text-gray-200 shadow-lg shadow-[#31d48c]/10' 
                    : 'bg-[#250d14] border-[#FF5B67]/50 text-gray-300 shadow-lg shadow-[#FF5B67]/10'
                }`}>
                  <div className={`flex items-center space-x-1.5 font-bold font-mono ${
                    isV104Isolated ? 'text-[#31d48c]' : 'text-[#FF5B67]'
                  }`}>
                    {isV104Isolated ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#31d48c]" />
                        <span>VALVE V-104 ISOLATED • BREACH SECURED</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        <span>ACOUSTIC RESONANCE DETECTED</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed text-gray-300">
                    {isV104Isolated ? (
                      <>Upstream Solenoid Valve <strong className="text-white">V-104</strong> commanded to 0% aperture. Line B Segment S05 depressurized to 0.15 Bar. Ultrasonic cavitation silenced (12.4 dB). Volumetric loss reduced to <strong className="text-[#31d48c]">0.0 L/hr</strong>.</>
                    ) : (
                      <>Cavitation hydrophone flagged 58.4 dB ultrasonic frequency. Water loss actively bleeding 342.4 L/hr under 2.15 Bar pressure. Recommended immediate isolation of upstream Valve V-104.</>
                    )}
                  </p>
                  <button
                    onClick={() => isolateLineB(!isV104Isolated)}
                    className={`w-full py-2.5 rounded-lg font-bold text-xs tracking-wider uppercase shadow hover:brightness-110 transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                      isV104Isolated
                        ? 'bg-[#31d48c] text-[#040F16]'
                        : 'bg-[#FF5B67] text-white'
                    }`}
                  >
                    {isV104Isolated ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>RESTORE V-104 FLOW (RE-OPEN)</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        <span>TRIGGER S05 ISOLATION (V-104)</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Plant 02 Special Diagnostics Card for HX-202 */}
              {currentPlantId === 'plant-02' && (selectedNode.id === 'NODE-P2-HX202' || selectedNode.id === 'NODE-P2-BYPASS-VALVE') && (
                <div className="p-3.5 rounded-xl border border-amber-400/50 bg-[#241708] text-xs space-y-2 text-gray-200">
                  <div className="flex items-center space-x-1.5 font-bold font-mono text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>DELTA-P CAVITATION DIAGNOSTIC</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-gray-300">
                    Exchanger HX-202 tube-bundle pressure differential spiked to 2.9 Bar. Modulating Bypass Valve BV-202 is currently positioned at 42% stroke. Acoustic sensors record high vibration.
                  </p>
                  <button
                    onClick={() => toggleValveState('NODE-P2-BYPASS-VALVE', 85)}
                    className="w-full py-2 rounded-lg font-bold text-xs bg-amber-400 hover:bg-amber-300 text-black font-mono transition-colors cursor-pointer"
                  >
                    RAMP BYPASS BV-202 TO 85%
                  </button>
                </div>
              )}

              {/* Plant 03 Special Diagnostics Card for RO Rack 02 */}
              {currentPlantId === 'plant-03' && selectedNode.id === 'NODE-P3-RO-RACK2' && (
                <div className="p-3.5 rounded-xl border border-[#FF5B67]/50 bg-[#250d14] text-xs space-y-2 text-gray-200">
                  <div className="flex items-center space-x-1.5 font-bold font-mono text-[#FF5B67]">
                    <ShieldAlert className="w-4 h-4" />
                    <span>MEMBRANE O-RING SEAL DISPLACEMENT</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-gray-300">
                    High pressure 9.5 Bar feed caused inter-element coupling O-ring dislocation. Permeate conductivity degrading. Ultrasonic sensor recording 62.8 dB acoustic emissions.
                  </p>
                  <button
                    onClick={() => toggleValveState('NODE-P3-RO-RACK2', 0)}
                    className="w-full py-2 rounded-lg font-bold text-xs bg-[#FF5B67] hover:bg-[#ff6e78] text-white font-mono transition-colors cursor-pointer"
                  >
                    ISOLATE RACK-02 FEED MANIFOLD
                  </button>
                </div>
              )}

              {/* Plant 04 Special Diagnostics Card for WFI Tank */}
              {currentPlantId === 'plant-04' && selectedNode.id === 'NODE-P4-WFI-TANK' && (
                <div className="p-3.5 rounded-xl border border-[#31d48c]/50 bg-[#0b251d] text-xs space-y-2 text-gray-200">
                  <div className="flex items-center space-x-1.5 font-bold font-mono text-[#31d48c]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>85.4°C CONTINUOUS THERMAL SANITIZATION</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-gray-300">
                    WFI storage and sanitary recirculation loop is operating in continuous self-sanitizing heat. Zero deadleg verified at all points of use. TOC: 6.2 ppb (Limit &lt; 10 ppb).
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 font-mono">
            <span>Tag: {selectedNode.id}</span>
            <button
              onClick={() => onNavigate('what-if-lab')}
              className="text-[#28d7ff] hover:underline cursor-pointer"
            >
              Simulate in Lab →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
