export type PageId = 
  | 'overview'
  | 'live-data'
  | 'analytics'
  | 'incidents'
  | 'reports'
  | 'settings'
  | 'command-center' 
  | 'incident-center' 
  | 'digital-twin' 
  | 'what-if-lab';

export type VisualizerLayer = 
  | '3d' 
  | 'top-view'
  | 'sensor-map' 
  | 'zones' 
  | 'pipelines' 
  | 'tanks' 
  | 'pumps' 
  | 'valves';

export type PlantId = 'plant-01' | 'plant-02' | 'plant-03' | 'plant-04';

export interface PlantInfo {
  id: PlantId;
  code: string;
  name: string;
  shortName: string;
  facilityType: string;
  location: string;
  status: 'critical' | 'warning' | 'nominal';
  statusLabel: string;
  activeIssue: string;
  activeSegment: string;
  capacityM3Day: number;
  flowRateNominalLpm: number;
  pressureNominalBar: number;
  activeSensors: number;
  activeIncidentsCount: number;
  description: string;
  pipingHighlights: string[];
  powerOutputMw?: number; // For thermal/nuclear power plants
}

export type IncidentStatus = 'Active' | 'Investigating' | 'Isolated' | 'Resolved';
export type IncidentSeverity = 'Critical' | 'Warning' | 'Moderate' | 'Low';

export type LeakSimulationMode = 'none' | 'warning_10' | 'critical_blowout' | 'resolved';

export interface Incident {
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

export interface SensorReading {
  sensorId: string;
  name: string;
  type: 'flow' | 'pressure' | 'acoustic' | 'vibration' | 'temperature';
  zone: string;
  segmentId: string;
  value: number;
  unit: string;
  nominalMin: number;
  nominalMax: number;
  status: 'nominal' | 'warning' | 'critical';
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
  healthScore?: number; // 0 - 100%
  driftPercentage?: number; // e.g. 0.04%
  snrDb?: number; // Signal to Noise Ratio
  batteryBusStatus?: 'Optimal' | 'Degraded' | 'Critical';
  calibrationDate?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info';
  time: string;
  targetPage?: PageId;
  targetNodeId?: string;
  targetIncidentId?: string;
}

export interface TelemetryPayload {
  timestamp: string;
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
    isIsolated?: boolean;
  };
  sensors: SensorReading[];
  systemStatus: {
    backend: 'online' | 'degraded' | 'offline';
    database: 'online' | 'degraded' | 'offline';
    mlEngine: 'online' | 'degraded' | 'offline';
    webSockets: 'online' | 'degraded' | 'offline';
    latencyMs: number;
    connectedClients: number;
    uptimeSeconds: number;
  };
}

export interface TimelineEvent {
  timeAgo: string;
  timestamp: string;
  title: string;
  description: string;
  stage: 'nominal' | 'anomaly' | 'drop' | 'detected' | 'action';
  readings: string;
}

export interface DigitalTwinNode {
  id: string;
  name: string;
  type: 'tank' | 'pump' | 'junction' | 'segment' | 'valve' | 'terminal';
  line?: 'Main' | 'Line A' | 'Line B' | 'Return';
  status: 'nominal' | 'warning' | 'critical' | 'closed';
  flowLpm: number;
  pressureBar: number;
  acousticKhz: number;
  vibrationMmS: number;
  temperatureC: number;
  healthIndex: number;
  valveOpenPercent?: number;
}

export interface SimulationParams {
  leakRateLph: number;
  responseDelayHours: number;
  tariffInrPerM3: number;
  productionState: 'Reduced' | 'Standard' | 'Peak';
}

export interface SimulationResult {
  projectedWaterLossLiters: number;
  projectedWaterLossM3: number;
  directWaterCostInr: number;
  effluentPenaltyInr: number;
  totalFinancialBleedInr: number;
  energyWastedKwh: number;
  co2eKg: number;
  riskCategory: 'Low' | 'Moderate' | 'High' | 'Critical';
  riskScore: number; // 0-100
  aiInsight: string;
  baselineWaterLossLiters: number;
  baselineFinancialCostInr: number;
  aiMitigatedLossLiters: number;
  aiMitigatedCostInr: number;
}

export interface HistoricalDataPoint {
  date: string;
  day: number;
  expectedLiters: number;
  actualLiters: number;
  leakLiters: number;
  financialImpactInr: number;
  hadIncident: boolean;
}

export interface ZoneAnalytics {
  zoneId: string;
  name: string;
  percentage: number;
  volumeLostLiters: number;
  financialImpactInr: number;
  activeSensors: number;
  status: 'nominal' | 'warning' | 'critical';
}
