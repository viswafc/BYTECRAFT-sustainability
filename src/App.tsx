import React, { useState } from 'react';
import { TelemetryProvider } from './context/TelemetryContext';
import { Header } from './components/Header';
import { EmergencyModal } from './components/EmergencyModal';
import { PlantVisualizer } from './components/pages/PlantVisualizer';
import { CommandCenter } from './components/pages/CommandCenter';
import { IncidentCenter } from './components/pages/IncidentCenter';
import { DigitalTwin } from './components/pages/DigitalTwin';
import { WhatIfLab } from './components/pages/WhatIfLab';
import { AnalyticsTrends } from './components/pages/AnalyticsTrends';
import { ReportsCompliance } from './components/pages/ReportsCompliance';
import { SettingsConfig } from './components/pages/SettingsConfig';
import { PageId } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [selectedSensorFromSearch, setSelectedSensorFromSearch] = useState<string | null>(null);

  const handleSearchSelect = (target: { type: string; id: string }) => {
    setSelectedSensorFromSearch(target.id);
  };

  return (
    <TelemetryProvider>
      <div className="min-h-screen bg-[#070e17] text-[#e2eff8] flex flex-col font-['Inter',sans-serif] selection:bg-[#ff4d6d] selection:text-white relative overflow-x-hidden">
        
        {/* Top Mission Control Header (Matching Screenshot) */}
        <Header 
          currentPage={currentPage}
          onNavigate={(page) => {
            setCurrentPage(page);
            setSelectedSensorFromSearch(null);
          }}
          onEmergencyClick={() => setIsEmergencyModalOpen(true)}
          onSearchSelect={handleSearchSelect}
        />

        {/* Main Content View Container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          
          {/* 1. OVERVIEW: Flagship Plant Visualizer matching screenshot */}
          {(currentPage === 'overview' || currentPage === 'command-center') && (
            <PlantVisualizer 
              onNavigate={(page) => setCurrentPage(page)} 
              selectedSensorIdFromSearch={selectedSensorFromSearch}
            />
          )}

          {/* 2. LIVE DATA: Sensor Waveforms & Simulation */}
          {(currentPage === 'live-data' || currentPage === 'what-if-lab') && (
            <WhatIfLab onNavigate={(page) => setCurrentPage(page)} />
          )}

          {/* 3. ANALYTICS: Flow reconciliation, Financial Bleed, Trends */}
          {currentPage === 'analytics' && (
            <AnalyticsTrends onNavigate={(page) => setCurrentPage(page)} />
          )}

          {/* 4. INCIDENTS: Real-time Incident Command & Isolation Console */}
          {(currentPage === 'incidents' || currentPage === 'incident-center') && (
            <IncidentCenter onNavigate={(page) => setCurrentPage(page)} />
          )}

          {/* 5. REPORTS: ISO 14046 Water Footprint & Compliance Audits */}
          {currentPage === 'reports' && (
            <ReportsCompliance onNavigate={(page) => setCurrentPage(page)} />
          )}

          {/* 6. SETTINGS: Calibration, Threshold Rules, SCADA Connectors */}
          {currentPage === 'settings' && (
            <SettingsConfig onNavigate={(page) => setCurrentPage(page)} />
          )}

          {/* 7. DIGITAL TWIN (Legacy 2D Topological View access) */}
          {currentPage === 'digital-twin' && (
            <DigitalTwin onNavigate={(page) => setCurrentPage(page)} />
          )}
        </main>

        {/* Global Emergency Isolation Console Modal */}
        <EmergencyModal
          isOpen={isEmergencyModalOpen}
          onClose={() => setIsEmergencyModalOpen(false)}
        />
      </div>
    </TelemetryProvider>
  );
}
