import React, { useState, useMemo } from 'react';
import { PageId, SimulationParams, SimulationResult } from '../../types';
import { motion } from 'motion/react';
import { 
  Sliders, 
  Droplets, 
  Sparkles, 
  Clock,
  RotateCcw,
  ShieldCheck,
  Zap,
  TrendingDown,
  AlertOctagon
} from 'lucide-react';

interface WhatIfLabProps {
  onNavigate: (page: PageId) => void;
}

export const WhatIfLab: React.FC<WhatIfLabProps> = ({ onNavigate }) => {
  const [params, setParams] = useState<SimulationParams>({
    leakRateLph: 350,
    responseDelayHours: 6.0,
    tariffInrPerM3: 52,
    productionState: 'Peak'
  });

  const [aiAnalysisRunning, setAiAnalysisRunning] = useState<boolean>(false);

  // Compute outcomes dynamically
  const outcome: SimulationResult = useMemo(() => {
    const prodMultiplier = params.productionState === 'Peak' ? 1.4 : params.productionState === 'Reduced' ? 0.6 : 1.0;
    const effectiveLeakRate = params.leakRateLph * prodMultiplier;
    
    // Total water loss in Liters
    const lossLiters = Math.round(effectiveLeakRate * params.responseDelayHours);
    const lossM3 = Number((lossLiters / 1000).toFixed(2));

    const directWaterCost = Math.round(lossM3 * params.tariffInrPerM3);
    const effluentPenalty = Math.round(lossM3 * 42); // treatment + effluent
    const totalCost = directWaterCost + effluentPenalty;

    const energyKwh = Math.round(lossM3 * 0.85);
    const co2Kg = Math.round(energyKwh * 0.72);

    let score = (effectiveLeakRate / 20) + (params.responseDelayHours * 3);
    if (params.productionState === 'Peak') score += 15;
    score = Math.min(100, Math.max(5, Math.round(score)));

    let riskCat: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';
    if (score >= 75) riskCat = 'Critical';
    else if (score >= 50) riskCat = 'High';
    else if (score >= 25) riskCat = 'Moderate';

    const aiLossLiters = Math.round(effectiveLeakRate * 0.25);
    const aiLossM3 = aiLossLiters / 1000;
    const aiCost = Math.round(aiLossM3 * (params.tariffInrPerM3 + 42));

    let insight = '';
    if (riskCat === 'Critical') {
      insight = `CRITICAL OPERATIONAL RISK: Under ${params.productionState} production with a ${params.leakRateLph} L/h leak rate, delaying intervention by ${params.responseDelayHours}h bleeds ${lossLiters.toLocaleString()} Litres, generating ₹${totalCost.toLocaleString()} in avoidable costs. Downstream cavitation will force Line B shutdown within 4.2 hours. Early automated valve isolation would mitigate ₹${(totalCost - aiCost).toLocaleString()} in direct plant bleed.`;
    } else if (riskCat === 'High') {
      insight = `HIGH INFRASTRUCTURE STRAIN: A ${params.responseDelayHours}h response delay yields ${lossLiters.toLocaleString()} L of unmetered water discharge (₹${totalCost.toLocaleString()}). Secondary hydraulic oscillation will destabilize Line A pasteurization manifolds. Immediate throttling to 50% capacity advised.`;
    } else if (riskCat === 'Moderate') {
      insight = `MODERATE VOLUME LEAK: ${lossLiters.toLocaleString()} L unmetered discharge across ${params.responseDelayHours}h window. System pressure buffer remains stable, but long-term trench foundation softening will degrade adjacent civil footing.`;
    } else {
      insight = `CONTAINED NOMINAL CONDITION: Early detection and prompt isolation under ${params.responseDelayHours}h keeps discharge within safety envelope (${lossLiters.toLocaleString()} L). Water table intact.`;
    }

    return {
      projectedWaterLossLiters: lossLiters,
      projectedWaterLossM3: lossM3,
      directWaterCostInr: directWaterCost,
      effluentPenaltyInr: effluentPenalty,
      totalFinancialBleedInr: totalCost,
      riskScore: score,
      riskCategory: riskCat,
      co2eKg: co2Kg,
      energyWastedKwh: energyKwh,
      aiInsight: insight,
      baselineWaterLossLiters: lossLiters,
      baselineFinancialCostInr: totalCost,
      aiMitigatedLossLiters: aiLossLiters,
      aiMitigatedCostInr: aiCost
    };
  }, [params]);

  const handleRunAiOptimization = () => {
    setAiAnalysisRunning(true);
    setTimeout(() => {
      setParams({
        ...params,
        responseDelayHours: 0.25,
        productionState: 'Standard'
      });
      setAiAnalysisRunning(false);
    }, 450);
  };

  return (
    <div className="py-2 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Title Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#e6f3fa]">
              What-If Risk Simulation Lab
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#28d7ff]/15 text-[#28d7ff] text-xs font-mono font-bold border border-[#28d7ff]/30">
              HYDRAULIC MODEL
            </span>
          </div>
          <p className="text-sm text-[#8ba2b2]">
            Simulate physical failure scenarios, calculate delay costs, and benchmark automated fast isolation
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setParams({ leakRateLph: 350, responseDelayHours: 6.0, tariffInrPerM3: 52, productionState: 'Peak' })}
            className="px-3.5 py-2 rounded-xl bg-[#0c1c2b] border border-[#1a374d] hover:border-white/20 text-[#8ba2b2] hover:text-white text-xs font-mono flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </motion.div>

      {/* Grid: Left Parameters (5 cols) & Right Projections (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Input Matrix Card */}
        <div className="lg:col-span-5 bg-[#0c1c2b] rounded-2xl p-5 lg:p-6 border border-[#1a374d] space-y-5">
          <div className="pb-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-[#28d7ff]" />
              <h3 className="text-base font-bold text-[#e6f3fa]">
                Scenario Parameters
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#28d7ff] bg-[#28d7ff]/10 px-2 py-0.5 rounded font-semibold">
              INPUT MATRIX
            </span>
          </div>

          {/* Slider 1: Leak Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-[#8ba2b2] flex items-center space-x-2">
                <Droplets className="w-3.5 h-3.5 text-[#28d7ff]" />
                <span>Simulated Leak Rate</span>
              </label>
              <span className="font-mono font-bold text-[#28d7ff] text-sm">
                {params.leakRateLph} <span className="text-xs font-normal text-[#6e899c]">L/hr</span>
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="2500"
              step="25"
              value={params.leakRateLph}
              onChange={(e) => setParams({ ...params, leakRateLph: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#6e899c]">
              <span>50 L/hr (Micro-crack)</span>
              <span>1,200 L/hr</span>
              <span>2,500 L/hr (Full Burst)</span>
            </div>
          </div>

          {/* Slider 2: Response Delay */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-[#8ba2b2] flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Response / Isolation Delay</span>
              </label>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {params.responseDelayHours} <span className="text-xs font-normal text-[#6e899c]">Hours</span>
              </span>
            </div>
            <input
              type="range"
              min="0.25"
              max="48"
              step="0.25"
              value={params.responseDelayHours}
              onChange={(e) => setParams({ ...params, responseDelayHours: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#6e899c]">
              <span>15m (SCADA Auto)</span>
              <span>6h (Shift transition)</span>
              <span>48h (Weekend leak)</span>
            </div>
          </div>

          {/* Slider 3: Water Tariff */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-[#8ba2b2] flex items-center space-x-2">
                <span>Intake Water Tariff Rate</span>
              </label>
              <span className="font-mono font-bold text-[#31d48c] text-sm">
                ₹{params.tariffInrPerM3} <span className="text-xs font-normal text-[#6e899c]">/ m³</span>
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="150"
              step="2"
              value={params.tariffInrPerM3}
              onChange={(e) => setParams({ ...params, tariffInrPerM3: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#6e899c]">
              <span>₹30/m³ (Borewell)</span>
              <span>₹52/m³ (Municipal)</span>
              <span>₹150/m³ (RO Tanker)</span>
            </div>
          </div>

          {/* Production State Selector */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="text-xs text-[#6e899c] block font-mono">
              FACTORY PRODUCTION STATE
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Reduced', 'Standard', 'Peak'] as const).map(state => (
                <button
                  key={state}
                  onClick={() => setParams({ ...params, productionState: state })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    params.productionState === state
                      ? state === 'Peak'
                        ? 'bg-[#ff5b67] text-white shadow-sm'
                        : 'bg-[#28d7ff] text-[#041624] shadow-sm'
                      : 'bg-[#06121d] text-[#8ba2b2] hover:text-white border border-[#19354b]'
                  }`}
                >
                  {state}
                  <div className="text-[10px] font-mono opacity-80 mt-0.5">
                    {state === 'Reduced' ? '50% Load' : state === 'Standard' ? '100% Load' : '140% Load'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Run Optimization */}
          <button
            onClick={handleRunAiOptimization}
            disabled={aiAnalysisRunning}
            className="w-full py-3 rounded-xl bg-[#28d7ff] hover:bg-[#5ae0ff] text-[#041624] font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>{aiAnalysisRunning ? 'SIMULATING...' : 'APPLY 15-MINUTE AUTOMATED ISOLATION'}</span>
          </button>
        </div>

        {/* Right: Projected Outcomes (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Outcome Projection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Projected Loss */}
            <div className="bg-[#0c1c2b] rounded-2xl p-5 border border-[#1a374d]">
              <span className="text-[11px] font-mono text-[#6e899c] uppercase block">
                PROJECTED WATER LOSS
              </span>
              <p className="text-3xl font-extrabold font-mono text-[#e6f3fa] mt-1.5">
                {outcome.projectedWaterLossLiters.toLocaleString()} <span className="text-xs font-semibold text-[#28d7ff]">L</span>
              </p>
              <span className="text-xs font-mono text-[#6e899c] mt-1 block">
                ≈ {outcome.projectedWaterLossM3} m³ discharged
              </span>
            </div>

            {/* Total Financial Bleed */}
            <div className="bg-[#0c1c2b] rounded-2xl p-5 border border-[#ff5b67]/40">
              <span className="text-[11px] font-mono text-[#6e899c] uppercase block">
                TOTAL FINANCIAL BLEED
              </span>
              <p className="text-3xl font-extrabold font-mono text-[#ff5b67] mt-1.5">
                ₹{outcome.totalFinancialBleedInr.toLocaleString()}
              </p>
              <span className="text-xs font-mono text-[#6e899c] mt-1 block">
                Tariff + Softening + Effluent
              </span>
            </div>

            {/* Risk Category */}
            <div className={`rounded-2xl p-5 border ${
              outcome.riskCategory === 'Critical' ? 'bg-[#ff5b67]/10 border-[#ff5b67]/50' :
              outcome.riskCategory === 'High' ? 'bg-amber-400/10 border-amber-400/50' :
              outcome.riskCategory === 'Moderate' ? 'bg-[#28d7ff]/10 border-[#28d7ff]/50' :
              'bg-[#31d48c]/10 border-[#31d48c]/50'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#6e899c] uppercase">
                  INFRASTRUCTURE RISK
                </span>
                <span className="text-xs font-mono font-bold text-white">{outcome.riskScore}/100</span>
              </div>
              <p className={`text-2xl font-bold mt-1 ${
                outcome.riskCategory === 'Critical' ? 'text-[#ff5b67]' :
                outcome.riskCategory === 'High' ? 'text-amber-400' :
                outcome.riskCategory === 'Moderate' ? 'text-[#28d7ff]' :
                'text-[#31d48c]'
              }`}>
                {outcome.riskCategory}
              </p>
              <div className="w-full bg-black/40 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    outcome.riskCategory === 'Critical' ? 'bg-[#ff5b67]' :
                    outcome.riskCategory === 'High' ? 'bg-amber-400' :
                    outcome.riskCategory === 'Moderate' ? 'bg-[#28d7ff]' :
                    'bg-[#31d48c]'
                  }`}
                  style={{ width: `${outcome.riskScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* AI Insight Box */}
          <div className="bg-[#0c1c2b] rounded-2xl p-6 border border-[#1f435e] space-y-3 relative overflow-hidden">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-xl bg-[#28d7ff]/15 text-[#28d7ff] shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-[#e6f3fa]">
                    AquaRisk AI Simulation Intelligence
                  </h4>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-[#31d48c]/15 text-[#31d48c] font-semibold">
                    PHYSICAL MODEL
                  </span>
                </div>
                <p className="text-xs text-[#cce2f0] leading-relaxed">
                  {outcome.aiInsight}
                </p>
                <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-[#8ba2b2]">
                  <span>Carbon impact: <strong className="text-white">{outcome.co2eKg} kg CO₂e</strong></span>
                  <span>•</span>
                  <span>Energy waste: <strong className="text-white">{outcome.energyWastedKwh} kWh</strong></span>
                  <span>•</span>
                  <span>Pressure oscillation: <strong className="text-[#ff5b67]">High</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparative Automation Bar */}
          <div className="bg-[#0c1c2b] rounded-2xl p-5 border border-[#1a374d] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#31d48c]/15 text-[#31d48c]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#e6f3fa]">SCADA Fast-Isolation Active?</div>
                <div className="text-xs text-[#6e899c]">Acoustic threshold detection triggers solenoid within 900 seconds</div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('command-center')}
              className="px-4 py-2.5 rounded-xl bg-[#102436] hover:bg-[#152e42] text-[#28d7ff] border border-[#1f435e] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <span>Return to Command Center</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
