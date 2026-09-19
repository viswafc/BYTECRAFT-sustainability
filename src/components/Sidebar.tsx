import React from 'react';
import { PageId } from '../types';
import { useTelemetry } from '../context/TelemetryContext';
import { 
  Gauge, 
  AlertOctagon, 
  Workflow, 
  Sliders, 
  BarChart3, 
  SlidersHorizontal,
  ShieldAlert,
  ChevronRight,
  Droplets,
  ArrowRight
} from 'lucide-react';

interface SidebarProps {
  currentPage?: PageId;
  activePage?: PageId;
  onSelectPage: (page: PageId) => void;
  onEmergencyClick?: () => void;
  onOpenEmergencyModal?: () => void;
  isCollapsed?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  activePage,
  onSelectPage,
  onEmergencyClick,
  onOpenEmergencyModal,
  mobileOpen,
  onCloseMobile
}) => {
  const current = currentPage || activePage || 'command-center';
  const handleEmergency = onEmergencyClick || onOpenEmergencyModal || (() => {});
  const { activeIncidents, emergencyTriggered } = useTelemetry();

  const navItems: Array<{
    id: PageId;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    {
      id: 'command-center',
      label: 'Command Center',
      sublabel: 'Live plant state',
      icon: Gauge,
      badge: activeIncidents.length > 0 ? `${activeIncidents.length} LIVE` : undefined,
      badgeColor: 'bg-[#ff5b67]/20 text-[#ff5b67]'
    },
    {
      id: 'incident-center',
      label: 'Incident Log',
      sublabel: 'Acoustic audit records',
      icon: AlertOctagon,
      badge: activeIncidents.length > 0 ? activeIncidents.length : undefined,
      badgeColor: 'bg-amber-400/20 text-amber-400'
    },
    {
      id: 'digital-twin',
      label: 'Digital Twin',
      sublabel: 'Hydraulic network view',
      icon: Workflow
    },
    {
      id: 'what-if-lab',
      label: 'What-If Lab',
      sublabel: 'Predictive simulations',
      icon: Sliders
    },
    {
      id: 'analytics',
      label: 'Analytics & Costs',
      sublabel: 'Financial loss metrics',
      icon: BarChart3
    },
    {
      id: 'settings',
      label: 'Plant Settings',
      sublabel: 'Sensor thresholds',
      icon: SlidersHorizontal
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden" 
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 md:z-30
        w-64 bg-[#07131e] border-r border-[#163044]
        flex flex-col justify-between shrink-0 select-none transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Navigation Items */}
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Facility Identifier */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 bg-[#28d7ff] rounded-xl flex items-center justify-center text-[#07131e] font-bold shadow-sm">
              <Droplets className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#e6f3fa] tracking-tight">AquaRisk AI</div>
              <div className="text-[11px] text-[#6e899c]">Plant Network 01</div>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <div className="px-3 pb-1 text-[11px] font-semibold text-[#5a768c] uppercase tracking-wider">
              Platform Views
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = current === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectPage(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 flex items-center justify-between cursor-pointer group ${
                    isActive
                      ? 'bg-[#102436] text-[#28d7ff] font-semibold border border-[#1f435e]'
                      : 'text-[#8ba2b2] hover:text-[#e6f3fa] hover:bg-[#0c1c2b]'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#28d7ff]' : 'text-[#6e899c] group-hover:text-[#28d7ff]'
                    }`} />
                    <span className="text-xs truncate">
                      {item.label}
                    </span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-[#ff5b67] text-white' : 'bg-[#ff5b67]/20 text-[#ff5b67]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Emergency & Telemetry Status */}
        <div className="p-4 border-t border-[#163044] bg-[#050e17] space-y-3">
          {/* Status Box */}
          <div className="p-3 rounded-xl bg-[#0c1c2b] border border-[#19354b] flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#31d48c] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#31d48c]" /> 
                SCADA Online
              </span>
              <span className="text-[#6e899c] font-mono text-[10px]">v4.2</span>
            </div>
            <span className="text-[#8ba2b2] text-[11px]">Sampling: 1,000ms polling</span>
          </div>

          {/* Master Emergency Button */}
          <button
            onClick={handleEmergency}
            className={`w-full py-2.5 px-3 rounded-xl font-semibold text-xs tracking-wide uppercase flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              emergencyTriggered
                ? 'bg-[#ff5b67] text-white shadow-md'
                : 'bg-[#ff5b67]/10 hover:bg-[#ff5b67]/20 border border-[#ff5b67]/40 text-[#ff5b67]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{emergencyTriggered ? 'OVERRIDE ACTIVE' : 'EMERGENCY OVERRIDE'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
