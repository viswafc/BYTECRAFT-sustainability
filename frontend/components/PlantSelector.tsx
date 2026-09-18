import React, { useState, useRef, useEffect } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { PlantId } from '../types';
import { 
  Factory, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Activity, 
  Gauge, 
  Droplets,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PlantSelector: React.FC = () => {
  const { currentPlantId, currentPlant, plants, setCurrentPlantId } = useTelemetry();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentIndex = plants.findIndex(p => p.id === currentPlantId);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevIndex = (currentIndex - 1 + plants.length) % plants.length;
    setCurrentPlantId(plants[prevIndex].id);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIndex = (currentIndex + 1) % plants.length;
    setCurrentPlantId(plants[nextIndex].id);
  };

  const getStatusBadge = (status: 'critical' | 'warning' | 'nominal', label: string) => {
    if (status === 'critical') {
      return (
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#ff5b67]/15 text-[#ff5b67] border border-[#ff5b67]/30 text-[10px] font-mono font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff5b67] beacon" />
          {label}
        </span>
      );
    }
    if (status === 'warning') {
      return (
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-400 border border-amber-400/30 text-[10px] font-mono font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          {label}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#31d48c]/15 text-[#31d48c] border border-[#31d48c]/30 text-[10px] font-mono font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-[#31d48c]" />
        {label}
      </span>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selector Capsule */}
      <div className="flex items-center bg-[#0c1c2b] border border-[#1a374d] hover:border-[#28d7ff]/50 rounded-xl transition-all shadow-sm">
        {/* Step Prev */}
        <button
          onClick={handlePrev}
          className="px-1.5 py-1.5 text-[#6c8699] hover:text-[#28d7ff] transition-colors border-r border-[#1a374d]/70 cursor-pointer"
          title="Previous Plant"
          aria-label="Previous Plant"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Main Plant Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-2.5 py-1 text-left cursor-pointer group"
          aria-expanded={isOpen}
          aria-label="Select Industrial Facility"
        >
          <Factory className="w-3.5 h-3.5 text-[#28d7ff] group-hover:scale-110 transition-transform" />
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#e6f3fa] group-hover:text-white transition-colors">
                {currentPlant.shortName}
              </span>
              <span className="text-[10px] font-mono text-[#6c8699] hidden md:inline">
                [{currentPlant.code}]
              </span>
            </div>
          </div>

          <div className="hidden sm:block ml-1">
            {getStatusBadge(currentPlant.status, currentPlant.statusLabel)}
          </div>

          <ChevronDown className={`w-3.5 h-3.5 text-[#6c8699] transition-transform duration-200 ml-0.5 ${isOpen ? 'rotate-180 text-[#28d7ff]' : ''}`} />
        </button>

        {/* Step Next */}
        <button
          onClick={handleNext}
          className="px-1.5 py-1.5 text-[#6c8699] hover:text-[#28d7ff] transition-colors border-l border-[#1a374d]/70 cursor-pointer"
          title="Next Plant"
          aria-label="Next Plant"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-[#091724] border border-[#1d3d57] rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl overflow-hidden"
          >
            {/* Popover Header */}
            <div className="px-3 py-2 border-b border-[#163044] flex items-center justify-between">
              <span className="text-xs font-bold text-[#8ba2b2] tracking-wider uppercase flex items-center gap-1.5">
                <Factory className="w-3.5 h-3.5 text-[#28d7ff]" />
                Industrial Facility Network
              </span>
              <span className="text-[10px] font-mono text-[#6c8699]">
                4 Plants Online
              </span>
            </div>

            {/* List of Plants */}
            <div className="space-y-1.5 mt-2 max-h-[380px] overflow-y-auto pr-1">
              {plants.map((plant) => {
                const isSelected = plant.id === currentPlantId;
                return (
                  <div
                    key={plant.id}
                    onClick={() => {
                      setCurrentPlantId(plant.id);
                      setIsOpen(false);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-[#10293d] border-[#28d7ff]/60 shadow-[0_0_12px_rgba(40,215,255,0.15)]'
                        : 'bg-[#0c1c2b]/80 border-[#152e42] hover:bg-[#0f2438] hover:border-[#1d425f]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#e6f3fa] group-hover:text-white">
                            {plant.name}
                          </span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#28d7ff]" />
                          )}
                        </div>
                        <div className="text-[11px] text-[#28d7ff] font-medium mt-0.5">
                          {plant.facilityType}
                        </div>
                        <div className="text-[10px] text-[#6c8699] flex items-center gap-1 mt-0.5">
                          <span>{plant.location}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge(plant.status, plant.statusLabel)}
                        <span className="text-[10px] font-mono text-[#8ba2b2]">
                          {plant.code}
                        </span>
                      </div>
                    </div>

                    {/* Quick Telemetry Strip */}
                    <div className="mt-2.5 pt-2 border-t border-[#163044]/60 grid grid-cols-3 gap-2 text-[10px] font-mono">
                      <div className="flex flex-col">
                        <span className="text-[#6c8699]">Cap / Day</span>
                        <span className="text-[#cce4f2] font-semibold">{plant.capacityM3Day} m³</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#6c8699]">Nominal Flow</span>
                        <span className="text-[#cce4f2] font-semibold">{plant.flowRateNominalLpm} L/m</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#6c8699]">Pressure</span>
                        <span className="text-[#cce4f2] font-semibold">{plant.pressureNominalBar} Bar</span>
                      </div>
                    </div>

                    {/* Active Issue Preview */}
                    <div className="mt-2 text-[10px] text-[#8ba2b2] bg-[#07131e] px-2 py-1 rounded-md border border-[#163044]/50 line-clamp-1">
                      <span className="text-[#28d7ff] font-semibold">Active:</span> {plant.activeIssue}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
