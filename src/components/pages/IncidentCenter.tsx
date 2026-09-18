import React, { useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { Incident, IncidentStatus, PageId } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertOctagon, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Droplets, 
  X, 
  FileText, 
  Download, 
  ShieldCheck, 
  Wrench,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';

interface IncidentCenterProps {
  onNavigate: (page: PageId) => void;
}

export const IncidentCenter: React.FC<IncidentCenterProps> = ({ onNavigate }) => {
  const { incidents, acknowledgeIncident, resolveIncident, toggleValveState } = useTelemetry();

  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Resolved'>('All');
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [operatorNotes, setOperatorNotes] = useState<string>('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filter incidents
  const filteredIncidents = incidents.filter(inc => {
    if (statusFilter === 'Active' && inc.status !== 'Active' && inc.status !== 'Investigating') return false;
    if (statusFilter === 'Resolved' && inc.status !== 'Resolved') return false;
    if (zoneFilter !== 'All' && !inc.zone.includes(zoneFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inc.id.toLowerCase().includes(q) ||
        inc.location.toLowerCase().includes(q) ||
        inc.rootCause.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAcknowledge = (inc: Incident) => {
    acknowledgeIncident(inc.id, operatorNotes || 'Acknowledged via Incident Center Console');
    setActionNotice(`Incident ${inc.id} logged as Acknowledged. Work order updated.`);
    setTimeout(() => setActionNotice(null), 3000);
    if (selectedIncident?.id === inc.id) {
      setSelectedIncident({
        ...selectedIncident,
        acknowledged: true,
        status: 'Investigating',
        acknowledgedBy: 'Chief Control Operator (Station 01)',
        acknowledgedAt: new Date().toISOString()
      });
    }
  };

  const handleResolve = (inc: Incident) => {
    resolveIncident(inc.id);
    setActionNotice(`Incident ${inc.id} marked as RESOLVED.`);
    setTimeout(() => setActionNotice(null), 3000);
    if (selectedIncident?.id === inc.id) {
      setSelectedIncident({
        ...selectedIncident,
        status: 'Resolved'
      });
    }
  };

  const handleExportJson = (inc: Incident) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inc, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `AquaRisk_${inc.id}_Report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="py-2 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#e6f3fa]">
              Incident Records & Root Cause Log
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ff5b67]/15 text-[#ff5b67] text-xs font-mono font-bold border border-[#ff5b67]/30">
              AUDIT TRAIL
            </span>
          </div>
          <p className="text-sm text-[#8ba2b2]">
            Plant-wide acoustic leak detections, SCADA actuation telemetry, and root-cause audits
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="bg-[#0c1c2b] px-4 py-2 rounded-xl border border-[#1a374d] flex items-center space-x-2.5">
            <span className="text-[#6e899c]">Total Logged:</span>
            <span className="text-[#e6f3fa] font-bold text-sm">{incidents.length}</span>
          </div>
          <div className="bg-[#0c1c2b] px-4 py-2 rounded-xl border border-[#ff5b67]/30 flex items-center space-x-2.5">
            <span className="text-[#ff5b67]">Active:</span>
            <span className="text-[#ff5b67] font-bold text-sm">
              {incidents.filter(i => i.status === 'Active' || i.status === 'Investigating').length}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0c1c2b] rounded-2xl p-4 lg:p-5 border border-[#1a374d] flex flex-col md:flex-row gap-3.5 items-center justify-between">
        <div className="relative w-full md:w-88">
          <Search className="w-4 h-4 text-[#6e899c] absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search incident ID, trench location, or root cause..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06121d] border border-[#19354b] text-xs text-[#e6f3fa] placeholder-[#5c778c] focus:outline-none focus:border-[#28d7ff] transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter buttons */}
          <div className="flex items-center bg-[#06121d] p-1 rounded-xl border border-[#19354b] text-xs">
            {(['All', 'Active', 'Resolved'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#28d7ff] text-[#041624] font-bold shadow-sm'
                    : 'text-[#8ba2b2] hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Zone Selector */}
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[#06121d] border border-[#19354b] text-xs text-[#e6f3fa] focus:outline-none focus:border-[#28d7ff] cursor-pointer"
          >
            <option value="All">All Factory Zones</option>
            <option value="Zone 1">Zone 1 - Main Intake</option>
            <option value="Zone 2">Zone 2 - Line A Pre-Treatment</option>
            <option value="Zone 3">Zone 3 - Line B High-Pressure</option>
            <option value="Zone 4">Zone 4 - Cooling Towers</option>
          </select>
        </div>
      </div>

      {actionNotice && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-[#31d48c]/15 border border-[#31d48c]/40 text-[#31d48c] text-xs font-mono rounded-xl flex items-center space-x-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionNotice}</span>
        </motion.div>
      )}

      {/* Clean Incident Table with Generous Padding */}
      <div className="bg-[#0c1c2b] rounded-2xl border border-[#1a374d] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-[#6e899c] bg-[#07131e] border-b border-white/5 uppercase font-mono tracking-wider">
              <tr>
                <th className="py-4 px-5">Incident ID</th>
                <th className="py-4 px-4">Detected</th>
                <th className="py-4 px-4">Location & Segment</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-right">Volume Lost</th>
                <th className="py-4 px-4 text-right">Cost Impact</th>
                <th className="py-4 px-4 text-center">AI Confidence</th>
                <th className="py-4 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-[#6e899c] font-sans">
                    No incidents match your selected filters.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident) => {
                  const isCrit = incident.severity === 'Critical';
                  const isWarn = incident.severity === 'Warning';
                  const isActive = incident.status === 'Active' || incident.status === 'Investigating';

                  return (
                    <tr
                      key={incident.id}
                      onClick={() => setSelectedIncident(incident)}
                      className={`cursor-pointer transition-colors hover:bg-[#112638] ${
                        isActive ? 'bg-[#ff5b67]/5' : ''
                      }`}
                    >
                      <td className="py-4 px-5 font-bold text-[#e6f3fa] flex items-center space-x-2.5">
                        <AlertOctagon className={`w-4 h-4 shrink-0 ${
                          isCrit ? 'text-[#ff5b67]' : isWarn ? 'text-amber-400' : 'text-[#28d7ff]'
                        }`} />
                        <span className="hover:text-[#28d7ff] transition-colors">{incident.id}</span>
                      </td>

                      <td className="py-4 px-4 text-[#8ba2b2]">
                        {incident.timestamp}
                      </td>

                      <td className="py-4 px-4 font-sans">
                        <div className="text-[#e6f3fa] font-medium">{incident.location}</div>
                        <div className="text-[11px] text-[#6e899c]">{incident.zone}</div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          incident.status === 'Active'
                            ? 'bg-[#ff5b67]/15 text-[#ff5b67] border border-[#ff5b67]/30'
                            : incident.status === 'Investigating'
                            ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30'
                            : incident.status === 'Isolated'
                            ? 'bg-[#28d7ff]/15 text-[#28d7ff] border border-[#28d7ff]/30'
                            : 'bg-[#31d48c]/15 text-[#31d48c] border border-[#31d48c]/30'
                        }`}>
                          {incident.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right font-bold text-[#e6f3fa]">
                        {incident.volumeLostLiters.toLocaleString()} L
                      </td>

                      <td className="py-4 px-4 text-right font-bold text-[#ff5b67]">
                        ₹{incident.financialImpactInr.toLocaleString()}
                      </td>

                      <td className="py-4 px-4 text-center text-[#28d7ff] font-bold">
                        {incident.confidenceScore}%
                      </td>

                      <td className="py-4 px-5 text-right font-sans">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIncident(incident);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#06121d] hover:bg-[#152e42] text-[#8ba2b2] hover:text-[#28d7ff] border border-[#19354b] transition-colors inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Review</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Detail Drawer/Modal */}
      <AnimatePresence>
        {selectedIncident && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0c1c2b] border border-[#1f435e] rounded-2xl p-6 lg:p-7 w-full max-w-2xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-[#ff5b67]/15 text-[#ff5b67]">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#e6f3fa]">
                      Incident Dossier: {selectedIncident.id}
                    </h3>
                    <p className="text-xs text-[#6e899c]">{selectedIncident.location} • {selectedIncident.zone}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="p-1 text-[#6e899c] hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 4 Fast Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="bg-[#07131e] p-3 rounded-xl border border-[#152e42]">
                  <span className="text-[10px] text-[#6e899c] block font-sans">STATUS</span>
                  <span className="text-sm font-bold text-[#ff5b67]">{selectedIncident.status}</span>
                </div>
                <div className="bg-[#07131e] p-3 rounded-xl border border-[#152e42]">
                  <span className="text-[10px] text-[#6e899c] block font-sans">VOLUME ESCAPE</span>
                  <span className="text-sm font-bold text-[#e6f3fa]">{selectedIncident.volumeLostLiters.toLocaleString()} L</span>
                </div>
                <div className="bg-[#07131e] p-3 rounded-xl border border-[#152e42]">
                  <span className="text-[10px] text-[#6e899c] block font-sans">TARIFF BLEED</span>
                  <span className="text-sm font-bold text-amber-300">₹{selectedIncident.financialImpactInr.toLocaleString()}</span>
                </div>
                <div className="bg-[#07131e] p-3 rounded-xl border border-[#152e42]">
                  <span className="text-[10px] text-[#6e899c] block font-sans">CONFIDENCE</span>
                  <span className="text-sm font-bold text-[#28d7ff]">{selectedIncident.confidenceScore}%</span>
                </div>
              </div>

              {/* Root Cause & Physical Triangulation */}
              <div className="bg-[#07131e] p-4 rounded-xl border border-[#152e42] space-y-2 text-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-[#28d7ff] font-mono">
                  Root Cause Audit Findings:
                </span>
                <p className="text-[#cce2f0] leading-relaxed">
                  {selectedIncident.rootCause}
                </p>
              </div>

              {/* Acknowledgment Info */}
              {selectedIncident.acknowledged && (
                <div className="p-3.5 rounded-xl bg-[#31d48c]/10 border border-[#31d48c]/30 flex items-center justify-between text-xs text-[#8ba2b2] font-mono">
                  <span className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-[#31d48c]" />
                    <span>Logged by {selectedIncident.acknowledgedBy || 'Chief Shift Operator'}</span>
                  </span>
                  <span className="text-[#6e899c]">{selectedIncident.acknowledgedAt || selectedIncident.timestamp}</span>
                </div>
              )}

              {/* Operator Note */}
              {!selectedIncident.acknowledged && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-mono text-[#6e899c]">
                    OPERATOR AUDIT LOG NOTE (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter dispatch notes, valve actuation tag, or SAP work order ref..."
                    value={operatorNotes}
                    onChange={(e) => setOperatorNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07131e] border border-[#152e42] text-xs text-white focus:outline-none focus:border-[#28d7ff]"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => handleExportJson(selectedIncident)}
                  className="px-4 py-2 rounded-xl bg-[#07131e] hover:bg-[#152e42] text-[#8ba2b2] hover:text-white border border-[#152e42] text-xs font-medium flex items-center space-x-2 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#28d7ff]" />
                  <span>Export Dossier (JSON)</span>
                </button>

                <div className="flex items-center space-x-2.5">
                  {!selectedIncident.acknowledged && (
                    <button
                      onClick={() => handleAcknowledge(selectedIncident)}
                      className="px-4 py-2 rounded-xl bg-[#28d7ff] text-[#041624] font-bold text-xs hover:bg-[#5ae0ff] transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Acknowledge Incident</span>
                    </button>
                  )}

                  {selectedIncident.status !== 'Resolved' && (
                    <button
                      onClick={() => handleResolve(selectedIncident)}
                      className="px-4 py-2 rounded-xl bg-[#31d48c]/20 border border-[#31d48c]/50 text-[#31d48c] hover:bg-[#31d48c] hover:text-[#041624] font-bold text-xs transition-all cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedIncident(null)}
                    className="px-3 py-2 text-xs text-[#6e899c] hover:text-white cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
