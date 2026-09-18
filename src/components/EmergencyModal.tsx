import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { 
  ShieldAlert, 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  Lock, 
  PowerOff,
  Flame,
  Wrench
} from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const { 
    emergencyTriggered, 
    triggerEmergencyOverride, 
    resetEmergencyOverride,
    toggleValveState 
  } = useTelemetry();

  const [confirmStep, setConfirmStep] = useState<boolean>(false);
  const [overrideSuccess, setOverrideSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleIsolateSegmentS05 = () => {
    toggleValveState('NODE-V104', 0);
    setOverrideSuccess('Quick Isolation executed: Valve V-104 closed to 0%. Line B pressure stabilizing.');
    setTimeout(() => {
      setOverrideSuccess(null);
      onClose();
    }, 2000);
  };

  const handleMasterPlantHalt = () => {
    triggerEmergencyOverride();
    setOverrideSuccess('FULL PLANT MASTER OVERRIDE EXECUTED: All Solenoid Valves shut to 0%.');
    setTimeout(() => {
      setOverrideSuccess(null);
      onClose();
    }, 2500);
  };

  const handleClearOverride = () => {
    resetEmergencyOverride();
    setOverrideSuccess('Emergency Override cleared. Normal plant telemetry restored.');
    setTimeout(() => {
      setOverrideSuccess(null);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-up">
      <div className="relative w-full max-w-lg glass-panel-critical rounded-2xl p-6 shadow-2xl border border-[#FF5B67]/60 overflow-hidden">
        {/* Glow Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#FF5B67]/30">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-[#FF5B67]/20 border border-[#FF5B67]/40 text-[#FF5B67] animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide font-['Outfit']">
                EMERGENCY OVERRIDE CONSOLE
              </h2>
              <p className="text-xs text-[#FF5B67] font-mono tracking-wider">
                DIRECT SCADA LEVEL-4 SAFETY ACTUATION
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {overrideSuccess ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#14E88D] mx-auto animate-bounce" />
            <p className="text-sm font-semibold text-white">{overrideSuccess}</p>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-xs text-gray-300 leading-relaxed">
              <div className="flex items-center space-x-2 text-[#FFC837] font-semibold mb-1">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Operational Warning</span>
              </div>
              Actuating emergency override immediately commands plant PLC field solenoids. Physical water flow in designated segments will be severed. Use with operational authorization.
            </div>

            {/* Emergency Action 1: Targeted Segment S05 Isolation */}
            <div className="p-3.5 bg-[#0e1f30] rounded-xl border border-[#28D7FF]/30 hover:border-[#28D7FF] transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>Targeted Isolation: Segment S05</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#FF5B67]/20 text-[#FF5B67] font-mono">
                      RECOMMENDED
                    </span>
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Closes Solenoid V-104 only. Keeps Line A Bottling & Cooling loop online.
                  </p>
                </div>
                <button
                  onClick={handleIsolateSegmentS05}
                  className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#28D7FF] to-[#007EA7] text-[#040F16] font-bold text-xs hover-lift"
                >
                  ISOLATE S05
                </button>
              </div>
            </div>

            {/* Emergency Action 2: Master Plant Isolation */}
            <div className="p-3.5 bg-[#200e14] rounded-xl border border-[#FF5B67]/40 hover:border-[#FF5B67] transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Flame className="w-4 h-4 text-[#FF5B67]" />
                    <span>Master Plant Hard Isolation</span>
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Closes Master Intake P-01, V-101, V-103, V-104. Shuts down all bottling loops.
                  </p>
                </div>
                {!confirmStep ? (
                  <button
                    onClick={() => setConfirmStep(true)}
                    className="px-3.5 py-2 rounded-lg bg-[#FF5B67]/20 border border-[#FF5B67] text-[#FF5B67] hover:bg-[#FF5B67] hover:text-white font-bold text-xs hover-lift transition-all"
                  >
                    TRIGGER ALL
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleMasterPlantHalt}
                      className="px-3.5 py-2 rounded-lg bg-[#FF5B67] text-white font-bold text-xs hover:bg-[#FF5B67]/90 animate-pulse shadow-lg shadow-[#FF5B67]/40"
                    >
                      CONFIRM HALT
                    </button>
                    <button
                      onClick={() => setConfirmStep(false)}
                      className="px-2 py-2 text-xs text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Reset Option if active */}
            {emergencyTriggered && (
              <div className="pt-2 border-t border-white/10 flex justify-end">
                <button
                  onClick={handleClearOverride}
                  className="px-4 py-2 rounded-lg bg-[#14E88D]/20 border border-[#14E88D]/40 text-[#14E88D] font-bold text-xs hover:bg-[#14E88D]/30 transition-all flex items-center space-x-1.5"
                >
                  <PowerOff className="w-3.5 h-3.5" />
                  <span>DISENGAGE ALL OVERRIDES</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
