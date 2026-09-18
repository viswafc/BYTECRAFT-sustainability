import { SensorItem, IncidentItem } from '../types';

export const initialSensors: SensorItem[] = [
  {
    sensorId: 'SEN-FL-01',
    name: 'Main Intake Ultrasonic Flowmeter',
    type: 'flow',
    zone: 'Zone 1 - Main Tank Intake',
    segmentId: 'S01',
    value: 482.4,
    unit: 'L/min',
    nominalMin: 420.0,
    nominalMax: 520.0,
    status: 'nominal',
    lastUpdated: 'Just now',
    trend: 'stable'
  },
  {
    sensorId: 'SEN-PR-01',
    name: 'Discharge Header Pressure Transmitter',
    type: 'pressure',
    zone: 'Zone 1 - Main Tank Intake',
    segmentId: 'S01',
    value: 4.82,
    unit: 'Bar',
    nominalMin: 4.2,
    nominalMax: 5.4,
    status: 'nominal',
    lastUpdated: 'Just now',
    trend: 'stable'
  },
  {
    sensorId: 'SEN-FL-02',
    name: 'Line A Pre-Treatment Electromagnetic Flowmeter',
    type: 'flow',
    zone: 'Zone 2 - Line A Pre-Treatment',
    segmentId: 'S02',
    value: 285.2,
    unit: 'L/min',
    nominalMin: 250.0,
    nominalMax: 320.0,
    status: 'nominal',
    lastUpdated: 'Just now',
    trend: 'stable'
  },
  {
    sensorId: 'SEN-AC-05',
    name: 'Line B High-Frequency Acoustic Hydrophone',
    type: 'acoustic',
    zone: 'Zone 3 - Line B High-Pressure Bottling',
    segmentId: 'S05',
    value: 58.4,
    unit: 'kHz',
    nominalMin: 5.0,
    nominalMax: 25.0,
    status: 'critical',
    lastUpdated: 'Just now',
    trend: 'up'
  },
  {
    sensorId: 'SEN-PR-03',
    name: 'Segment S05 Piezoresistive Pressure Sensor',
    type: 'pressure',
    zone: 'Zone 3 - Line B High-Pressure Bottling',
    segmentId: 'S05',
    value: 2.15,
    unit: 'Bar',
    nominalMin: 3.8,
    nominalMax: 4.6,
    status: 'critical',
    lastUpdated: 'Just now',
    trend: 'down'
  },
  {
    sensorId: 'SEN-FL-03',
    name: 'Line B Mass Coriolis Flowmeter',
    type: 'flow',
    zone: 'Zone 3 - Line B High-Pressure Bottling',
    segmentId: 'S06',
    value: 132.8,
    unit: 'L/min',
    nominalMin: 180.0,
    nominalMax: 220.0,
    status: 'warning',
    lastUpdated: 'Just now',
    trend: 'down'
  },
  {
    sensorId: 'SEN-VB-01',
    name: 'Intake Booster Pump P-01 Tri-Axial Vibration',
    type: 'vibration',
    zone: 'Zone 1 - Main Tank Intake',
    segmentId: 'P01',
    value: 1.85,
    unit: 'mm/s',
    nominalMin: 0.5,
    nominalMax: 3.2,
    status: 'nominal',
    lastUpdated: 'Just now',
    trend: 'stable'
  },
  {
    sensorId: 'SEN-AC-07',
    name: 'Cooling Tower Return Acoustic Monitor',
    type: 'acoustic',
    zone: 'Zone 4 - Cooling Towers',
    segmentId: 'S07',
    value: 14.2,
    unit: 'kHz',
    nominalMin: 5.0,
    nominalMax: 25.0,
    status: 'nominal',
    lastUpdated: 'Just now',
    trend: 'stable'
  }
];

export const initialIncidents: IncidentItem[] = [
  {
    id: 'INC-2026-089',
    timestamp: new Date().toISOString(),
    location: 'Line B - High Pressure Bottling Loop (Segment S05)',
    zone: 'Zone 3 - Line B High-Pressure Bottling',
    segmentId: 'S05',
    status: 'Active',
    severity: 'Critical',
    volumeLostLiters: 1420.0,
    financialImpactInr: 73840.0,
    confidenceScore: 94.8,
    leakRateLph: 342.4,
    rootCause: 'Acoustic signature spikes at 58.4 kHz indicative of circumferential pipe wall rupture near flange FLG-305B.',
    automatedActions: [
      'Pneumatic valve V-103 throttled to 50% aperture',
      'Alert dispatched to SCADA Station 01'
    ],
    acknowledged: false
  }
];
