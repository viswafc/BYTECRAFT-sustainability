export type SensorType = 'flow' | 'pressure' | 'acoustic' | 'vibration' | 'temperature';
export type SensorStatus = 'nominal' | 'warning' | 'critical';
export type SensorTrend = 'up' | 'down' | 'stable';

export interface SensorItem {
  sensorId: string;
  name: string;
  type: SensorType;
  zone: string;
  segmentId: string;
  value: number;
  unit: string;
  nominalMin: number;
  nominalMax: number;
  status: SensorStatus;
  lastUpdated: string;
  trend: SensorTrend;
}

export type IncidentStatus = 'Active' | 'Investigating' | 'Isolated' | 'Resolved';
export type IncidentSeverity = 'Critical' | 'Warning' | 'Moderate' | 'Low';

export interface IncidentItem {
  id: string;
  timestamp: string;
  location: string;
  zone: string;
  segmentId: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  volumeLostLiters: number;
  financialImpactInr: number;
  confidenceScore: number;
  leakRateLph: number;
  rootCause: string;
  automatedActions: string[];
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export type LeakSimulationMode = 'none' | 'warning_10' | 'critical_blowout' | 'resolved';

export interface FleetHealthSummary {
  fleetHealthScore: number;
  totalSensors: number;
  nominalCount: number;
  warningCount: number;
  criticalCount: number;
  calibrationDueCount: number;
  averageSnrDb: number;
  busIntegrity: string;
  lastFleetScan: string;
}

export interface TelemetryFrame {
  timestamp: string;
  systemStatus: 'NOMINAL' | 'WARNING' | 'CRITICAL_ALERT';
  leakMode: LeakSimulationMode;
  pipelineStopped: boolean;
  flowRateLpm: number;
  pressureBar: number;
  waterLossLph: number;
  totalLostLiters: number;
  financialBleedInr: number;
  leakSensors: Array<{ sensorId: string; value: number; status: SensorStatus }>;
  activeIncidents: IncidentItem[];
  sensors: SensorItem[];
  activeLeak: {
    incidentId: string;
    location: string;
    segmentId: string;
    severity: IncidentSeverity;
    confidenceScore: number;
    currentLossRateLph: number;
    projected24hLossLiters: number;
    financialBleedInrPerDay: number;
    detectedAt: string;
    isIsolated: boolean;
  };
  systemStatusObj: {
    backend: string;
    database: string;
    mlEngine: string;
    webSockets: string;
    latencyMs: number;
    connectedClients: number;
    uptimeSeconds: number;
  };
}
