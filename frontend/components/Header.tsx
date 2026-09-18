import React, { useState, useEffect, useRef } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { PageId } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Activity, 
  BarChart3, 
  AlertCircle, 
  FileText, 
  Settings, 
  Search, 
  Bell, 
  ChevronDown, 
  Droplets,
  CheckCircle2,
  AlertTriangle,
  X,
  Radio,
  ExternalLink,
  ShieldCheck,
  User
} from 'lucide-react';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onEmergencyClick?: () => void;
  onSearchSelect?: (target: { type: 'sensor' | 'valve' | 'page' | 'incident'; id: string }) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentPage, 
  onNavigate,
  onEmergencyClick,
  onSearchSelect
}) => {
  const { 
    telemetry, 
    notifications, 
    clearNotifications,
    currentPlant,
    currentPlantId,
    setCurrentPlantId,
    plants,
    fleetHealthScore
  } = useTelemetry();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [notifOpen, setNotifOpen] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navTabs: { id: PageId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'live-data', label: 'Live Data', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'incidents', label: 'Incidents', icon: AlertCircle },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Search items index
  const searchResults = [
    { title: 'Tank Level Sensor (TL-01)', category: 'Sensors', id: 'TL-01', type: 'sensor' as const, page: 'overview' as const },
    { title: 'Tank Level Sensor (TL-02)', category: 'Sensors', id: 'TL-02', type: 'sensor' as const, page: 'overview' as const },
    { title: 'Flow Sensor (FS-01)', category: 'Sensors', id: 'FS-01', type: 'sensor' as const, page: 'overview' as const },
    { title: 'Flow Sensor (FS-02)', category: 'Sensors', id: 'FS-02', type: 'sensor' as const, page: 'overview' as const },
    { title: 'Pressure Sensor (PS-01)', category: 'Sensors', id: 'PS-01', type: 'sensor' as const, page: 'overview' as const },
    { title: 'Pump RPM Sensor (RPM-01)', category: 'Pumps', id: 'RPM-01', type: 'sensor' as const, page: 'overview' as const },
    { title: 'Vibration Sensor (VB-01)', category: 'Pumps', id: 'VB-01', type: 'sensor' as const, page: 'overview' as const },
    { title: 'Valve Sensor (V-01) - 40% Open', category: 'Valves', id: 'V-01', type: 'valve' as const, page: 'overview' as const },
    { title: 'Valve Sensor (V-02) - 100% Open', category: 'Valves', id: 'V-02', type: 'valve' as const, page: 'overview' as const },
    { title: 'Raw Water Tank', category: 'Tanks', id: 'TL-01', type: 'sensor' as const, page: 'overview' as const },
    { title: 'Treated Water Tank', category: 'Tanks', id: 'TL-02', type: 'sensor' as const, page: 'overview' as const },
    { title: 'Incident INC-8921 (S05 Micro-Fissure)', category: 'Incidents', id: 'INC-8921', type: 'incident' as const, page: 'incidents' as const },
  ].filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase()));

  // Determine active tab matching
  const isTabActive = (tabId: PageId) => {
    if (currentPage === tabId) return true;
    if (tabId === 'overview' && (currentPage === 'command-center' || currentPage === 'digital-twin')) return true;
    if (tabId === 'live-data' && currentPage === 'what-if-lab') return true;
    if (tabId === 'incidents' && currentPage === 'incident-center') return true;
    return false;
  };

  return (
    <header className="h-[72px] bg-[#0b121a] border-b border-[#1b2b3a] px-5 sm:px-8 flex items-center justify-between sticky top-0 z-50 select-none shadow-md">
      
      {/* LEFT: Brand Logo & Subtitle */}
      <div 
        onClick={() => onNavigate('overview')}
        className="flex items-center space-x-3 cursor-pointer group shrink-0"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ff3366] via-[#ff5b79] to-[#ff758f] flex items-center justify-center shadow-lg shadow-[#ff4d6d]/30 group-hover:scale-105 transition-transform">
          <Droplets className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-xl font-extrabold tracking-tight text-white font-['Outfit',sans-serif]">
              AquaRisk <span className="text-[#ff4d6d]">AI</span>
            </span>
          </div>
          <p className="text-[11px] text-[#7d92a4] font-medium tracking-wide">
            Smart Water for a Sustainable Tomorrow
          </p>
        </div>
      </div>

      {/* CENTER: Clean Navigation Pill Tabs */}
      <nav className="hidden lg:flex items-center bg-[#070e16]/80 p-1.5 rounded-full border border-[#162737] shadow-inner">
        {navTabs.map((tab) => {
          const active = isTabActive(tab.id);
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`relative flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                active 
                  ? 'text-white bg-[#2a1420] border border-[#ff4d6d]/50 shadow-sm shadow-[#ff4d6d]/20' 
                  : 'text-[#8ba2b5] hover:text-white hover:bg-[#122232]/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#ff4d6d]' : 'text-[#8ba2b5]'}`} />
              <span>{tab.label}</span>
              {active && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 rounded-full border border-[#ff4d6d]/40 pointer-events-none"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* RIGHT: Search Bar, Notifications, User Profile */}
      <div className="flex items-center space-x-3.5">
        
        {/* Search Input Bar */}
        <div ref={searchRef} className="relative hidden md:block">
          <div className="flex items-center bg-[#070e16] border border-[#1b2f42] rounded-full px-3.5 py-1.5 w-52 lg:w-64 focus-within:w-72 focus-within:border-[#ff4d6d] transition-all">
            <Search className="w-3.5 h-3.5 text-[#738a9c] mr-2 shrink-0" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search anything..."
              className="bg-transparent text-xs text-white placeholder-[#5a7285] focus:outline-none w-full font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-[#738a9c] hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Live Search Quick Results Modal */}
          <AnimatePresence>
            {searchOpen && searchQuery.trim().length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute left-0 right-0 mt-2 bg-[#0c1824] border border-[#223b52] rounded-2xl shadow-2xl p-2 z-50 max-h-72 overflow-y-auto"
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#ff4d6d]">
                  Quick Match ({searchResults.length})
                </div>
                {searchResults.length === 0 ? (
                  <div className="p-4 text-xs text-gray-400 text-center">
                    No components found matching "{searchQuery}"
                  </div>
                ) : (
                  searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        onNavigate(item.page);
                        if (onSearchSelect) {
                          onSearchSelect({ type: item.type, id: item.id });
                        }
                        setSearchOpen(false);
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#162a3d] cursor-pointer text-xs transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-white">{item.title}</div>
                        <span className="text-[10px] text-[#7c95aa]">{item.category} • Plant 1</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-[#ff4d6d]" />
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fleet Sensor Health Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#070e16] border border-[#1b2f42]">
          <span className="w-2 h-2 rounded-full bg-[#31d48c] animate-pulse" />
          <span className="text-[11px] text-[#7d92a4] font-medium">Fleet Health:</span>
          <span className="text-xs font-mono font-bold text-[#31d48c]">{fleetHealthScore}%</span>
        </div>

        {/* Notifications Bell with Pink Badge */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="w-10 h-10 rounded-full bg-[#070e16] border border-[#1b2f42] hover:border-[#ff4d6d] flex items-center justify-center text-[#8ba2b5] hover:text-white transition-colors relative cursor-pointer"
            aria-label="Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ff4d6d] text-white text-[9px] font-black flex items-center justify-center shadow-md shadow-[#ff4d6d]/50 animate-pulse">
              1
            </span>
          </button>

          {/* Notifications Dropdown Panel */}
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                className="absolute right-0 mt-2 w-80 bg-[#0c1824] border border-[#223b52] rounded-2xl shadow-2xl p-4 z-50"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#1b3247]">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#ff4d6d]" />
                    <span className="font-bold text-xs text-white">System Notifications</span>
                  </div>
                  <span className="text-[10px] text-[#ff4d6d] font-bold cursor-pointer hover:underline" onClick={clearNotifications}>
                    Clear all
                  </span>
                </div>

                <div className="py-2 space-y-2">
                  <div className="p-2.5 rounded-xl bg-[#281318] border border-[#ff4d6d]/40 text-xs">
                    <div className="flex items-center justify-between font-semibold text-[#ff4d6d] text-[11px]">
                      <span>Critical Leak Detected (S05)</span>
                      <span className="text-[10px] text-gray-400">10:21 AM</span>
                    </div>
                    <p className="text-[11px] text-gray-300 mt-1">
                      Flow rate drop at FS-02. Upstream Valve V-104 recommended for immediate isolation.
                    </p>
                    <button 
                      onClick={() => {
                        onNavigate('incidents');
                        setNotifOpen(false);
                      }}
                      className="mt-2 text-[10px] font-bold text-white bg-[#ff4d6d] px-2.5 py-1 rounded-lg hover:bg-[#ff3366] transition-colors"
                    >
                      Review Incident
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#070e16] border border-[#1b3247] text-xs">
                    <div className="flex items-center justify-between font-semibold text-[#28d7ff] text-[11px]">
                      <span>SCADA Calibration Verified</span>
                      <span className="text-[10px] text-gray-400">07:30 AM</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      All 14 plant telemetry hydrophones synchronized at nominal 10ms sampling rate.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Badge: "SS", "Sanjeev", "Administrator" */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2.5 p-1.5 pr-2.5 rounded-full bg-[#070e16] border border-[#1b2f42] hover:border-[#2b4b66] transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1f3f59] to-[#3a6688] flex items-center justify-center font-bold text-xs text-white border border-[#487396]">
              SS
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-white leading-tight">Sanjeev</div>
              <div className="text-[10px] text-[#7d92a4] font-medium leading-tight">Administrator</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#7d92a4]" />
          </button>

          {/* Profile Dropdown Menu */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                className="absolute right-0 mt-2 w-56 bg-[#0c1824] border border-[#223b52] rounded-2xl shadow-2xl p-2 z-50 text-xs text-gray-300"
              >
                <div className="px-3 py-2 border-b border-[#1b3247]">
                  <p className="text-white font-bold">Sanjeev Sharma</p>
                  <p className="text-[11px] text-[#7d92a4]">Chief Plant Operations</p>
                  <div className="mt-1 flex items-center space-x-1 text-[10px] text-[#10b981]">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Level 4 Safety Clearance</span>
                  </div>
                </div>
                <div className="p-1 space-y-1">
                  <button 
                    onClick={() => {
                      onNavigate('settings');
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#162a3d] hover:text-white transition-colors flex items-center space-x-2"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#ff4d6d]" />
                    <span>System Settings</span>
                  </button>
                  <button 
                    onClick={() => {
                      onNavigate('reports');
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#162a3d] hover:text-white transition-colors flex items-center space-x-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#28d7ff]" />
                    <span>Compliance Reports</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
};
