import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { PageId } from '../../types';
import { 
  FileText, 
  Download, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  Droplets, 
  BarChart3, 
  Filter, 
  Printer, 
  Share2, 
  Building2, 
  TrendingUp, 
  Clock, 
  Award,
  Sparkles
} from 'lucide-react';

interface ReportsComplianceProps {
  onNavigate: (page: PageId) => void;
}

export const ReportsCompliance: React.FC<ReportsComplianceProps> = ({ onNavigate }) => {
  const { currentPlant, currentPlantId } = useTelemetry();
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('monthly');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleDownload = (format: 'PDF' | 'CSV') => {
    const filename = `AquaRisk_${currentPlant.code}_Water_Audit_Report_${new Date().toISOString().slice(0, 10)}.${format.toLowerCase()}`;
    
    // Trigger download simulation with toast
    setDownloadSuccess(`Generated ${filename} successfully!`);
    setTimeout(() => setDownloadSuccess(null), 4000);

    // Create a real downloadable text/csv if CSV
    if (format === 'CSV') {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Timestamp,Facility,Intake_Lph,Discharge_Lph,Recycled_Pct,Unaccounted_Loss_Lph,Financial_Impact_INR\n"
        + "2026-09-18 08:00,Plant 1,5230,5090,92.4,140,1190\n"
        + "2026-09-18 09:00,Plant 1,5210,5080,92.2,130,1105\n"
        + "2026-09-18 10:00,Plant 1,5420,5100,91.8,320,2720\n";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 text-white">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#182e42]">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#ff4d6d] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Regulatory & ESG Water Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Outfit',sans-serif] mt-1">
            Audit & Compliance <span className="text-[#ff4d6d]">Reports</span>
          </h1>
          <p className="text-xs text-[#7f99ab] mt-1">
            ISO 14046 Water Footprint verification, CPCB Zero-Liquid Discharge (ZLD) telemetry, and financial water balance statements.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleDownload('CSV')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#0c1a26] border border-[#1e3952] hover:border-[#00e5ff] text-xs font-bold text-white transition-all cursor-pointer shadow"
          >
            <Download className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>Export Raw CSV</span>
          </button>
          <button
            onClick={() => handleDownload('PDF')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#ff4d6d] hover:bg-[#ff3366] text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-[#ff4d6d]/30"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Executive PDF</span>
          </button>
        </div>
      </div>

      {/* Download Success Banner */}
      {downloadSuccess && (
        <div className="p-4 rounded-2xl bg-[#0d281e] border border-[#10b981]/50 text-xs text-[#10b981] flex items-center space-x-2 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#0b1622]/90 border border-[#1b344a] shadow-xl">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#738e9f]">Overall Water Efficiency</div>
          <div className="text-3xl font-black text-white font-['Outfit',sans-serif] mt-1">94.8%</div>
          <div className="mt-2 text-[10px] text-[#10b981] flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>+3.2% vs previous quarter baseline</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0b1622]/90 border border-[#1b344a] shadow-xl">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#738e9f]">Water Recycled & Reused</div>
          <div className="text-3xl font-black text-[#00e5ff] font-['Outfit',sans-serif] mt-1">14,280 m³</div>
          <div className="mt-2 text-[10px] text-[#86a1b2]">92.4% Closed-loop internal recovery</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0b1622]/90 border border-[#1b344a] shadow-xl">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#738e9f]">Mean Time to Detect (MTTD)</div>
          <div className="text-3xl font-black text-[#ff4d6d] font-['Outfit',sans-serif] mt-1">4.2 min</div>
          <div className="mt-2 text-[10px] text-[#86a1b2]">AI hydrophone anomaly response</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0b1622]/90 border border-[#1b344a] shadow-xl">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#738e9f]">Regulatory ZLD Rating</div>
          <div className="text-3xl font-black text-[#10b981] font-['Outfit',sans-serif] mt-1">Grade A+</div>
          <div className="mt-2 text-[10px] text-[#10b981]">100% Zero-Liquid Discharge certified</div>
        </div>
      </div>

      {/* Main Audit Report Document Container */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0b1622]/90 border border-[#1a3348] shadow-2xl space-y-6">
        
        {/* Report Header Metadata */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#182e42]">
          <div>
            <span className="text-[10px] font-mono text-[#ff4d6d] font-bold uppercase">OFFICIAL AUDIT TRANSMITTAL • REF-2026-AQ-9912</span>
            <h2 className="text-lg font-bold text-white font-['Outfit',sans-serif] mt-0.5">
              Monthly Industrial Water Balance & Environmental Footprint
            </h2>
            <p className="text-xs text-[#7f99ab]">
              Facility: <strong className="text-white">{currentPlant.name}</strong> ({currentPlant.location})
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-[#070e17] p-1.5 rounded-2xl border border-[#1b344b] text-xs">
            {(['daily', 'weekly', 'monthly', 'quarterly'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1.5 rounded-xl capitalize font-semibold transition-all cursor-pointer ${
                  selectedPeriod === period 
                    ? 'bg-[#ff4d6d] text-white shadow' 
                    : 'text-[#7d97aa] hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Water Balance Breakdown Table */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#8da4b5] mb-3">
            1. Mass-Balance Flow Reconciliation (m³)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1b344b] text-[#718d9e] uppercase font-bold text-[10px]">
                  <th className="py-2.5 px-3">Process Segment</th>
                  <th className="py-2.5 px-3">Gross Inflow (m³)</th>
                  <th className="py-2.5 px-3">Net Outflow (m³)</th>
                  <th className="py-2.5 px-3">Evaporation/Process (m³)</th>
                  <th className="py-2.5 px-3">Variance / Unaccounted (L)</th>
                  <th className="py-2.5 px-3">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#132839] font-mono text-gray-200">
                <tr>
                  <td className="py-3 px-3 font-sans font-semibold text-white">Intake & Pre-Treatment (Raw Water Tank TL-01)</td>
                  <td className="py-3 px-3">125,520</td>
                  <td className="py-3 px-3">124,800</td>
                  <td className="py-3 px-3">480</td>
                  <td className="py-3 px-3 text-[#10b981]">240 L (0.19%)</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10b981]/20 text-[#10b981]">NOMINAL</span></td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-sans font-semibold text-white">High-Pressure Booster Header (Pump P-01 / FS-01)</td>
                  <td className="py-3 px-3">124,800</td>
                  <td className="py-3 px-3">122,160</td>
                  <td className="py-3 px-3">0</td>
                  <td className="py-3 px-3 text-amber-400">2,640 L (2.11%)</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-400">AUDIT FLAGGED</span></td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-sans font-semibold text-white">Cooling Towers & Evaporative Condensers</td>
                  <td className="py-3 px-3">68,400</td>
                  <td className="py-3 px-3">54,720</td>
                  <td className="py-3 px-3">13,200</td>
                  <td className="py-3 px-3 text-[#10b981]">480 L (0.70%)</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10b981]/20 text-[#10b981]">NOMINAL</span></td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-sans font-semibold text-white">Treated Water Storage (Tank TL-02 & Point of Use)</td>
                  <td className="py-3 px-3">53,760</td>
                  <td className="py-3 px-3">53,400</td>
                  <td className="py-3 px-3">220</td>
                  <td className="py-3 px-3 text-[#10b981]">140 L (0.26%)</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10b981]/20 text-[#10b981]">NOMINAL</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Environmental Footprint & ESG Verification Signatures */}
        <div className="pt-6 border-t border-[#182e42] grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-4 rounded-2xl bg-[#070e17] border border-[#1b344b] space-y-2">
            <span className="text-[10px] text-[#ff4d6d] font-bold uppercase tracking-wider">Third-Party ESG Certification</span>
            <p className="text-gray-300 leading-relaxed text-[11px]">
              This report satisfies the statutory water stewardship criteria pursuant to Central Pollution Control Board (CPCB) Notification GSR-826(E) and ISO 14046 Environmental Management — Water Footprint.
            </p>
            <div className="flex items-center space-x-2 pt-2 text-[10px] text-[#10b981] font-mono font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>SHA-256 HASH VERIFIED: 9a8c2...e81f</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#070e17] border border-[#1b344b] flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-[#7895aa] font-bold uppercase tracking-wider">Certified By Lead Auditor</span>
              <p className="font-bold text-white text-sm font-['Outfit',sans-serif] mt-1">Sanjeev Sharma</p>
              <p className="text-[11px] text-[#7895aa]">Chief Plant Operations & Water Stewardship Officer</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] text-gray-400 font-mono border-t border-[#152c3f] pt-2">
              <span>Date: 2026-09-18</span>
              <span className="text-[#00e5ff]">AquaRisk AI Signature Valid</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
