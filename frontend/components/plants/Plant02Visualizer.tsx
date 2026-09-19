import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Gauge, 
  Droplets, 
  Thermometer, 
  Radio, 
  Zap, 
  Waves, 
  Cpu, 
  Sliders, 
  Layers, 
  Crosshair, 
  CheckCircle2, 
  AlertTriangle,
  Search,
  Maximize2,
  Info,
  Compass,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  ChevronRight,
  ChevronUp,
  Minus,
  Box,
  GitCommit,
  Database,
  Building2,
  ChevronDown,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export interface Plant2Sensor {
  id: string;
  code: string;
  name: string;
  type: 'flow' | 'pressure' | 'acoustic' | 'tank' | 'vibration' | 'temperature' | 'quality' | 'pump' | 'valve';
  pipeline: string;
  pipelineDiameter: string;
  stationDistanceMeters: number;
  coordinates: { x: number; y: number };
  labelOffset?: { x: number; y: number };
  value: string;
  unit: string;
  status: 'nominal' | 'warning' | 'critical';
  nominalRange: string;
  description: string;
}

export type Plant2VisualizerLayer = '3d' | 'sensor-map' | 'zones' | 'pipelines' | 'tanks' | 'pumps' | 'valves';
export type Plant2LeakSimulationMode = 'resolved' | 'warning_10' | 'critical_blowout';

export const INITIAL_PLANT_02_SENSORS: Plant2Sensor[] = [
  {
    id: 'SEN-FS-201',
    code: 'FS-201',
    name: 'Raw Water Intake Ultrasonic Flowmeter',
    type: 'flow',
    pipeline: 'Raw Intake Pipeline (Line 1)',
    pipelineDiameter: 'DN500 Carbon Steel',
    stationDistanceMeters: 45,
    coordinates: { x: 310, y: 560 },
    labelOffset: { x: -45, y: -48 },
    value: '1,650 L/m',
    unit: 'L/m',
    status: 'nominal',
    nominalRange: '1,400 - 1,800 L/m',
    description: 'Transit-time ultrasonic flow measurement on primary raw water intake line from Clarifier Basin C-200.'
  },
  {
    id: 'SEN-PS-201',
    code: 'PS-201',
    name: 'Intake Manifold Piezoresistive Pressure Transmitter',
    type: 'pressure',
    pipeline: 'Intake Manifold Header (Line 1)',
    pipelineDiameter: 'DN450 Sch40',
    stationDistanceMeters: 80,
    coordinates: { x: 420, y: 510 },
    labelOffset: { x: -45, y: -48 },
    value: '3.4 Bar',
    unit: 'Bar',
    status: 'nominal',
    nominalRange: '3.0 - 4.0 Bar',
    description: 'Measures positive suction head upstream of high-pressure dual booster pump skids.'
  },
  {
    id: 'SEN-LV-201',
    code: 'LV-201',
    name: 'Clarifier Basin C-200 Radar Level Sensor',
    type: 'tank',
    pipeline: 'Clarification Basin C-200 Suction Chamber',
    pipelineDiameter: 'Ø 14m Cylindrical Basin',
    stationDistanceMeters: 110,
    coordinates: { x: 230, y: 640 },
    labelOffset: { x: -45, y: 16 },
    value: '84 %',
    unit: '%',
    status: 'nominal',
    nominalRange: '65% - 90%',
    description: '80 GHz non-contact radar level sensor tracking raw water retention volume and sedimentation.'
  },
  {
    id: 'SEN-AC-201',
    code: 'AC-201',
    name: 'Booster Pump P-201A Acoustic Hydrophone',
    type: 'acoustic',
    pipeline: 'Booster Discharge Header A (Line 2)',
    pipelineDiameter: 'DN350 Carbon Steel',
    stationDistanceMeters: 160,
    coordinates: { x: 550, y: 440 },
    labelOffset: { x: 12, y: -44 },
    value: '14.2 kHz',
    unit: 'kHz',
    status: 'nominal',
    nominalRange: '10 - 20 kHz',
    description: 'Piezoelectric acoustic emission sensor detecting pump impeller cavitation and pre-stall resonance.'
  },
  {
    id: 'SEN-VB-201',
    code: 'VB-201',
    name: 'Booster Pump P-201B Tri-Axial Vibration Transmitter',
    type: 'vibration',
    pipeline: 'Booster Skid P-201B Foundation (Line 2)',
    pipelineDiameter: 'Pump Bearing Housing',
    stationDistanceMeters: 190,
    coordinates: { x: 510, y: 390 },
    labelOffset: { x: -95, y: -44 },
    value: '1.8 mm/s',
    unit: 'mm/s',
    status: 'nominal',
    nominalRange: '0.5 - 2.8 mm/s',
    description: '3-axis accelerometer monitoring motor bearing vibration, misalignment, and foundation harmonics.'
  },
  {
    id: 'SEN-PS-202',
    code: 'PS-202',
    name: 'Utility High-Pressure Loop Expansion Sensor',
    type: 'pressure',
    pipeline: 'High-Pressure Utility Loop (Line 2)',
    pipelineDiameter: 'DN400 Heavy Wall',
    stationDistanceMeters: 320,
    coordinates: { x: 740, y: 460 },
    labelOffset: { x: -45, y: -48 },
    value: '7.2 Bar',
    unit: 'Bar',
    status: 'nominal',
    nominalRange: '6.8 - 7.5 Bar',
    description: 'Monitors stabilized discharge pressure on main industrial utility loop past thermal expansion U-loop.'
  },
  {
    id: 'SEN-FS-202',
    code: 'FS-202',
    name: 'Catalytic Exchanger Feed Coriolis Mass Flowmeter',
    type: 'flow',
    pipeline: 'Catalytic Process Cooling Supply (Line 3)',
    pipelineDiameter: 'DN300 Pre-Insulated',
    stationDistanceMeters: 410,
    coordinates: { x: 860, y: 410 },
    labelOffset: { x: -45, y: -48 },
    value: '820 L/m',
    unit: 'L/m',
    status: 'nominal',
    nominalRange: '750 - 900 L/m',
    description: 'High-accuracy dual bent-tube Coriolis mass flowmeter feeding primary refinery heat exchangers.'
  },
  {
    id: 'SEN-TS-201',
    code: 'TS-201',
    name: 'Heat Exchanger HX-201 Primary Inflow RTD',
    type: 'temperature',
    pipeline: 'Exchanger HX-201 Process Inflow (Line 3)',
    pipelineDiameter: 'DN300 Flanged',
    stationDistanceMeters: 470,
    coordinates: { x: 990, y: 360 },
    labelOffset: { x: -45, y: -48 },
    value: '34.2 °C',
    unit: '°C',
    status: 'nominal',
    nominalRange: '28 - 38 °C',
    description: 'Duplex Pt100 RTD measuring process water temperature entering catalytic cooling battery.'
  },
  {
    id: 'SEN-AC-202',
    code: 'AC-202',
    name: 'Bypass Valve BV-202 Ultrasonic Cavitation Sensor',
    type: 'acoustic',
    pipeline: 'Exchanger HX-202 Modulating Bypass (Line 4)',
    pipelineDiameter: 'DN250 Stainless',
    stationDistanceMeters: 530,
    coordinates: { x: 1060, y: 510 },
    labelOffset: { x: -45, y: 16 },
    value: '18.2 kHz',
    unit: 'kHz',
    status: 'nominal',
    nominalRange: '10 - 25 kHz',
    description: 'Monitors acoustic cavitation resonance across modulating bypass valve BV-202 on Cooling Bank B.'
  },
  {
    id: 'SEN-PS-203',
    code: 'PS-203',
    name: 'Exchanger HX-202 Differential Pressure Transmitter',
    type: 'pressure',
    pipeline: 'Cooling Bank B Return Line (Line 4)',
    pipelineDiameter: 'DN300 Return Header',
    stationDistanceMeters: 620,
    coordinates: { x: 1180, y: 470 },
    labelOffset: { x: 12, y: -44 },
    value: '0.92 Bar (ΔP)',
    unit: 'Bar',
    status: 'nominal',
    nominalRange: '0.6 - 1.2 Bar',
    description: 'Differential pressure drop across heat exchanger tube sheet and bypass throttle valve.'
  }
];

interface Plant02VisualizerProps {
  onNavigateIncident?: () => void;
  showLabels?: boolean;
  currentPlantId?: string;
  onPlantChange?: (plantId: any) => void;
  plants?: Array<{ id: string; name: string; shortName: string; code: string; facilityType: string }>;
}

export const Plant02Visualizer: React.FC<Plant02VisualizerProps> = ({ 
  onNavigateIncident,
  showLabels = true,
  currentPlantId = 'plant-02',
  onPlantChange,
  plants = [
    { id: 'plant-01', name: 'Plant 1: Municipal Water Treatment', shortName: 'Plant 1 (Demo)', code: 'DEMO-P1', facilityType: 'Municipal Water Grid' },
    { id: 'plant-02', name: 'Plant 2: Large Scale Industrial Processing', shortName: 'Plant 2 (Industrial)', code: 'IND-P2', facilityType: 'Catalytic Refining Facility' },
    { id: 'plant-03', name: 'Plant 3: Chemical Synthesis Unit', shortName: 'Plant 3 (Chemical)', code: 'CHEM-P3', facilityType: 'Polymer Synthesis Unit' },
    { id: 'plant-04', name: 'Plant 4: High-Pressure Power Terminal', shortName: 'Plant 4 (Power)', code: 'PWR-P4', facilityType: 'Steam Turbine Generation' }
  ]
}) => {
  const [selectedSensorId, setSelectedSensorId] = useState<string>('SEN-AC-202');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showLocatorLabels, setShowLocatorLabels] = useState<boolean>(showLabels);
  const [isInspectorMinimized, setIsInspectorMinimized] = useState<boolean>(false);
  const [activeLayer, setActiveLayer] = useState<Plant2VisualizerLayer>('3d');
  const [plantDropdownOpen, setPlantDropdownOpen] = useState<boolean>(false);

  // SCADA SIMULATION STATES FOR PLANT 2
  const [leakSimulationMode, setLeakSimulationMode] = useState<Plant2LeakSimulationMode>('resolved');
  const [fleetHealthScore, setFleetHealthScore] = useState<number>(100);

  // Dynamic sensors based on simulation mode
  const [sensors, setSensors] = useState<Plant2Sensor[]>(INITIAL_PLANT_02_SENSORS);

  // Synchronize dynamic sensor readings and health when simulation changes
  useEffect(() => {
    if (leakSimulationMode === 'resolved') {
      setFleetHealthScore(100);
      setSensors(prev => prev.map(s => {
        if (s.id === 'SEN-AC-202') {
          return {
            ...s,
            value: '18.2 kHz',
            status: 'nominal',
            nominalRange: '10 - 25 kHz',
            description: 'Acoustic emission frequency is within normal laminar range (18.2 kHz). Modulating bypass valve BV-202 open at 100% nominal flow.'
          };
        }
        if (s.id === 'SEN-PS-203') {
          return {
            ...s,
            value: '0.92 Bar (ΔP)',
            status: 'nominal',
            nominalRange: '0.6 - 1.2 Bar',
            description: 'Differential pressure drop across tube sheet and bypass throttle valve is balanced at 0.92 Bar.'
          };
        }
        if (s.id === 'SEN-FS-201') {
          return { ...s, value: '1,650 L/m', status: 'nominal' };
        }
        return s;
      }));
    } else if (leakSimulationMode === 'warning_10') {
      setFleetHealthScore(82);
      setSensors(prev => prev.map(s => {
        if (s.id === 'SEN-AC-202') {
          return {
            ...s,
            value: '36.8 kHz',
            status: 'warning',
            nominalRange: '10 - 25 kHz (Warning)',
            description: '10% Seepage detected: Acoustic cavitation resonance rising across modulating bypass valve BV-202. Throttled aperture producing micro-vortices.'
          };
        }
        if (s.id === 'SEN-PS-203') {
          return {
            ...s,
            value: '1.55 Bar (ΔP)',
            status: 'warning',
            nominalRange: '0.6 - 1.2 Bar',
            description: 'Moderate differential pressure rise on Bank B return line indicates localized flow resistance.'
          };
        }
        if (s.id === 'SEN-FS-201') {
          return { ...s, value: '1,485 L/m', status: 'nominal' };
        }
        return s;
      }));
    } else if (leakSimulationMode === 'critical_blowout') {
      setFleetHealthScore(38);
      setSensors(prev => prev.map(s => {
        if (s.id === 'SEN-AC-202') {
          return {
            ...s,
            value: '48.6 kHz',
            status: 'critical',
            nominalRange: '10 - 25 kHz (Spike Alert!)',
            description: 'CRITICAL CAVITATION SPIKE: 48.6 kHz resonance detected across bypass valve BV-202. Automatic SCADA safety cutoff tripped on Line 4 to isolate Bank B.'
          };
        }
        if (s.id === 'SEN-PS-203') {
          return {
            ...s,
            value: '2.40 Bar (ΔP)',
            status: 'critical',
            nominalRange: '0.6 - 1.2 Bar (Breach)',
            description: 'Critical differential pressure spike across tube sheet indicates severe throttling and imminent rupture risk.'
          };
        }
        if (s.id === 'SEN-FS-201') {
          return { ...s, value: '920 L/m', status: 'warning' };
        }
        return s;
      }));
    }
  }, [leakSimulationMode]);

  // Zoom and Pan states for interactive map
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse wheel scroll to zoom in and zoom out directly on the plant
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY;
      setZoom((prev) => {
        const factor = delta < 0 ? 1.08 : 0.92;
        const next = Math.min(Math.max(prev * factor, 0.4), 3.5);
        return Math.round(next * 100) / 100;
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const selectedSensor = sensors.find(s => s.id === selectedSensorId) || sensors[0];

  const currentPlant = plants.find(p => p.id === currentPlantId) || plants[1];

  const getStatusColor = (status: 'nominal' | 'warning' | 'critical') => {
    switch (status) {
      case 'nominal': return 'text-[#10b981] bg-[#10b981]/15 border-[#10b981]/40';
      case 'warning': return 'text-[#f59e0b] bg-[#f59e0b]/15 border-[#f59e0b]/40';
      case 'critical': return 'text-[#ff4d6d] bg-[#ff4d6d]/15 border-[#ff4d6d]/40';
    }
  };

  const getSensorPinIcon = (type: Plant2Sensor['type']) => {
    switch (type) {
      case 'flow': return Activity;
      case 'pressure': return Gauge;
      case 'acoustic': return Waves;
      case 'tank': return Droplets;
      case 'vibration': return Zap;
      case 'temperature': return Thermometer;
      case 'quality': return Sliders;
      case 'pump': return Gauge;
      case 'valve': return Sliders;
    }
  };

  // Plant 2 Structural Counts
  const layerCounts = {
    '3d': 10,
    'sensor-map': 10,
    'zones': 2,
    'pipelines': 4,
    'tanks': 2,
    'pumps': 2,
    'valves': 2
  };

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative w-full h-full select-none overflow-hidden bg-[#060e17] ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Isometric Grid Background Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#15293d_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none" />

      {/* Ambient Lighting Gradients */}
      <div className="absolute top-[28%] left-[16%] w-72 h-72 bg-[#00e5ff]/10 rounded-full blur-3xl pointer-events-none" />
      <div className={`absolute top-[48%] left-[50%] w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
        leakSimulationMode === 'critical_blowout' ? 'bg-[#ff4d6d]/20' : 'bg-[#00e5ff]/10'
      }`} />
      <div className="absolute top-[35%] right-[15%] w-80 h-80 bg-[#00e5ff]/10 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. LEFT FLOATING CONTROLS & MODE SELECTOR FOR PLANT 2                     */}
      {/* ========================================================================= */}
      <div className="absolute top-24 left-6 z-30 flex flex-col space-y-2.5 pointer-events-auto w-48">
        
        {/* Plant Selector Dropdown Card */}
        <div className="relative">
          <div 
            onClick={() => setPlantDropdownOpen(!plantDropdownOpen)}
            className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0d1824]/90 backdrop-blur-md border border-[#1e364c] hover:border-[#ff4d6d] cursor-pointer transition-all shadow-xl"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#ff4d6d]/20 border border-[#ff4d6d]/40 flex items-center justify-center text-[#ff4d6d] shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white leading-tight truncate">
                  {currentPlant?.shortName || 'Plant 2 (Industrial)'}
                </div>
                <div className="text-[10px] text-[#7893a6] leading-tight truncate">
                  {currentPlant?.facilityType || 'Catalytic Refining'}
                </div>
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[#7893a6] shrink-0 transition-transform ${plantDropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Plant Dropdown Menu */}
          <AnimatePresence>
            {plantDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute left-0 right-0 mt-1.5 bg-[#0d1824] border border-[#233d54] rounded-2xl shadow-2xl p-1.5 z-40 space-y-1"
              >
                {plants.map((plant) => (
                  <button
                    key={plant.id}
                    onClick={() => {
                      if (onPlantChange) onPlantChange(plant.id);
                      setPlantDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      currentPlantId === plant.id 
                        ? 'bg-[#ff4d6d] text-white font-bold' 
                        : 'text-gray-300 hover:bg-[#162a3d]'
                    }`}
                  >
                    <span>{plant.shortName}</span>
                    <span className="text-[10px] opacity-80 font-mono">{plant.code}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* View Mode Layer Buttons (Vertical Stack) */}
        <div className="flex flex-col space-y-1 p-1.5 rounded-2xl bg-[#0d1824]/85 backdrop-blur-md border border-[#1a3145] shadow-xl">
          {[
            { id: '3d' as Plant2VisualizerLayer, label: '3D View', count: layerCounts['3d'], icon: Box },
            { id: 'sensor-map' as Plant2VisualizerLayer, label: 'Sensor Map', count: layerCounts['sensor-map'], icon: Radio },
            { id: 'zones' as Plant2VisualizerLayer, label: 'Zones', count: layerCounts['zones'], icon: Layers },
            { id: 'pipelines' as Plant2VisualizerLayer, label: 'Pipelines', count: layerCounts['pipelines'], icon: GitCommit },
            { id: 'tanks' as Plant2VisualizerLayer, label: 'Tanks', count: layerCounts['tanks'], icon: Database },
            { id: 'pumps' as Plant2VisualizerLayer, label: 'Pumps', count: layerCounts['pumps'], icon: Gauge },
            { id: 'valves' as Plant2VisualizerLayer, label: 'Valves', count: layerCounts['valves'], icon: Sliders },
          ].map((item) => {
            const active = activeLayer === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveLayer(item.id)}
                className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  active 
                    ? 'bg-[#ff4d6d] text-white shadow-lg shadow-[#ff4d6d]/40' 
                    : 'text-[#879fae] hover:text-white hover:bg-[#142637]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-[#7590a2]'}`} />
                  <span>{item.label}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                  active ? 'bg-white/20 text-white font-bold' : 'bg-[#081520] text-[#638094]'
                }`}>
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* SCADA LEAK SIMULATION & SAFETY CUTOFF INTERACTIVE CONTROLS FOR PLANT 2 */}
        <div className="p-2.5 rounded-2xl bg-[#0d1824]/90 backdrop-blur-md border border-[#1a3145] shadow-xl space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#7893a6]">SCADA Simulation</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
              leakSimulationMode === 'resolved' 
                ? 'bg-[#31d48c]/20 text-[#31d48c]' 
                : leakSimulationMode === 'warning_10' 
                ? 'bg-amber-400/20 text-amber-400' 
                : 'bg-rose-500/20 text-rose-400'
            }`}>
              {leakSimulationMode === 'resolved' ? 'NOMINAL' : leakSimulationMode === 'warning_10' ? '10% SEEPAGE' : 'CRITICAL BLOWOUT'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {/* 10% Seepage button */}
            <button
              onClick={() => setLeakSimulationMode('warning_10')}
              className={`w-full py-1.5 px-2.5 rounded-xl text-[10px] font-semibold flex items-center justify-between transition-all cursor-pointer ${
                leakSimulationMode === 'warning_10'
                  ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/30'
                  : 'bg-[#122232] text-amber-300/80 hover:bg-[#182e44] hover:text-amber-200'
              }`}
            >
              <span>10% Seepage</span>
              <span className="text-[9px] opacity-75 font-mono">Running</span>
            </button>

            {/* Critical Blowout >30% button */}
            <button
              onClick={() => setLeakSimulationMode('critical_blowout')}
              className={`w-full py-1.5 px-2.5 rounded-xl text-[10px] font-semibold flex items-center justify-between transition-all cursor-pointer ${
                leakSimulationMode === 'critical_blowout'
                  ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30'
                  : 'bg-[#122232] text-rose-300/80 hover:bg-[#182e44] hover:text-rose-200'
              }`}
            >
              <span>Critical Blowout</span>
              <span className="text-[9px] opacity-75 font-mono">Auto-Cutoff</span>
            </button>

            {/* Resolve Problem & Restore Flow */}
            <button
              onClick={() => setLeakSimulationMode('resolved')}
              className={`w-full py-1.5 px-2.5 rounded-xl text-[10px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                leakSimulationMode === 'resolved'
                  ? 'bg-[#31d48c] text-[#051a12] shadow-md shadow-[#31d48c]/30'
                  : 'bg-[#0f2e24] text-[#31d48c] hover:bg-[#143d30] border border-[#31d48c]/40'
              }`}
            >
              <div className="flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Resolve & Flow</span>
              </div>
              <span className="text-[9px] font-mono">1,650 L/m</span>
            </button>
          </div>

          {/* Fleet Health Meter */}
          <div className="pt-2 border-t border-[#182f44] px-0.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#6d8a9e] flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-[#28d7ff]" />
                <span>Fleet Health</span>
              </span>
              <span className="font-mono font-bold text-[#31d48c]">{fleetHealthScore}%</span>
            </div>
            <div className="w-full bg-[#122232] h-1.5 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#28d7ff] to-[#31d48c] rounded-full transition-all duration-500" 
                style={{ width: `${fleetHealthScore}%` }} 
              />
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* DEDICATED CATEGORY SENSORS DRAWER (SEPARATE SENSORS ON CLICK)    */}
        {/* ================================================================ */}
        <AnimatePresence>
          {activeLayer !== '3d' && (
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              className="absolute top-0 left-[200px] z-30 w-80 p-3.5 rounded-2xl bg-[#09131e]/95 backdrop-blur-md border border-[#1d374e] shadow-2xl pointer-events-auto space-y-2.5 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#182f44]">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff4d6d] animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-['Outfit',sans-serif]">
                    {activeLayer === 'valves' && 'Valve Sensors (2)'}
                    {activeLayer === 'pumps' && 'Pumping Sensors (2)'}
                    {activeLayer === 'tanks' && 'Tank Sensors (2)'}
                    {activeLayer === 'pipelines' && 'Pipeline Sensors (4)'}
                    {activeLayer === 'zones' && 'Zone Overview (2)'}
                    {activeLayer === 'sensor-map' && 'All Sensors (10)'}
                  </span>
                </div>
                <button
                  onClick={() => setActiveLayer('3d')}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#14283b] transition-colors cursor-pointer"
                  title="Close Drawer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dynamic Items List */}
              <div className="space-y-1.5">
                {/* 1. SENSOR MAP / ALL SENSORS */}
                {activeLayer === 'sensor-map' && (
                  sensors.map(sensor => {
                    const isSelected = sensor.id === selectedSensorId;
                    const Icon = getSensorPinIcon(sensor.type);
                    return (
                      <div
                        key={sensor.id}
                        onClick={() => {
                          setSelectedSensorId(sensor.id);
                          setIsInspectorMinimized(false);
                        }}
                        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected 
                            ? 'bg-[#ff4d6d]/15 border-[#ff4d6d] shadow-md shadow-[#ff4d6d]/10' 
                            : 'bg-[#0d1e2e]/60 border-[#14283b] hover:bg-[#112437]'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center ${getStatusColor(sensor.status)}`}>
                            <Icon className="w-3 h-3" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[11px] font-bold text-white font-mono">{sensor.code}</span>
                              <span className="text-[9px] px-1 py-0.2 rounded bg-black/40 text-[#86a2b5] font-mono">
                                Stn {sensor.stationDistanceMeters}m
                              </span>
                            </div>
                            <span className="text-[10px] text-[#7b98ac] truncate block">
                              {sensor.name}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-mono font-bold text-white block">
                            {sensor.value}
                          </span>
                          <span className={`text-[9px] font-bold ${
                            sensor.status === 'warning' ? 'text-amber-400' : sensor.status === 'critical' ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {sensor.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* 2. ZONES VIEW */}
                {activeLayer === 'zones' && (
                  [
                    { 
                      id: 'zone-1', 
                      name: 'Zone A: Raw Intake & Boosting Skid', 
                      desc: 'Clarifier C-200, Dual Pumps P-201A/B (1,650 L/m @ 7.2 Bar)', 
                      health: '100%', 
                      status: 'Nominal',
                      sensors: ['FS-201', 'PS-201', 'LV-201', 'AC-201', 'VB-201'] 
                    },
                    { 
                      id: 'zone-2', 
                      name: 'Zone B: Catalytic Exchanger & Cooling', 
                      desc: 'Battery HX-201/202, Modulating Bypass BV-202 & Towers CT-201/202', 
                      health: leakSimulationMode === 'critical_blowout' ? '38%' : leakSimulationMode === 'warning_10' ? '82%' : '100%', 
                      status: leakSimulationMode === 'critical_blowout' ? 'Critical Cutoff' : leakSimulationMode === 'warning_10' ? '10% Seepage' : 'Nominal',
                      sensors: ['PS-202', 'FS-202', 'TS-201', 'AC-202', 'PS-203'] 
                    }
                  ].map(zone => (
                    <div 
                      key={zone.id}
                      className="p-2.5 rounded-xl bg-[#0d1e2e]/70 border border-[#1a3348] hover:border-[#ff4d6d] transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{zone.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          zone.status === 'Nominal' ? 'bg-[#31d48c]/20 text-[#31d48c]' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {zone.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#7a97ab] leading-tight">{zone.desc}</p>
                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#162a3c]">
                        <span className="text-[#628094]">Subsystem Health:</span>
                        <span className="font-mono font-bold text-[#31d48c]">{zone.health}</span>
                      </div>
                    </div>
                  ))
                )}

                {/* 3. PIPELINES VIEW */}
                {activeLayer === 'pipelines' && (
                  [
                    { id: 'SEN-FS-201', code: 'Line 1', name: 'Raw Water Intake Header', spec: 'DN500 Carbon Steel', flow: '1,650 L/m', press: '3.4 Bar', status: 'nominal' },
                    { id: 'SEN-PS-202', code: 'Line 2', name: 'High-Pressure Utility Loop', spec: 'DN400 Heavy Wall', flow: '1,650 L/m', press: '7.2 Bar', status: 'nominal' },
                    { id: 'SEN-FS-202', code: 'Line 3', name: 'Catalytic Exchanger Feed', spec: 'DN300 Pre-Insulated', flow: '820 L/m', press: '6.8 Bar', status: 'nominal' },
                    { 
                      id: 'SEN-AC-202', 
                      code: 'Line 4', 
                      name: 'Cooling Bank B Bypass Line', 
                      spec: 'DN250 Stainless', 
                      flow: leakSimulationMode === 'critical_blowout' ? '0 L/m (Cutoff)' : leakSimulationMode === 'warning_10' ? '320 L/m' : '410 L/m', 
                      press: leakSimulationMode === 'critical_blowout' ? '2.40 Bar ΔP' : '0.92 Bar ΔP', 
                      status: leakSimulationMode === 'critical_blowout' ? 'critical' : leakSimulationMode === 'warning_10' ? 'warning' : 'nominal' 
                    }
                  ].map(pipe => (
                    <div 
                      key={pipe.code}
                      onClick={() => {
                        setSelectedSensorId(pipe.id);
                        setIsInspectorMinimized(false);
                      }}
                      className="p-2 rounded-xl bg-[#0d1e2e]/70 border border-[#1a3348] hover:border-[#ff4d6d] transition-all cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-white font-mono">{pipe.code}</span>
                          <span className="text-[10px] text-gray-300 truncate">{pipe.name}</span>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          pipe.status === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : pipe.status === 'warning' ? 'bg-amber-400/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {pipe.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#7a97ab] font-mono">
                        <span>{pipe.spec}</span>
                        <span className="text-[#00e5ff] font-bold">{pipe.flow} • {pipe.press}</span>
                      </div>
                    </div>
                  ))
                )}

                {/* 4. TANKS VIEW */}
                {activeLayer === 'tanks' && (
                  [
                    { id: 'SEN-LV-201', code: 'C-200', name: 'Clarifier Basin C-200', spec: 'Ø 14m Cylindrical Basin', level: '84%', cap: '4,800 m³/day', status: 'nominal' },
                    { id: 'SEN-TS-202', code: 'CT-201/202', name: 'Cooling Towers Basin', spec: 'Dual Hyperbolic Basin', level: '92%', cap: '31.8 °C Temp', status: 'nominal' }
                  ].map(tank => (
                    <div 
                      key={tank.code}
                      onClick={() => {
                        setSelectedSensorId(tank.id);
                        setIsInspectorMinimized(false);
                      }}
                      className="p-2.5 rounded-xl bg-[#0d1e2e]/70 border border-[#1a3348] hover:border-[#ff4d6d] transition-all cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono">{tank.code} — {tank.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">NOMINAL</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#7a97ab] font-mono">
                        <span>{tank.spec}</span>
                        <span className="text-[#00e5ff] font-bold">Level: {tank.level} • {tank.cap}</span>
                      </div>
                    </div>
                  ))
                )}

                {/* 5. PUMPS VIEW */}
                {activeLayer === 'pumps' && (
                  [
                    { id: 'SEN-AC-201', code: 'P-201A', name: 'Duty Booster Skid A', spec: '45 kW Multistage Centrifugal', rpm: '1,450 RPM', vibe: '1.2 mm/s', status: 'nominal' },
                    { id: 'SEN-VB-201', code: 'P-201B', name: 'Standby Booster Skid B', spec: '45 kW Multistage Centrifugal', rpm: 'Standby', vibe: '1.8 mm/s', status: 'nominal' }
                  ].map(pump => (
                    <div 
                      key={pump.code}
                      onClick={() => {
                        setSelectedSensorId(pump.id);
                        setIsInspectorMinimized(false);
                      }}
                      className="p-2.5 rounded-xl bg-[#0d1e2e]/70 border border-[#1a3348] hover:border-[#ff4d6d] transition-all cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono">{pump.code} — {pump.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">ACTIVE</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#7a97ab] font-mono">
                        <span>{pump.spec}</span>
                        <span className="text-[#00e5ff] font-bold">{pump.rpm} • {pump.vibe}</span>
                      </div>
                    </div>
                  ))
                )}

                {/* 6. VALVES VIEW */}
                {activeLayer === 'valves' && (
                  [
                    { 
                      id: 'SEN-AC-202', 
                      code: 'BV-202', 
                      name: 'Modulating Bypass Valve', 
                      spec: 'DN250 Stainless Actuated', 
                      aperture: leakSimulationMode === 'critical_blowout' ? '0% (Cutoff Closed)' : leakSimulationMode === 'warning_10' ? '42% Throttled' : '100% Full Open', 
                      status: leakSimulationMode === 'critical_blowout' ? 'Critical Cutoff' : leakSimulationMode === 'warning_10' ? '10% Seepage' : 'Nominal' 
                    },
                    { id: 'SEN-PS-201', code: 'MV-201', name: 'Intake Manifold Header Valve', spec: 'DN450 Flanged Gate Valve', aperture: '100% Full Open', status: 'Nominal' }
                  ].map(valve => (
                    <div 
                      key={valve.code}
                      onClick={() => {
                        setSelectedSensorId(valve.id);
                        setIsInspectorMinimized(false);
                      }}
                      className="p-2.5 rounded-xl bg-[#0d1e2e]/70 border border-[#1a3348] hover:border-[#ff4d6d] transition-all cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono">{valve.code} — {valve.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          valve.status === 'Nominal' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {valve.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#7a97ab] font-mono">
                        <span>{valve.spec}</span>
                        <span className="text-[#00e5ff] font-bold">Aperture: {valve.aperture}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Plant 2 Dedicated Quick Toggles (Labels overlay and Reset Zoom) */}
      <div className="absolute top-20 right-4 md:right-6 z-20 pointer-events-auto flex items-center gap-2">
        <button
          onClick={() => setShowLocatorLabels(!showLocatorLabels)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5 transition-all cursor-pointer backdrop-blur-md border shadow-md ${
            showLocatorLabels 
              ? 'bg-[#00e5ff] text-black shadow-[#00e5ff]/20 font-bold border-[#00e5ff]' 
              : 'bg-[#091522]/90 border-[#1a3348] text-[#86a2b5] hover:text-white'
          }`}
          title="Toggle Station Labels on Map"
        >
          <Crosshair className="w-3 h-3" />
          <span>{showLocatorLabels ? 'Labels: ON' : 'Labels: OFF'}</span>
        </button>

        {/* Zoom controls */}
        <div className="flex items-center bg-[#091522]/90 backdrop-blur-md border border-[#1a3348] rounded-lg p-0.5 shadow-md">
          <button
            onClick={() => setZoom(prev => Math.min(prev * 1.15, 3.5))}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#14283b] transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev * 0.85, 0.4))}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#14283b] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#14283b] transition-colors cursor-pointer"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. CENTER ISOMETRIC HIGH-FIDELITY PLANT 2 SVG SCHEMATIC               */}
      {/* --------------------------------------------------------------------- */}
      <div 
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.08s ease-out'
        }}
        className="w-full h-full flex items-center justify-center pointer-events-none"
      >
        <svg 
          viewBox="0 0 1600 950" 
          className="w-full h-full object-contain max-h-[92vh] pointer-events-auto select-none"
        >
          <defs>
            {/* Pipelines & Metallic Surface Gradients */}
            <linearGradient id="p2PipeDark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#456177" />
              <stop offset="35%" stopColor="#87a5ba" />
              <stop offset="70%" stopColor="#2c4558" />
              <stop offset="100%" stopColor="#142431" />
            </linearGradient>

            <linearGradient id="p2WaterNominal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00c6ff" />
              <stop offset="50%" stopColor="#0072ff" />
              <stop offset="100%" stopColor="#00c6ff" />
            </linearGradient>

            <linearGradient id="p2HotWater" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>

            <linearGradient id="p2CoolingTower" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#192e40" />
              <stop offset="40%" stopColor="#3b5973" />
              <stop offset="80%" stopColor="#1e3447" />
              <stop offset="100%" stopColor="#111f2c" />
            </linearGradient>

            <linearGradient id="p2GroundBase" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0c1722" />
              <stop offset="100%" stopColor="#060c13" />
            </linearGradient>
          </defs>

          {/* 1. GROUND PLATFORM & INDUSTRIAL PAVEMENT */}
          <polygon 
            points="60,650 780,260 1540,580 840,940" 
            fill="url(#p2GroundBase)" 
            stroke="#17334a" 
            strokeWidth="2.5" 
          />
          {/* Internal Grid Roadway Markings */}
          <path 
            d="M 220,700 L 760,420 L 1400,680" 
            stroke="#172b3b" 
            strokeWidth="32" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <path 
            d="M 220,700 L 760,420 L 1400,680" 
            stroke="#eab308" 
            strokeWidth="2" 
            strokeDasharray="14 12" 
            fill="none" 
          />

          {/* Area Sector Labels */}
          <text x="120" y="520" fill="#58768d" fontSize="12" fontWeight="bold" letterSpacing="1.5">
            SECTOR 1: RAW INTAKE & CLARIFIER
          </text>
          <text x="470" y="340" fill="#58768d" fontSize="12" fontWeight="bold" letterSpacing="1.5">
            SECTOR 2: BOOSTER PUMP SKID & HP LOOP
          </text>
          <text x="1050" y="290" fill="#58768d" fontSize="12" fontWeight="bold" letterSpacing="1.5">
            SECTOR 3: CATALYTIC EXCHANGERS & COOLING
          </text>

          {/* 2. BACKGROUND INDUSTRIAL STRUCTURES (REFINERY & COOLING TOWERS) */}
          <g id="cooling-towers-background" opacity={activeLayer === 'tanks' || activeLayer === '3d' ? 1 : 0.4}>
            {/* CT-201 */}
            <path 
              d="M 1240,360 C 1255,290 1265,240 1250,190 L 1315,190 C 1300,240 1310,290 1330,360 Z" 
              fill="url(#p2CoolingTower)" 
              stroke={activeLayer === 'tanks' ? '#ff4d6d' : '#2c4d68'} 
              strokeWidth="2" 
            />
            <ellipse cx="1282" cy="190" rx="32" ry="9" fill="#08141f" stroke="#2c4d68" strokeWidth="1.5" />
            <text x="1282" y="385" fill="#7593aa" fontSize="11" fontWeight="bold" textAnchor="middle">
              Cooling Tower CT-201
            </text>

            {/* CT-202 */}
            <path 
              d="M 1345,360 C 1360,290 1370,240 1355,190 L 1420,190 C 1405,240 1415,290 1435,360 Z" 
              fill="url(#p2CoolingTower)" 
              stroke={activeLayer === 'tanks' ? '#ff4d6d' : '#2c4d68'} 
              strokeWidth="2" 
            />
            <ellipse cx="1387" cy="190" rx="32" ry="9" fill="#08141f" stroke="#2c4d68" strokeWidth="1.5" />
            <text x="1387" y="385" fill="#7593aa" fontSize="11" fontWeight="bold" textAnchor="middle">
              Cooling Tower CT-202
            </text>
          </g>

          {/* Distillation Columns / Catalytic Fractionators in Background */}
          <g id="distillation-towers" opacity={activeLayer === '3d' || activeLayer === 'zones' ? 1 : 0.35}>
            <rect x="920" y="160" width="48" height="190" rx="6" fill="#132737" stroke="#274863" strokeWidth="2" />
            <ellipse cx="944" cy="160" rx="24" ry="8" fill="#1e3b52" stroke="#274863" strokeWidth="1.5" />
            <line x1="920" y1="210" x2="968" y2="210" stroke="#375d7d" strokeWidth="2" />
            <line x1="920" y1="260" x2="968" y2="260" stroke="#375d7d" strokeWidth="2" />
            <line x1="920" y1="310" x2="968" y2="310" stroke="#375d7d" strokeWidth="2" />
            <text x="944" y="340" fill="#7593aa" fontSize="10" fontWeight="bold" textAnchor="middle">
              Fractionator C-10
            </text>

            <rect x="985" y="200" width="38" height="150" rx="5" fill="#10212f" stroke="#25435b" strokeWidth="2" />
            <ellipse cx="1004" cy="200" rx="19" ry="6" fill="#1a354b" stroke="#25435b" strokeWidth="1.5" />
          </g>

          {/* 3. CLARIFICATION BASIN C-200 (ZONE 1 / TANKS) */}
          <g id="clarifier-c200" opacity={activeLayer === 'tanks' || activeLayer === 'zones' || activeLayer === '3d' ? 1 : 0.4}>
            <ellipse cx="230" cy="640" rx="100" ry="42" fill="#0b1e2c" stroke={activeLayer === 'tanks' ? '#ff4d6d' : '#1d435f'} strokeWidth="3" />
            <ellipse cx="230" cy="635" rx="88" ry="34" fill="#00e5ff" fillOpacity="0.4" />
            {/* Center Scraper Bridge Gantry */}
            <circle cx="230" cy="635" r="14" fill="#1d3d54" stroke="#00e5ff" strokeWidth="2" />
            <line x1="145" y1="635" x2="315" y2="635" stroke="#487597" strokeWidth="4" />
            <text x="230" y="595" fill="#FFFFFF" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="Outfit">
              CLARIFIER C-200 (INTAKE)
            </text>
            <text x="230" y="612" fill="#00e5ff" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono">
              4,800 m³/day • Level 84%
            </text>
          </g>

          {/* 4. DUAL BOOSTER PUMP HOUSE P-201A & P-201B (ZONE 2 / PUMPS) */}
          <g id="booster-pumps" opacity={activeLayer === 'pumps' || activeLayer === 'zones' || activeLayer === '3d' ? 1 : 0.4}>
            <rect x="470" y="380" width="130" height="95" rx="12" fill="#0b1b28" stroke={activeLayer === 'pumps' ? '#ff4d6d' : '#20435f'} strokeWidth="2.5" />
            {/* Pump A */}
            <circle cx="515" cy="425" r="22" fill="#0e283b" stroke="#00e5ff" strokeWidth="2" />
            <text x="515" y="429" fill="#00e5ff" fontSize="10" fontWeight="bold" textAnchor="middle">P-201A</text>
            {/* Pump B */}
            <circle cx="565" cy="425" r="22" fill="#0e283b" stroke="#31d48c" strokeWidth="2" />
            <text x="565" y="429" fill="#31d48c" fontSize="10" fontWeight="bold" textAnchor="middle">P-201B</text>
            <text x="535" y="495" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
              BOOSTER SKID (DUTY/STDBY)
            </text>
          </g>

          {/* 5. SHELL-AND-TUBE EXCHANGER BATTERY HX-201 & HX-202 (ZONE 3 / VALVES) */}
          <g id="exchangers-battery" opacity={activeLayer === 'valves' || activeLayer === 'pipelines' || activeLayer === 'zones' || activeLayer === '3d' ? 1 : 0.4}>
            {/* HX-201 */}
            <rect x="930" y="380" width="120" height="55" rx="14" fill="#0a1d2c" stroke="#224765" strokeWidth="2.5" />
            <line x1="950" y1="385" x2="950" y2="430" stroke="#00e5ff" strokeWidth="2" />
            <line x1="975" y1="385" x2="975" y2="430" stroke="#00e5ff" strokeWidth="2" />
            <line x1="1000" y1="385" x2="1000" y2="430" stroke="#00e5ff" strokeWidth="2" />
            <text x="990" y="412" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">HX-201 (Primary)</text>

            {/* HX-202 */}
            <rect 
              x="1060" 
              y="450" 
              width="120" 
              height="55" 
              rx="14" 
              fill={leakSimulationMode === 'critical_blowout' ? '#24080e' : '#1c1106'} 
              stroke={leakSimulationMode === 'critical_blowout' ? '#ff4d6d' : '#f59e0b'} 
              strokeWidth="2.5" 
            />
            <line x1="1080" y1="455" x2="1080" y2="500" stroke={leakSimulationMode === 'critical_blowout' ? '#ff4d6d' : '#f59e0b'} strokeWidth="2" />
            <line x1="1105" y1="455" x2="1105" y2="500" stroke={leakSimulationMode === 'critical_blowout' ? '#ff4d6d' : '#f59e0b'} strokeWidth="2" />
            <line x1="1130" y1="455" x2="1130" y2="500" stroke={leakSimulationMode === 'critical_blowout' ? '#ff4d6d' : '#f59e0b'} strokeWidth="2" />
            <text x="1120" y="482" fill={leakSimulationMode === 'critical_blowout' ? '#ff4d6d' : '#f59e0b'} fontSize="11" fontWeight="bold" textAnchor="middle">
              HX-202 (Secondary)
            </text>
          </g>

          {/* ----------------------------------------------------------------- */}
          {/* 6. MAJOR INDUSTRIAL PIPELINES (HEAVY STEEL GAUGE & ARTERIES)       */}
          {/* ----------------------------------------------------------------- */}
          <g id="industrial-pipeline-grid">
            {/* Pipeline 1: Raw Intake Pipeline DN500 (Clarifier to Booster Skid) */}
            <path d="M 230,640 L 320,560 L 470,510 L 470,430" fill="none" stroke="url(#p2PipeDark)" strokeWidth="20" strokeLinejoin="round" />
            <path d="M 230,640 L 320,560 L 470,510 L 470,430" fill="none" stroke="url(#p2WaterNominal)" strokeWidth="10" strokeLinejoin="round" />
            <path d="M 230,640 L 320,560 L 470,510 L 470,430" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="8 6" className="pipe-flow-cyan" strokeLinejoin="round" />

            {/* Pipeline 2: High-Pressure Utility Loop DN400 with Expansion U-Loop */}
            <path d="M 600,430 L 720,430 L 720,460 L 760,460 L 760,430 L 860,430" fill="none" stroke="url(#p2PipeDark)" strokeWidth="18" strokeLinejoin="round" />
            <path d="M 600,430 L 720,430 L 720,460 L 760,460 L 760,430 L 860,430" fill="none" stroke="url(#p2WaterNominal)" strokeWidth="9" strokeLinejoin="round" />
            <path d="M 600,430 L 720,430 L 720,460 L 760,460 L 760,430 L 860,430" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="8 6" className="pipe-flow-cyan" strokeLinejoin="round" />

            {/* Pipeline 3: Catalytic Exchanger Loop DN300 (Split to HX-201 and HX-202) */}
            <path d="M 860,430 L 930,405" fill="none" stroke="url(#p2PipeDark)" strokeWidth="16" strokeLinejoin="round" />
            <path d="M 860,430 L 930,405" fill="none" stroke="url(#p2WaterNominal)" strokeWidth="8" strokeLinejoin="round" />

            <path d="M 860,430 L 910,480 L 1060,480" fill="none" stroke="url(#p2PipeDark)" strokeWidth="16" strokeLinejoin="round" />
            <path d="M 860,430 L 910,480 L 1060,480" fill="none" stroke="url(#p2WaterNominal)" strokeWidth="8" strokeLinejoin="round" />

            {/* Pipeline 4: Modulating Bypass Line around HX-202 (Valve BV-202) */}
            <path d="M 980,480 L 1010,530 L 1120,530 L 1150,480" fill="none" stroke="url(#p2PipeDark)" strokeWidth="14" strokeLinejoin="round" />
            <path 
              d="M 980,480 L 1010,530 L 1120,530 L 1150,480" 
              fill="none" 
              stroke={leakSimulationMode === 'critical_blowout' ? '#ff4d6d' : leakSimulationMode === 'warning_10' ? '#f59e0b' : '#31d48c'} 
              strokeWidth={leakSimulationMode === 'critical_blowout' ? 9 : 7} 
              strokeLinejoin="round" 
            />
            <path 
              d="M 980,480 L 1010,530 L 1120,530 L 1150,480" 
              fill="none" 
              stroke="#FFFFFF" 
              strokeWidth="2" 
              strokeDasharray="6 6" 
              className={leakSimulationMode === 'critical_blowout' ? 'pipe-flow-red' : leakSimulationMode === 'warning_10' ? 'pipe-flow-slow' : 'pipe-flow-cyan'} 
              strokeLinejoin="round" 
            />

            {/* SIMULATION VISUAL INDICATORS FOR BV-202 */}
            {leakSimulationMode === 'critical_blowout' && (
              <g transform="translate(1060, 530)">
                {/* Acoustic Cavitation Shockwave Rings */}
                <circle cx="0" cy="0" r="28" fill="none" stroke="#ff1744" strokeWidth="2.5" className="leak-pulse-ring" />
                <circle cx="0" cy="0" r="50" fill="none" stroke="#ff5252" strokeWidth="1.5" className="leak-pulse-ring" style={{ animationDelay: '0.5s' }} />
                <circle cx="0" cy="0" r="10" fill="#ff1744" className="animate-ping" />
                <circle cx="0" cy="0" r="6" fill="#d50000" />
                
                {/* Safety Cutoff Floating Flag */}
                <g transform="translate(-60, -45)">
                  <rect width="120" height="24" rx="6" fill="#24080e" stroke="#ff1744" strokeWidth="2" />
                  <text x="60" y="16" fill="#ff4d6d" fontSize="9" fontWeight="black" textAnchor="middle" fontFamily="JetBrains Mono">
                    AUTO-CUTOFF ACTIVE
                  </text>
                </g>
              </g>
            )}

            {leakSimulationMode === 'warning_10' && (
              <g transform="translate(1060, 530)">
                <circle cx="0" cy="0" r="20" fill="none" stroke="#f59e0b" strokeWidth="2" className="ultrasonic-wave" />
                <circle cx="0" cy="0" r="5" fill="#f59e0b" />
              </g>
            )}

            {/* Pipeline 5: Cooling Tower Circulation Loop DN350 */}
            <path d="M 1050,405 L 1200,405 L 1200,340 L 1250,340" fill="none" stroke="url(#p2PipeDark)" strokeWidth="18" strokeLinejoin="round" />
            <path d="M 1050,405 L 1200,405 L 1200,340 L 1250,340" fill="none" stroke="url(#p2WaterNominal)" strokeWidth="9" strokeLinejoin="round" />

            <path d="M 1180,480 L 1240,480 L 1240,340 L 1350,340" fill="none" stroke="url(#p2PipeDark)" strokeWidth="18" strokeLinejoin="round" />
            <path d="M 1180,480 L 1240,480 L 1240,340 L 1350,340" fill="none" stroke="url(#p2HotWater)" strokeWidth="9" strokeLinejoin="round" />

            {/* Pipeline 6: Steam Condensate Loop DN250 (Hot Return Header) */}
            <path d="M 1250,370 L 1250,640 L 980,640 L 980,510" fill="none" stroke="url(#p2PipeDark)" strokeWidth="14" strokeLinejoin="round" />
            <path d="M 1250,370 L 1250,640 L 980,640 L 980,510" fill="none" stroke="url(#p2HotWater)" strokeWidth="7" strokeLinejoin="round" />

            {/* Pipeline 7: Effluent Recycling & Neutralization Header DN300 */}
            <path d="M 980,640 L 720,720 L 320,720 L 230,670" fill="none" stroke="url(#p2PipeDark)" strokeWidth="14" strokeLinejoin="round" />
            <path d="M 980,640 L 720,720 L 320,720 L 230,670" fill="none" stroke="#10b981" strokeWidth="6" strokeLinejoin="round" />
          </g>

          {/* ----------------------------------------------------------------- */}
          {/* 7. PIPELINE SENSOR IDENTIFICATION PINS & STATIONS (PROMINENT OVERLAY)*/}
          {/* ----------------------------------------------------------------- */}
          <g id="sensors-pipeline-stations">
            {sensors.map((sensor) => {
              const isSelected = sensor.id === selectedSensorId;
              const { x, y } = sensor.coordinates;
              const offsetX = sensor.labelOffset?.x ?? -45;
              const offsetY = sensor.labelOffset?.y ?? -48;
              const isWarning = sensor.status === 'warning';
              const isCritical = sensor.status === 'critical';
              const pinColor = isCritical ? '#ff4d6d' : isWarning ? '#f59e0b' : '#00e5ff';

              return (
                <g 
                  key={sensor.id} 
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedSensorId(sensor.id);
                    setIsInspectorMinimized(false);
                  }}
                >
                  {/* Outer Radar Pulse Wave */}
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={isSelected ? 32 : 22} 
                    fill={pinColor} 
                    fillOpacity={isSelected ? 0.25 : 0.12} 
                    className={isSelected || isWarning || isCritical ? "animate-ping" : ""} 
                  />
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={isSelected ? 20 : 14} 
                    fill="#04121d" 
                    stroke={pinColor} 
                    strokeWidth={isSelected ? 3 : 2} 
                  />
                  <circle cx={x} cy={y} r={isSelected ? 6 : 4} fill={pinColor} />

                  {/* Sensor Station Pin Flag / Badge */}
                  {showLocatorLabels && (
                    <g transform={`translate(${x + offsetX}, ${y + offsetY})`}>
                      <rect 
                        width="90" 
                        height="30" 
                        rx="7" 
                        fill="#071724" 
                        fillOpacity="0.95"
                        stroke={isSelected ? '#FFFFFF' : pinColor} 
                        strokeWidth={isSelected ? 2 : 1.2} 
                        filter="drop-shadow(0 4px 10px rgba(0,0,0,0.5))"
                      />
                      <line 
                        x1="45" 
                        y1={offsetY > 0 ? 0 : 30} 
                        x2="45" 
                        y2={offsetY > 0 ? -12 : 46} 
                        stroke={pinColor} 
                        strokeWidth="1.5" 
                        strokeDasharray="2 2" 
                      />
                      <text 
                        x="45" 
                        y="14" 
                        fill="#FFFFFF" 
                        fontSize="9.5" 
                        fontWeight="bold" 
                        textAnchor="middle" 
                        fontFamily="JetBrains Mono"
                      >
                        {sensor.code}
                      </text>
                      <text 
                        x="45" 
                        y="24" 
                        fill={pinColor} 
                        fontSize="8" 
                        fontWeight="bold" 
                        textAnchor="middle" 
                        fontFamily="JetBrains Mono"
                      >
                        Stn {sensor.stationDistanceMeters}m • {sensor.value}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 3. SENSOR INSPECTOR CARD (FOCUSED SENSOR HUD AT BOTTOM RIGHT - MINIMIZABLE) */}
      {/* --------------------------------------------------------------------- */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-auto max-w-[calc(100vw-2rem)]">
        {isInspectorMinimized ? (
          <button
            onClick={() => setIsInspectorMinimized(false)}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-[#091522]/95 backdrop-blur-md border border-[#1b3750] shadow-xl text-white hover:bg-[#122436] transition-all cursor-pointer group"
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${getStatusColor(selectedSensor.status)}`}>
              {React.createElement(getSensorPinIcon(selectedSensor.type), { className: 'w-3.5 h-3.5' })}
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold font-mono">{selectedSensor.code}</span>
                <span className="text-[10px] text-[#00e5ff] font-mono font-semibold">{selectedSensor.value}</span>
              </div>
              <span className="text-[10px] text-[#7a97ab] block">Click to inspect</span>
            </div>
            <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-white transition-transform" />
          </button>
        ) : (
          <div className="w-[330px] p-3.5 rounded-2xl bg-[#091522]/95 backdrop-blur-md border border-[#1b3750] shadow-2xl space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#183149]">
              <div className="flex items-center space-x-2 min-w-0">
                <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center border ${getStatusColor(selectedSensor.status)}`}>
                  {React.createElement(getSensorPinIcon(selectedSensor.type), { className: 'w-4 h-4' })}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white font-['Outfit',sans-serif] block truncate">
                    {selectedSensor.code} — {selectedSensor.name}
                  </span>
                  <span className="text-[10px] text-[#7a97ab] font-mono block truncate">
                    Station: {selectedSensor.stationDistanceMeters}m on {selectedSensor.pipeline}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsInspectorMinimized(true)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#163148] transition-colors cursor-pointer shrink-0 ml-1"
                title="Minimize Inspector"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 bg-[#050e17]/70 p-2 rounded-xl border border-[#14283b] text-xs">
              <div>
                <span className="text-[10px] text-[#7896ab] block">Live Reading:</span>
                <span className="font-mono font-bold text-white text-sm">
                  {selectedSensor.value}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#7896ab] block">Nominal Spec:</span>
                <span className="font-mono text-emerald-400 text-xs">
                  {selectedSensor.nominalRange}
                </span>
              </div>
              <div className="col-span-2 pt-1 border-t border-[#14283b]">
                <span className="text-[10px] text-[#7896ab] block">Pipeline Specification:</span>
                <span className="text-[11px] font-mono text-gray-200">
                  {selectedSensor.pipelineDiameter}
                </span>
              </div>
            </div>

            <p className="text-[10px] leading-relaxed text-[#9ab3c4]">
              {selectedSensor.description}
            </p>

            {(selectedSensor.status === 'warning' || selectedSensor.status === 'critical') && (
              <div className={`p-2 rounded-xl flex items-center justify-between border ${
                selectedSensor.status === 'critical' ? 'bg-rose-950/50 border-rose-500/50' : 'bg-amber-950/40 border-amber-500/40'
              }`}>
                <div className={`flex items-center space-x-1.5 text-[11px] font-semibold ${
                  selectedSensor.status === 'critical' ? 'text-rose-300' : 'text-amber-300'
                }`}>
                  <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${
                    selectedSensor.status === 'critical' ? 'text-rose-400' : 'text-amber-400'
                  }`} />
                  <span>{selectedSensor.status === 'critical' ? 'Critical Cavitation Spike!' : 'Cavitation Anomaly Flagged'}</span>
                </div>
                {onNavigateIncident && (
                  <button
                    onClick={onNavigateIncident}
                    className={`px-2 py-0.5 rounded-lg text-black font-bold text-[10px] cursor-pointer ${
                      selectedSensor.status === 'critical' ? 'bg-[#ff4d6d] hover:bg-[#ff3358] text-white' : 'bg-amber-500 hover:bg-amber-400'
                    }`}
                  >
                    Inspect
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
