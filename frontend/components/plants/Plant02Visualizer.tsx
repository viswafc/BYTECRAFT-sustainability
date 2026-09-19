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
  Minus
} from 'lucide-react';

export interface Plant2Sensor {
  id: string;
  code: string;
  name: string;
  type: 'flow' | 'pressure' | 'acoustic' | 'tank' | 'vibration' | 'temperature' | 'quality';
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

export const PLANT_02_SENSORS: Plant2Sensor[] = [
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
    value: '48.6 kHz',
    unit: 'kHz',
    status: 'warning',
    nominalRange: '10 - 25 kHz (Spike Alert!)',
    description: 'Flagged 48.6 kHz cavitation resonance due to modulating bypass valve BV-202 stuck at 42% aperture.'
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
    value: '1.85 Bar (ΔP)',
    unit: 'Bar',
    status: 'warning',
    nominalRange: '0.6 - 1.2 Bar',
    description: 'High differential pressure drop across tube sheet indicates localized fouling and bypass throttling.'
  },
  {
    id: 'SEN-TS-202',
    code: 'TS-202',
    name: 'Cooling Towers CT-201/202 Basin Temperature Probe',
    type: 'temperature',
    pipeline: 'Cooling Tower Circulation Loop (Line 5)',
    pipelineDiameter: 'DN350 Low-Pressure',
    stationDistanceMeters: 740,
    coordinates: { x: 1320, y: 320 },
    labelOffset: { x: -45, y: -48 },
    value: '31.8 °C',
    unit: '°C',
    status: 'nominal',
    nominalRange: '26 - 34 °C',
    description: 'Monitors recooled industrial basin water temperature before redistribution to processing loops.'
  },
  {
    id: 'SEN-FS-203',
    code: 'FS-203',
    name: 'Steam Condensate Return Electromagnetic Flowmeter',
    type: 'flow',
    pipeline: 'High-Temp Steam Condensate Loop (Line 6)',
    pipelineDiameter: 'DN250 Heavy Wall',
    stationDistanceMeters: 830,
    coordinates: { x: 1040, y: 640 },
    labelOffset: { x: -45, y: 16 },
    value: '495 L/m',
    unit: 'L/m',
    status: 'nominal',
    nominalRange: '420 - 560 L/m',
    description: 'Tracks hot condensate (46.5°C) returning from refinery reboilers and distillation columns.'
  },
  {
    id: 'SEN-WQ-201',
    code: 'WQ-201',
    name: 'Effluent Neutralization Turbidity & pH Analyzer',
    type: 'quality',
    pipeline: 'Chemical Effluent Recycle Header (Line 7)',
    pipelineDiameter: 'DN300 Acid-Resistant HDPE',
    stationDistanceMeters: 920,
    coordinates: { x: 720, y: 720 },
    labelOffset: { x: -45, y: 16 },
    value: '7.3 pH • 4.1 NTU',
    unit: 'pH/NTU',
    status: 'nominal',
    nominalRange: '6.8 - 7.8 pH',
    description: 'Continuous online water quality spectrometry verifying neutral chemistry before wastewater reuse.'
  }
];

interface Plant02VisualizerProps {
  onNavigateIncident?: () => void;
  showLabels?: boolean;
}

export const Plant02Visualizer: React.FC<Plant02VisualizerProps> = ({ 
  onNavigateIncident,
  showLabels = true
}) => {
  const [selectedSensorId, setSelectedSensorId] = useState<string>('SEN-AC-202');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showLocatorLabels, setShowLocatorLabels] = useState<boolean>(showLabels);
  const [isSensorListOpen, setIsSensorListOpen] = useState<boolean>(false);
  const [isInspectorMinimized, setIsInspectorMinimized] = useState<boolean>(false);

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

  const selectedSensor = PLANT_02_SENSORS.find(s => s.id === selectedSensorId) || PLANT_02_SENSORS[0];

  const filteredSensors = PLANT_02_SENSORS.filter(sensor => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'flow') return sensor.type === 'flow';
    if (activeCategory === 'pressure') return sensor.type === 'pressure';
    if (activeCategory === 'acoustic') return sensor.type === 'acoustic';
    if (activeCategory === 'tank') return sensor.type === 'tank';
    if (activeCategory === 'vibration') return sensor.type === 'vibration';
    if (activeCategory === 'temp-qual') return sensor.type === 'temperature' || sensor.type === 'quality';
    return true;
  });

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
    }
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
      {/* Plant 2 Dedicated Quick Toggles (Labels overlay and Sensor Directory toggle) */}
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

        <button
          onClick={() => setIsSensorListOpen(!isSensorListOpen)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5 transition-all cursor-pointer backdrop-blur-md border shadow-md ${
            isSensorListOpen 
              ? 'bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff]/60 shadow-md font-bold' 
              : 'bg-[#091522]/90 border-[#1a3348] text-[#00e5ff] hover:bg-[#102334]'
          }`}
          title="Toggle Pipeline Sensors Drawer"
        >
          <Radio className="w-3 h-3" />
          <span>Sensors ({PLANT_02_SENSORS.length})</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* SVG 3D ISOMETRIC SCHEMATIC: EXPANSIVE INDUSTRIAL PIPELINES & SENSORS   */}
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
          className="w-full h-full object-contain max-h-[92vh]"
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
          {/* Dual Hyperbolic Natural Draft Cooling Towers CT-201 & CT-202 */}
          <g id="cooling-towers-background">
            {/* CT-201 */}
            <path 
              d="M 1240,360 C 1255,290 1265,240 1250,190 L 1315,190 C 1300,240 1310,290 1330,360 Z" 
              fill="url(#p2CoolingTower)" 
              stroke="#2c4d68" 
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
              stroke="#2c4d68" 
              strokeWidth="2" 
            />
            <ellipse cx="1387" cy="190" rx="32" ry="9" fill="#08141f" stroke="#2c4d68" strokeWidth="1.5" />
            <text x="1387" y="385" fill="#7593aa" fontSize="11" fontWeight="bold" textAnchor="middle">
              Cooling Tower CT-202
            </text>
          </g>

          {/* Distillation Columns / Catalytic Fractionators in Background */}
          <g id="distillation-towers">
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

          {/* 3. CLARIFICATION BASIN C-200 (ZONE 1) */}
          <g id="clarifier-c200">
            <ellipse cx="230" cy="640" rx="100" ry="42" fill="#0b1e2c" stroke="#1d435f" strokeWidth="3" />
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

          {/* 4. DUAL BOOSTER PUMP HOUSE P-201A & P-201B (ZONE 2) */}
          <g id="booster-pumps">
            <rect x="470" y="380" width="130" height="95" rx="12" fill="#0b1b28" stroke="#20435f" strokeWidth="2.5" />
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

          {/* 5. SHELL-AND-TUBE EXCHANGER BATTERY HX-201 & HX-202 (ZONE 3) */}
          <g id="exchangers-battery">
            {/* HX-201 */}
            <rect x="930" y="380" width="120" height="55" rx="14" fill="#0a1d2c" stroke="#224765" strokeWidth="2.5" />
            <line x1="950" y1="385" x2="950" y2="430" stroke="#00e5ff" strokeWidth="2" />
            <line x1="975" y1="385" x2="975" y2="430" stroke="#00e5ff" strokeWidth="2" />
            <line x1="1000" y1="385" x2="1000" y2="430" stroke="#00e5ff" strokeWidth="2" />
            <text x="990" y="412" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">HX-201 (Primary)</text>

            {/* HX-202 */}
            <rect x="1060" y="450" width="120" height="55" rx="14" fill="#1c1106" stroke="#f59e0b" strokeWidth="2.5" />
            <line x1="1080" y1="455" x2="1080" y2="500" stroke="#f59e0b" strokeWidth="2" />
            <line x1="1105" y1="455" x2="1105" y2="500" stroke="#f59e0b" strokeWidth="2" />
            <line x1="1130" y1="455" x2="1130" y2="500" stroke="#f59e0b" strokeWidth="2" />
            <text x="1120" y="482" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle">HX-202 (Secondary)</text>
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
            <path d="M 980,480 L 1010,530 L 1120,530 L 1150,480" fill="none" stroke="#f59e0b" strokeWidth="7" strokeLinejoin="round" />
            <path d="M 980,480 L 1010,530 L 1120,530 L 1150,480" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="6 6" className="pipe-flow-slow" strokeLinejoin="round" />

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
            {PLANT_02_SENSORS.map((sensor) => {
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
                    className={isSelected || isWarning ? "animate-ping" : ""} 
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
      {/* SENSOR INSPECTOR CARD (FOCUSED SENSOR HUD AT BOTTOM LEFT - MINIMIZABLE) */}
      {/* --------------------------------------------------------------------- */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-auto max-w-[calc(100vw-2rem)]">
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

            {selectedSensor.status === 'warning' && (
              <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-[11px] text-amber-300 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Cavitation Anomaly Flagged</span>
                </div>
                {onNavigateIncident && (
                  <button
                    onClick={onNavigateIncident}
                    className="px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] cursor-pointer"
                  >
                    Inspect Incident
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* SENSOR DIRECTORY & RADAR LOCATOR (RIGHT SIDE CORNER DOCKED PANEL)    */}
      {/* --------------------------------------------------------------------- */}
      <AnimatePresence>
        {isSensorListOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-28 right-4 md:right-6 z-30 pointer-events-auto w-[330px] max-w-[calc(100vw-2rem)]"
          >
            <div className="p-3.5 rounded-2xl bg-[#091522]/95 backdrop-blur-md border border-[#1b3750] shadow-2xl space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#183149]">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-[#00e5ff]/20 border border-[#00e5ff]/40 flex items-center justify-center text-[#00e5ff]">
                    <Radio className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white font-['Outfit',sans-serif] block">
                      Pipeline Sensors ({filteredSensors.length})
                    </span>
                    <span className="text-[10px] text-[#7fa0b4] font-mono block">
                      Click to locate station
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsSensorListOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#163148] transition-colors cursor-pointer"
                  title="Minimize Panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'flow', label: 'Flow (3)' },
                  { id: 'pressure', label: 'Press (3)' },
                  { id: 'acoustic', label: 'Acoustic (2)' },
                  { id: 'tank', label: 'Level (1)' },
                  { id: 'vibration', label: 'Vibe (1)' },
                  { id: 'temp-qual', label: 'Temp & WQ (3)' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                      activeCategory === tab.id 
                        ? 'bg-[#00e5ff] text-black font-bold' 
                        : 'bg-[#102334] text-[#7fa0b4] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Scrollable Sensor Stations List */}
              <div className="max-h-[260px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {filteredSensors.map(sensor => {
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
                          ? 'bg-[#00e5ff]/15 border-[#00e5ff] shadow-md shadow-[#00e5ff]/10' 
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
                            {sensor.pipeline}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono font-bold text-white block">
                          {sensor.value}
                        </span>
                        <span className={`text-[9px] font-bold ${
                          sensor.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {sensor.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
