import React, { useState, useMemo } from 'react';
import { 
  HeartPulse, 
  Search, 
  Filter, 
  Activity, 
  Gauge, 
  Waves, 
  Zap, 
  Droplets, 
  Thermometer, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  RefreshCw, 
  ShieldCheck, 
  Radio, 
  Building2, 
  ArrowUpRight, 
  Clock, 
  Cpu, 
  Signal, 
  BatteryCharging, 
  Sparkles,
  Download,
  Info,
  Check,
  ChevronRight,
  SlidersHorizontal,
  Layers,
  RotateCcw,
  Wrench,
  Package,
  FileCheck2,
  XCircle,
  Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface DetailedSensorHealth {
  id: string;
  tag: string;
  name: string;
  plantId: 'plant-01' | 'plant-02';
  plantName: string;
  plantBadgeColor: string;
  zone: string;
  pipelineSpec: string;
  stationDistanceMeters: number;
  type: 'flow' | 'pressure' | 'acoustic' | 'vibration' | 'tank' | 'temperature' | 'quality';
  value: string | number;
  unit: string;
  nominalBand: string;
  status: 'nominal' | 'warning' | 'critical';
  healthScore: number; // 0-100
  snrDb: number; // Signal to noise ratio in dB
  driftPercentage: number; // Zero point drift %
  powerSupply: string; // e.g. 24V DC Loop (Optimal)
  powerStatus: 'Optimal' | 'Degraded' | 'Critical';
  protocol: string; // Modbus TCP, HART 7, IO-Link
  samplingRate: string; // e.g. 500 Hz, 1000 Hz
  lastCalibrated: string;
  nextCalibrationDue: string;
  temperatureDrift: string;
  crystalImpedance: string;
  firmwareVersion: string;
  replacementSku: string;
  diagnosticNotes: string;
}

export const INITIAL_FLEET_SENSOR_HEALTH_DATA: DetailedSensorHealth[] = [
  // ==========================================
  // PLANT 1 SENSORS (Municipal Water Treatment)
  // ==========================================
  {
    id: 'P1-SEN-FL-01',
    tag: 'SEN-FL-01',
    name: 'Main Intake Ultrasonic Flowmeter',
    plantId: 'plant-01',
    plantName: 'Plant 1: Municipal Water Treatment',
    plantBadgeColor: '#00e5ff',
    zone: 'Zone 1 - Main Tank Intake',
    pipelineSpec: 'DN600 Ductile Iron Header',
    stationDistanceMeters: 15,
    type: 'flow',
    value: '620.5',
    unit: 'L/min',
    nominalBand: '500 - 700 L/min',
    status: 'nominal',
    healthScore: 99,
    snrDb: 42.1,
    driftPercentage: 0.02,
    powerSupply: '24V DC Industrial Bus',
    powerStatus: 'Optimal',
    protocol: 'Modbus TCP / RS-485',
    samplingRate: '500 Hz',
    lastCalibrated: '2026-09-01',
    nextCalibrationDue: '2027-03-01',
    temperatureDrift: '+0.01 °C/mo',
    crystalImpedance: '120.4 Ω (Nominal)',
    firmwareVersion: 'v4.1.2-PR',
    replacementSku: 'KROHNE-OPTISONIC-3400-DN600',
    diagnosticNotes: 'Acoustic transit-time transducer crystals balanced. Flow profile is fully turbulent and symmetrical.'
  },
  {
    id: 'P1-SEN-PR-01',
    tag: 'SEN-PR-01',
    name: 'Reservoir Piezoresistive Transducer',
    plantId: 'plant-01',
    plantName: 'Plant 1: Municipal Water Treatment',
    plantBadgeColor: '#00e5ff',
    zone: 'Zone 1 - Main Tank Intake',
    pipelineSpec: 'DN500 Carbon Steel Flange',
    stationDistanceMeters: 40,
    type: 'pressure',
    value: '4.6',
    unit: 'Bar',
    nominalBand: '4.0 - 5.2 Bar',
    status: 'nominal',
    healthScore: 98,
    snrDb: 38.6,
    driftPercentage: 0.04,
    powerSupply: '24V DC Loop Powered',
    powerStatus: 'Optimal',
    protocol: 'HART 7.0 / 4-20mA',
    samplingRate: '250 Hz',
    lastCalibrated: '2026-08-28',
    nextCalibrationDue: '2027-02-28',
    temperatureDrift: '+0.03 % Span',
    crystalImpedance: '350.0 Ω (Nominal)',
    firmwareVersion: 'v2.8.0-HT',
    replacementSku: 'ROSEMOUNT-3051S-TG-P01',
    diagnosticNotes: 'Diaphragm strain gauge zero-offset within factory ISO tolerance. High pulse damping verified.'
  },
  {
    id: 'P1-SEN-LVL-01',
    tag: 'SEN-LVL-01',
    name: 'Raw Water Tank Radar Level Transmitter',
    plantId: 'plant-01',
    plantName: 'Plant 1: Municipal Water Treatment',
    plantBadgeColor: '#00e5ff',
    zone: 'Zone 1 - Main Tank Intake',
    pipelineSpec: 'Ø 12m Reservoir Top Flange',
    stationDistanceMeters: 65,
    type: 'tank',
    value: '84.5',
    unit: '% Level',
    nominalBand: '60.0 - 95.0 %',
    status: 'nominal',
    healthScore: 99,
    snrDb: 45.0,
    driftPercentage: 0.01,
    powerSupply: '24V DC Industrial Bus',
    powerStatus: 'Optimal',
    protocol: '80 GHz FMCW Radar / Modbus',
    samplingRate: '100 Hz',
    lastCalibrated: '2026-09-10',
    nextCalibrationDue: '2027-09-10',
    temperatureDrift: '0.00 % Span',
    crystalImpedance: '50.1 Ω (RF Port)',
    firmwareVersion: 'v5.0.4-RD',
    replacementSku: 'VEGAPULS-64-RADAR-80G',
    diagnosticNotes: '80 GHz radar horn clean. No condensation buildup or false bottom echo anomalies detected.'
  },
  {
    id: 'P1-SEN-FL-02',
    tag: 'SEN-FL-02',
    name: 'Line A Bottling Electromagnetic Flowmeter',
    plantId: 'plant-01',
    plantName: 'Plant 1: Municipal Water Treatment',
    plantBadgeColor: '#00e5ff',
    zone: 'Zone 2 - Line A Pre-Treatment',
    pipelineSpec: 'DN300 Stainless 316L',
    stationDistanceMeters: 120,
    type: 'flow',
    value: '285.2',
    unit: 'L/min',
    nominalBand: '250 - 320 L/min',
    status: 'nominal',
    healthScore: 97,
    snrDb: 36.4,
    driftPercentage: 0.06,
    powerSupply: '24V DC Industrial Bus',
    powerStatus: 'Optimal',
    protocol: 'Profinet / Modbus TCP',
    samplingRate: '400 Hz',
    lastCalibrated: '2026-09-05',
    nextCalibrationDue: '2027-03-05',
    temperatureDrift: '+0.02 % Span',
    crystalImpedance: '118.2 Ω (Coil)',
    firmwareVersion: 'v3.4.1-PN',
    replacementSku: 'ENDRESS-PROMAG-50W-DN300',
    diagnosticNotes: 'Electrode impedance balanced across both poles. Liner insulation resistance > 100 GΩ.'
  },
  {
    id: 'P1-SEN-PR-02',
    tag: 'SEN-PR-02',
    name: 'Line A Manifold Pressure Monitor',
    plantId: 'plant-01',
    plantName: 'Plant 1: Municipal Water Treatment',
    plantBadgeColor: '#00e5ff',
    zone: 'Zone 2 - Line A Pre-Treatment',
    pipelineSpec: 'DN250 Schedule 40',
    stationDistanceMeters: 180,
    type: 'pressure',
    value: '3.4',
    unit: 'Bar',
    nominalBand: '3.0 - 4.0 Bar',
    status: 'nominal',
    healthScore: 96,
    snrDb: 35.2,
    driftPercentage: 0.08,
    powerSupply: '24V DC Loop Powered',
    powerStatus: 'Optimal',
    protocol: 'HART 7.0 / 4-20mA',
    samplingRate: '200 Hz',
    lastCalibrated: '2026-08-15',
    nextCalibrationDue: '2027-02-15',
    temperatureDrift: '+0.04 % Span',
    crystalImpedance: '348.5 Ω (Nominal)',
    firmwareVersion: 'v2.8.0-HT',
    replacementSku: 'ROSEMOUNT-2088-GP-P02',
    diagnosticNotes: 'Zero offset steady. No diaphragm fatigue or pressure spike hysteresis observed.'
  },
  {
    id: 'P1-SEN-TMP-01',
    tag: 'SEN-TMP-01',
    name: 'Pre-Treatment In-Line RTD Temperature',
    plantId: 'plant-01',
    plantName: 'Plant 1: Municipal Water Treatment',
    plantBadgeColor: '#00e5ff',
    zone: 'Zone 2 - Line A Pre-Treatment',
    pipelineSpec: 'DN300 Thermowell Well',
    stationDistanceMeters: 140,
    type: 'temperature',
    value: '21.4',
    unit: '°C',
    nominalBand: '18.0 - 26.0 °C',
    status: 'nominal',
    healthScore: 100,
    snrDb: 48.0,
    driftPercentage: 0.01,
    powerSupply: '24V DC Loop Powered',
    powerStatus: 'Optimal',
    protocol: 'Pt100 4-Wire RTD / Modbus',
    samplingRate: '50 Hz',
    lastCalibrated: '2026-09-12',
    nextCalibrationDue: '2027-09-12',
    temperatureDrift: '0.00 °C/mo',
    crystalImpedance: '108.4 Ω @ 21.4°C',
    firmwareVersion: 'v1.9.0-RT',
    replacementSku: 'WIKA-TR10-PT100-4W',
    diagnosticNotes: '4-wire resistance bridge compensation active. Lead wire resistance balanced to 0.02 Ω.'
  },
  {
    id: 'P1-SEN-FL-03',
    tag: 'SEN-FL-03',
    name: 'Line B Coriolis Mass Flowmeter',
    plantId: 'plant-01',
    plantName: 'Plant 1: Municipal Water Treatment',
    plantBadgeColor: '#00e5ff',
    zone: 'Zone 3 - Line B High-Pressure Bottling',
    pipelineSpec: 'DN200 High-Pressure Stainless',
    stationDistanceMeters: 280,
    type: 'flow',
    value: '395.8',
    unit: 'L/min',
    nominalBand: '280 - 350 L/min',
    status: 'critical',
    healthScore: 48, // UNDER 50% TO TRIGGER ALERT AND DEMONSTRATE THE CRITICAL REPLACEMENT FEATURE
    snrDb: 18.2,
    driftPercentage: 0.44,
    powerSupply: '24V DC Loop (Severe Ripple)',
    powerStatus: 'Critical',
    protocol: 'Modbus TCP / RS-485',
    samplingRate: '1000 Hz',
    lastCalibrated: '2026-07-20',
    nextCalibrationDue: '2026-10-20',
    temperatureDrift: '+0.48 % Span',
    crystalImpedance: '52.1 Ω (Degraded Coil)',
    firmwareVersion: 'v4.0.8-CR',
    replacementSku: 'MICROMOTION-ELITE-CMFS150M',
    diagnosticNotes: 'CRITICAL HEALTH: Coriolis tube resonance imbalance detected (< 50% health). Sensor has sustained structural cavitation damage from downstream line hammer and MUST BE REPLACED.'
  },
  {
    id: 'P1-SEN-PR-03',
    tag: 'SEN-PR-03',
    name: 'Line B Segment S05 Differential Pressure Transducer',
    plantId: 'plant-01',
    plantName: 'Plant 1: Municipal Water Treatment',
    plantBadgeColor: '#00e5ff',
    zone: 'Zone 3 - Line B High-Pressure Bottling',
    pipelineSpec: 'DN200 Heavy Wall Segment S05',
    stationDistanceMeters: 310,
    type: 'pressure',
    value: '2.15',
    unit: 'Bar',
    nominalBand: '3.8 - 4.8 Bar',
    status: 'critical',
    healthScore: 42, // UNDER 50% TO TRIGGER REPLACEMENT ALERT
    snrDb: 16.4,
    driftPercentage: 0.52,
    powerSupply: '24V DC Loop (Severe Noise)',
    powerStatus: 'Critical',
    protocol: 'HART 7.0 / 4-20mA',
    samplingRate: '500 Hz',
    lastCalibrated: '2026-07-15',
    nextCalibrationDue: '2026-10-15',
    temperatureDrift: '+0.55 % Span',
    crystalImpedance: '210.0 Ω (Defective Diaphragm)',
    firmwareVersion: 'v2.8.0-HT',
    replacementSku: 'ROSEMOUNT-3051CD-DP-S05',
    diagnosticNotes: 'CRITICAL HEALTH ALERT (<50%): Transducer diaphragm fatigued from hydraulic shock pulses. High risk of total transducer failure. REPLACEMENT IS REQUIRED IMMEDIATELY.'
  },
  {
    id: 'P1-SEN-AC-05',
    tag: 'SEN-AC-05',
    name: 'Segment S05 Acoustic Cavitation Hydrophone',
    plantId: 'plant-01',
    plantName: 'Plant 1: Municipal Water Treatment',
    plantBadgeColor: '#00e5ff',
    zone: 'Zone 3 - Line B High-Pressure Bottling',
    pipelineSpec: 'Clamp-On Acoustic Mount S05',
    stationDistanceMeters: 325,
    type: 'acoustic',
    value: '58.4',
    unit: 'dB',
    nominalBand: '15 - 30 dB',
    status: 'critical',
    healthScore: 85,
    snrDb: 26.5,
    driftPercentage: 0.18,
    powerSupply: '24V DC Industrial Bus',
    powerStatus: 'Optimal',
    protocol: 'Edge DSP / High-Speed SPI',
    samplingRate: '192 kHz',
    lastCalibrated: '2026-08-01',
    nextCalibrationDue: '2026-11-01',
    temperatureDrift: '+0.08 dB/mo',
    crystalImpedance: '1,240 Ω (Piezo Core)',
    firmwareVersion: 'v6.1.0-AC',
    replacementSku: 'PHYSICAL-ACOUSTICS-PK15I',
    diagnosticNotes: 'Acoustic emission intensity 58.4 dB indicates turbulent jet spray and micro-cavitation vortex.'
  },
  {
    id: 'P1-SEN-VB-05',
    tag: 'SEN-VB-05',
    name: 'Booster Pump P-02 Tri-Axial Vibration Transducer',
    plantId: 'plant-01',
    plantName: 'Plant 1: Municipal Water Treatment',
    plantBadgeColor: '#00e5ff',
    zone: 'Zone 3 - Line B High-Pressure Bottling',
    pipelineSpec: 'Pump P-02 Bearing Housing',
    stationDistanceMeters: 260,
    type: 'vibration',
    value: '3.85',
    unit: 'mm/s',
    nominalBand: '0.5 - 2.5 mm/s',
    status: 'warning',
    healthScore: 89,
    snrDb: 31.0,
    driftPercentage: 0.12,
    powerSupply: '24V DC Industrial Bus',
    powerStatus: 'Optimal',
    protocol: 'IO-Link v1.1 / Modbus',
    samplingRate: '20 kHz',
    lastCalibrated: '2026-08-10',
    nextCalibrationDue: '2027-02-10',
    temperatureDrift: '+0.05 mm/s',
    crystalImpedance: '620 Ω (X-Y-Z Array)',
    firmwareVersion: 'v3.2.0-VB',
    replacementSku: 'IFM-VSA001-TRI-AXIAL',
    diagnosticNotes: 'Moderate radial vibration harmonic at 2x running speed. Recommended inspection of drive coupling.'
  },
  {
    id: 'P1-SEN-AC-06',
    tag: 'SEN-AC-06',
    name: 'Flange Weld S05-W12 Structural Acoustic Emission Probe',
    plantId: 'plant-01',
    plantName: 'Plant 1: Municipal Water Treatment',
    plantBadgeColor: '#00e5ff',
    zone: 'Zone 3 - Line B High-Pressure Bottling',
    pipelineSpec: 'Weld Flange S05-W12 Collar',
    stationDistanceMeters: 335,
    type: 'acoustic',
    value: '38.4',
    unit: 'kHz',
    nominalBand: '8.0 - 20.0 kHz',
    status: 'critical',
    healthScore: 84,
    snrDb: 24.0,
    driftPercentage: 0.16,
    powerSupply: '24V DC Industrial Bus',
    powerStatus: 'Optimal',
    protocol: 'Edge DSP / SpecResNet Engine',
    samplingRate: '250 kHz',
    lastCalibrated: '2026-08-05',
    nextCalibrationDue: '2026-11-05',
    temperatureDrift: '+0.06 kHz',
    crystalImpedance: '1,180 Ω (Acoustic)',
    firmwareVersion: 'v6.1.0-AC',
    replacementSku: 'VALLEN-SYSTEME-VS150-RIC',
    diagnosticNotes: 'Structural acoustic resonance peak detected at 38.4 kHz, matching high-pressure pipe wall fissure signature.'
  },
  {
    id: 'P1-SEN-FL-04',
    tag: 'SEN-FL-04',
    name: 'Cooling Loop Return Electromagnetic Flowmeter',
    plantId: 'plant-01',
    plantName: 'Plant 1: Municipal Water Treatment',
    plantBadgeColor: '#00e5ff',
    zone: 'Zone 4 - Cooling Towers',
    pipelineSpec: 'DN200 Return Header',
    stationDistanceMeters: 450,
    type: 'flow',
    value: '145.0',
    unit: 'L/min',
    nominalBand: '120 - 180 L/min',
    status: 'nominal',
    healthScore: 98,
    snrDb: 39.5,
    driftPercentage: 0.03,
    powerSupply: '24V DC Industrial Bus',
    powerStatus: 'Optimal',
    protocol: 'Modbus TCP / RS-485',
    samplingRate: '300 Hz',
    lastCalibrated: '2026-09-02',
    nextCalibrationDue: '2027-03-02',
    temperatureDrift: '+0.01 % Span',
    crystalImpedance: '119.0 Ω (Coil)',
    firmwareVersion: 'v3.4.1-PN',
    replacementSku: 'SIEMENS-MAG-5100W-DN200',
    diagnosticNotes: 'Return line flow balanced. Steady magnetic excitation coil current verified.'
  },
  {
    id: 'P1-SEN-PR-04',
    tag: 'SEN-PR-04',
    name: 'Cooling Loop Discharge Pressure Transmitter',
    plantId: 'plant-01',
    plantName: 'Plant 1: Municipal Water Treatment',
    plantBadgeColor: '#00e5ff',
    zone: 'Zone 4 - Cooling Towers',
    pipelineSpec: 'DN200 Header Segment S08',
    stationDistanceMeters: 490,
    type: 'pressure',
    value: '2.7',
    unit: 'Bar',
    nominalBand: '2.2 - 3.2 Bar',
    status: 'nominal',
    healthScore: 97,
    snrDb: 37.8,
    driftPercentage: 0.05,
    powerSupply: '24V DC Loop Powered',
    powerStatus: 'Optimal',
    protocol: 'HART 7.0 / 4-20mA',
    samplingRate: '200 Hz',
    lastCalibrated: '2026-08-25',
    nextCalibrationDue: '2027-02-25',
    temperatureDrift: '+0.02 % Span',
    crystalImpedance: '349.0 Ω (Nominal)',
    firmwareVersion: 'v2.8.0-HT',
    replacementSku: 'ROSEMOUNT-2088-GP-P04',
    diagnosticNotes: 'Cooling loop head pressure stable. No cavitation induced back-pulsing observed.'
  },

  // =========================================================================
  // PLANT 2 SENSORS (Large Scale Industrial Processing - Catalytic Refining)
  // =========================================================================
  {
    id: 'P2-SEN-FS-201',
    tag: 'SEN-FS-201',
    name: 'Raw Water Intake Ultrasonic Flowmeter',
    plantId: 'plant-02',
    plantName: 'Plant 2: Large Scale Industrial Processing',
    plantBadgeColor: '#ff4d6d',
    zone: 'Zone A - Raw Intake & Clarifier',
    pipelineSpec: 'DN500 Carbon Steel (Line 1)',
    stationDistanceMeters: 45,
    type: 'flow',
    value: '1,650',
    unit: 'L/m',
    nominalBand: '1,400 - 1,800 L/m',
    status: 'nominal',
    healthScore: 99,
    snrDb: 44.5,
    driftPercentage: 0.02,
    powerSupply: '24V DC Industrial Bus',
    powerStatus: 'Optimal',
    protocol: 'Profinet / Modbus TCP',
    samplingRate: '600 Hz',
    lastCalibrated: '2026-09-02',
    nextCalibrationDue: '2027-03-02',
    temperatureDrift: '+0.01 % Span',
    crystalImpedance: '121.2 Ω (Transducer Pair)',
    firmwareVersion: 'v5.2.0-IN',
    replacementSku: 'KROHNE-ALTOSONIC-V12-DN500',
    diagnosticNotes: 'Transit-time acoustic signal path 100% transparent. High Reynolds number profile compensated.'
  },
  {
    id: 'P2-SEN-PS-201',
    tag: 'SEN-PS-201',
    name: 'Intake Manifold Piezoresistive Pressure Transmitter',
    plantId: 'plant-02',
    plantName: 'Plant 2: Large Scale Industrial Processing',
    plantBadgeColor: '#ff4d6d',
    zone: 'Zone A - Raw Intake & Clarifier',
    pipelineSpec: 'DN450 Sch40 (Line 1)',
    stationDistanceMeters: 80,
    type: 'pressure',
    value: '3.4',
    unit: 'Bar',
    nominalBand: '3.0 - 4.0 Bar',
    status: 'nominal',
    healthScore: 98,
    snrDb: 41.2,
    driftPercentage: 0.03,
    powerSupply: '24V DC Loop Powered',
    powerStatus: 'Optimal',
    protocol: 'Foundation Fieldbus / HART',
    samplingRate: '300 Hz',
    lastCalibrated: '2026-08-29',
    nextCalibrationDue: '2027-02-28',
    temperatureDrift: '+0.02 % Span',
    crystalImpedance: '352.0 Ω (Nominal)',
    firmwareVersion: 'v3.1.2-FF',
    replacementSku: 'YOKOGAWA-EJX530A-P201',
    diagnosticNotes: 'Positive suction head verified for downstream dual booster pump skids. Zero diaphragm drift.'
  },
  {
    id: 'P2-SEN-LV-201',
    tag: 'SEN-LV-201',
    name: 'Clarifier Basin C-200 Radar Level Sensor',
    plantId: 'plant-02',
    plantName: 'Plant 2: Large Scale Industrial Processing',
    plantBadgeColor: '#ff4d6d',
    zone: 'Zone A - Raw Intake & Clarifier',
    pipelineSpec: 'Ø 14m Clarification Basin',
    stationDistanceMeters: 110,
    type: 'tank',
    value: '84',
    unit: '%',
    nominalBand: '65% - 90%',
    status: 'nominal',
    healthScore: 100,
    snrDb: 47.8,
    driftPercentage: 0.01,
    powerSupply: '24V DC Industrial Bus',
    powerStatus: 'Optimal',
    protocol: '80 GHz FMCW Radar / Modbus',
    samplingRate: '100 Hz',
    lastCalibrated: '2026-09-12',
    nextCalibrationDue: '2027-09-12',
    temperatureDrift: '0.00 % Span',
    crystalImpedance: '50.0 Ω (Coaxial)',
    firmwareVersion: 'v5.0.4-RD',
    replacementSku: 'VEGAPULS-69-RADAR-LV201',
    diagnosticNotes: 'Surface ripple filtering active. Sludge blanket interface detected at 2.4m depth with 98% clarity.'
  },
  {
    id: 'P2-SEN-AC-201',
    tag: 'SEN-AC-201',
    name: 'Booster Pump P-201A Acoustic Hydrophone',
    plantId: 'plant-02',
    plantName: 'Plant 2: Large Scale Industrial Processing',
    plantBadgeColor: '#ff4d6d',
    zone: 'Zone A - Booster Skid & HP Loop',
    pipelineSpec: 'DN350 Carbon Steel (Line 2)',
    stationDistanceMeters: 160,
    type: 'acoustic',
    value: '14.2',
    unit: 'kHz',
    nominalBand: '10 - 20 kHz',
    status: 'nominal',
    healthScore: 97,
    snrDb: 39.0,
    driftPercentage: 0.05,
    powerSupply: '24V DC Industrial Bus',
    powerStatus: 'Optimal',
    protocol: 'Edge DSP / High-Speed Modbus',
    samplingRate: '150 kHz',
    lastCalibrated: '2026-09-04',
    nextCalibrationDue: '2027-03-04',
    temperatureDrift: '+0.02 kHz',
    crystalImpedance: '1,210 Ω (Hydrophone)',
    firmwareVersion: 'v6.1.0-AC',
    replacementSku: 'BRUEL-KJAER-TYPE-8103',
    diagnosticNotes: 'Impeller acoustic frequency spectrum confirms smooth laminar flow with no cavitation spikes.'
  },
  {
    id: 'P2-SEN-VB-201',
    tag: 'SEN-VB-201',
    name: 'Booster Pump P-201B Tri-Axial Vibration Transmitter',
    plantId: 'plant-02',
    plantName: 'Plant 2: Large Scale Industrial Processing',
    plantBadgeColor: '#ff4d6d',
    zone: 'Zone A - Booster Skid & HP Loop',
    pipelineSpec: 'Pump Bearing Housing (Line 2)',
    stationDistanceMeters: 190,
    type: 'vibration',
    value: '1.8',
    unit: 'mm/s',
    nominalBand: '0.5 - 2.8 mm/s',
    status: 'nominal',
    healthScore: 96,
    snrDb: 37.5,
    driftPercentage: 0.07,
    powerSupply: '24V DC Industrial Bus',
    powerStatus: 'Optimal',
    protocol: 'IO-Link v1.1 / Profinet',
    samplingRate: '25 kHz',
    lastCalibrated: '2026-08-19',
    nextCalibrationDue: '2027-02-19',
    temperatureDrift: '+0.03 mm/s',
    crystalImpedance: '615 Ω (Tri-Axial)',
    firmwareVersion: 'v3.2.0-VB',
    replacementSku: 'BENTLY-NEVADA-330400-ACCEL',
    diagnosticNotes: 'Motor shaft alignment within ISO 10816-3 Class II limits. Bearing cage harmonics nominal.'
  },
  {
    id: 'P2-SEN-PS-202',
    tag: 'SEN-PS-202',
    name: 'Utility High-Pressure Loop Expansion Sensor',
    plantId: 'plant-02',
    plantName: 'Plant 2: Large Scale Industrial Processing',
    plantBadgeColor: '#ff4d6d',
    zone: 'Zone B - Utility HP Loop',
    pipelineSpec: 'DN400 Heavy Wall (Line 2)',
    stationDistanceMeters: 320,
    type: 'pressure',
    value: '7.2',
    unit: 'Bar',
    nominalBand: '6.8 - 7.5 Bar',
    status: 'nominal',
    healthScore: 99,
    snrDb: 43.1,
    driftPercentage: 0.02,
    powerSupply: '24V DC Loop Powered',
    powerStatus: 'Optimal',
    protocol: 'HART 7.0 / 4-20mA',
    samplingRate: '350 Hz',
    lastCalibrated: '2026-09-08',
    nextCalibrationDue: '2027-03-08',
    temperatureDrift: '+0.01 % Span',
    crystalImpedance: '350.2 Ω (Nominal)',
    firmwareVersion: 'v2.8.0-HT',
    replacementSku: 'ABB-266DSH-PRESSURE-P202',
    diagnosticNotes: 'Thermal expansion U-loop pressure steady. Shock surge suppressor damper in optimal condition.'
  },
  {
    id: 'P2-SEN-FS-202',
    tag: 'SEN-FS-202',
    name: 'Catalytic Exchanger Feed Coriolis Mass Flowmeter',
    plantId: 'plant-02',
    plantName: 'Plant 2: Large Scale Industrial Processing',
    plantBadgeColor: '#ff4d6d',
    zone: 'Zone B - Catalytic Cooling Bank',
    pipelineSpec: 'DN300 Pre-Insulated (Line 3)',
    stationDistanceMeters: 410,
    type: 'flow',
    value: '820',
    unit: 'L/m',
    nominalBand: '750 - 900 L/m',
    status: 'nominal',
    healthScore: 98,
    snrDb: 40.4,
    driftPercentage: 0.04,
    powerSupply: '24V DC Industrial Bus',
    powerStatus: 'Optimal',
    protocol: 'Modbus TCP / Profibus',
    samplingRate: '800 Hz',
    lastCalibrated: '2026-09-03',
    nextCalibrationDue: '2027-03-03',
    temperatureDrift: '+0.02 % Span',
    crystalImpedance: '92.1 Ω (Dual Tube)',
    firmwareVersion: 'v4.1.0-CR',
    replacementSku: 'EMERSON-MICROMOTION-F300',
    diagnosticNotes: 'Dual bent-tube phase shift accuracy 0.05%. Density calculation calibration locked.'
  },
  {
    id: 'P2-SEN-TS-201',
    tag: 'SEN-TS-201',
    name: 'Heat Exchanger HX-201 Primary Inflow RTD',
    plantId: 'plant-02',
    plantName: 'Plant 2: Large Scale Industrial Processing',
    plantBadgeColor: '#ff4d6d',
    zone: 'Zone B - Catalytic Cooling Bank',
    pipelineSpec: 'DN300 Flanged (Line 3)',
    stationDistanceMeters: 470,
    type: 'temperature',
    value: '34.2',
    unit: '°C',
    nominalBand: '28 - 38 °C',
    status: 'nominal',
    healthScore: 100,
    snrDb: 49.2,
    driftPercentage: 0.01,
    powerSupply: '24V DC Loop Powered',
    powerStatus: 'Optimal',
    protocol: 'Duplex Pt100 4-Wire / Modbus',
    samplingRate: '60 Hz',
    lastCalibrated: '2026-09-14',
    nextCalibrationDue: '2027-09-14',
    temperatureDrift: '0.00 °C/mo',
    crystalImpedance: '113.3 Ω @ 34.2°C',
    firmwareVersion: 'v1.9.0-RT',
    replacementSku: 'WIKA-TR10-DUPLEX-PT100',
    diagnosticNotes: 'Exchanger inlet water temperature balanced. Duplex backup sensor element matched within 0.02 °C.'
  },
  {
    id: 'P2-SEN-AC-202',
    tag: 'SEN-AC-202',
    name: 'Bypass Valve BV-202 Ultrasonic Cavitation Sensor',
    plantId: 'plant-02',
    plantName: 'Plant 2: Large Scale Industrial Processing',
    plantBadgeColor: '#ff4d6d',
    zone: 'Zone B - Cooling Bank B Bypass',
    pipelineSpec: 'DN250 Stainless (Line 4)',
    stationDistanceMeters: 530,
    type: 'acoustic',
    value: '18.2',
    unit: 'kHz',
    nominalBand: '10 - 25 kHz',
    status: 'nominal',
    healthScore: 94,
    snrDb: 34.2,
    driftPercentage: 0.08,
    powerSupply: '24V DC Industrial Bus',
    powerStatus: 'Optimal',
    protocol: 'Edge DSP / Ultrasonic FFT',
    samplingRate: '200 kHz',
    lastCalibrated: '2026-08-20',
    nextCalibrationDue: '2027-02-20',
    temperatureDrift: '+0.04 kHz',
    crystalImpedance: '1,195 Ω (Piezo Core)',
    firmwareVersion: 'v6.1.0-AC',
    replacementSku: 'SDT-ULTRASONICS-CONIC-250',
    diagnosticNotes: 'Monitors acoustic cavitation resonance across modulating valve BV-202. Baseline laminar flow confirmed.'
  },
  {
    id: 'P2-SEN-PS-203',
    tag: 'SEN-PS-203',
    name: 'Exchanger HX-202 Differential Pressure Transmitter',
    plantId: 'plant-02',
    plantName: 'Plant 2: Large Scale Industrial Processing',
    plantBadgeColor: '#ff4d6d',
    zone: 'Zone B - Cooling Bank B Return',
    pipelineSpec: 'DN300 Return Header (Line 4)',
    stationDistanceMeters: 620,
    type: 'pressure',
    value: '0.92',
    unit: 'Bar ΔP',
    nominalBand: '0.6 - 1.2 Bar',
    status: 'nominal',
    healthScore: 96,
    snrDb: 36.8,
    driftPercentage: 0.06,
    powerSupply: '24V DC Loop Powered',
    powerStatus: 'Optimal',
    protocol: 'HART 7.0 / Differential',
    samplingRate: '300 Hz',
    lastCalibrated: '2026-08-22',
    nextCalibrationDue: '2027-02-22',
    temperatureDrift: '+0.03 % Span',
    crystalImpedance: '349.5 Ω (Nominal)',
    firmwareVersion: 'v2.8.0-HT',
    replacementSku: 'ROSEMOUNT-3051CD-DIFF-P203',
    diagnosticNotes: 'Differential pressure drop across tube sheet and bypass throttle valve balanced at 0.92 Bar.'
  }
];

export const SensorsHealthTab: React.FC = () => {
  // Fleet sensor list stored in state so health scores can be simulated & modified in real-time
  const [sensorsList, setSensorsList] = useState<DetailedSensorHealth[]>(INITIAL_FLEET_SENSOR_HEALTH_DATA);
  const [plantFilter, setPlantFilter] = useState<'all' | 'plant-01' | 'plant-02'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'nominal' | 'warning' | 'critical' | 'replace-under-50'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSensorId, setSelectedSensorId] = useState<string>(INITIAL_FLEET_SENSOR_HEALTH_DATA[6].id); // Select degraded sensor initially
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [testingSensorId, setTestingSensorId] = useState<string | null>(null);
  const [testResultNotice, setTestResultNotice] = useState<string | null>(null);
  const [workOrderNotice, setWorkOrderNotice] = useState<{ id: string; sensorTag: string; message: string } | null>(null);

  // Selected sensor reference
  const selectedSensor = useMemo(() => {
    return sensorsList.find(s => s.id === selectedSensorId) || sensorsList[0];
  }, [sensorsList, selectedSensorId]);

  // Identify all sensors with health <= 50%
  const criticalSensorsUnder50 = useMemo(() => {
    return sensorsList.filter(s => s.healthScore <= 50);
  }, [sensorsList]);

  // Filtered dataset
  const filteredSensors = useMemo(() => {
    return sensorsList.filter(sensor => {
      // Plant filter
      if (plantFilter !== 'all' && sensor.plantId !== plantFilter) return false;
      // Status filter
      if (statusFilter === 'replace-under-50') {
        if (sensor.healthScore > 50) return false;
      } else if (statusFilter !== 'all' && sensor.status !== statusFilter) {
        return false;
      }
      // Type filter
      if (typeFilter !== 'all' && sensor.type !== typeFilter) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTag = sensor.tag.toLowerCase().includes(q);
        const matchesName = sensor.name.toLowerCase().includes(q);
        const matchesZone = sensor.zone.toLowerCase().includes(q);
        const matchesPlant = sensor.plantName.toLowerCase().includes(q);
        const matchesSpec = sensor.pipelineSpec.toLowerCase().includes(q);
        return matchesTag || matchesName || matchesZone || matchesPlant || matchesSpec;
      }
      return true;
    });
  }, [sensorsList, plantFilter, statusFilter, typeFilter, searchQuery]);

  // Overall statistics
  const stats = useMemo(() => {
    const total = sensorsList.length;
    const plant1Count = sensorsList.filter(s => s.plantId === 'plant-01').length;
    const plant2Count = sensorsList.filter(s => s.plantId === 'plant-02').length;
    const nominal = sensorsList.filter(s => s.status === 'nominal').length;
    const warning = sensorsList.filter(s => s.status === 'warning').length;
    const critical = sensorsList.filter(s => s.status === 'critical').length;
    const under50Count = criticalSensorsUnder50.length;
    const avgHealth = Math.round(sensorsList.reduce((acc, s) => acc + s.healthScore, 0) / total);
    const avgSnr = (sensorsList.reduce((acc, s) => acc + s.snrDb, 0) / total).toFixed(1);
    const optimalPower = sensorsList.filter(s => s.powerStatus === 'Optimal').length;

    return {
      total,
      plant1Count,
      plant2Count,
      nominal,
      warning,
      critical,
      under50Count,
      avgHealth,
      avgSnr,
      optimalPower
    };
  }, [sensorsList, criticalSensorsUnder50]);

  // Helper to dynamically update a sensor's health score
  const handleUpdateSensorHealth = (sensorId: string, newHealthScore: number) => {
    setSensorsList(prev => prev.map(s => {
      if (s.id === sensorId) {
        const clampedScore = Math.max(0, Math.min(100, newHealthScore));
        let newStatus: 'nominal' | 'warning' | 'critical' = 'nominal';
        let newPowerStatus: 'Optimal' | 'Degraded' | 'Critical' = 'Optimal';
        let newNotes = s.diagnosticNotes;

        if (clampedScore <= 50) {
          newStatus = 'critical';
          newPowerStatus = 'Critical';
          newNotes = `CRITICAL SENSOR HEALTH ALERT: Transducer health is under 50% (${clampedScore}%). Severe risk of transducer failure and SCADA blindness. THIS SENSOR MUST BE REPLACED IMMEDIATELY.`;
        } else if (clampedScore <= 85) {
          newStatus = 'warning';
          newPowerStatus = 'Degraded';
          newNotes = `Transducer health degraded to ${clampedScore}%. Higher zero-point drift observed. Schedule calibration.`;
        } else {
          newStatus = 'nominal';
          newPowerStatus = 'Optimal';
          newNotes = `Transducer operating nominally with ${clampedScore}% health index. Signal crystal and loop impedance verified.`;
        }

        return {
          ...s,
          healthScore: clampedScore,
          status: newStatus,
          powerStatus: newPowerStatus,
          diagnosticNotes: newNotes
        };
      }
      return s;
    }));
  };

  // Replace / Hot-Swap sensor to 100% health
  const handleReplaceSensor = (sensorId: string, sensorTag: string) => {
    handleUpdateSensorHealth(sensorId, 100);
    setWorkOrderNotice({
      id: `WO-PM-${Math.floor(1000 + Math.random() * 9000)}`,
      sensorTag: sensorTag,
      message: `Sensor ${sensorTag} successfully replaced with a new calibrated transducer unit. Health restored to 100% (Nominal).`
    });
    setTimeout(() => setWorkOrderNotice(null), 6000);
  };

  // Generate SAP PM Emergency Work Order for replacement
  const handleDispatchWorkOrder = (sensor: DetailedSensorHealth) => {
    const woNumber = `WO-PM-${Math.floor(1000 + Math.random() * 9000)}`;
    setWorkOrderNotice({
      id: woNumber,
      sensorTag: sensor.tag,
      message: `EMERGENCY WORK ORDER #${woNumber} DISPATCHED in SAP PM: Replacement unit ${sensor.replacementSku} reserved from warehouse for ${sensor.tag} (${sensor.plantName} • ${sensor.zone}). Crew Priority 1 assigned.`
    });
    setTimeout(() => setWorkOrderNotice(null), 7000);
  };

  // Run full fleet diagnostics scan
  const handleRunFleetDiagnostics = () => {
    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setTestResultNotice(`Fleet Diagnostic Scan Complete: ${stats.total} sensors polled across Plant 1 & Plant 2. ${stats.under50Count} sensor(s) flagged for IMMEDIATE REPLACEMENT (<50% health).`);
          setTimeout(() => setTestResultNotice(null), 5000);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  // Run single transducer self-test
  const handleTestTransducer = (sensor: DetailedSensorHealth) => {
    setTestingSensorId(sensor.id);
    setTimeout(() => {
      setTestingSensorId(null);
      if (sensor.healthScore <= 50) {
        setTestResultNotice(`⚠️ Loopback Diagnostic for ${sensor.tag}: CRITICAL IMPEDANCE FAILURE. Transducer crystal response degraded to ${sensor.healthScore}%. REPLACEMENT REQUIRED.`);
      } else {
        setTestResultNotice(`Loopback Diagnostic for ${sensor.tag}: Signal Loop ${sensor.snrDb} dB SNR verified. Transducer crystal impedance ${sensor.crystalImpedance} PASS.`);
      }
      setTimeout(() => setTestResultNotice(null), 5000);
    }, 900);
  };

  const getStatusBadge = (sensor: DetailedSensorHealth) => {
    if (sensor.healthScore <= 50) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-[#ff4d6d]/25 text-[#ff4d6d] border border-[#ff4d6d] text-[10px] font-mono font-black flex items-center space-x-1 animate-pulse shadow-sm shadow-[#ff4d6d]/30">
          <AlertOctagon className="w-3 h-3 text-[#ff4d6d]" />
          <span>REPLACE (&lt;50%)</span>
        </span>
      );
    }
    switch (sensor.status) {
      case 'nominal':
        return (
          <span className="px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 text-[10px] font-mono font-bold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span>NOMINAL</span>
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 rounded-full bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 text-[10px] font-mono font-bold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
            <span>WARNING</span>
          </span>
        );
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded-full bg-[#ff4d6d]/15 text-[#ff4d6d] border border-[#ff4d6d]/30 text-[10px] font-mono font-bold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d6d] animate-pulse" />
            <span>CRITICAL</span>
          </span>
        );
    }
  };

  const getTypeIcon = (type: DetailedSensorHealth['type']) => {
    switch (type) {
      case 'flow': return Activity;
      case 'pressure': return Gauge;
      case 'acoustic': return Waves;
      case 'vibration': return Zap;
      case 'tank': return Droplets;
      case 'temperature': return Thermometer;
      case 'quality': return Sliders;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER & ACTION BANNER                                    */}
      {/* ------------------------------------------------------------- */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10b981]/20 to-[#00e5ff]/20 border border-[#10b981]/40 flex items-center justify-center text-[#10b981]">
              <HeartPulse className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide font-['Outfit'] flex items-center space-x-2">
                <span>Fleet Sensors Health & Replacement Center</span>
                <span className="px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#10b981] text-[10px] font-mono font-bold border border-[#10b981]/30">
                  REAL-TIME PREDICTIVE MONITORING
                </span>
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                Transducer health index tracking with automated replacement alerts when health drops under 50%
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <button
            onClick={handleRunFleetDiagnostics}
            disabled={isScanning}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#10b981] to-[#00e5ff] text-[#04131d] font-mono font-bold text-xs flex items-center space-x-2 shadow-lg shadow-[#10b981]/20 hover:brightness-110 cursor-pointer transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? `Scanning Fleet (${scanProgress}%)` : 'Run Fleet Diagnostic Scan'}</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CRITICAL SENSOR REPLACEMENT ALERT BANNER (<50% HEALTH)        */}
      {/* ------------------------------------------------------------- */}
      {criticalSensorsUnder50.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-2xl bg-gradient-to-r from-[#ff4d6d]/20 via-[#3a0814]/80 to-[#ff4d6d]/20 border-2 border-[#ff4d6d] shadow-xl shadow-[#ff4d6d]/20 space-y-4"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#ff4d6d]/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#ff4d6d] text-white flex items-center justify-center shrink-0 animate-bounce shadow-lg shadow-[#ff4d6d]/50">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm sm:text-base font-black text-white font-mono tracking-wide uppercase flex items-center space-x-2">
                    <span>CRITICAL SENSOR REPLACEMENT ALERT (HEALTH UNDER 50%)</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#ff4d6d] text-white text-[10px] font-mono font-extrabold animate-pulse">
                    ACTION REQUIRED
                  </span>
                </div>
                <p className="text-xs text-rose-200/90 font-mono mt-0.5">
                  The following sensor(s) have dropped under <strong>50% health</strong>. Immediate replacement is required to avoid future transducer failure, loss of SCADA telemetry, and catastrophic pipeline blowout.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center space-x-2 self-start md:self-auto">
              <span className="px-3 py-1 rounded-xl bg-[#ff4d6d]/30 border border-[#ff4d6d]/60 text-white font-mono text-xs font-bold">
                {criticalSensorsUnder50.length} Sensor{criticalSensorsUnder50.length > 1 ? 's' : ''} Under 50%
              </span>
            </div>
          </div>

          {/* List of Critical Sensors under 50% */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {criticalSensorsUnder50.map(critSensor => (
              <div 
                key={critSensor.id}
                className="p-3.5 rounded-xl bg-[#1a050a] border border-[#ff4d6d]/50 flex flex-col justify-between space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold font-mono text-white tracking-wider">
                        {critSensor.tag}
                      </span>
                      <span 
                        className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold"
                        style={{ 
                          backgroundColor: `${critSensor.plantBadgeColor}20`,
                          color: critSensor.plantBadgeColor,
                          border: `1px solid ${critSensor.plantBadgeColor}40`
                        }}
                      >
                        {critSensor.plantId === 'plant-01' ? 'Plant 1' : 'Plant 2'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-rose-100 mt-0.5">
                      {critSensor.name}
                    </h4>
                    <div className="text-[10px] text-rose-300/70 font-mono">
                      {critSensor.zone} • {critSensor.pipelineSpec}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xl font-black text-[#ff4d6d] font-mono animate-pulse">
                      {critSensor.healthScore}%
                    </div>
                    <div className="text-[9px] font-mono font-bold text-rose-400 uppercase">
                      UNDER 50% HEALTH
                    </div>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-black/40 border border-rose-500/20 text-[10px] font-mono text-rose-200/90 flex items-center justify-between">
                  <span>Transducer SKU: <strong>{critSensor.replacementSku}</strong></span>
                  <span className="text-amber-400 font-bold">Failure Probability: 96%</span>
                </div>

                {/* Replacement Action Buttons */}
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    onClick={() => handleDispatchWorkOrder(critSensor)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-[#ff4d6d] to-[#e63946] hover:brightness-110 text-white font-mono font-bold text-[11px] flex items-center justify-center space-x-1.5 shadow-md shadow-[#ff4d6d]/30 cursor-pointer transition-all"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Dispatch Replacement (SAP PM)</span>
                  </button>

                  <button
                    onClick={() => handleReplaceSensor(critSensor.id, critSensor.tag)}
                    className="py-1.5 px-3 rounded-lg bg-[#10b981] hover:bg-[#059669] text-black font-mono font-bold text-[11px] flex items-center space-x-1 cursor-pointer transition-all"
                    title="Simulate replacing sensor with a new calibrated unit"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Install New (100%)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Notice Feedbacks */}
      {workOrderNotice && (
        <motion.div 
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-[#10b981]/20 border border-[#10b981] text-emerald-200 text-xs font-mono rounded-xl flex items-start space-x-2.5 shadow-lg shadow-[#10b981]/10"
        >
          <FileCheck2 className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-[#10b981] uppercase">Work Order Dispatched:</span>
            <p className="text-gray-200">{workOrderNotice.message}</p>
          </div>
        </motion.div>
      )}

      {testResultNotice && (
        <motion.div 
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-[#00e5ff]/15 border border-[#00e5ff]/40 text-[#00e5ff] text-xs font-mono rounded-xl flex items-center space-x-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{testResultNotice}</span>
        </motion.div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* OVERALL HEALTH SUMMARY KPI CARDS                              */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Total Fleet Sensors */}
        <div className="p-3.5 rounded-2xl bg-[#081521] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono uppercase">Total Sensors</span>
            <Radio className="w-3.5 h-3.5 text-[#00e5ff]" />
          </div>
          <div className="text-xl font-bold text-white font-mono">{stats.total}</div>
          <div className="text-[10px] text-gray-400 font-mono">
            P1: <span className="text-[#00e5ff] font-bold">{stats.plant1Count}</span> • P2: <span className="text-[#ff4d6d] font-bold">{stats.plant2Count}</span>
          </div>
        </div>

        {/* Card 2: Fleet Health Index */}
        <div className="p-3.5 rounded-2xl bg-[#081521] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono uppercase">Avg Health Score</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
          </div>
          <div className={`text-xl font-bold font-mono ${stats.avgHealth >= 90 ? 'text-[#10b981]' : stats.avgHealth >= 75 ? 'text-[#f59e0b]' : 'text-[#ff4d6d]'}`}>
            {stats.avgHealth}%
          </div>
          <div className="w-full bg-[#132637] h-1.5 rounded-full overflow-hidden mt-1">
            <div 
              className={`h-full rounded-full ${stats.avgHealth >= 90 ? 'bg-[#10b981]' : stats.avgHealth >= 75 ? 'bg-[#f59e0b]' : 'bg-[#ff4d6d]'}`} 
              style={{ width: `${stats.avgHealth}%` }} 
            />
          </div>
        </div>

        {/* Card 3: Replacement Alert Counter (<50%) */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'replace-under-50' ? 'all' : 'replace-under-50')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1 ${
            stats.under50Count > 0 
              ? 'bg-[#2a0810] border-[#ff4d6d] shadow-lg shadow-[#ff4d6d]/20 hover:brightness-110' 
              : 'bg-[#081521] border-white/10'
          }`}
        >
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono uppercase font-bold text-[#ff4d6d]">Needs Replacement</span>
            <AlertOctagon className={`w-3.5 h-3.5 text-[#ff4d6d] ${stats.under50Count > 0 ? 'animate-pulse' : ''}`} />
          </div>
          <div className="text-xl font-bold text-[#ff4d6d] font-mono">{stats.under50Count}</div>
          <div className="text-[10px] text-rose-300 font-mono font-bold">Health &lt; 50% Threshold</div>
        </div>

        {/* Card 4: Nominal State */}
        <div className="p-3.5 rounded-2xl bg-[#081521] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono uppercase">Nominal Pass</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
          </div>
          <div className="text-xl font-bold text-[#10b981] font-mono">{stats.nominal}</div>
          <div className="text-[10px] text-gray-400 font-mono">100% Calibrated</div>
        </div>

        {/* Card 5: Warnings & Watch */}
        <div className="p-3.5 rounded-2xl bg-[#081521] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono uppercase">Warning Watch</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b]" />
          </div>
          <div className="text-xl font-bold text-[#f59e0b] font-mono">{stats.warning}</div>
          <div className="text-[10px] text-amber-300/80 font-mono">Drift &gt; 0.10%</div>
        </div>

        {/* Card 6: Loop Integrity */}
        <div className="p-3.5 rounded-2xl bg-[#081521] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono uppercase">Mean SNR</span>
            <Signal className="w-3.5 h-3.5 text-[#00e5ff]" />
          </div>
          <div className="text-xl font-bold text-white font-mono">{stats.avgSnr} dB</div>
          <div className="text-[10px] text-[#10b981] font-mono">Noise Floor: -74 dBm</div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PLANT SEPARATION CONTROLS & FILTER BAR                         */}
      {/* ------------------------------------------------------------- */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3.5">
        
        {/* Plant Separation Tab Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase text-gray-400 font-bold">Plant Filter:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {/* All Plants */}
              <button
                onClick={() => setPlantFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  plantFilter === 'all'
                    ? 'bg-white text-black shadow-lg shadow-white/10'
                    : 'bg-[#081521] text-gray-300 hover:text-white border border-white/10'
                }`}
              >
                <span>All Plants Combined</span>
                <span className="px-1.5 py-0.2 rounded bg-black/20 text-[10px] font-mono">
                  {stats.total}
                </span>
              </button>

              {/* Plant 1: Municipal Water Treatment */}
              <button
                onClick={() => setPlantFilter('plant-01')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  plantFilter === 'plant-01'
                    ? 'bg-[#00e5ff] text-black shadow-lg shadow-[#00e5ff]/30 font-bold'
                    : 'bg-[#081521] text-[#00e5ff] hover:bg-[#00e5ff]/10 border border-[#00e5ff]/30'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Plant 1: Municipal (Demo)</span>
                <span className="px-1.5 py-0.2 rounded bg-black/20 text-[10px] font-mono">
                  {stats.plant1Count}
                </span>
              </button>

              {/* Plant 2: Large Scale Industrial Processing */}
              <button
                onClick={() => setPlantFilter('plant-02')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  plantFilter === 'plant-02'
                    ? 'bg-[#ff4d6d] text-white shadow-lg shadow-[#ff4d6d]/30 font-bold'
                    : 'bg-[#081521] text-[#ff4d6d] hover:bg-[#ff4d6d]/10 border border-[#ff4d6d]/30'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Plant 2: Industrial Complex</span>
                <span className="px-1.5 py-0.2 rounded bg-black/20 text-[10px] font-mono">
                  {stats.plant2Count}
                </span>
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-400 font-mono">
            Showing <strong className="text-white">{filteredSensors.length}</strong> of {stats.total} sensors
          </div>
        </div>

        {/* Secondary Search & Type Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by tag, name, zone, spec..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#081521] border border-white/10 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-[#00e5ff]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-[#081521] p-1 rounded-xl border border-white/10">
            {(['all', 'nominal', 'warning', 'critical', 'replace-under-50'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`flex-1 py-1 text-[10px] font-mono uppercase font-bold rounded-lg transition-all cursor-pointer truncate ${
                  statusFilter === st 
                    ? st === 'nominal' ? 'bg-[#10b981] text-black' : st === 'warning' ? 'bg-[#f59e0b] text-black' : st === 'replace-under-50' ? 'bg-[#ff4d6d] text-white animate-pulse' : st === 'critical' ? 'bg-[#ff4d6d] text-white' : 'bg-white/20 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {st === 'replace-under-50' ? '<50% Replace' : st}
              </button>
            ))}
          </div>

          {/* Sensor Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#081521] border border-white/10 text-xs font-mono text-gray-200 focus:outline-none focus:border-[#00e5ff] cursor-pointer"
          >
            <option value="all">All Sensor Types (Flow, Pressure, Acoustic...)</option>
            <option value="flow">Flow Meters (Ultrasonic, Coriolis, EM)</option>
            <option value="pressure">Pressure & DP Transducers</option>
            <option value="acoustic">Acoustic Hydrophones & Probes</option>
            <option value="vibration">Vibration Transmitters (Tri-Axial)</option>
            <option value="tank">Tank & Radar Level</option>
            <option value="temperature">RTD Temperature Probes</option>
          </select>

          {/* Reset Filters */}
          <button
            onClick={() => {
              setPlantFilter('all');
              setStatusFilter('all');
              setTypeFilter('all');
              setSearchQuery('');
            }}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-mono flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-white/5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SENSOR HEALTH SPLIT VIEW: SENSOR LIST & DETAIL INSPECTOR       */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Sensor Cards List */}
        <div className="lg:col-span-7 space-y-4">
          
          {filteredSensors.length === 0 ? (
            <div className="p-8 text-center glass-panel rounded-2xl border border-white/10 space-y-2">
              <Info className="w-8 h-8 text-gray-400 mx-auto opacity-50" />
              <p className="text-xs font-mono text-gray-400">No sensors match the current filter criteria.</p>
              <button
                onClick={() => {
                  setPlantFilter('all');
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs font-mono text-[#00e5ff] underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSensors.map((sensor) => {
                const isSelected = selectedSensor?.id === sensor.id;
                const Icon = getTypeIcon(sensor.type);
                const isPlant1 = sensor.plantId === 'plant-01';
                const isUnder50 = sensor.healthScore <= 50;

                return (
                  <div
                    key={sensor.id}
                    onClick={() => setSelectedSensorId(sensor.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isUnder50
                        ? isSelected 
                          ? 'bg-[#2b0811] border-[#ff4d6d] shadow-2xl shadow-[#ff4d6d]/25 ring-2 ring-[#ff4d6d]'
                          : 'bg-[#180509] border-[#ff4d6d]/70 hover:border-[#ff4d6d]'
                        : isSelected
                          ? isPlant1
                            ? 'bg-[#091a27] border-[#00e5ff] shadow-xl shadow-[#00e5ff]/10'
                            : 'bg-[#180e1a] border-[#ff4d6d] shadow-xl shadow-[#ff4d6d]/10'
                          : 'bg-[#081521]/90 border-white/10 hover:border-white/20 hover:bg-[#0b1d2e]'
                    }`}
                  >
                    {/* Left Plant / Replacement Color Accent Indicator Bar */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1.5"
                      style={{ backgroundColor: isUnder50 ? '#ff4d6d' : sensor.plantBadgeColor }}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      
                      {/* Sensor Identity */}
                      <div className="flex items-start space-x-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isUnder50 ? 'bg-[#ff4d6d] text-white animate-pulse' :
                          sensor.status === 'critical' ? 'bg-[#ff4d6d]/20 text-[#ff4d6d] border border-[#ff4d6d]/30' :
                          sensor.status === 'warning' ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30' :
                          'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white font-mono tracking-wider">
                              {sensor.tag}
                            </span>
                            <span 
                              className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold"
                              style={{ 
                                backgroundColor: `${sensor.plantBadgeColor}20`,
                                color: sensor.plantBadgeColor,
                                border: `1px solid ${sensor.plantBadgeColor}40`
                              }}
                            >
                              {isPlant1 ? 'Plant 1 (Demo)' : 'Plant 2 (Industrial)'}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              Stn {sensor.stationDistanceMeters}m
                            </span>
                          </div>

                          <h4 className="text-xs font-medium text-gray-200 mt-0.5 truncate">
                            {sensor.name}
                          </h4>

                          <div className="text-[11px] text-gray-400 font-mono mt-0.5 truncate">
                            {sensor.zone} • <span className="text-gray-500">{sensor.pipelineSpec}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Health Score & Reading */}
                      <div className="flex items-center justify-between sm:justify-end space-x-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        
                        {/* Live Value */}
                        <div className="text-left sm:text-right">
                          <div className="text-xs font-bold text-white font-mono">
                            {sensor.value} {sensor.unit}
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono">
                            Band: {sensor.nominalBand}
                          </div>
                        </div>

                        {/* Health Score Pill */}
                        <div className="text-right">
                          <div className="flex items-center space-x-1.5 justify-end">
                            <span className={`text-sm font-bold font-mono ${
                              sensor.healthScore <= 50 ? 'text-[#ff4d6d] font-black animate-pulse' :
                              sensor.healthScore >= 95 ? 'text-[#10b981]' : 
                              sensor.healthScore >= 85 ? 'text-[#f59e0b]' : 'text-[#ff4d6d]'
                            }`}>
                              {sensor.healthScore}%
                            </span>
                            {getStatusBadge(sensor)}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                            SNR: <span className="text-white font-bold">{sensor.snrDb} dB</span> • Drift: <span className="text-white">{sensor.driftPercentage}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Deep Transducer Diagnostic Inspector & Health Simulator */}
        <div className="lg:col-span-5">
          {selectedSensor ? (
            <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/15 space-y-5 sticky top-24">
              
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <div className="flex items-center space-x-2">
                    <span 
                      className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
                      style={{ 
                        backgroundColor: `${selectedSensor.plantBadgeColor}25`,
                        color: selectedSensor.plantBadgeColor,
                        border: `1px solid ${selectedSensor.plantBadgeColor}50`
                      }}
                    >
                      {selectedSensor.plantName}
                    </span>
                    <span className="text-xs font-mono text-gray-400">
                      ID: {selectedSensor.id}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white font-['Outfit'] mt-1">
                    {selectedSensor.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    {selectedSensor.zone} • {selectedSensor.pipelineSpec}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className={`text-2xl font-black font-mono ${
                    selectedSensor.healthScore <= 50 ? 'text-[#ff4d6d] animate-pulse' :
                    selectedSensor.healthScore >= 95 ? 'text-[#10b981]' : 
                    selectedSensor.healthScore >= 85 ? 'text-[#f59e0b]' : 'text-[#ff4d6d]'
                  }`}>
                    {selectedSensor.healthScore}%
                  </div>
                  <div className="text-[10px] uppercase font-mono text-gray-400">Transducer Health</div>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* SENSOR HEALTH SIMULATION & THRESHOLD TESTING SLIDER               */}
              {/* ----------------------------------------------------------------- */}
              <div className="p-3.5 bg-[#081521] rounded-xl border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-300 font-bold flex items-center space-x-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#00e5ff]" />
                    <span>Health Score Simulator & Tester</span>
                  </span>
                  <span className={`font-bold px-2 py-0.5 rounded ${
                    selectedSensor.healthScore <= 50 ? 'bg-[#ff4d6d] text-white' : 'bg-white/10 text-white'
                  }`}>
                    {selectedSensor.healthScore}% Health
                  </span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="100"
                  value={selectedSensor.healthScore}
                  onChange={(e) => handleUpdateSensorHealth(selectedSensor.id, Number(e.target.value))}
                  className="w-full accent-[#00e5ff] cursor-pointer"
                />

                <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                  <button
                    onClick={() => handleUpdateSensorHealth(selectedSensor.id, 42)}
                    className="px-2 py-1 rounded bg-[#ff4d6d]/20 text-[#ff4d6d] hover:bg-[#ff4d6d]/30 border border-[#ff4d6d]/40 transition-colors font-bold cursor-pointer"
                  >
                    Drop &lt;50% (42% Alert)
                  </button>
                  <button
                    onClick={() => handleUpdateSensorHealth(selectedSensor.id, 75)}
                    className="px-2 py-1 rounded bg-[#f59e0b]/20 text-[#f59e0b] hover:bg-[#f59e0b]/30 border border-[#f59e0b]/40 transition-colors font-bold cursor-pointer"
                  >
                    Set 75% (Warning)
                  </button>
                  <button
                    onClick={() => handleUpdateSensorHealth(selectedSensor.id, 100)}
                    className="px-2 py-1 rounded bg-[#10b981]/20 text-[#10b981] hover:bg-[#10b981]/30 border border-[#10b981]/40 transition-colors font-bold cursor-pointer"
                  >
                    Set 100% (New)
                  </button>
                </div>
              </div>

              {/* URGENT REPLACEMENT CARD IF UNDER 50% */}
              {selectedSensor.healthScore <= 50 && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#ff4d6d]/30 to-[#3a0814] border-2 border-[#ff4d6d] space-y-3 animate-fade-in-up">
                  <div className="flex items-start space-x-2.5">
                    <AlertOctagon className="w-5 h-5 text-[#ff4d6d] shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-black text-white font-mono uppercase tracking-wider">
                        CRITICAL: SENSOR HEALTH UNDER 50% ({selectedSensor.healthScore}%)
                      </h4>
                      <p className="text-[11px] text-rose-200 mt-1 leading-relaxed">
                        Transducer health has degraded below safe SCADA operating limits. <strong>This sensor needs to be replaced</strong> immediately to prevent sudden telemetry dropout and unmonitored line failures.
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/50 border border-rose-500/30 text-[11px] font-mono text-gray-200 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Replacement Transducer SKU:</span>
                      <strong className="text-white">{selectedSensor.replacementSku}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Inventory Status:</span>
                      <strong className="text-[#10b981]">In Stock (Dahej / Chennai Warehouse)</strong>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDispatchWorkOrder(selectedSensor)}
                      className="flex-1 py-2 rounded-lg bg-[#ff4d6d] hover:bg-[#e63946] text-white font-mono font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-[#ff4d6d]/30 cursor-pointer transition-all"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Dispatch SAP Work Order</span>
                    </button>

                    <button
                      onClick={() => handleReplaceSensor(selectedSensor.id, selectedSensor.tag)}
                      className="py-2 px-3 rounded-lg bg-[#10b981] hover:bg-[#059669] text-black font-mono font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Hot-Swap</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Real-time Health Diagnostic Gauges */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                
                {/* 1. Live Value */}
                <div className="p-3 bg-[#081521] rounded-xl border border-white/10 space-y-0.5">
                  <div className="text-[10px] text-gray-400 uppercase">Live SCADA Reading</div>
                  <div className="text-sm font-bold text-[#00e5ff]">
                    {selectedSensor.value} {selectedSensor.unit}
                  </div>
                  <div className="text-[10px] text-gray-500">Nominal: {selectedSensor.nominalBand}</div>
                </div>

                {/* 2. Signal-to-Noise Ratio (SNR) */}
                <div className="p-3 bg-[#081521] rounded-xl border border-white/10 space-y-0.5">
                  <div className="text-[10px] text-gray-400 uppercase">Signal Quality (SNR)</div>
                  <div className={`text-sm font-bold ${
                    selectedSensor.snrDb >= 35 ? 'text-[#10b981]' : selectedSensor.snrDb >= 25 ? 'text-[#f59e0b]' : 'text-[#ff4d6d]'
                  }`}>
                    {selectedSensor.snrDb} dB SNR
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {selectedSensor.snrDb >= 35 ? 'Excellent Signal' : selectedSensor.snrDb >= 25 ? 'Moderate Noise' : 'High Noise Floor'}
                  </div>
                </div>

                {/* 3. Calibration Drift */}
                <div className="p-3 bg-[#081521] rounded-xl border border-white/10 space-y-0.5">
                  <div className="text-[10px] text-gray-400 uppercase">Zero-Point Drift</div>
                  <div className={`text-sm font-bold ${
                    selectedSensor.driftPercentage <= 0.05 ? 'text-[#10b981]' : selectedSensor.driftPercentage <= 0.15 ? 'text-[#f59e0b]' : 'text-[#ff4d6d]'
                  }`}>
                    {selectedSensor.driftPercentage}% Span
                  </div>
                  <div className="text-[10px] text-gray-500">Tolerance: ±0.10%</div>
                </div>

                {/* 4. Power & Loop Status */}
                <div className="p-3 bg-[#081521] rounded-xl border border-white/10 space-y-0.5">
                  <div className="text-[10px] text-gray-400 uppercase">Power & Bus Supply</div>
                  <div className="text-sm font-bold text-white truncate">
                    {selectedSensor.powerSupply}
                  </div>
                  <div className={`text-[10px] font-bold ${
                    selectedSensor.powerStatus === 'Optimal' ? 'text-[#10b981]' : selectedSensor.powerStatus === 'Degraded' ? 'text-[#f59e0b]' : 'text-[#ff4d6d]'
                  }`}>
                    {selectedSensor.powerStatus} Bus
                  </div>
                </div>
              </div>

              {/* Hardware & Calibration Registry */}
              <div className="space-y-2 p-3.5 bg-[#081521] rounded-xl border border-white/10 text-xs font-mono">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider pb-1 border-b border-white/5">
                  Hardware & Metrology Parameters
                </div>

                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">Communication Protocol</span>
                  <span className="text-white font-bold">{selectedSensor.protocol}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">Sampling Rate</span>
                  <span className="text-[#00e5ff] font-bold">{selectedSensor.samplingRate}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">Crystal / Coil Impedance</span>
                  <span className="text-white font-bold">{selectedSensor.crystalImpedance}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">Thermal Drift</span>
                  <span className="text-white">{selectedSensor.temperatureDrift}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">Firmware Revision</span>
                  <span className="text-gray-300 font-bold">{selectedSensor.firmwareVersion}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">Last Calibrated</span>
                  <span className="text-[#10b981] font-bold">{selectedSensor.lastCalibrated}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-gray-400">Next Recalibration Due</span>
                  <span className="text-amber-400 font-bold">{selectedSensor.nextCalibrationDue}</span>
                </div>
              </div>

              {/* AI Diagnostic Summary */}
              <div className="p-3.5 bg-[#0b1c2b] rounded-xl border border-[#00e5ff]/20 text-xs font-mono space-y-1">
                <div className="flex items-center space-x-1.5 text-[#00e5ff] font-bold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SCADA Diagnostics Assessment</span>
                </div>
                <p className="text-gray-300 leading-relaxed text-[11px]">
                  {selectedSensor.diagnosticNotes}
                </p>
              </div>

              {/* Transducer Self-Test Interactive Action */}
              <button
                onClick={() => handleTestTransducer(selectedSensor)}
                disabled={testingSensorId === selectedSensor.id}
                className="w-full py-2.5 rounded-xl bg-[#00e5ff]/15 hover:bg-[#00e5ff]/25 border border-[#00e5ff]/40 text-[#00e5ff] font-bold text-xs font-mono flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingSensorId === selectedSensor.id ? 'animate-spin' : ''}`} />
                <span>
                  {testingSensorId === selectedSensor.id ? 'Pinging Transducer Loop...' : `Run Loop Diagnostics on ${selectedSensor.tag}`}
                </span>
              </button>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-8 border border-white/10 text-center text-gray-400 text-xs font-mono">
              Select a sensor from the list to view detailed transducer health telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
