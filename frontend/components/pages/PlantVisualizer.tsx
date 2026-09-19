import React, { useState, useEffect, useRef } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { PageId, VisualizerLayer, PlantId, PlantInfo } from '../../types';
import { Plant02Visualizer } from '../plants/Plant02Visualizer';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Box, 
  Layers, 
  Radio, 
  GitCommit, 
  Database, 
  Gauge, 
  Sliders, 
  Droplets, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Minus, 
  Bell, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Wind, 
  X, 
  RefreshCw, 
  Power, 
  RotateCcw, 
  Zap, 
  ZoomIn, 
  ZoomOut,
  Wrench,
  Crosshair
} from 'lucide-react';

interface PlantVisualizerProps {
  onNavigate: (page: PageId) => void;
  selectedSensorIdFromSearch?: string | null;
}

export const PlantVisualizer: React.FC<PlantVisualizerProps> = ({ 
  onNavigate,
  selectedSensorIdFromSearch
}) => {
  const { 
    telemetry, 
    currentPlant, 
    currentPlantId, 
    setCurrentPlantId, 
    plants,
    digitalTwinNodes,
    selectedTwinNodeId,
    setSelectedTwinNodeId,
    isV104Isolated,
    isolateLineB,
    emergencyTriggered,
    leakSimulationMode,
    setLeakSimulationMode,
    resolveIncident,
    isPipelineAutoStopped,
    fleetHealthScore
  } = useTelemetry();

  // Active Layer / View Mode
  const [activeLayer, setActiveLayer] = useState<VisualizerLayer>('3d');
  
  // Plant Selector Dropdown open state
  const [plantDropdownOpen, setPlantDropdownOpen] = useState<boolean>(false);

  // Minimized states for floating boxes to prevent screen clutter and overlap
  const [isAlertsMinimized, setIsAlertsMinimized] = useState<boolean>(true);
  const [isPlantHealthMinimized, setIsPlantHealthMinimized] = useState<boolean>(false);

  // Production Status override state
  const [productionState, setProductionState] = useState<'RUNNING' | 'MAINTENANCE' | 'IDLE' | 'PEAK'>('RUNNING');
  const [loadPercentage, setLoadPercentage] = useState<number>(82);

  // Live Valve Aperture overrides
  const [valve01Aperture, setValve01Aperture] = useState<number>(40);
  const [valve02Aperture, setValve02Aperture] = useState<number>(100);

  // Demo Leak State connected with SCADA simulation mode & safety cutoff
  const [demoLeakActive, setDemoLeakActive] = useState<boolean>(true);
  const isLeakActive = 
    leakSimulationMode !== 'resolved' && 
    leakSimulationMode !== 'none' && 
    !isPipelineAutoStopped && 
    valve01Aperture > 0 && 
    demoLeakActive;

  // Sync auto safety cutoff and resolved restoration
  useEffect(() => {
    if (isPipelineAutoStopped) {
      setValve01Aperture(0);
    } else if (leakSimulationMode === 'resolved') {
      setValve01Aperture(100);
      setDemoLeakActive(false);
    } else if (leakSimulationMode === 'warning_10') {
      setValve01Aperture(75);
      setDemoLeakActive(true);
    }
  }, [isPipelineAutoStopped, leakSimulationMode]);

  // Interactive Pipeline Repair Demo State (Plant 1)
  const [repairingPipeline, setRepairingPipeline] = useState<boolean>(false);
  const [repairProgressText, setRepairProgressText] = useState<string>('');

  const handleFixPipeline = async () => {
    setRepairingPipeline(true);
    setRepairProgressText('Deploying pneumatic composite sleeve clamp...');
    await new Promise(r => setTimeout(r, 600));
    setRepairProgressText('Torquing high-tensile clamp bolts to 180 Nm...');
    await new Promise(r => setTimeout(r, 600));
    setRepairProgressText('Conducting hydrostatic pressure seal test (4.6 bar)...');
    await new Promise(r => setTimeout(r, 600));
    setRepairProgressText('Flange sealed! Restoring nominal fluid flow...');
    await new Promise(r => setTimeout(r, 400));
    await setLeakSimulationMode('resolved');
    setDemoLeakActive(false);
    setValve01Aperture(100);
    setRepairingPipeline(false);
    setRepairProgressText('');
  };

  const handleRetriggerDemoDefect = () => {
    setLeakSimulationMode('critical_blowout');
    setDemoLeakActive(true);
    setValve01Aperture(40);
  };

  // Selected sensor for detailed inspector modal
  const [selectedSensorPin, setSelectedSensorPin] = useState<string | null>(null);

  // VFD Pump RPM override
  const [pumpRpm, setPumpRpm] = useState<number>(1800);

  // Zoom and Pan states for interactive map
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Reset zoom, pan, and selection whenever plant is changed
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedSensorPin(null);
  }, [currentPlantId]);

  // Direct mouse wheel scroll to zoom in and zoom out across all plants
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // If target is inside a scrollable drawer or list, don't zoom map
      if ((e.target as HTMLElement).closest('.overflow-y-auto')) return;
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
    // Prevent starting map pan if clicking on an interactive button, input, or sensor pin
    if ((e.target as HTMLElement).closest('button, input, [role="button"], .interactive-pin')) {
      return;
    }
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

  // Handle incoming search selections
  useEffect(() => {
    if (selectedSensorIdFromSearch) {
      setSelectedSensorPin(selectedSensorIdFromSearch);
    }
  }, [selectedSensorIdFromSearch]);

  // Derived live flow & pressure based on valve apertures & active leakage
  const calculatedFlowIn = Math.round(5230 * (pumpRpm / 1800) * (valve01Aperture / 40));
  const calculatedLeakLoss = isLeakActive ? 480 : 0;
  const calculatedFlowOut = Math.max(0, Math.round(5090 * (valve02Aperture / 100)) - (isLeakActive ? 320 : 0));
  const calculatedPressure = (isLeakActive ? 3.1 : ((4.2 * (valve01Aperture / 40) + (valve02Aperture === 0 ? 0.8 : 0)) / 1.05)).toFixed(1);

  // Live alerts array (dynamically reflecting active leak or containment)
  const alertsList = isLeakActive ? [
    { time: '09:24 AM', message: '🚨 Pipe rupture at S-05: 480 L/h loss in Zone A', severity: 'Critical', color: 'bg-rose-500/30 text-rose-300 border-rose-500 animate-pulse' },
    { time: '09:22 AM', message: 'Severe pressure drop (-1.1 bar) detected at PS-01', severity: 'High', color: 'bg-rose-500/20 text-rose-400 border-rose-500/40' },
    { time: '08:45 AM', message: 'Flow differential warning: FS-01 vs FS-02', severity: 'Warning', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
    { time: '07:30 AM', message: 'Pre-shift plant calibration complete', severity: 'Info', color: 'bg-sky-500/20 text-sky-400 border-sky-500/40' },
  ] : isV104Isolated ? [
    { time: '09:25 AM', message: '✅ S-05 Leak Contained: Valve V-01 isolated (0% aperture)', severity: 'Resolved', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    { time: '09:23 AM', message: 'Line B depressurized safely for technician inspection', severity: 'Info', color: 'bg-sky-500/20 text-sky-400 border-sky-500/40' },
    { time: '07:30 AM', message: 'All systems normal', severity: 'Info', color: 'bg-sky-500/20 text-sky-400 border-sky-500/40' },
  ] : [
    { time: '10:21 AM', message: 'Flow at FS-02 is nominal and steady', severity: 'Info', color: 'bg-sky-500/20 text-sky-400 border-sky-500/40' },
    { time: '09:48 AM', message: 'Pressure steady at 4.2 bar at PS-01', severity: 'Info', color: 'bg-sky-500/20 text-sky-400 border-sky-500/40' },
    { time: '08:15 AM', message: 'Tank level at TL-02 stable at 62%', severity: 'Info', color: 'bg-sky-500/20 text-sky-400 border-sky-500/40' },
    { time: '07:30 AM', message: 'All systems normal', severity: 'Info', color: 'bg-sky-500/20 text-sky-400 border-sky-500/40' },
  ];

  // Sensor Nodes Definition matching reference screenshot
  const sensorPins = [
    {
      id: 'TL-01',
      name: 'Tank Level Sensor',
      code: 'TL-01',
      value: '78 %',
      subtext: '',
      icon: Droplets,
      type: 'tank',
      positionClass: 'top-[31%] left-[23%]',
      status: 'nominal',
      unit: '%',
      numericValue: 78,
      nominalRange: '60% - 90%'
    },
    {
      id: 'FS-01',
      name: 'Flow Sensor',
      code: 'FS-01',
      value: `${calculatedFlowIn.toLocaleString()} L/h`,
      subtext: '',
      icon: Activity,
      type: 'flow',
      positionClass: 'top-[44%] left-[34%]',
      status: 'nominal',
      unit: 'L/h',
      numericValue: calculatedFlowIn,
      nominalRange: '4,800 - 5,600 L/h'
    },
    {
      id: 'RPM-01',
      name: 'Pump RPM Sensor',
      code: 'RPM-01',
      value: `${pumpRpm.toLocaleString()} RPM`,
      subtext: '',
      icon: Gauge,
      type: 'pump',
      positionClass: 'top-[44%] left-[45%]',
      status: 'nominal',
      unit: 'RPM',
      numericValue: pumpRpm,
      nominalRange: '1,600 - 2,100 RPM'
    },
    {
      id: 'VB-01',
      name: 'Vibration Sensor',
      code: 'VB-01',
      value: '0.9 mm/s',
      subtext: '',
      icon: Zap,
      type: 'vibration',
      positionClass: 'top-[53%] left-[45%]',
      status: 'nominal',
      unit: 'mm/s',
      numericValue: 0.9,
      nominalRange: '0.2 - 1.8 mm/s'
    },
    {
      id: 'PS-01',
      name: 'Pressure Sensor',
      code: 'PS-01',
      value: `${calculatedPressure} bar`,
      subtext: '',
      icon: Gauge,
      type: 'pressure',
      positionClass: 'top-[49%] left-[56%]',
      status: isLeakActive ? 'critical' : 'nominal',
      unit: 'bar',
      numericValue: parseFloat(calculatedPressure),
      nominalRange: '3.8 - 4.6 bar'
    },
    {
      id: 'V-01',
      name: 'Valve Sensor',
      code: 'V-01',
      value: `${valve01Aperture} % Open`,
      subtext: '',
      icon: Sliders,
      type: 'valve',
      positionClass: 'top-[53%] left-[66%]',
      status: valve01Aperture === 0 ? 'warning' : 'nominal',
      unit: '% Aperture',
      numericValue: valve01Aperture,
      nominalRange: '20% - 100%'
    },
    {
      id: 'FS-02-PRESSURE',
      name: 'Flow Sensor',
      code: 'FS-02',
      value: isLeakActive ? '2.8 bar' : '3.8 bar',
      subtext: '',
      icon: Droplets,
      type: 'flow',
      positionClass: 'top-[37%] left-[75%]',
      status: isLeakActive ? 'warning' : 'nominal',
      unit: 'bar',
      numericValue: isLeakActive ? 2.8 : 3.8,
      nominalRange: '3.2 - 4.2 bar'
    },
    {
      id: 'V-02',
      name: 'Valve Sensor',
      code: 'V-02',
      value: `${valve02Aperture} % Open`,
      subtext: '',
      icon: Sliders,
      type: 'valve',
      positionClass: 'top-[72%] left-[78%]',
      status: valve02Aperture === 0 ? 'critical' : 'nominal',
      unit: '% Aperture',
      numericValue: valve02Aperture,
      nominalRange: '80% - 100%'
    },
    {
      id: 'FS-03',
      name: 'Flow Sensor',
      code: 'FS-02',
      value: `${calculatedFlowOut.toLocaleString()} L/h`,
      subtext: '',
      icon: Activity,
      type: 'flow',
      positionClass: 'top-[48%] left-[84%]',
      status: isLeakActive ? 'warning' : 'nominal',
      unit: 'L/h',
      numericValue: calculatedFlowOut,
      nominalRange: '4,800 - 5,300 L/h'
    },
    {
      id: 'TL-02',
      name: 'Tank Level Sensor',
      code: 'TL-02',
      value: '62 %',
      subtext: '',
      icon: Droplets,
      type: 'tank',
      positionClass: 'top-[58%] left-[93%]',
      status: 'nominal',
      unit: '%',
      numericValue: 62,
      nominalRange: '40% - 85%'
    },
    ...(isLeakActive ? [{
      id: 'LEAK-S05',
      name: 'Pipe Breach Sensor',
      code: 'LEAK-S05',
      value: '480 L/h Loss',
      subtext: 'Segment S-05 Rupture',
      icon: AlertTriangle,
      type: 'flow',
      positionClass: 'top-[42%] left-[61%]',
      status: 'critical',
      unit: 'L/h',
      numericValue: 480,
      nominalRange: '0 L/h (Zero Loss)'
    }] : []),
  ];

  // Filter pins based on active layer - SEPARATING SENSORS BY CATEGORY
  const filteredSensorPins = sensorPins.filter(pin => {
    if (activeLayer === '3d' || activeLayer === 'sensor-map' || activeLayer === 'zones') return true;
    if (activeLayer === 'tanks') return pin.type === 'tank';
    if (activeLayer === 'pumps') return pin.type === 'pump' || pin.type === 'vibration';
    if (activeLayer === 'valves') return pin.type === 'valve';
    if (activeLayer === 'pipelines') return pin.type === 'flow' || pin.type === 'pressure';
    return false;
  });

  const selectedPinData = sensorPins.find(p => p.id === selectedSensorPin);

  return (
    <div className="relative w-full h-[calc(100vh-72px)] bg-[#070e17] overflow-hidden select-none flex flex-col font-['Inter',sans-serif]">
      
      {/* ========================================================================= */}
      {/* 1. TOP TITLE ROW & CENTER FLOATING PRODUCTION STATUS BADGE               */}
      {/* ========================================================================= */}
      <div className="absolute top-4 left-6 right-6 z-30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pointer-events-none">
        
        {/* Left Title with Dynamic Active Plant Info */}
        <div className="pointer-events-auto bg-[#070e17]/80 backdrop-blur-sm p-2 rounded-2xl border border-transparent">
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-['Outfit',sans-serif]">
              {currentPlant?.name || 'Industrial Plant'}
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#ff4d6d]/20 text-[#ff4d6d] border border-[#ff4d6d]/40">
              {currentPlant?.code || 'PLANT-01'}
            </span>
          </div>
          <p className="text-xs text-[#879ea9] mt-0.5 font-medium tracking-wide">
            {currentPlant?.location || 'Industrial Area'} • Real-time Digital Twin SCADA
          </p>
        </div>

        {/* Center Plant Quick Switch Bar */}
        <div className="pointer-events-auto flex items-center p-1 rounded-2xl bg-[#0b1622]/90 backdrop-blur-md border border-[#1b344a] shadow-xl">
          {plants.map((plant: PlantInfo) => {
            const isSelected = currentPlantId === plant.id;
            return (
              <button
                key={plant.id}
                onClick={() => setCurrentPlantId(plant.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-[#ff4d6d] text-white shadow-lg shadow-[#ff4d6d]/40'
                    : 'text-[#829db0] hover:text-white hover:bg-[#152a3d]'
                }`}
              >
                <span>{plant.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Right Section: Minimizable Plant Health & Quick Status Badge */}
        <div className="pointer-events-auto flex items-center space-x-2 self-end md:self-auto">
          {/* Production Status Badge */}
          <div className={`flex items-center backdrop-blur-md border px-3 py-1.5 rounded-2xl shadow-xl space-x-2.5 ${
            isLeakActive 
              ? 'bg-[#1a070c]/90 border-[#ff4d6d]/60 shadow-rose-950/50' 
              : 'bg-[#0d1824]/90 border-[#1d354b] shadow-black/40'
          }`}>
            <div className={`w-7 h-7 rounded-xl border flex items-center justify-center ${
              isLeakActive 
                ? 'bg-[#ff4d6d]/20 border-[#ff4d6d] text-[#ff4d6d]' 
                : 'bg-[#00e5ff]/20 border-[#00e5ff]/40 text-[#00e5ff]'
            }`}>
              {isLeakActive ? <AlertTriangle className="w-3.5 h-3.5 animate-bounce" /> : <Building2 className="w-3.5 h-3.5" />}
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-black text-white tracking-wider font-['Outfit',sans-serif]">
                  {isLeakActive ? 'LEAK ALERT' : productionState}
                </span>
                <span className={`w-2 h-2 rounded-full ${
                  isLeakActive ? 'bg-[#ff4d6d] animate-ping' : 'bg-[#10b981] animate-pulse'
                }`} />
              </div>
              <div className="text-[10px] text-[#8aa3b5] font-medium font-mono">
                {isLeakActive ? '480 L/h Bleed' : `${loadPercentage}% Load`}
              </div>
            </div>
          </div>

          {/* TOP RIGHT MINIMIZABLE PLANT HEALTH CARD */}
          {isPlantHealthMinimized ? (
            <button
              onClick={() => setIsPlantHealthMinimized(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#0b1622]/90 hover:bg-[#132637] backdrop-blur-md border border-[#1b344a] shadow-xl text-xs text-white transition-all cursor-pointer group"
              title="Expand Plant Health"
            >
              <div className={`w-2 h-2 rounded-full ${isLeakActive ? 'bg-[#ff4d6d] animate-ping' : 'bg-[#10b981] animate-pulse'}`} />
              <span className="font-bold text-gray-200 group-hover:text-white font-['Outfit',sans-serif]">Health</span>
              <span className={`font-mono font-bold ${isLeakActive ? 'text-[#ff4d6d]' : 'text-[#00e5ff]'}`}>
                {isLeakActive ? '82%' : '98%'}
              </span>
              <ChevronDown className="w-3 h-3 text-[#7893a6] group-hover:text-white" />
            </button>
          ) : (
            <div className="w-56 p-2.5 rounded-2xl bg-[#0b1622]/95 backdrop-blur-md border border-[#1b344a] shadow-2xl">
              <div className="flex items-center justify-between pb-1 border-b border-[#162d40]">
                <div className="flex items-center space-x-1.5">
                  <h2 className="text-xs font-bold text-white font-['Outfit',sans-serif]">
                    Plant Health
                  </h2>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isLeakActive ? 'bg-[#ff4d6d] animate-ping' : 'bg-[#10b981] animate-pulse'
                  }`} />
                </div>
                <div className="flex items-center space-x-1">
                  <span className={`text-[9px] font-semibold ${isLeakActive ? 'text-[#ff4d6d]' : 'text-[#10b981]'}`}>
                    {isLeakActive ? 'Alert' : 'Nominal'}
                  </span>
                  <button
                    onClick={() => setIsPlantHealthMinimized(true)}
                    className="p-1 rounded-md text-[#7893a6] hover:text-white hover:bg-[#162d40] transition-colors cursor-pointer ml-1"
                    title="Minimize Plant Health"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 my-1.5">
                <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#122739" strokeWidth="10" fill="none" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      stroke={isLeakActive ? '#ff4d6d' : '#00e5ff'} 
                      strokeWidth="10" 
                      strokeDasharray="251.2" 
                      strokeDashoffset={isLeakActive ? '45' : '5'} 
                      strokeLinecap="round" 
                      fill="none" 
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-white font-['Outfit',sans-serif]">
                    {isLeakActive ? '82%' : '98%'}
                  </span>
                </div>

                <div className="flex-1 space-y-0.5 text-[9px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#7f99ab]">Flow In:</span>
                    <span className="font-mono font-bold text-[#10b981]">{calculatedFlowIn.toLocaleString()} L/h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#7f99ab]">Flow Out:</span>
                    <span className="font-mono font-bold text-[#10b981]">{calculatedFlowOut.toLocaleString()} L/h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#7f99ab]">{isLeakActive ? 'Loss:' : 'Press:'}</span>
                    <span className={`font-mono font-bold ${isLeakActive ? 'text-[#ff4d6d]' : 'text-[#00e5ff]'}`}>
                      {isLeakActive ? '-480 L/h' : `${calculatedPressure} bar`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. LEFT FLOATING CONTROLS & MODE SELECTOR                                */}
      {/* ========================================================================= */}
      {currentPlantId === 'plant-01' && (
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
                  {currentPlant?.shortName || currentPlant?.name || 'Plant 1'}
                </div>
                <div className="text-[10px] text-[#7893a6] leading-tight truncate">
                  {currentPlant?.facilityType || 'Production Unit'}
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
                {plants.map((plant: PlantInfo) => (
                  <button
                    key={plant.id}
                    onClick={() => {
                      setCurrentPlantId(plant.id);
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
            { id: '3d' as VisualizerLayer, label: '3D View', count: sensorPins.length, icon: Box },
            { id: 'sensor-map' as VisualizerLayer, label: 'Sensor Map', count: sensorPins.length, icon: Radio },
            { id: 'zones' as VisualizerLayer, label: 'Zones', count: 2, icon: Layers },
            { id: 'pipelines' as VisualizerLayer, label: 'Pipelines', count: sensorPins.filter(p => p.type === 'flow' || p.type === 'pressure').length, icon: GitCommit },
            { id: 'tanks' as VisualizerLayer, label: 'Tanks', count: sensorPins.filter(p => p.type === 'tank').length, icon: Database },
            { id: 'pumps' as VisualizerLayer, label: 'Pumps', count: sensorPins.filter(p => p.type === 'pump' || p.type === 'vibration').length, icon: Gauge },
            { id: 'valves' as VisualizerLayer, label: 'Valves', count: sensorPins.filter(p => p.type === 'valve').length, icon: Sliders },
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

        {/* SCADA LEAK SIMULATION & SAFETY CUTOFF INTERACTIVE CONTROLS */}
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
              onClick={() => resolveIncident()}
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
              <span className="text-[9px] font-mono">380 L/m</span>
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
              className="absolute top-0 left-[200px] z-30 w-80 p-3.5 rounded-2xl bg-[#09131e]/95 backdrop-blur-md border border-[#1d374e] shadow-2xl pointer-events-auto space-y-2.5 max-h-[calc(100vh-140px)] overflow-y-auto"
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
                    {activeLayer === 'sensor-map' && 'All Sensors (10)'}
                    {activeLayer === 'zones' && 'Zone Sensors (A & B)'}
                  </span>
                </div>
                <button
                  onClick={() => setActiveLayer('3d')}
                  className="text-[#6c8699] hover:text-white text-[11px] px-2 py-0.5 rounded hover:bg-[#152737] cursor-pointer"
                >
                  ✕ 3D View
                </button>
              </div>

              {/* VALVES: Individual Valve Sensors & Direct Aperture Controls */}
              {activeLayer === 'valves' && (
                <div className="space-y-3">
                  {/* Valve V-01 */}
                  <div className="p-3 rounded-xl bg-[#0c1a26] border border-[#1c364c] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <Sliders className="w-3.5 h-3.5 text-[#ff4d6d]" />
                          <span>V-01: Control Valve</span>
                        </div>
                        <div className="text-[10px] text-[#718d9f]">Zone A Upstream Isolation Point</div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#ff4d6d] bg-[#ff4d6d]/10 px-2 py-0.5 rounded border border-[#ff4d6d]/30">
                        {valve01Aperture}% Open
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-[#8aa1b1] mb-1 font-medium">
                        <span>Aperture Setting:</span>
                        <span className="font-mono">{valve01Aperture}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={valve01Aperture}
                        onChange={(e) => setValve01Aperture(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-[#172d3f] rounded-lg appearance-none cursor-pointer accent-[#ff4d6d]"
                      />
                      <div className="flex justify-between text-[9px] text-[#5d7789] mt-0.5 font-mono">
                        <span>0% (Shut)</span>
                        <span>40% (Nominal)</span>
                        <span>100% (Full)</span>
                      </div>
                    </div>

                    <div className="flex space-x-1.5 pt-0.5">
                      <button
                        onClick={() => {
                          setValve01Aperture(0);
                          isolateLineB(true);
                        }}
                        className="flex-1 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-bold border border-rose-500/40 cursor-pointer"
                      >
                        ⚡ Emergency Shut (0%)
                      </button>
                      <button
                        onClick={() => {
                          setValve01Aperture(40);
                          isolateLineB(false);
                        }}
                        className="flex-1 py-1 rounded-lg bg-[#1a3348] hover:bg-[#23425e] text-white text-[10px] font-bold cursor-pointer"
                      >
                        Reset (40%)
                      </button>
                    </div>
                  </div>

                  {/* Valve V-02 */}
                  <div className="p-3 rounded-xl bg-[#0c1a26] border border-[#1c364c] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <Sliders className="w-3.5 h-3.5 text-[#00e5ff]" />
                          <span>V-02: Discharge Valve</span>
                        </div>
                        <div className="text-[10px] text-[#718d9f]">Zone B Effluent Regulation</div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#00e5ff] bg-[#00e5ff]/10 px-2 py-0.5 rounded border border-[#00e5ff]/30">
                        {valve02Aperture}% Open
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-[#8aa1b1] mb-1 font-medium">
                        <span>Aperture Setting:</span>
                        <span className="font-mono">{valve02Aperture}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={valve02Aperture}
                        onChange={(e) => setValve02Aperture(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-[#172d3f] rounded-lg appearance-none cursor-pointer accent-[#00e5ff]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PUMPS: Individual Pump RPM & Vibration Transducer */}
              {activeLayer === 'pumps' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#0c1a26] border border-[#1c364c] space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <Gauge className="w-3.5 h-3.5 text-[#00e5ff]" />
                          <span>RPM-01: Booster Pump VFD</span>
                        </div>
                        <div className="text-[10px] text-[#718d9f]">Motor Variable Frequency Drive</div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#00e5ff] bg-[#00e5ff]/10 px-2 py-0.5 rounded border border-[#00e5ff]/30">
                        {pumpRpm} RPM
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1200"
                      max="2400"
                      step="50"
                      value={pumpRpm}
                      onChange={(e) => setPumpRpm(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#172d3f] rounded-lg appearance-none cursor-pointer accent-[#00e5ff]"
                    />
                    <div className="flex justify-between text-[9px] text-[#5d7789] font-mono">
                      <span>1,200 RPM</span>
                      <span>1,800 (Rated)</span>
                      <span>2,400 RPM</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => setSelectedSensorPin('VB-01')}
                    className="p-3 rounded-xl bg-[#0c1a26] border border-[#1c364c] hover:border-[#00e5ff] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <Activity className="w-3.5 h-3.5 text-[#10b981]" />
                        <span>VB-01: Vibration Transducer</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#10b981]">0.9 mm/s</span>
                    </div>
                    <div className="text-[10px] text-[#718d9f] mt-1">Status: Nominal (ISO 10816 Zone A)</div>
                  </div>
                </div>
              )}

              {/* TANKS: TL-01 & TL-02 */}
              {activeLayer === 'tanks' && (
                <div className="space-y-3">
                  <div 
                    onClick={() => setSelectedSensorPin('TL-01')}
                    className="p-3 rounded-xl bg-[#0c1a26] border border-[#1c364c] hover:border-[#00e5ff] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <Droplets className="w-3.5 h-3.5 text-[#00e5ff]" />
                        <span>TL-01: Raw Water Tank</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#00e5ff]">78 %</span>
                    </div>
                    <div className="w-full bg-[#132737] h-2 rounded-full mt-2 overflow-hidden">
                      <div className="bg-[#00e5ff] h-full rounded-full" style={{ width: '78%' }} />
                    </div>
                    <div className="flex justify-between text-[9px] text-[#718d9f] mt-1">
                      <span>Capacity: 500 m³</span>
                      <span>Volume: 390 m³</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => setSelectedSensorPin('TL-02')}
                    className="p-3 rounded-xl bg-[#0c1a26] border border-[#1c364c] hover:border-[#00e5ff] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <Droplets className="w-3.5 h-3.5 text-[#00e5ff]" />
                        <span>TL-02: Treated Water Tank</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#00e5ff]">62 %</span>
                    </div>
                    <div className="w-full bg-[#132737] h-2 rounded-full mt-2 overflow-hidden">
                      <div className="bg-[#00e5ff] h-full rounded-full" style={{ width: '62%' }} />
                    </div>
                    <div className="flex justify-between text-[9px] text-[#718d9f] mt-1">
                      <span>Capacity: 450 m³</span>
                      <span>Volume: 279 m³</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PIPELINES: Separate Flow & Pressure Sensors + Active Rupture */}
              {activeLayer === 'pipelines' && (
                <div className="space-y-2">
                  {isLeakActive && (
                    <div className="p-2.5 rounded-xl bg-rose-950/50 border border-[#ff1744] space-y-1.5 animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-[#ff4d6d] flex items-center space-x-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>S-05 Active Rupture</span>
                        </div>
                        <span className="text-xs font-mono font-black text-[#ff1744]">-480 L/h</span>
                      </div>
                      <div className="text-[10px] text-rose-200/80">Zone A High-Pressure Main Breach</div>
                      <button
                        onClick={() => {
                          setValve01Aperture(0);
                          isolateLineB(true);
                        }}
                        className="w-full py-1 rounded-lg bg-[#ff1744] hover:bg-[#d50000] text-white text-[10px] font-bold cursor-pointer transition-all"
                      >
                        ⚡ Emergency Isolate Valve V-01
                      </button>
                    </div>
                  )}

                  {sensorPins.filter(p => p.type === 'flow' || p.type === 'pressure').map(pin => (
                    <div
                      key={pin.id}
                      onClick={() => setSelectedSensorPin(pin.id)}
                      className="p-2.5 rounded-xl bg-[#0c1a26] border border-[#1c364c] hover:border-[#00e5ff] cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{pin.code}: {pin.name}</div>
                        <div className="text-[10px] text-[#718d9f]">{pin.nominalRange}</div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#00e5ff]">{pin.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* SENSOR MAP or ZONES: All sensors grouped */}
              {(activeLayer === 'sensor-map' || activeLayer === 'zones') && (
                <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                  {sensorPins.map(pin => (
                    <div
                      key={pin.id}
                      onClick={() => setSelectedSensorPin(pin.id)}
                      className="p-2 rounded-xl bg-[#0c1a26] border border-[#1c364c] hover:border-[#ff4d6d] cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          pin.status === 'critical' ? 'bg-[#ff1744]' : pin.status === 'warning' ? 'bg-amber-400' : 'bg-[#10b981]'
                        }`} />
                        <div>
                          <div className="text-xs font-bold text-white">{pin.code}</div>
                          <div className="text-[10px] text-[#718d9f]">{pin.name}</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-white">{pin.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. BOTTOM LEFT "LIVE ALERTS" FLOATING CARD (FOR PLANT 1)                  */}
      {/* ========================================================================= */}
      {currentPlantId === 'plant-01' && (
        isAlertsMinimized ? (
          <div className="absolute bottom-4 left-4 z-30 pointer-events-auto">
            <button
              onClick={() => setIsAlertsMinimized(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#0b1622]/90 hover:bg-[#122332] backdrop-blur-md border border-[#1a3348] shadow-lg text-white transition-all cursor-pointer group"
              title="Expand Live Alerts"
              aria-label="Expand Live Alerts"
            >
              <div className="w-4 h-4 rounded-md bg-[#ff4d6d]/20 flex items-center justify-center text-[#ff4d6d]">
                <Bell className="w-2.5 h-2.5" />
              </div>
              <span className="text-[10px] font-bold text-gray-200 group-hover:text-white font-['Outfit',sans-serif]">Live Alerts</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#ff4d6d]/20 text-[#ff4d6d] font-mono font-bold">
                {alertsList.length}
              </span>
              <ChevronUp className="w-3 h-3 text-[#7893a6] group-hover:text-white ml-0.5" />
            </button>
          </div>
        ) : (
          <div className="absolute bottom-4 left-4 z-30 pointer-events-auto w-[280px] sm:w-[310px] max-w-[calc(100vw-2rem)]">
            <div className="p-2.5 rounded-2xl bg-[#0b1622]/95 backdrop-blur-md border border-[#1a3348] shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-[#182e42]/80">
                <div className="flex items-center space-x-1.5">
                  <div className="w-5 h-5 rounded-md bg-[#ff4d6d]/20 flex items-center justify-center text-[#ff4d6d]">
                    <Bell className="w-3 h-3" />
                  </div>
                  <span className="text-[11px] font-bold text-white tracking-wide font-['Outfit',sans-serif]">Live Alerts</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#ff4d6d]/15 text-[#ff4d6d] font-mono font-bold">
                    {alertsList.length}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => onNavigate('incidents')}
                    className="text-[10px] font-semibold text-[#8ca4b5] hover:text-[#ff4d6d] flex items-center space-x-0.5 transition-colors cursor-pointer px-1 py-0.5"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={() => setIsAlertsMinimized(true)}
                    className="p-1 rounded-md text-[#7893a6] hover:text-white hover:bg-[#142839] transition-colors cursor-pointer"
                    title="Minimize Live Alerts"
                    aria-label="Minimize Live Alerts"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Alert List Rows */}
              <div className="pt-1.5 space-y-1">
                {alertsList.map((alert, idx) => (
                  <div 
                    key={idx}
                    onClick={() => onNavigate('incidents')}
                    className="flex items-center justify-between text-[10px] py-1 hover:bg-[#122332]/60 px-1.5 rounded-lg transition-colors cursor-pointer gap-1.5"
                  >
                    <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                      <span className="text-[9px] font-mono text-[#7691a3] shrink-0">{alert.time}</span>
                      <span className="text-gray-200 truncate text-[10px]">{alert.message}</span>
                    </div>
                    <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold border shrink-0 ${alert.color}`}>
                      {alert.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}

      {/* ========================================================================= */}
      {/* 4. CENTER 3D INDUSTRIAL ISOMETRIC PLANT SCHEMATIC (INTERACTIVE SVG)       */}
      {/* ========================================================================= */}
      {currentPlantId === 'plant-02' ? (
        <Plant02Visualizer 
          onNavigateIncident={() => onNavigate('incident-center')} 
          currentPlantId={currentPlantId}
          onPlantChange={setCurrentPlantId}
          plants={plants}
        />
      ) : (
        <div 
          ref={mapContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
        
        {/* Isometric Grid Background Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#15293d_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none" />

        {/* Ambient Ground Lighting for Night Industrial Atmosphere */}
        <div className="absolute top-[28%] left-[16%] w-72 h-72 bg-[#00e5ff]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[48%] left-[50%] w-96 h-96 bg-[#ff4d6d]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[35%] right-[15%] w-80 h-80 bg-[#00e5ff]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Zoomed & Panned Content Wrapper */}
        <div 
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.08s ease-out'
          }}
          className="relative w-full h-full flex items-center justify-center pointer-events-none"
        >
          {/* Realistic High-Fidelity Isometric Plant SVG Graphics */}
        <svg 
          viewBox="0 0 1600 900" 
          className="w-full h-full object-contain pointer-events-auto select-none"
        >
          <defs>
            {/* Cylindrical Tank Linear Gradients */}
            <linearGradient id="rawTankGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0f2233" />
              <stop offset="35%" stopColor="#1e3f5c" />
              <stop offset="70%" stopColor="#142c42" />
              <stop offset="100%" stopColor="#0c1d2c" />
            </linearGradient>

            <linearGradient id="treatedTankGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#122a3d" />
              <stop offset="40%" stopColor="#224c6d" />
              <stop offset="75%" stopColor="#17354c" />
              <stop offset="100%" stopColor="#0d2030" />
            </linearGradient>

            {/* Glowing Water in Tanks */}
            <linearGradient id="tankWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#0099ff" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#0055ff" stopOpacity="0.9" />
            </linearGradient>

            {/* Heavy Industrial Pipe Metallic Gradient */}
            <linearGradient id="pipeMetallicGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#678396" />
              <stop offset="25%" stopColor="#a9c2d3" />
              <stop offset="50%" stopColor="#41596c" />
              <stop offset="85%" stopColor="#1a2d3b" />
              <stop offset="100%" stopColor="#0f1b24" />
            </linearGradient>

            {/* Glowing Liquid Flow Interior Core */}
            <linearGradient id="pipeLiquidCore" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="50%" stopColor="#4facfe" />
              <stop offset="100%" stopColor="#00f2fe" />
            </linearGradient>

            {/* Building Glass Window Glow */}
            <linearGradient id="windowWarmGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffe49e" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffb347" stopOpacity="0.7" />
            </linearGradient>

            {/* Hyperbolic Cooling Tower Gradient */}
            <linearGradient id="coolingTowerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e3245" />
              <stop offset="50%" stopColor="#425d74" />
              <stop offset="100%" stopColor="#192a3b" />
            </linearGradient>

            {/* Asphalt Ground Platform Shadow */}
            <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#04090e" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#04090e" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ---------------------------------------------------------------- */}
          {/* GROUND PLATFORM & FACTORY ROADWAYS                               */}
          {/* ---------------------------------------------------------------- */}
          <g id="ground-infrastructure">
            {/* Ground Asphalt Slab Base */}
            <polygon 
              points="100,680 780,360 1520,620 840,880" 
              fill="#0d1822" 
              stroke="#1a3145" 
              strokeWidth="2"
            />

            {/* Factory Perimeter Roadway markings */}
            <path 
              d="M 280,720 L 840,480 L 1380,680" 
              stroke="#1e384e" 
              strokeWidth="28" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            {/* Yellow Dash Road Divider */}
            <path 
              d="M 280,720 L 840,480 L 1380,680" 
              stroke="#eab308" 
              strokeWidth="2" 
              strokeDasharray="14 12" 
              fill="none" 
            />

            {/* Ground safety labels */}
            <text x="880" y="630" fill="#587487" fontSize="13" fontWeight="bold" letterSpacing="1.5">
              Pipeline - Zone A
            </text>
            <text x="1090" y="745" fill="#587487" fontSize="13" fontWeight="bold" letterSpacing="1.5">
              Pipeline - Zone B
            </text>

            {/* Factory sign board */}
            <rect x="540" y="630" width="160" height="36" rx="4" fill="#0d1c29" stroke="#1f3d57" strokeWidth="1" />
            <text x="555" y="652" fill="#8ca8bd" fontSize="10" fontWeight="bold" letterSpacing="0.8">
              A CLEANER TOMORROW
            </text>
          </g>

          {/* ---------------------------------------------------------------- */}
          {/* BACKGROUND PRODUCTION FACILITY & COOLING TOWERS                  */}
          {/* ---------------------------------------------------------------- */}
          <g id="production-complex">
            {/* Production Building Main Block */}
            <polygon points="570,390 730,320 880,380 720,450" fill="#132433" stroke="#22425c" strokeWidth="2" />
            <polygon points="570,390 720,450 720,530 570,470" fill="#0c1721" stroke="#22425c" strokeWidth="2" />
            <polygon points="720,450 880,380 880,460 720,530" fill="#182d40" stroke="#22425c" strokeWidth="2" />
            
            {/* Illuminated Building Windows */}
            <polygon points="600,430 690,465 690,500 600,465" fill="url(#windowWarmGlow)" />
            <polygon points="740,475 850,425 850,455 740,505" fill="url(#windowWarmGlow)" />
            
            {/* Building Roof Sign */}
            <text x="635" y="380" fill="#7593aa" fontSize="12" fontWeight="bold">Production Unit</text>

            {/* Hyperbolic Cooling Towers (Dual) */}
            {/* Cooling Tower 1 */}
            <path 
              d="M 980,410 C 995,350 1005,310 995,270 L 1045,270 C 1035,310 1045,350 1060,410 Z" 
              fill="url(#coolingTowerGrad)" 
              stroke="#2c4b66" 
              strokeWidth="1.5" 
            />
            <ellipse cx="1020" cy="270" rx="25" ry="8" fill="#0c1722" stroke="#2c4b66" strokeWidth="1.5" />
            
            {/* Cooling Tower 2 */}
            <path 
              d="M 1065,410 C 1080,350 1090,310 1080,270 L 1130,270 C 1120,310 1130,350 1145,410 Z" 
              fill="url(#coolingTowerGrad)" 
              stroke="#2c4b66" 
              strokeWidth="1.5" 
            />
            <ellipse cx="1105" cy="270" rx="25" ry="8" fill="#0c1722" stroke="#2c4b66" strokeWidth="1.5" />

            <text x="1040" y="435" fill="#7998af" fontSize="13" fontWeight="bold">Cooling System</text>

            {/* Rising Animated Steam Clouds from Cooling Towers */}
            <g className="steam-cloud-1 pointer-events-none">
              <ellipse cx="1020" cy="250" rx="18" ry="10" fill="#ffffff" opacity="0.6" filter="blur(6px)" />
              <ellipse cx="1025" cy="235" rx="24" ry="14" fill="#ffffff" opacity="0.4" filter="blur(8px)" />
            </g>
            <g className="steam-cloud-2 pointer-events-none">
              <ellipse cx="1105" cy="250" rx="19" ry="11" fill="#ffffff" opacity="0.6" filter="blur(6px)" />
              <ellipse cx="1110" cy="230" rx="26" ry="15" fill="#ffffff" opacity="0.4" filter="blur(8px)" />
            </g>
          </g>

          {/* ---------------------------------------------------------------- */}
          {/* LEFT: RAW WATER TANK                                             */}
          {/* ---------------------------------------------------------------- */}
          <g id="raw-water-tank" className="cursor-pointer" onClick={() => setSelectedSensorPin('TL-01')}>
            {/* Shadow beneath tank */}
            <ellipse cx="330" cy="560" rx="120" ry="40" fill="url(#groundShadow)" />

            {/* Main Cylindrical Tank Body */}
            <path 
              d="M 230,370 L 230,520 C 230,555 430,555 430,520 L 430,370 Z" 
              fill="url(#rawTankGrad)" 
              stroke="#2b5070" 
              strokeWidth="2" 
            />
            
            {/* Top Rim */}
            <ellipse cx="330" cy="370" rx="100" ry="32" fill="#1b364d" stroke="#325e83" strokeWidth="2" />
            
            {/* Transparent Water Viewing Window showing Internal Blue Liquid */}
            <path 
              d="M 245,410 L 245,510 C 245,535 415,535 415,510 L 415,410 C 415,435 245,435 245,410 Z" 
              fill="url(#tankWaterGrad)" 
              className="water-surface"
            />
            {/* Water Surface Ellipse */}
            <ellipse cx="330" cy="410" rx="85" ry="24" fill="#00e5ff" opacity="0.75" />

            {/* Reinforced Steel Ribs */}
            <path d="M 230,420 C 230,450 430,450 430,420" fill="none" stroke="#2a4e6d" strokeWidth="3" />
            <path d="M 230,470 C 230,500 430,500 430,470" fill="none" stroke="#2a4e6d" strokeWidth="3" />

            {/* Tank Title Text */}
            <text x="330" y="465" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold" letterSpacing="0.5">
              Raw Water
            </text>
            <text x="330" y="488" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold" letterSpacing="0.5">
              Tank
            </text>
          </g>

          {/* ---------------------------------------------------------------- */}
          {/* PUMPING STATION P-01 (DUAL BLUE INDUSTRIAL PUMPS)                */}
          {/* ---------------------------------------------------------------- */}
          <g id="pump-station" className="cursor-pointer" onClick={() => setSelectedSensorPin('RPM-01')}>
            {/* Pump concrete mounting plinth */}
            <polygon points="510,630 670,560 740,590 580,660" fill="#0f1d28" stroke="#1d374d" strokeWidth="2" />
            <polygon points="510,630 580,660 580,680 510,650" fill="#081017" />
            <polygon points="580,660 740,590 740,610 580,680" fill="#132433" />
            <text x="560" y="670" fill="#83a0b5" fontSize="12" fontWeight="bold">P-01</text>

            {/* Industrial Pump 1 (Left Centrifugal Casing) */}
            <ellipse cx="570" cy="590" rx="30" ry="20" fill="#0277bd" stroke="#00b0ff" strokeWidth="2" />
            <rect x="540" y="560" width="30" height="35" rx="4" fill="#01579b" stroke="#0091ea" strokeWidth="2" />
            {/* Rotating Impeller Hub */}
            <circle cx="570" cy="590" r="10" fill="#01345d" />
            <circle cx="570" cy="590" r="5" fill="#4fc3f7" className="spin-rotor" />

            {/* Industrial Pump 2 (Right Centrifugal Casing) */}
            <ellipse cx="650" cy="555" rx="30" ry="20" fill="#0277bd" stroke="#00b0ff" strokeWidth="2" />
            <rect x="620" y="525" width="30" height="35" rx="4" fill="#01579b" stroke="#0091ea" strokeWidth="2" />
            <circle cx="650" cy="555" r="10" fill="#01345d" />
            <circle cx="650" cy="555" r="5" fill="#4fc3f7" className="spin-rotor" />

            {/* Analog Circular Pressure Dial on Pump */}
            <circle cx="525" cy="520" r="16" fill="#081420" stroke="#90a4ae" strokeWidth="2" />
            <circle cx="525" cy="520" r="12" fill="#ffffff" />
            <line x1="525" y1="520" x2="532" y2="514" stroke="#d32f2f" strokeWidth="2" />
          </g>

          {/* ---------------------------------------------------------------- */}
          {/* INDUSTRIAL PIPING NETWORK WITH ANIMATED FLOW (ZONE A & ZONE B)    */}
          {/* ---------------------------------------------------------------- */}
          <g id="pipelines">
            {/* Intake Pipe from Raw Tank to P-01 */}
            <path 
              d="M 430,520 L 510,555" 
              fill="none" 
              stroke="url(#pipeMetallicGrad)" 
              strokeWidth="24" 
              strokeLinecap="round" 
            />
            {/* Pipe Flow Core */}
            <path 
              d="M 430,520 L 510,555" 
              fill="none" 
              stroke="url(#pipeLiquidCore)" 
              strokeWidth="8" 
              className="pipe-flow-cyan" 
            />

            {/* Main Discharge Pipe from P-01 into Zone A */}
            <path 
              d="M 680,570 L 980,700 L 1180,610 L 1320,670" 
              fill="none" 
              stroke="url(#pipeMetallicGrad)" 
              strokeWidth="26" 
              strokeLinejoin="round" 
            />
            {/* Animated Flow Glow Core */}
            <path 
              d="M 680,570 L 980,700 L 1180,610 L 1320,670" 
              fill="none" 
              stroke="url(#pipeLiquidCore)" 
              strokeWidth="8" 
              strokeLinejoin="round" 
              className="pipe-flow-cyan" 
            />

            {/* Glowing Flow Arrow Heads along pipeline */}
            <g className="flow-arrow-pulse">
              <polygon points="460,535 480,544 465,550" fill="#00f2fe" />
              <polygon points="780,615 800,624 785,630" fill="#00f2fe" />
              <polygon points="880,658 900,667 885,673" fill="#00f2fe" />
              <polygon points="1060,665 1075,658 1065,650" fill="#00f2fe" />
              <polygon points="1230,630 1250,639 1235,645" fill="#00f2fe" />
            </g>

            {/* Analog Pressure Dial PS-01 on Zone A Pipe */}
            <g className="cursor-pointer" onClick={() => setSelectedSensorPin('PS-01')}>
              <line x1="860" y1="650" x2="860" y2="600" stroke="#78909c" strokeWidth="6" />
              <circle cx="860" cy="590" r="16" fill="#081420" stroke="#90a4ae" strokeWidth="2.5" />
              <circle cx="860" cy="590" r="12" fill="#ffffff" />
              <line x1="860" y1="590" x2="868" y2="584" stroke="#d32f2f" strokeWidth="2" />
            </g>

            {/* VALVE 01 (RED HANDWHEEL ON ZONE A) */}
            <g 
              id="valve-01" 
              className="cursor-pointer transition-transform hover:scale-105" 
              onClick={() => setSelectedSensorPin('V-01')}
            >
              <rect x="990" y="650" width="16" height="40" fill="#455a64" stroke="#263238" strokeWidth="1" />
              {/* Red Wheel */}
              <ellipse cx="998" cy="640" rx="20" ry="9" fill="#d32f2f" stroke="#b71c1c" strokeWidth="3" />
              <ellipse cx="998" cy="640" rx="10" ry="4.5" fill="#ef5350" />
            </g>

            {/* -------------------------------------------------------------- */}
            {/* DEMO LEAKAGE VISUALIZATION ON SEGMENT S-05 (ZONE A PIPELINE)    */}
            {/* Coordinates: x=930, y=660                                       */}
            {/* -------------------------------------------------------------- */}
            {isLeakActive ? (
              <g id="demo-leakage-effect" className="cursor-pointer pointer-events-auto" onClick={() => setSelectedSensorPin('LEAK-S05')}>
                {/* 1. Ground Wet Puddle Expansion & Liquid Caustics */}
                <ellipse cx="930" cy="710" rx="65" ry="22" fill="#00e5ff" fillOpacity="0.3" className="animate-pulse" />
                <ellipse cx="930" cy="710" rx="45" ry="14" fill="#0091ea" fillOpacity="0.5" />
                <ellipse cx="928" cy="708" rx="25" ry="8" fill="#80d8ff" fillOpacity="0.75" />
                
                {/* Expanding animated hazard shockwave radar rings */}
                <circle cx="930" cy="660" r="28" fill="none" stroke="#ff1744" strokeWidth="3" className="leak-pulse-ring" />
                <circle cx="930" cy="660" r="48" fill="none" stroke="#ff5252" strokeWidth="2" className="leak-pulse-ring" style={{ animationDelay: '0.5s' }} />
                <circle cx="930" cy="660" r="72" fill="#ff1744" fillOpacity="0.18" className="animate-ping" />

                {/* 2. Pipe Rupture Fracture Hole on Pipe Wall */}
                <ellipse cx="930" cy="660" rx="11" ry="6" fill="#140205" stroke="#ff1744" strokeWidth="3" />
                <circle cx="930" cy="660" r="5" fill="#d50000" className="animate-ping" />
                <circle cx="930" cy="660" r="2.5" fill="#ffffff" />

                {/* 3. High-Pressure Erupting Water Spray Jet Fountain */}
                <g className="water-spray-jet">
                  {/* Broad spraying water fan cone */}
                  <path 
                    d="M 930,660 Q 880,550 830,500 Q 890,535 930,660" 
                    fill="#00e5ff" 
                    opacity="0.9" 
                  />
                  <path 
                    d="M 930,660 Q 955,540 990,495 Q 945,540 930,660" 
                    fill="#80d8ff" 
                    opacity="0.85" 
                  />
                  <path 
                    d="M 930,660 Q 920,520 910,465 Q 935,515 930,660" 
                    fill="#ffffff" 
                    opacity="0.95" 
                  />
                  
                  {/* High pressure jet streams */}
                  <line x1="930" y1="658" x2="840" y2="505" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
                  <line x1="930" y1="658" x2="910" y2="470" stroke="#80d8ff" strokeWidth="4.5" strokeLinecap="round" />
                  <line x1="930" y1="658" x2="980" y2="500" stroke="#00e5ff" strokeWidth="5" strokeLinecap="round" />
                  <line x1="930" y1="658" x2="880" y2="530" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                  <line x1="930" y1="658" x2="950" y2="525" stroke="#4dd0e1" strokeWidth="3" strokeLinecap="round" />
                </g>

                {/* 5. Flashing Warning Beacon Over Rupture */}
                <g transform="translate(930, 600)">
                  <line x1="0" y1="55" x2="0" y2="12" stroke="#ff1744" strokeWidth="2.5" strokeDasharray="3 3" />
                  <circle cx="0" cy="0" r="14" fill="#ff1744" className="animate-ping" />
                  <circle cx="0" cy="0" r="9" fill="#d50000" stroke="#ffffff" strokeWidth="2" />
                  <polygon points="-5,-1 0,-7 5,-1 0,5" fill="#ffffff" />
                </g>
              </g>
            ) : (
              <g id="demo-leakage-contained" className="cursor-pointer pointer-events-auto" onClick={() => setSelectedSensorPin('LEAK-S05')}>
                <circle cx="930" cy="660" r="16" fill="#059669" stroke="#34d399" strokeWidth="2.5" />
                <polyline points="924,660 928,664 937,655" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="850" y="682" width="160" height="24" rx="6" fill="#061e14" stroke="#10b981" strokeWidth="1" />
                <text x="930" y="698" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold">
                  ✓ LEAK CONTAINED
                </text>
              </g>
            )}

            {/* VALVE 02 (RED HANDWHEEL ON ZONE B) */}
            <g 
              id="valve-02" 
              className="cursor-pointer transition-transform hover:scale-105" 
              onClick={() => setSelectedSensorPin('V-02')}
            >
              <line x1="1200" y1="620" x2="1200" y2="760" stroke="url(#pipeMetallicGrad)" strokeWidth="22" />
              <ellipse cx="1200" cy="740" rx="18" ry="8" fill="#d32f2f" stroke="#b71c1c" strokeWidth="3" />
              <ellipse cx="1200" cy="740" rx="8" ry="3.5" fill="#ef5350" />
            </g>
          </g>

          {/* ---------------------------------------------------------------- */}
          {/* RIGHT: TREATED WATER TANK                                        */}
          {/* ---------------------------------------------------------------- */}
          <g id="treated-water-tank" className="cursor-pointer" onClick={() => setSelectedSensorPin('TL-02')}>
            <ellipse cx="1380" cy="720" rx="110" ry="38" fill="url(#groundShadow)" />
            
            {/* Cylindrical Treated Water Tank */}
            <path 
              d="M 1290,560 L 1290,700 C 1290,735 1470,735 1470,700 L 1470,560 Z" 
              fill="url(#treatedTankGrad)" 
              stroke="#2d5272" 
              strokeWidth="2" 
            />
            <ellipse cx="1380" cy="560" rx="90" ry="30" fill="#1b3952" stroke="#336087" strokeWidth="2" />
            
            {/* Water Core Visible Level */}
            <path 
              d="M 1305,620 L 1305,690 C 1305,715 1455,715 1455,690 L 1455,620 C 1455,640 1305,640 1305,620 Z" 
              fill="url(#tankWaterGrad)" 
              className="water-surface" 
            />
            <ellipse cx="1380" cy="620" rx="75" ry="20" fill="#00e5ff" opacity="0.8" />

            {/* Spiral Access Ladder */}
            <path 
              d="M 1450,560 C 1475,610 1475,660 1445,700" 
              fill="none" 
              stroke="#78909c" 
              strokeWidth="4" 
            />

            {/* Tank Title Text */}
            <text x="1380" y="665" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="bold" letterSpacing="0.5">
              Treated Water
            </text>
            <text x="1380" y="686" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="bold" letterSpacing="0.5">
              Tank
            </text>
          </g>

          {/* ---------------------------------------------------------------- */}
          {/* ZONE OVERLAYS (WHEN "ZONES" LAYER IS ACTIVE)                      */}
          {/* ---------------------------------------------------------------- */}
          {activeLayer === 'zones' && (
            <g id="zone-overlays" pointerEvents="none">
              {/* Zone A: Intake & Pressurization */}
              <polygon 
                points="180,620 540,380 940,540 580,780" 
                fill="#00e5ff" 
                fillOpacity="0.1" 
                stroke="#00e5ff" 
                strokeWidth="2.5" 
                strokeDasharray="8 6" 
              />
              <rect x="220" y="610" width="230" height="42" rx="8" fill="#091b29" stroke="#00e5ff" strokeWidth="1.5" />
              <text x="235" y="630" fill="#00e5ff" fontSize="13" fontWeight="900" letterSpacing="0.8">
                ZONE A NETWORK
              </text>
              <text x="235" y="644" fill="#8cb9d1" fontSize="10" fontWeight="600">
                Intake & Pressurization System
              </text>

              {/* Zone B: Distribution & Storage */}
              <polygon 
                points="950,540 1260,390 1520,580 1210,830" 
                fill="#a855f7" 
                fillOpacity="0.1" 
                stroke="#c084fc" 
                strokeWidth="2.5" 
                strokeDasharray="8 6" 
              />
              <rect x="1220" y="740" width="230" height="42" rx="8" fill="#1b122c" stroke="#a855f7" strokeWidth="1.5" />
              <text x="1235" y="760" fill="#c084fc" fontSize="13" fontWeight="900" letterSpacing="0.8">
                ZONE B NETWORK
              </text>
              <text x="1235" y="774" fill="#d8b4fe" fontSize="10" fontWeight="600">
                Distribution & Storage System
              </text>
            </g>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* SENSOR MESH OVERLAYS (WHEN "SENSOR MAP" LAYER IS ACTIVE)          */}
          {/* ---------------------------------------------------------------- */}
          {activeLayer === 'sensor-map' && (
            <g id="sensor-telemetry-mesh" pointerEvents="none">
              <path 
                d="M 330,410 L 510,555 L 610,570 L 860,590 L 930,660 L 998,640 L 1200,740 L 1380,620" 
                fill="none" 
                stroke="#00e5ff" 
                strokeWidth="2" 
                strokeDasharray="6 6" 
                opacity="0.85" 
                className="pipe-flow-cyan" 
              />
              {[
                { cx: 330, cy: 410 },
                { cx: 510, cy: 555 },
                { cx: 610, cy: 570 },
                { cx: 860, cy: 590 },
                { cx: 930, cy: 660 },
                { cx: 998, cy: 640 },
                { cx: 1200, cy: 740 },
                { cx: 1380, cy: 620 }
              ].map((node, i) => (
                <g key={i}>
                  <circle cx={node.cx} cy={node.cy} r="28" fill="#00e5ff" fillOpacity="0.08" stroke="#00e5ff" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx={node.cx} cy={node.cy} r="14" fill="#00e5ff" fillOpacity="0.18" stroke="#00e5ff" strokeWidth="1.5" />
                  <circle cx={node.cx} cy={node.cy} r="4" fill="#ffffff" />
                </g>
              ))}
            </g>
          )}
        </svg>

        {/* ------------------------------------------------------------------ */}
        {/* INTERACTIVE SENSOR HUD CALLOUT PINS (EXACT OVERLAY AS IN IMAGE)     */}
        {/* ------------------------------------------------------------------ */}
        {filteredSensorPins.map((pin) => {
          const Icon = pin.icon;
          const isSelected = selectedSensorPin === pin.id;
          return (
            <motion.div
              key={pin.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedSensorPin(pin.id)}
              className={`absolute ${pin.positionClass} -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer pointer-events-auto group`}
            >
              {/* Glassmorphic Sensor HUD Pin */}
              <div className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-xl backdrop-blur-md shadow-2xl transition-all ${
                isSelected 
                  ? 'bg-[#ff4d6d]/90 text-white border-2 border-white shadow-[#ff4d6d]/50' 
                  : 'bg-[#081520]/90 text-white border border-[#1b344b] hover:border-[#00e5ff] shadow-black/60'
              }`}>
                {/* Cyan Glow Icon */}
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#00e5ff]/20 text-[#00e5ff]'
                }`}>
                  <Icon className="w-3 h-3" />
                </div>

                {/* Sensor Info */}
                <div className="text-left">
                  <div className="text-[10px] text-[#86a1b2] font-medium leading-none">{pin.name}</div>
                  <div className="text-[10px] text-[#718d9f] font-mono leading-none mt-0.5">{pin.code}</div>
                  <div className="text-xs font-bold text-white font-mono leading-tight mt-0.5">{pin.value}</div>
                </div>

                {/* Status Dot */}
                <span className={`w-2 h-2 rounded-full ${
                  pin.status === 'nominal' ? 'bg-[#10b981]' : pin.status === 'warning' ? 'bg-amber-400' : 'bg-[#ff4d6d]'
                } shadow-md animate-pulse`} />
              </div>
            </motion.div>
          );
        })}

        {/* Active Leak Interactive HUD Callout Pin (Defect Identification & Fix Demo) */}
        {isLeakActive && (activeLayer === '3d' || activeLayer === 'pipelines' || activeLayer === 'sensor-map' || activeLayer === 'zones') && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-[64%] left-[58%] -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto"
          >
            <div className="flex flex-col p-3 rounded-2xl bg-[#1a050b]/95 backdrop-blur-md border-2 border-[#ff1744] shadow-[0_0_35px_rgba(255,23,68,0.7)] text-white min-w-[280px]">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#ff1744]/40">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff1744] animate-ping" />
                  <AlertTriangle className="w-4 h-4 text-[#ff1744] animate-bounce" />
                  <span className="text-xs font-black text-[#ff1744] tracking-wider uppercase font-['Outfit',sans-serif]">
                    Defect Identified
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#ff1744]/20 text-[#ff4d6d] font-bold">
                  Station 142m
                </span>
              </div>

              <div className="py-2 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-rose-200/70 text-[11px]">Identified Location:</span>
                  <span className="font-mono font-bold text-white text-[11px]">Flange FLG-305B (Line B)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-rose-200/70 text-[11px]">Acoustic Sensor:</span>
                  <span className="font-mono font-bold text-amber-300">SEN-AC-05 (58.4 kHz)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-rose-200/70 text-[11px]">Loss Rate / Drop:</span>
                  <span className="font-mono font-bold text-rose-300">-480 L/h • 4.2 → 2.8 bar</span>
                </div>
              </div>

              {repairingPipeline ? (
                <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-center space-y-1.5 my-1">
                  <div className="flex items-center justify-center space-x-2 text-cyan-300 text-xs font-bold">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deploying Composite Seal...</span>
                  </div>
                  <p className="text-[10px] font-mono text-cyan-200">{repairProgressText}</p>
                </div>
              ) : (
                <div className="space-y-1.5 pt-1">
                  <button
                    onClick={handleFixPipeline}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black text-xs font-black flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Fix Pipeline Now (Deploy Seal Clamp)</span>
                  </button>
                  <button
                    onClick={() => {
                      setValve01Aperture(0);
                      isolateLineB(true);
                    }}
                    className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#ff1744] to-[#d50000] hover:from-[#ff4569] hover:to-[#ff1744] text-white text-[11px] font-bold flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>⚡ SCADA Isolate Valve V-01</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Repaired / Contained State HUD Pin - Sized and positioned down to keep pipeline fully visible */}
        {!isLeakActive && (activeLayer === '3d' || activeLayer === 'pipelines' || activeLayer === 'sensor-map' || activeLayer === 'zones') && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="absolute top-[82%] sm:top-[84%] left-[58%] -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto"
          >
            <div className="flex flex-col p-2.5 rounded-2xl bg-[#061e14]/95 backdrop-blur-md border border-[#10b981]/80 shadow-2xl text-white space-y-1.5 w-[270px] sm:w-[300px]">
              <div className="flex items-center justify-between pb-1 border-b border-[#0f3824]">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                  <span className="text-[11px] font-bold text-[#34d399] font-['Outfit',sans-serif]">Pipeline Repaired & Sealed</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  Station 142m
                </span>
              </div>
              <p className="text-[9px] text-[#93bba6] font-mono leading-tight">
                Composite sleeve clamp installed • 4.4 bar nominal pressure restored • Zero bleed.
              </p>
              <div className="flex items-center space-x-1.5 pt-0.5">
                <button
                  onClick={handleRetriggerDemoDefect}
                  className="flex-1 py-1 px-2 rounded-xl bg-[#133827] hover:bg-[#1a4a35] text-emerald-200 text-[9px] font-bold flex items-center justify-center space-x-1 cursor-pointer border border-emerald-500/40 transition-colors"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Re-trigger Defect Demo</span>
                </button>
                <button
                  onClick={() => {
                    setValve01Aperture(40);
                    isolateLineB(false);
                  }}
                  className="text-[9px] text-[#8db5a0] hover:text-white bg-[#0e271b] px-2 py-1 rounded-xl cursor-pointer hover:bg-[#153a29] transition-colors"
                >
                  Reset SCADA
                </button>
              </div>
            </div>
          </motion.div>
        )}

        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* 5. BOTTOM RIGHT FLOATING ZOOM & PAN CONTROLS                              */}
      {/* ========================================================================= */}
      <div className="absolute bottom-6 right-6 z-30 pointer-events-auto flex items-center space-x-2">
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-[#0b1622]/90 backdrop-blur-md border border-[#1b344a] shadow-xl text-xs text-white">
          <span className="text-[10px] text-[#7691a3] font-mono hidden sm:inline">Ctrl + Scroll</span>
          <div className="h-3 w-px bg-[#1e384e] mx-1 hidden sm:inline" />
          <button 
            onClick={() => setZoom((z) => Math.max(Math.round((z - 0.15) * 100) / 100, 0.4))}
            className="p-1 rounded-lg hover:bg-[#152a3d] text-[#8ea8bc] hover:text-white transition-colors cursor-pointer"
            title="Zoom Out (or Ctrl + Scroll Down)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] font-bold min-w-[38px] text-center text-[#00e5ff]">
            {Math.round(zoom * 100)}%
          </span>
          <button 
            onClick={() => setZoom((z) => Math.min(Math.round((z + 0.15) * 100) / 100, 3.5))}
            className="p-1 rounded-lg hover:bg-[#152a3d] text-[#8ea8bc] hover:text-white transition-colors cursor-pointer"
            title="Zoom In (or Ctrl + Scroll Up)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {(zoom !== 1 || pan.x !== 0 || pan.y !== 0) && (
            <button 
              onClick={handleResetZoom}
              className="p-1 rounded-lg hover:bg-[#152a3d] text-[#ff4d6d] transition-colors cursor-pointer ml-1"
              title="Reset Zoom & Pan"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. SENSOR / VALVE ACTUATOR INSPECTOR MODAL                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedPinData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 pointer-events-auto"
            onClick={() => setSelectedSensorPin(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#0c1824] border border-[#223e57] rounded-3xl shadow-2xl p-6 text-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#1b344b]">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#ff4d6d]/20 border border-[#ff4d6d]/40 flex items-center justify-center text-[#ff4d6d]">
                    <selectedPinData.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-['Outfit',sans-serif]">{selectedPinData.name}</h3>
                    <span className="text-xs font-mono text-[#7896ab]">{selectedPinData.code} • Plant 1 Facility</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSensorPin(null)}
                  className="p-1.5 rounded-full hover:bg-[#162e44] text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="py-4 space-y-4">
                {/* Live Value Hero */}
                <div className="p-4 rounded-2xl bg-[#070e17] border border-[#1b344b] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#718f9e] uppercase font-bold tracking-wider">Live Telemetry</span>
                    <div className="text-2xl font-black text-[#00e5ff] font-mono mt-0.5">
                      {selectedPinData.value}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#718f9e] uppercase font-bold tracking-wider">Operating Range</span>
                    <div className="text-xs font-mono text-gray-300 mt-0.5">{selectedPinData.nominalRange}</div>
                  </div>
                </div>

                {/* Valve 01 Interactive Actuation Slider */}
                {selectedPinData.id === 'V-01' && (
                  <div className="p-4 rounded-2xl bg-[#142637] border border-[#234563] space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>Valve V-01 Aperture Control</span>
                      <span className="font-mono text-[#00e5ff]">{valve01Aperture}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={valve01Aperture} 
                      onChange={(e) => setValve01Aperture(Number(e.target.value))}
                      className="w-full accent-[#ff4d6d] cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>0% (Closed)</span>
                      <span>40% (Nominal)</span>
                      <span>100% (Full Bore)</span>
                    </div>
                  </div>
                )}

                {/* Valve 02 Interactive Actuation Slider */}
                {selectedPinData.id === 'V-02' && (
                  <div className="p-4 rounded-2xl bg-[#142637] border border-[#234563] space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>Valve V-02 Zone B Aperture</span>
                      <span className="font-mono text-[#00e5ff]">{valve02Aperture}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={valve02Aperture} 
                      onChange={(e) => setValve02Aperture(Number(e.target.value))}
                      className="w-full accent-[#ff4d6d] cursor-pointer"
                    />
                    <div className="flex items-center space-x-2 mt-2">
                      <button 
                        onClick={() => setValve02Aperture(100)}
                        className="flex-1 py-1.5 rounded-lg bg-[#10b981] text-black font-bold text-xs hover:bg-[#20c997] transition-colors"
                      >
                        100% Open
                      </button>
                      <button 
                        onClick={() => setValve02Aperture(0)}
                        className="flex-1 py-1.5 rounded-lg bg-[#ff4d6d] text-white font-bold text-xs hover:bg-[#ff3366] transition-colors"
                      >
                        Isolate (0%)
                      </button>
                    </div>
                  </div>
                )}

                {/* Pump RPM VFD Slider */}
                {(selectedPinData.id === 'RPM-01' || selectedPinData.id === 'VB-01') && (
                  <div className="p-4 rounded-2xl bg-[#142637] border border-[#234563] space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>Booster Pump VFD Setpoint</span>
                      <span className="font-mono text-[#00e5ff]">{pumpRpm} RPM</span>
                    </div>
                    <input 
                      type="range" 
                      min="1200" 
                      max="2400" 
                      step="50"
                      value={pumpRpm} 
                      onChange={(e) => setPumpRpm(Number(e.target.value))}
                      className="w-full accent-[#00e5ff] cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>1,200 (Low Eco)</span>
                      <span>1,800 (Design)</span>
                      <span>2,400 (Peak)</span>
                    </div>
                  </div>
                )}

                {/* Active Leak Incident Control Panel */}
                {selectedPinData.id === 'LEAK-S05' && (
                  <div className="p-4 rounded-2xl bg-[#260810] border border-[#ff4d6d]/60 space-y-3">
                    <div className="flex items-center space-x-2 text-rose-300">
                      <AlertTriangle className="w-5 h-5 text-[#ff4d6d] animate-bounce" />
                      <span className="text-sm font-bold text-white">Active Pipe Breach (Segment S-05)</span>
                    </div>
                    <p className="text-xs text-rose-200/90 leading-relaxed">
                      Severe pressure drop (-1.1 bar) and high fluid loss detected between booster pump P-01 discharge and Valve V-01. Fluid loss rate: <strong>480 L/h</strong>.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                      <button 
                        onClick={() => {
                          isolateLineB(true);
                          setValve01Aperture(0);
                          setSelectedSensorPin(null);
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#ff4d6d] hover:bg-[#ff2d55] text-white font-bold text-xs shadow-lg shadow-[#ff4d6d]/40 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <span>⚡ Isolate Line B (Close V-01)</span>
                      </button>
                      <button 
                        onClick={() => {
                          setDemoLeakActive(false);
                          setSelectedSensorPin(null);
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#172c3d] hover:bg-[#203c53] text-gray-300 text-xs font-semibold cursor-pointer"
                      >
                        Reset Demo
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-[#1b344b] flex items-center justify-between">
                <button
                  onClick={() => onNavigate('live-data')}
                  className="text-xs text-[#00e5ff] hover:underline font-semibold cursor-pointer flex items-center space-x-1"
                >
                  <span>Open Full Waveform Telemetry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setSelectedSensorPin(null)}
                  className="px-4 py-1.5 rounded-xl bg-[#1b3247] hover:bg-[#254562] text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
