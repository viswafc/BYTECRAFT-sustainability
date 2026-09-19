import React, { useState } from 'react';
import { PageId } from '../../types';
import { HISTORICAL_30_DAYS, ZONE_ANALYTICS } from '../../data/mockData';
import { 
  BarChart3, 
  TrendingUp, 
  Droplets, 
  IndianRupee, 
  AlertTriangle, 
  Calendar, 
  ArrowUpRight, 
  Layers,
  Sparkles,
  Download
} from 'lucide-react';

interface AnalyticsTrendsProps {
  onNavigate: (page: PageId) => void;
}

export const AnalyticsTrends: React.FC<AnalyticsTrendsProps> = ({ onNavigate }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('30d');
  const [hoveredPoint, setHoveredPoint] = useState<typeof HISTORICAL_30_DAYS[0] | null>(null);

  const displayedData = timeRange === '7d' 
    ? HISTORICAL_30_DAYS.slice(-7)
    : timeRange === '14d'
    ? HISTORICAL_30_DAYS.slice(-14)
    : HISTORICAL_30_DAYS;

  // Totals for the displayed dataset
  const totalExpected = displayedData.reduce((acc, curr) => acc + curr.expectedLiters, 0);
  const totalActual = displayedData.reduce((acc, curr) => acc + curr.actualLiters, 0);
  const totalLeak = displayedData.reduce((acc, curr) => acc + curr.leakLiters, 0);
  const totalFinancialLoss = displayedData.reduce((acc, curr) => acc + curr.financialImpactInr, 0);
  const incidentCount = displayedData.filter(d => d.hadIncident).length;

  // Chart coordinate mapping
  const chartWidth = 840;
  const chartHeight = 260;
  const paddingX = 40;
  const paddingY = 30;

  const minVal = Math.min(...displayedData.map(d => Math.min(d.expectedLiters, d.actualLiters))) * 0.95;
  const maxVal = Math.max(...displayedData.map(d => Math.max(d.expectedLiters, d.actualLiters))) * 1.05;

  const getX = (index: number) => {
    if (displayedData.length <= 1) return paddingX;
    return paddingX + (index / (displayedData.length - 1)) * (chartWidth - paddingX * 2);
  };

  const getY = (val: number) => {
    return chartHeight - paddingY - ((val - minVal) / (maxVal - minVal)) * (chartHeight - paddingY * 2);
  };

  // Build SVG path for expected line
  const expectedPath = displayedData.reduce((acc, curr, idx) => {
    const x = getX(idx);
    const y = getY(curr.expectedLiters);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Build SVG path for actual line
  const actualPath = displayedData.reduce((acc, curr, idx) => {
    const x = getX(idx);
    const y = getY(curr.actualLiters);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Build SVG area fill for difference/leak
  const leakAreaPath = `${actualPath} L ${getX(displayedData.length - 1)} ${getY(minVal)} L ${getX(0)} ${getY(minVal)} Z`;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      {/* Title & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-white tracking-wide font-['Outfit']">
              Analytics & Historical Trends
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#28D7FF]/20 text-[#28D7FF] text-xs font-mono font-bold border border-[#28D7FF]/30">
              AUDIT INTELLIGENCE
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Plant-wide consumption variance, leak loss attribution, and cross-zone degradation patterns
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[#081521] p-1 rounded-xl border border-white/10 text-xs font-mono">
            {(['7d', '14d', '30d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  timeRange === range
                    ? 'bg-[#28D7FF] text-[#040F16] font-bold shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '14d' ? '14 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Water Consumed */}
        <div className="glass-panel rounded-2xl p-4 border border-white/10 hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-400 uppercase">TOTAL CONSUMPTION</span>
            <div className="p-2 rounded-lg bg-[#28D7FF]/10 text-[#28D7FF]">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-white mt-2">
            {(totalActual / 1000).toFixed(1)} <span className="text-xs font-sans text-[#28D7FF]">m³</span>
          </p>
          <span className="text-[11px] font-mono text-gray-400 mt-1 block">
            Baseline expected: {(totalExpected / 1000).toFixed(1)} m³
          </span>
        </div>

        {/* Total Water Lost */}
        <div className="glass-panel rounded-2xl p-4 border border-[#FF5B67]/30 hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-400 uppercase">TOTAL UNMETERED LOSS</span>
            <div className="p-2 rounded-lg bg-[#FF5B67]/10 text-[#FF5B67]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-[#FF5B67] mt-2">
            {totalLeak.toLocaleString()} <span className="text-xs font-sans text-gray-400">L</span>
          </p>
          <span className="text-[11px] font-mono text-gray-400 mt-1 block">
            {((totalLeak / totalActual) * 100).toFixed(1)}% of total intake
          </span>
        </div>

        {/* Financial Bleed */}
        <div className="glass-panel rounded-2xl p-4 border border-[#FFC837]/30 hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-400 uppercase">NET FINANCIAL BLEED</span>
            <div className="p-2 rounded-lg bg-[#FFC837]/10 text-[#FFC837]">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-white mt-2">
            ₹ {totalFinancialLoss.toLocaleString()}
          </p>
          <span className="text-[11px] font-mono text-[#FFC837] mt-1 block">
            ₹ {(totalFinancialLoss / displayedData.length).toFixed(0)} avg daily impact
          </span>
        </div>

        {/* Leak Incidents Caught */}
        <div className="glass-panel rounded-2xl p-4 border border-[#14E88D]/30 hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-400 uppercase">INCIDENTS MITIGATED</span>
            <div className="p-2 rounded-lg bg-[#14E88D]/10 text-[#14E88D]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-[#14E88D] mt-2">
            {incidentCount} <span className="text-xs font-sans text-gray-400">Events</span>
          </p>
          <span className="text-[11px] font-mono text-gray-400 mt-1 block">
            100% caught &lt;15m by AI
          </span>
        </div>
      </div>

      {/* Main Historical Chart: Expected vs Actual Consumption */}
      <div className="glass-panel rounded-2xl p-5 border border-[#28D7FF]/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-[#28D7FF]" />
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Expected vs Actual Water Consumption ({timeRange.toUpperCase()})
            </h3>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-gray-400" />
              <span className="text-gray-400">Expected Baseline</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-[#FF5B67]" />
              <span className="text-[#FF5B67]">Actual (With Leaks)</span>
            </div>
          </div>
        </div>

        {/* Interactive SVG Chart */}
        <div className="relative w-full overflow-x-auto">
          <svg 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            className="w-full h-64 select-none"
          >
            {/* Horizontal Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = paddingY + pct * (chartHeight - paddingY * 2);
              const val = Math.round(maxVal - pct * (maxVal - minVal));
              return (
                <g key={i}>
                  <line 
                    x1={paddingX} 
                    y1={y} 
                    x2={chartWidth - paddingX} 
                    y2={y} 
                    stroke="rgba(255, 255, 255, 0.07)" 
                    strokeDasharray="4,4" 
                  />
                  <text 
                    x={paddingX - 6} 
                    y={y + 3} 
                    fill="#6e7681" 
                    fontSize="9" 
                    textAnchor="end" 
                    fontFamily="JetBrains Mono"
                  >
                    {(val / 1000).toFixed(0)}k L
                  </text>
                </g>
              );
            })}

            {/* Expected Baseline Line (Dotted Gray) */}
            <path
              d={expectedPath}
              fill="none"
              stroke="#6e7681"
              strokeWidth="2"
              strokeDasharray="3,3"
            />

            {/* Actual Consumption Line (Cyan/Red) */}
            <path
              d={actualPath}
              fill="none"
              stroke="#FF5B67"
              strokeWidth="2.5"
            />

            {/* Data points & Interactive Hover Triggers */}
            {displayedData.map((d, idx) => {
              const x = getX(idx);
              const yActual = getY(d.actualLiters);
              const yExpected = getY(d.expectedLiters);
              const isHovered = hoveredPoint?.date === d.date;

              return (
                <g key={d.date} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(d)}>
                  {/* Vertical hover guide */}
                  {isHovered && (
                    <line 
                      x1={x} y1={paddingY} x2={x} y2={chartHeight - paddingY} 
                      stroke="#28D7FF" strokeWidth="1" strokeDasharray="2,2" 
                    />
                  )}

                  {/* Incident marker circle */}
                  {d.hadIncident && (
                    <circle 
                      cx={x} cy={yActual} r="5" 
                      fill="#FF5B67" stroke="#040F16" strokeWidth="2" 
                      className="animate-pulse"
                    />
                  )}

                  {/* Expected point */}
                  <circle cx={x} cy={yExpected} r="2.5" fill="#6e7681" />

                  {/* X-axis label */}
                  {(idx % Math.ceil(displayedData.length / 8) === 0 || idx === displayedData.length - 1) && (
                    <text
                      x={x}
                      y={chartHeight - 8}
                      fill="#8b949e"
                      fontSize="9"
                      textAnchor="middle"
                      fontFamily="JetBrains Mono"
                    >
                      {d.date}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip Callout */}
          {hoveredPoint && (
            <div className="absolute top-2 right-4 glass-panel p-3 rounded-xl border border-[#28D7FF]/40 text-xs font-mono space-y-1 shadow-lg pointer-events-none animate-fade-in-up">
              <div className="font-bold text-white flex items-center justify-between gap-4">
                <span>{hoveredPoint.date} (Day {hoveredPoint.day})</span>
                {hoveredPoint.hadIncident && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FF5B67]/20 text-[#FF5B67]">
                    LEAK EVENT
                  </span>
                )}
              </div>
              <div className="text-gray-300">
                Actual: <strong className="text-white">{hoveredPoint.actualLiters.toLocaleString()} L</strong>
              </div>
              <div className="text-gray-400">
                Expected: {hoveredPoint.expectedLiters.toLocaleString()} L
              </div>
              <div className="text-[#FF5B67] font-semibold">
                Unmetered Loss: +{hoveredPoint.leakLiters.toLocaleString()} L (₹{hoveredPoint.financialImpactInr.toLocaleString()})
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zone Water Loss Breakdown */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#28D7FF]" />
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Zone Water Loss & Vulnerability Breakdown
            </h3>
          </div>
          <span className="text-xs font-mono text-gray-400">
            Ranked by Cumulative Loss Contribution
          </span>
        </div>

        <div className="space-y-4">
          {ZONE_ANALYTICS.map((zone) => {
            const isCrit = zone.status === 'critical';
            const isWarn = zone.status === 'warning';

            return (
              <div key={zone.zoneId} className="space-y-1.5 p-3 rounded-xl bg-[#081521] border border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-white">{zone.name}</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-mono uppercase ${
                      isCrit ? 'bg-[#FF5B67]/20 text-[#FF5B67]' : isWarn ? 'bg-[#FFC837]/20 text-[#FFC837]' : 'bg-[#14E88D]/20 text-[#14E88D]'
                    }`}>
                      {zone.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 font-mono text-gray-300">
                    <span>{zone.volumeLostLiters.toLocaleString()} L</span>
                    <span className="text-[#FF5B67] font-bold">₹ {zone.financialImpactInr.toLocaleString()}</span>
                    <span className="font-bold text-white">{zone.percentage}%</span>
                  </div>
                </div>

                <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                      isCrit ? 'bg-gradient-to-r from-[#FFC837] to-[#FF5B67]' :
                      isWarn ? 'bg-gradient-to-r from-[#28D7FF] to-[#FFC837]' :
                      'bg-[#28D7FF]'
                    }`}
                    style={{ width: `${zone.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
