import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { PageId } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  FileText,
  X,
  Search,
  Timer,
  Factory,
  TrendingUp,
  Flame,
  ArrowUpRight,
  Sliders,
  ShieldCheck,
  Zap,
  ChevronRight,
  Droplets,
  RotateCcw
} from 'lucide-react';

interface CommandCenterProps {
  onNavigate: (page: PageId) => void;
  onOpenEmergencyModal?: () => void;
  onEmergencyTrigger?: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ 
  onNavigate,
  onOpenEmergencyModal,
  onEmergencyTrigger
}) => {
  const { 
    isV104Isolated,
    isolateLineB,
    leakSimulationMode,
    setLeakSimulationMode,
    resolveIncident,
    isPipelineAutoStopped,
    fleetHealthScore
  } = useTelemetry();

  // Wait Simulator Slider State
  const [sliderIndex, setSliderIndex] = useState<number>(0);

  // Segment Detail Modal State
  const [segmentModalOpen, setSegmentModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<{
    title: string;
    status: string;
    flow: string;
    press: string;
    loss: string;
    isNominal: boolean;
  }>({
    title: 'Breach Segment S05–S06',
    status: 'CRITICAL LEAK',
    flow: '24,440 L/h',
    press: '1.82 bar',
    loss: '2,840 L/h',
    isNominal: false
  });

  // Full Investigation Modal State
  const [investigationModalOpen, setInvestigationModalOpen] = useState<boolean>(false);

  // Time-horizon Simulation Scenarios
  const waitData = [
    { label: "NOW", hours: 0, water: isV104Isolated ? "0 L" : "2,840 L", money: isV104Isolated ? "₹0" : "₹6,816", context: isV104Isolated ? "Valve BV-102 actively closed. Zero unmetered bleed." : "Immediate hydraulic intervention needed. Loss ongoing." },
    { label: "+1 HR", hours: 1, water: isV104Isolated ? "0 L" : "2,840 L", money: isV104Isolated ? "₹0" : "₹6,816", context: isV104Isolated ? "Standby buffer sustained with no factory pressure drop." : "Storage reservoir down 0.4%; secondary cooling starvation starts." },
    { label: "+6 HRS", hours: 6, water: isV104Isolated ? "0 L" : "17,040 L", money: isV104Isolated ? "₹0" : "₹40,896", context: isV104Isolated ? "Automated containment active. Operations stable." : "Underground pipe trench saturating. Machine Bay B throttled." },
    { label: "+12 HRS", hours: 12, water: isV104Isolated ? "0 L" : "34,080 L", money: isV104Isolated ? "₹0" : "₹81,792", context: isV104Isolated ? "SCADA fail-safe protocol prevented all structural damage." : "Production halted on Line B. High-tier municipal surcharge." },
    { label: "+24 HRS", hours: 24, water: isV104Isolated ? "0 L" : "67,200 L", money: isV104Isolated ? "₹0" : "₹1,61,280", context: isV104Isolated ? "Saved ₹1,61,280 and 67,200 Litres of drinking-grade water." : "Critical factory shutdown. Foundation erosion and structural risk." }
  ];

  const currentSim = waitData[sliderIndex];

  const handleOpenSegmentModal = (
    title: string,
    status: string,
    flow: string,
    press: string,
    loss: string,
    isNominal: boolean = false
  ) => {
    setModalData({ title, status, flow, press, loss, isNominal });
    setSegmentModalOpen(true);
  };

  const handleExecuteQuickIsolation = () => {
    isolateLineB(!isV104Isolated);
    setSegmentModalOpen(false);
    setInvestigationModalOpen(false);
  };

  return (
    <div className="py-2 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">

      {/* ================= SCADA SIMULATION & FLEET HEALTH CONTROLLER ================= */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl bg-[#091522]/90 border border-[#1b344b] shadow-xl flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${
            leakSimulationMode === 'resolved' 
              ? 'bg-[#31d48c]/15 text-[#31d48c]' 
              : leakSimulationMode === 'warning_10' 
              ? 'bg-amber-400/15 text-amber-400' 
              : 'bg-rose-500/15 text-rose-400'
          }`}>
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">SCADA Simulation & Emergency Response Hub</h2>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                leakSimulationMode === 'resolved'
                  ? 'bg-[#31d48c]/20 text-[#31d48c] border border-[#31d48c]/40'
                  : leakSimulationMode === 'warning_10'
                  ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}>
                {leakSimulationMode === 'resolved' ? 'Normal Flow (380 L/m)' : leakSimulationMode === 'warning_10' ? '10% Seepage (Running)' : 'Critical Blowout (Auto-Cutoff)'}
              </span>
            </div>
            <p className="text-xs text-[#738fa2]">
              Live SCADA simulator: Toggle between early seepage, high-pressure blowout with automated safety shutoff, or full incident resolution.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 10% Seepage button */}
          <button
            onClick={() => setLeakSimulationMode('warning_10')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              leakSimulationMode === 'warning_10'
                ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/30'
                : 'bg-[#10202e] text-amber-300 hover:bg-[#162c3f] border border-amber-500/30'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>10% Seepage</span>
          </button>

          {/* Critical Blowout button */}
          <button
            onClick={() => setLeakSimulationMode('critical_blowout')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              leakSimulationMode === 'critical_blowout'
                ? 'bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/30'
                : 'bg-[#10202e] text-rose-300 hover:bg-[#162c3f] border border-rose-500/30'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Critical Blowout (&gt;30%)</span>
          </button>

          {/* Resolve Problem & Restore Flow button */}
          <button
            onClick={() => resolveIncident()}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              leakSimulationMode === 'resolved'
                ? 'bg-[#31d48c] text-[#051a12] shadow-lg shadow-[#31d48c]/30'
                : 'bg-[#0f2e24] text-[#31d48c] hover:bg-[#154234] border border-[#31d48c]/50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>✓ Resolve Problem & Restore Flow</span>
          </button>

          {/* Fleet Health Badge */}
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-[#193246]">
            <div className="text-right">
              <div className="text-[10px] text-[#6d8a9e] uppercase font-bold">Fleet Health</div>
              <div className="text-xs font-mono font-bold text-[#31d48c]">{fleetHealthScore}% Nominal</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#31d48c]/15 border border-[#31d48c]/30 flex items-center justify-center text-[#31d48c]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* ================= HERO INCIDENT OVERVIEW (Spacious & Clean Hierarchy) ================= */}
      <motion.section 
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`rounded-2xl p-6 lg:p-7 border transition-colors duration-300 relative overflow-hidden ${
          leakSimulationMode === 'resolved'
            ? 'bg-[#061c16] border-[#31d48c]/60'
            : isPipelineAutoStopped || isV104Isolated 
            ? 'bg-[#091a1e] border-[#31d48c]/50' 
            : 'bg-[#150d14] border-[#ff5b67]/60'
        }`}
      >
        {/* Subtle background ambient glow */}
        <div 
          className={`absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 ${
            leakSimulationMode === 'resolved'
              ? 'bg-[#31d48c]'
              : isPipelineAutoStopped || isV104Isolated 
              ? 'bg-[#31d48c]' 
              : 'bg-[#ff5b67]'
          }`} 
        />

        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                leakSimulationMode === 'resolved'
                  ? 'bg-[#31d48c]/15 text-[#31d48c] border border-[#31d48c]/40'
                  : isPipelineAutoStopped
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : isV104Isolated 
                  ? 'bg-[#31d48c]/15 text-[#31d48c] border border-[#31d48c]/30' 
                  : 'bg-[#ff5b67]/15 text-[#ff5b67] border border-[#ff5b67]/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  leakSimulationMode === 'resolved' 
                    ? 'bg-[#31d48c]' 
                    : isPipelineAutoStopped
                    ? 'bg-rose-500 beacon'
                    : isV104Isolated 
                    ? 'bg-[#31d48c]' 
                    : 'bg-[#ff5b67] beacon'
                }`} />
                {leakSimulationMode === 'resolved'
                  ? 'ALL SENSORS NOMINAL • LINE B FLOW RUNNING'
                  : isPipelineAutoStopped
                  ? 'SCADA AUTOMATIC SAFETY CUTOFF ENGAGED • FLOW HALTED'
                  : isV104Isolated 
                  ? 'VALVE BV-102 CLOSED • BREACH SECURED' 
                  : 'CRITICAL WATER LEAK DETECTED'}
              </span>
              <span className="text-xs font-mono text-[#6c8699]">ID: INC-9821</span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#e6f3fa]">
              {leakSimulationMode === 'resolved' ? (
                <>Line B Restored to <span className="text-[#31d48c]">Normal Operation</span></>
              ) : (
                <>Rupture on <span className="text-[#ff5b67]">Line B</span> at{' '}</>
              )}
              <button 
                onClick={() => handleOpenSegmentModal('Breach Segment S05–S06', leakSimulationMode === 'resolved' ? 'NOMINAL' : isV104Isolated ? 'ISOLATED' : 'CRITICAL LEAK', leakSimulationMode === 'resolved' ? '22,800 L/h' : '24,440 L/h', leakSimulationMode === 'resolved' ? '4.40 bar' : isV104Isolated ? '0.15 bar' : '1.82 bar', leakSimulationMode === 'resolved' ? '0 L/h' : isV104Isolated ? '0 L/h' : '2,840 L/h', leakSimulationMode === 'resolved' || isV104Isolated)}
                className="text-[#28d7ff] underline decoration-[#28d7ff]/40 hover:decoration-[#28d7ff] cursor-pointer inline-flex items-center gap-1 transition-colors ml-1"
              >
                Segment S05–S06
                <ArrowUpRight className="w-4 h-4 opacity-70" />
              </button>
            </h1>
            <p className="text-sm text-[#8ba2b2] max-w-2xl">
              {leakSimulationMode === 'resolved'
                ? 'All acoustic hydrophones report baseline nominal values (14.2 dB). SCADA mass-balance deviation cleared. Normal process fluid flow active at 380 L/min.'
                : isPipelineAutoStopped
                ? 'Automated SCADA safety interlock engaged: leak exceeded 30% critical tolerance. Flow halted to 0 L/min and isolation valves tripped to prevent catastrophic rupture.'
                : 'Acoustic sensors confirmed flange seal collapse under Trench 4. Real-time hydraulic mass-balance discrepancy triggered automatic incident status.'
              }
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setInvestigationModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#0c1c2b] border border-[#23455f] hover:border-[#28d7ff] text-[#e6f3fa] text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <FileText className="w-4 h-4 text-[#28d7ff]" />
              Full Dossier
            </motion.button>

            {leakSimulationMode === 'resolved' ? (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLeakSimulationMode('warning_10')}
                className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-[#102a20] text-[#31d48c] border border-[#31d48c]/40 hover:bg-[#15382b] transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4 text-[#31d48c]" />
                System Running Nominal
              </motion.button>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExecuteQuickIsolation}
                className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                  isV104Isolated
                    ? 'bg-[#31d48c] text-[#051a12] hover:bg-[#3de69b]'
                    : 'bg-[#ff5b67] text-white hover:bg-[#ff6e78]'
                }`}
              >
                {isV104Isolated ? (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Re-Open Valve BV-102
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Isolate Valve BV-102 Now
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>

        {/* 4 Stat Anchor Cards with High-Contrast Typography */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          {/* Card 1 */}
          <div className="bg-[#0b1926]/90 p-4 rounded-xl border border-[#19354b] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#7893a7] text-xs">
              <span>Current Loss Rate</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                leakSimulationMode === 'resolved'
                  ? 'bg-[#31d48c]/15 text-[#31d48c]'
                  : isPipelineAutoStopped
                  ? 'bg-rose-500/20 text-rose-400'
                  : isV104Isolated ? 'bg-[#31d48c]/15 text-[#31d48c]' : 'bg-[#ff5b67]/15 text-[#ff5b67]'
              }`}>
                {leakSimulationMode === 'resolved' ? 'NOMINAL' : isPipelineAutoStopped ? 'AUTO CUTOFF' : isV104Isolated ? 'CONTAINED' : 'UNMETERED'}
              </span>
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold tracking-tight font-mono ${
                leakSimulationMode === 'resolved' || isPipelineAutoStopped || isV104Isolated ? 'text-[#31d48c]' : 'text-[#ff5b67]'
              }`}>
                {leakSimulationMode === 'resolved' || isPipelineAutoStopped || isV104Isolated ? '0' : leakSimulationMode === 'warning_10' ? '284' : '2,840'}
              </span>
              <span className="text-xs font-mono text-[#8ba2b2]">Litres / hr</span>
            </div>
            <p className="text-xs text-[#6e899c]">
              {leakSimulationMode === 'resolved'
                ? 'Line B fluid flow nominal at 380 L/min'
                : isPipelineAutoStopped
                ? 'Safety interlock tripped • flow halted'
                : isV104Isolated ? 'Supply valve closed at 14:26' : 'Flowing into drainage manifold'}
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0b1926]/90 p-4 rounded-xl border border-[#19354b] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#7893a7] text-xs">
              <span>24h Projected Loss</span>
              <span className="text-xs font-mono text-amber-400">VOLUME</span>
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight font-mono text-[#e6f3fa]">
                {leakSimulationMode === 'resolved' || isPipelineAutoStopped || isV104Isolated ? '0' : leakSimulationMode === 'warning_10' ? '6,816' : '67,200'}
              </span>
              <span className="text-xs font-mono text-[#8ba2b2]">Litres</span>
            </div>
            <p className="text-xs text-[#6e899c]">
              {leakSimulationMode === 'resolved' 
                ? 'Zero loss — normal pipeline distribution'
                : isPipelineAutoStopped || isV104Isolated ? 'Loss averted by automated safety cutoff' : 'Equivalent to 8.4 tanker trucks'}
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0b1926]/90 p-4 rounded-xl border border-[#19354b] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#7893a7] text-xs">
              <span>Daily Financial Bleed</span>
              <span className="text-xs font-mono text-[#28d7ff]">PENALTY + WATER</span>
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold tracking-tight font-mono ${
                leakSimulationMode === 'resolved' || isPipelineAutoStopped || isV104Isolated ? 'text-[#31d48c]' : 'text-amber-300'
              }`}>
                {leakSimulationMode === 'resolved' || isPipelineAutoStopped || isV104Isolated ? '₹0' : leakSimulationMode === 'warning_10' ? '₹16,358' : '₹1,61,280'}
              </span>
              <span className="text-xs font-mono text-[#8ba2b2]">/ day</span>
            </div>
            <p className="text-xs text-[#6e899c]">
              {leakSimulationMode === 'resolved' ? 'Zero financial bleed • 100% efficiency' : 'Includes tier-2 municipal tariff surcharges'}
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#0b1926]/90 p-4 rounded-xl border border-[#19354b] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#7893a7] text-xs">
              <span>Required Action</span>
              <span className="text-xs font-mono text-[#28d7ff]">SCADA CMD</span>
            </div>
            <div className="my-2">
              <div className="text-sm font-semibold text-[#e6f3fa]">
                {leakSimulationMode === 'resolved' ? (
                  <span className="text-[#31d48c] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    System Fully Nominal
                  </span>
                ) : isPipelineAutoStopped ? (
                  <span className="text-rose-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Auto Interlock Engaged
                  </span>
                ) : isV104Isolated ? (
                  <span className="text-[#31d48c] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Line B Isolated (Standby)
                  </span>
                ) : (
                  <span>Isolate Valve <span className="text-[#28d7ff] font-mono">BV-102</span></span>
                )}
              </div>
              <p className="text-xs text-[#6e899c] mt-1">
                {leakSimulationMode === 'resolved'
                  ? 'All sensors reporting 100% nominal'
                  : isPipelineAutoStopped
                  ? 'Equipment protected from rupture • click Resolve to restore'
                  : isV104Isolated ? 'Work order #WO-891 pending repair' : 'Click above to trigger immediate closure'}
              </p>
            </div>
            <div className="pt-1">
              <button
                onClick={() => onNavigate('incident-center')}
                className="text-xs text-[#28d7ff] hover:text-white font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                View in Incident Center
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ================= STORY TIMELINE (Spacious Horizontal Progression) ================= */}
      <section className="bg-[#0c1c2b] border border-[#1a374d] rounded-2xl p-5 lg:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#28d7ff]" />
            <h2 className="text-sm font-bold tracking-tight text-[#e6f3fa] uppercase">
              Incident Detection Story Progression
            </h2>
          </div>
          <span className="text-xs font-mono text-[#6c8699]">
            Detection to confirmation: 17 minutes total
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Step 1 */}
          <div className="bg-[#07131e] p-3.5 rounded-xl border border-[#31d48c]/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-[#31d48c] font-semibold">14:10 UTC</span>
              <span className="w-2 h-2 rounded-full bg-[#31d48c]" />
            </div>
            <div className="text-sm font-semibold text-[#e6f3fa]">Nominal Baseline</div>
            <p className="text-xs text-[#6e899c] mt-1">Line B steady at standard 24k L/h delivery.</p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#07131e] p-3.5 rounded-xl border border-[#193347] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-[#28d7ff] font-semibold">14:18 UTC</span>
              <span className="w-2 h-2 rounded-full bg-[#28d7ff]" />
            </div>
            <div className="text-sm font-semibold text-[#e6f3fa]">Flow Surge (+42%)</div>
            <p className="text-xs text-[#6e899c] mt-1">S05 reports sharp flow jump without factory call.</p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#07131e] p-3.5 rounded-xl border border-amber-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-amber-400 font-semibold">14:21 UTC</span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <div className="text-sm font-semibold text-[#e6f3fa]">Pressure Drop (-18%)</div>
            <p className="text-xs text-[#6e899c] mt-1">S06 drops to 1.82 bar, revealing hydraulic bleed.</p>
          </div>

          {/* Step 4 */}
          <div className="bg-[#07131e] p-3.5 rounded-xl border border-[#ff5b67]/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-[#ff5b67] font-semibold">14:25 UTC</span>
              <span className="w-2 h-2 rounded-full bg-[#ff5b67]" />
            </div>
            <div className="text-sm font-semibold text-[#e6f3fa]">Usage Disproven</div>
            <p className="text-xs text-[#6e899c] mt-1">Machine load up only 3%. Rupture confirmed.</p>
          </div>

          {/* Step 5 (Active) */}
          <div className={`p-3.5 rounded-xl border-2 flex flex-col justify-between transition-colors ${
            isV104Isolated
              ? 'bg-[#0b201a] border-[#31d48c]'
              : 'bg-[#220d14] border-[#ff5b67]'
          }`}>
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className={`font-semibold ${isV104Isolated ? 'text-[#31d48c]' : 'text-[#ff5b67]'}`}>
                14:27 UTC ({isV104Isolated ? 'SECURED' : 'ACTIVE'})
              </span>
              <span className={`w-2.5 h-2.5 rounded-full ${isV104Isolated ? 'bg-[#31d48c]' : 'bg-[#ff5b67] beacon'}`} />
            </div>
            <div className="text-sm font-bold text-[#e6f3fa]">
              {isV104Isolated ? 'Breach Contained' : 'Pipe Rupture Active'}
            </div>
            <p className={`text-xs mt-1 font-mono ${isV104Isolated ? 'text-[#31d48c]' : 'text-[#ff5b67]'}`}>
              {isV104Isolated ? '0 L/h loss (BV-102 closed)' : '2,840 L/h unmetered bleed'}
            </p>
          </div>
        </div>
      </section>

      {/* ================= DUAL CORE SECTION: DIGITAL TWIN & ROOT CAUSE / SIMULATION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT 7 COLS: DIGITAL TWIN SCHEMATIC */}
        <section className="lg:col-span-7 flex flex-col">
          <div className="bg-[#0c1c2b] border border-[#1a374d] rounded-2xl p-5 lg:p-6 flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5 mb-4">
              <div>
                <h2 className="text-base font-bold tracking-tight text-[#e6f3fa]">
                  Digital Twin: Facility Flow Routing
                </h2>
                <p className="text-xs text-[#6e899c]">
                  Click on any node, sensor, or pipe segment to inspect telemetry
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-[#31d48c]">
                  <span className="w-2 h-2 rounded-full bg-[#31d48c]" />
                  Line A (Nominal)
                </span>
                <span className={`flex items-center gap-1.5 ${isV104Isolated ? 'text-[#31d48c]' : 'text-[#ff5b67]'}`}>
                  <span className={`w-2 h-2 rounded-full ${isV104Isolated ? 'bg-[#31d48c]' : 'bg-[#ff5b67] beacon'}`} />
                  {isV104Isolated ? 'Line B (Isolated)' : 'Line B (Ruptured)'}
                </span>
              </div>
            </div>

            {/* Interactive SVG Diagram */}
            <div className="relative bg-[#061019] rounded-xl border border-[#152e42] flex-1 min-h-[380px] p-4 flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full max-h-[390px]" viewBox="0 0 760 360">
                <defs>
                  <linearGradient id="tankWaterGrad" x1="0" x2="0" y1="1" y2="0">
                    <stop offset="0%" stopColor="#007799" stopOpacity="0.8" />
                    <stop offset="90%" stopColor="#28d7ff" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0f2639" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <g stroke="#14293a" strokeDasharray="4 4" strokeWidth="0.5">
                  <line x1="30" y1="90" x2="730" y2="90" />
                  <line x1="30" y1="180" x2="730" y2="180" />
                  <line x1="30" y1="270" x2="730" y2="270" />
                </g>

                {/* 1. Main Storage Tank T-01 */}
                <g 
                  className="cursor-pointer group"
                  onClick={() => handleOpenSegmentModal('MAIN STORAGE TANK T-01', 'Nominal', '48,240 L/h total output', '4.2 bar head pressure', '0 L unmetered', true)}
                  transform="translate(45, 95)"
                >
                  <rect x="0" y="0" width="105" height="170" rx="8" fill="#0d2133" stroke="#254a67" strokeWidth="1.5" className="group-hover:stroke-[#28d7ff] transition-colors" />
                  <rect x="4" y="28" width="97" height="138" rx="5" fill="url(#tankWaterGrad)" />
                  <ellipse cx="52.5" cy="14" rx="42" ry="7" fill="#13314b" stroke="#254a67" strokeWidth="1" />
                  <text x="52.5" y="55" fill="#e6f3fa" fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="Inter">MAIN TANK</text>
                  <text x="52.5" y="82" fill="#28d7ff" fontSize="24" fontWeight="800" textAnchor="middle" fontFamily="'JetBrains Mono'">92%</text>
                  <text x="52.5" y="104" fill="#8ba2b2" fontSize="10" textAnchor="middle" fontFamily="'JetBrains Mono'">782,000 Litres</text>
                  <rect x="18" y="122" width="69" height="18" rx="4" fill="#07131e" stroke="#31d48c" strokeWidth="1" />
                  <text x="52.5" y="134" fill="#31d48c" fontSize="9" fontWeight="600" textAnchor="middle" fontFamily="'JetBrains Mono'">SUPPLY OK</text>
                </g>

                {/* Tank Outlet Pipe */}
                <path d="M 150 180 L 210 180" fill="none" stroke="#102538" strokeWidth="10" />
                <path d="M 150 180 L 210 180" fill="none" stroke="#28d7ff" strokeWidth="3" className="pipe-flow-green" />

                {/* Splitter Manifold Junction */}
                <circle cx="210" cy="180" r="7" fill="#28d7ff" stroke="#e6f3fa" strokeWidth="2" />

                {/* LINE A (NORMAL - GREEN) */}
                <path d="M 210 180 L 210 100 L 590 100" fill="none" stroke="#102538" strokeWidth="8" />
                <path d="M 210 180 L 210 100 L 590 100" fill="none" stroke="#31d48c" strokeWidth="3" className="pipe-flow-green" />

                {/* Line A Label */}
                <rect x="235" y="80" width="135" height="20" rx="4" fill="#06121d" stroke="#31d48c" strokeWidth="1" />
                <text x="302.5" y="93.5" fill="#31d48c" fontSize="9.5" fontWeight="600" textAnchor="middle" fontFamily="'JetBrains Mono'">LINE A • 23,800 L/h (OK)</text>

                {/* Line A Sensor S01 */}
                <g 
                  className="cursor-pointer group"
                  onClick={() => handleOpenSegmentModal('SENSOR S01 (Line A)', 'Nominal', '23,800 L/h', '3.8 bar', '0 L/h loss', true)}
                  transform="translate(400, 88)"
                >
                  <circle cx="12" cy="12" r="12" fill="#0b1e2e" stroke="#31d48c" strokeWidth="2" className="group-hover:stroke-white transition-colors" />
                  <text x="12" y="16" fill="#e6f3fa" fontSize="8.5" fontWeight="700" textAnchor="middle" fontFamily="'JetBrains Mono'">S01</text>
                </g>

                {/* Bottling Bay A Terminal */}
                <g transform="translate(590, 75)">
                  <rect x="0" y="0" width="125" height="50" rx="6" fill="#0d2133" stroke="#31d48c" strokeWidth="1.5" />
                  <text x="62.5" y="20" fill="#e6f3fa" fontSize="10.5" fontWeight="600" textAnchor="middle" fontFamily="Inter">BOTTLING BAY A</text>
                  <rect x="15" y="28" width="95" height="14" rx="3" fill="#06121d" />
                  <text x="62.5" y="38" fill="#31d48c" fontSize="8.5" fontWeight="600" textAnchor="middle" fontFamily="'JetBrains Mono'">RUNNING NORMAL</text>
                </g>

                {/* LINE B (RUPTURED / ISOLATED) */}
                <path d="M 210 180 L 210 260 L 320 260" fill="none" stroke="#102538" strokeWidth="8" />
                <path d="M 210 180 L 210 260 L 320 260" fill="none" stroke={isV104Isolated ? "#31d48c" : "#28d7ff"} strokeWidth="3" className="pipe-flow-green" />

                {/* Valve BV-102 (Clickable) */}
                <g 
                  className="cursor-pointer group" 
                  onClick={handleExecuteQuickIsolation}
                  transform="translate(235, 246)"
                >
                  <rect 
                    x="0" y="0" width="52" height="28" rx="4" 
                    fill="#0a1a27" 
                    stroke={isV104Isolated ? "#31d48c" : "#28d7ff"} 
                    strokeWidth="1.5" 
                    className="group-hover:stroke-white transition-colors" 
                  />
                  <text x="26" y="15" fill={isV104Isolated ? "#31d48c" : "#28d7ff"} fontSize="8.5" fontWeight="700" textAnchor="middle" fontFamily="'JetBrains Mono'">BV-102</text>
                  <text x="26" y="24" fill={isV104Isolated ? "#31d48c" : "#8ba2b2"} fontSize="7.5" textAnchor="middle" fontFamily="Inter">
                    {isV104Isolated ? "CLOSED" : "ISOLATE"}
                  </text>
                </g>

                {/* Sensor S05 (Line B Intake) */}
                <g 
                  className="cursor-pointer group"
                  onClick={() => handleOpenSegmentModal('SENSOR S05 (Line B Intake)', isV104Isolated ? 'Standby' : 'Flow Anomaly', isV104Isolated ? '0 L/h' : '24,440 L/h (+42%)', isV104Isolated ? '0.15 bar' : '2.9 bar', isV104Isolated ? '0 L/h' : 'Surge Point', isV104Isolated)}
                  transform="translate(320, 247)"
                >
                  <circle cx="13" cy="13" r="13" fill="#0d2133" stroke={isV104Isolated ? "#31d48c" : "#ff5b67"} strokeWidth="2" />
                  <text x="13" y="17" fill="#e6f3fa" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="'JetBrains Mono'">S05</text>
                  <text x="13" y="-5" fill={isV104Isolated ? "#31d48c" : "#ff5b67"} fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="'JetBrains Mono'">
                    {isV104Isolated ? "STANDBY" : "+42% FLOW"}
                  </text>
                </g>

                {/* CRITICAL BREACH SEGMENT S05–S06 */}
                <g 
                  className="cursor-pointer group"
                  onClick={() => handleOpenSegmentModal('Breach Segment S05–S06', isV104Isolated ? 'ISOLATED' : 'CRITICAL LEAK', isV104Isolated ? '0 L/h' : '24,440 L/h', isV104Isolated ? '0.15 bar' : '1.82 bar', isV104Isolated ? '0 L/h' : '2,840 L/h', isV104Isolated)}
                >
                  {/* Subtle highlight box if active */}
                  {!isV104Isolated && (
                    <rect x="348" y="246" width="130" height="28" rx="4" fill="#ff5b67" fillOpacity="0.12" stroke="#ff5b67" strokeWidth="1" strokeDasharray="3 3" />
                  )}

                  {/* Red/Green Pipe Stroke */}
                  <line x1="346" y1="260" x2="480" y2="260" stroke={isV104Isolated ? "#31d48c" : "#ff5b67"} strokeWidth="6" />
                  <line x1="346" y1="260" x2="480" y2="260" stroke="#ffffff" strokeWidth="2" className={isV104Isolated ? "pipe-flow-green" : "pipe-flow-red"} />

                  {/* Callout Badge */}
                  <g transform="translate(413, 214)">
                    <rect 
                      x="-65" y="-12" width="130" height="24" rx="5" 
                      fill={isV104Isolated ? "#31d48c" : "#ff5b67"} 
                      stroke="#ffffff" strokeWidth="1" 
                    />
                    <text x="0" y="4" fill="#040e17" fontSize="9.5" fontWeight="700" textAnchor="middle" fontFamily="'JetBrains Mono'">
                      {isV104Isolated ? "✓ SECURED (STANDBY)" : "⚡ RUPTURE DETECTED"}
                    </text>
                    <polygon points="0,12 -4,16 4,16" fill={isV104Isolated ? "#31d48c" : "#ff5b67"} />
                  </g>

                  {/* Indicator Beacon */}
                  {!isV104Isolated ? (
                    <circle cx="413" cy="260" r="6" fill="#ffffff" className="beacon" />
                  ) : (
                    <circle cx="413" cy="260" r="4" fill="#31d48c" />
                  )}

                  <text x="413" y="292" fill={isV104Isolated ? "#31d48c" : "#ff5b67"} fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="'JetBrains Mono'">
                    {isV104Isolated ? "INSPECTION SCHEDULED" : "CLICK TO INSPECT (2,840 L/h)"}
                  </text>
                </g>

                {/* Sensor S06 (Downstream Pressure Drop) */}
                <g 
                  className="cursor-pointer group"
                  onClick={() => handleOpenSegmentModal('SENSOR S06 (Line B)', isV104Isolated ? 'Safe Standby' : 'Pressure Deficit', 'Starvation deficit', isV104Isolated ? '0.15 bar' : '1.82 bar (-18%)', isV104Isolated ? '0 L/h' : '2,840 L/h breach', isV104Isolated)}
                  transform="translate(480, 247)"
                >
                  <circle cx="13" cy="13" r="13" fill={isV104Isolated ? "#0d2133" : "#ff5b67"} stroke={isV104Isolated ? "#31d48c" : "#ffffff"} strokeWidth="2" />
                  <text x="13" y="17" fill={isV104Isolated ? "#31d48c" : "#040e17"} fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="'JetBrains Mono'">S06</text>
                  <text x="13" y="-5" fill={isV104Isolated ? "#31d48c" : "#ff5b67"} fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="'JetBrains Mono'">
                    {isV104Isolated ? "SAFE" : "-18% PRESS"}
                  </text>
                </g>

                {/* Downstream Pipe */}
                <path d="M 506 260 L 590 260" fill="none" stroke="#102538" strokeWidth="8" />
                <path d="M 506 260 L 590 260" fill="none" stroke={isV104Isolated ? "#31d48c" : "#ff5b67"} strokeDasharray="3 3" strokeWidth="2" />

                {/* Terminal Cooling Bay B */}
                <g transform="translate(590, 235)">
                  <rect x="0" y="0" width="125" height="50" rx="6" fill="#0d2133" stroke={isV104Isolated ? "#31d48c" : "#ff5b67"} strokeWidth="1.5" />
                  <text x="62.5" y="20" fill="#e6f3fa" fontSize="10.5" fontWeight="600" textAnchor="middle" fontFamily="Inter">COOLING BAY B</text>
                  <rect x="15" y="28" width="95" height="14" rx="3" fill="#06121d" />
                  <text x="62.5" y="38" fill={isV104Isolated ? "#31d48c" : "#ff5b67"} fontSize="8.5" fontWeight="600" textAnchor="middle" fontFamily="'JetBrains Mono'">
                    {isV104Isolated ? "STANDBY BUFFER" : "LOW PRESSURE FEED"}
                  </text>
                </g>
              </svg>

              <div className="absolute bottom-3 left-3 bg-[#0c1c2b]/95 border border-[#1a374d] px-3 py-1.5 rounded-lg text-xs text-[#7893a7]">
                Click any component or breach flag to open detailed telemetry
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT 5 COLS: "WHY DID THIS HAPPEN" + "TIME-HORIZON SIMULATOR" */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Why Did This Happen (Triangulation Logic) */}
          <div className="bg-[#0c1c2b] border border-[#1a374d] rounded-2xl p-5 lg:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-sm font-bold tracking-tight text-[#e6f3fa]">
                  Why Did AquaRisk Flag This?
                </h3>
                <p className="text-xs text-[#6e899c]">
                  Physical signal triangulation rules out false alarms
                </p>
              </div>
              <span className="text-xs font-mono text-[#28d7ff] bg-[#28d7ff]/10 px-2 py-0.5 rounded font-semibold">
                3-POINT VERIFICATION
              </span>
            </div>

            {/* The 3 Triangulated Signals */}
            <div className="space-y-2.5">
              {/* Signal 1 */}
              <div className="bg-[#07131e] p-3 rounded-xl border border-[#ff5b67]/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#ff5b67]/15 flex items-center justify-center text-[#ff5b67]">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#e6f3fa]">1. Flow Surge</div>
                    <div className="text-[11px] text-[#6e899c]">Line B intake sensor S05</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-[#ff5b67]">+42%</span>
                  <span className="text-[10px] text-[#6e899c] block font-mono">Abnormal</span>
                </div>
              </div>

              {/* Signal 2 */}
              <div className="bg-[#07131e] p-3 rounded-xl border border-[#ff5b67]/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#ff5b67]/15 flex items-center justify-center text-[#ff5b67]">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#e6f3fa]">2. Pressure Drop</div>
                    <div className="text-[11px] text-[#6e899c]">Downstream sensor S06</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-[#ff5b67]">-18%</span>
                  <span className="text-[10px] text-[#6e899c] block font-mono">Loss of Head</span>
                </div>
              </div>

              {/* Signal 3 */}
              <div className="bg-[#07131e] p-3 rounded-xl border border-[#31d48c]/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#31d48c]/15 flex items-center justify-center text-[#31d48c]">
                    <Factory className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#e6f3fa]">3. Machine Production</div>
                    <div className="text-[11px] text-[#6e899c]">Cooling Bay B actual consumption</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-[#31d48c]">+3%</span>
                  <span className="text-[10px] text-[#6e899c] block font-mono">Nominal Load</span>
                </div>
              </div>
            </div>

            {/* Verdict Callout */}
            <div className="p-3.5 rounded-xl bg-[#28d7ff]/10 border border-[#28d7ff]/30 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#28d7ff] mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>PHYSICAL VERDICT:</span>
              </div>
              <p className="text-[#cce2f0] leading-relaxed">
                Because machine load only increased by <strong>+3%</strong>, the <strong>+42% flow surge</strong> combined with the <strong>-18% downstream pressure drop</strong> cannot be operational water use. A physical rupture exists at <strong>Line B (Flange #4)</strong>.
              </p>
            </div>
          </div>

          {/* Time Horizon: What Happens If We Wait? */}
          <div className="bg-[#0c1c2b] border border-[#1a374d] rounded-2xl p-5 lg:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-sm font-bold tracking-tight text-[#e6f3fa]">
                  What Happens If We Wait?
                </h3>
                <p className="text-xs text-[#6e899c]">
                  Drag the slider to project compounding financial & volume losses
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded font-semibold">
                <Timer className="w-3.5 h-3.5" />
                HORIZON
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-2 pt-1">
              <input 
                type="range" 
                min="0" 
                max="4" 
                step="1" 
                value={sliderIndex}
                onChange={(e) => setSliderIndex(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs font-mono text-[#6c8699]">
                {waitData.map((d, i) => (
                  <button 
                    key={d.label}
                    onClick={() => setSliderIndex(i)}
                    className={`cursor-pointer transition-colors ${sliderIndex === i ? 'text-[#28d7ff] font-bold' : 'hover:text-white'}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Results */}
            <div className="grid grid-cols-2 gap-3 bg-[#07131e] p-3.5 rounded-xl border border-[#152e42] font-mono">
              <div>
                <span className="text-[11px] text-[#6e899c] block font-sans">WATER LOSS:</span>
                <span className={`text-xl font-bold ${isV104Isolated ? 'text-[#31d48c]' : 'text-[#ff5b67]'}`}>
                  {currentSim.water}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#6e899c] block font-sans">FINANCIAL IMPACT:</span>
                <span className={`text-xl font-bold ${isV104Isolated ? 'text-[#31d48c]' : 'text-amber-300'}`}>
                  {currentSim.money}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#8ba2b2] leading-relaxed">
              {currentSim.context}
            </p>

            {/* Quick Actions */}
            <div className="flex gap-2 pt-1">
              <button 
                onClick={() => setInvestigationModalOpen(true)}
                className="flex-1 py-2 rounded-xl bg-[#102436] hover:bg-[#152f46] text-[#e6f3fa] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-[#1f435e]"
              >
                <Search className="w-3.5 h-3.5 text-[#28d7ff]" />
                Investigate
              </button>
              <button 
                onClick={handleExecuteQuickIsolation}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  isV104Isolated
                    ? 'bg-[#31d48c]/15 text-[#31d48c] hover:bg-[#31d48c]/25 border border-[#31d48c]/40'
                    : 'bg-[#ff5b67]/15 text-[#ff5b67] hover:bg-[#ff5b67]/25 border border-[#ff5b67]/40'
                }`}
              >
                {isV104Isolated ? 'Re-open BV-102' : 'Isolate BV-102 Now'}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ================= MODAL: 4-POINT COMPONENT TELEMETRY ================= */}
      <AnimatePresence>
        {segmentModalOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0c1c2b] border border-[#1f435e] rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full ${modalData.isNominal ? 'bg-[#31d48c]' : 'bg-[#ff5b67] beacon'}`} />
                  <div>
                    <h3 className="text-base font-bold text-[#e6f3fa]">{modalData.title}</h3>
                    <span className="text-xs text-[#6e899c]">Sub-distribution pipeline network</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSegmentModalOpen(false)}
                  className="text-[#6e899c] hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 4 Metric Grid */}
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="bg-[#07131e] p-3 rounded-xl border border-[#152e42]">
                  <span className="text-[10px] text-[#6e899c] block font-sans">STATUS</span>
                  <span className={`text-base font-bold ${modalData.isNominal ? 'text-[#31d48c]' : 'text-[#ff5b67]'}`}>
                    {modalData.status}
                  </span>
                </div>
                <div className="bg-[#07131e] p-3 rounded-xl border border-[#152e42]">
                  <span className="text-[10px] text-[#6e899c] block font-sans">FLOW RATE</span>
                  <span className="text-base font-bold text-[#e6f3fa]">{modalData.flow}</span>
                </div>
                <div className="bg-[#07131e] p-3 rounded-xl border border-[#152e42]">
                  <span className="text-[10px] text-[#6e899c] block font-sans">LINE PRESSURE</span>
                  <span className="text-base font-bold text-[#e6f3fa]">{modalData.press}</span>
                </div>
                <div className="bg-[#07131e] p-3 rounded-xl border border-[#152e42]">
                  <span className="text-[10px] text-[#6e899c] block font-sans">LOSS VELOCITY</span>
                  <span className={`text-base font-bold ${modalData.isNominal ? 'text-[#31d48c]' : 'text-[#ff5b67]'}`}>
                    {modalData.loss}
                  </span>
                </div>
              </div>

              {/* Action Recommendation */}
              <div className="bg-[#28d7ff]/10 border border-[#28d7ff]/30 p-3.5 rounded-xl text-xs">
                <span className="text-[#28d7ff] font-bold block mb-1">RECOMMENDED ACTION:</span>
                <p className="text-[#cce2f0]">
                  Engage upstream gate valve <strong>BV-102</strong> and send inspection crew with acoustic ground microphones to Trench 4.
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/5">
                <button 
                  onClick={() => setSegmentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#8ba2b2] hover:text-white cursor-pointer"
                >
                  Dismiss
                </button>
                <button 
                  onClick={handleExecuteQuickIsolation}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#ff5b67] text-white hover:bg-[#ff6e78] cursor-pointer"
                >
                  {isV104Isolated ? 'Re-Open Valve' : 'Isolate BV-102 Now'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: FULL INVESTIGATION DOSSIER ================= */}
      <AnimatePresence>
        {investigationModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.25 }}
              className="bg-[#0c1c2b] border border-[#1f435e] rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#28d7ff]/15 text-[#28d7ff]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#e6f3fa]">Incident Dossier: INC-9821-B</h3>
                    <p className="text-xs text-[#6e899c] font-mono">Location: Trench 4 • Segment S05–S06 • Flange #4</p>
                  </div>
                </div>
                <button 
                  onClick={() => setInvestigationModalOpen(false)}
                  className="text-[#6e899c] hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 3 Overview Highlights */}
              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="bg-[#07131e] p-3 rounded-xl border border-[#ff5b67]/40">
                  <span className="text-[10px] text-[#6e899c] block font-sans">INCIDENT TYPE</span>
                  <span className="text-sm font-bold text-[#ff5b67]">Rupture Leak</span>
                </div>
                <div className="bg-[#07131e] p-3 rounded-xl border border-[#152e42]">
                  <span className="text-[10px] text-[#6e899c] block font-sans">FLOW ESCAPE</span>
                  <span className="text-sm font-bold text-[#e6f3fa]">2,840 L/hr</span>
                </div>
                <div className="bg-[#07131e] p-3 rounded-xl border border-[#152e42]">
                  <span className="text-[10px] text-[#6e899c] block font-sans">EST. DAILY TARIFF</span>
                  <span className="text-sm font-bold text-amber-300">₹1,61,280</span>
                </div>
              </div>

              {/* Root Cause Deduction */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7893a7]">
                  Root Cause Deduction Sequence
                </span>
                <div className="space-y-2 text-xs">
                  <div className="bg-[#07131e] p-3 rounded-xl border border-[#152e42] flex items-start gap-3">
                    <span className="text-[#31d48c] font-mono font-bold">01</span>
                    <div>
                      <strong className="text-[#e6f3fa]">Machine consumption verified:</strong> Bottling & cooling equipment operates within nominal load bounds (+3%), which accounts for standard 24,000 L/h.
                    </div>
                  </div>
                  <div className="bg-[#07131e] p-3 rounded-xl border border-[#ff5b67]/30 flex items-start gap-3">
                    <span className="text-[#ff5b67] font-mono font-bold">02</span>
                    <div>
                      <strong className="text-[#ff5b67]">Unaccounted ultrasonic surge:</strong> Sensor S05 clocked 48,240 L/h total plant demand (+42% spike), indicating huge draw.
                    </div>
                  </div>
                  <div className="bg-[#07131e] p-3 rounded-xl border border-[#ff5b67]/30 flex items-start gap-3">
                    <span className="text-[#ff5b67] font-mono font-bold">03</span>
                    <div>
                      <strong className="text-[#ff5b67]">Downstream pressure starvation:</strong> Downstream sensor S06 fell from 4.1 bar to 1.82 bar (-18%), proving fluid is dumping into the trench before reaching the cooling jackets.
                    </div>
                  </div>
                </div>
              </div>

              {/* Mitigation Checklist */}
              <div className="bg-[#07131e] p-4 rounded-xl border border-[#152e42] space-y-2 text-xs">
                <span className="text-xs font-bold text-[#28d7ff] font-mono uppercase">
                  Automated SCADA Protocol Execution:
                </span>
                <ul className="space-y-1.5 text-[#cce2f0] list-disc list-inside">
                  <li>Trigger isolation solenoid on valve <strong>BV-102</strong>.</li>
                  <li>Depressurize and safely vent Line B sub-trunk.</li>
                  <li>Generate Work Order #WO-891 with trench coordinates for maintenance dispatched crew.</li>
                </ul>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                <button 
                  onClick={() => setInvestigationModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs text-[#8ba2b2] hover:text-white cursor-pointer"
                >
                  Close Dossier
                </button>
                <button 
                  onClick={handleExecuteQuickIsolation}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#28d7ff] text-[#041624] hover:bg-[#5ae0ff] transition-all cursor-pointer shadow-md"
                >
                  {isV104Isolated ? 'Restore Valve Flow' : 'Authorize Valve Isolation & Dispatch Crew'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
