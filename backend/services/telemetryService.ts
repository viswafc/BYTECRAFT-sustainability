import { SensorItem, SensorStatus, FleetHealthSummary, TelemetryFrame } from '../types';
import { initialSensors } from '../data/seeds';
import { incidentService } from './incidentService';

class TelemetryService {
  private sensors: SensorItem[] = [...initialSensors];

  getSensors(): SensorItem[] {
    return this.sensors;
  }

  getFleetHealth(): FleetHealthSummary {
    const totalSensors = this.sensors.length;
    const nominalCount = this.sensors.filter(s => s.status === 'nominal').length;
    const warningCount = this.sensors.filter(s => s.status === 'warning').length;
    const criticalCount = this.sensors.filter(s => s.status === 'critical').length;
    const fleetHealth = Math.round(((nominalCount * 1.0 + warningCount * 0.6 + criticalCount * 0.2) / totalSensors) * 100);

    return {
      fleetHealthScore: fleetHealth,
      totalSensors,
      nominalCount,
      warningCount,
      criticalCount,
      calibrationDueCount: 1,
      averageSnrDb: 39.4,
      busIntegrity: '99.8%',
      lastFleetScan: new Date().toISOString()
    };
  }

  resetSensorsToNominal(): void {
    this.sensors = this.sensors.map(s => ({
      ...s,
      status: 'nominal',
      trend: 'stable'
    }));
  }

  generateNextTelemetryFrame(connectedClientsCount: number): TelemetryFrame {
    const mode = incidentService.getSimulationMode();
    const isResolved = mode === 'resolved' || mode === 'none';
    const isWarning = mode === 'warning_10';
    const isCritical = mode === 'critical_blowout';
    const isLineIsolated = incidentService.isLineIsolated();
    const isHalted = incidentService.isPipelineHalted();

    if (!isResolved && !isLineIsolated && !isHalted) {
      incidentService.incrementAccumulatedLoss(isWarning ? 0.025 : 0.19);
    }
    const totalLost = incidentService.getAccumulatedLoss();
    const financialCost = Math.round(totalLost * 52.0);

    const flow_s01 = Number((495.0 + (Math.random() - 0.5) * 4.0).toFixed(1));
    const pressure_s01 = Number((4.82 + (Math.random() - 0.5) * 0.08).toFixed(2));

    let acoustic_s05 = 14.2;
    let pressure_s05 = 4.35;
    let flow_s06 = 195.0;
    let statusLineB: SensorStatus = 'nominal';

    if (isResolved) {
      acoustic_s05 = Number((14.0 + (Math.random() - 0.5) * 0.4).toFixed(1));
      pressure_s05 = Number((4.35 + (Math.random() - 0.5) * 0.05).toFixed(2));
      flow_s06 = Number((195.0 + (Math.random() - 0.5) * 2.0).toFixed(1));
      statusLineB = 'nominal';
    } else if (isWarning) {
      acoustic_s05 = Number((32.8 + (Math.random() - 0.5) * 1.2).toFixed(1));
      pressure_s05 = Number((3.82 + (Math.random() - 0.5) * 0.04).toFixed(2));
      flow_s06 = Number((175.2 + (Math.random() - 0.5) * 2.5).toFixed(1));
      statusLineB = 'warning';
    } else if (isCritical) {
      if (isLineIsolated || isHalted) {
        acoustic_s05 = Number((12.2 + (Math.random() - 0.5) * 0.3).toFixed(1));
        pressure_s05 = 0.12;
        flow_s06 = 0.0;
        statusLineB = 'nominal';
      } else {
        acoustic_s05 = Number((58.4 + (Math.random() - 0.5) * 2.0).toFixed(1));
        pressure_s05 = Number((2.15 + (Math.random() - 0.5) * 0.06).toFixed(2));
        flow_s06 = Number((132.8 + (Math.random() - 0.5) * 3.0).toFixed(1));
        statusLineB = 'critical';
      }
    }

    // Update internal sensor states
    this.sensors = this.sensors.map(s => {
      if (s.sensorId === 'SEN-FL-01') return { ...s, value: flow_s01 };
      if (s.sensorId === 'SEN-PR-01') return { ...s, value: pressure_s01 };
      if (s.sensorId === 'SEN-AC-05') return { ...s, value: acoustic_s05, status: statusLineB };
      if (s.sensorId === 'SEN-PR-03') return { ...s, value: pressure_s05, status: statusLineB };
      if (s.sensorId === 'SEN-FL-03') return { ...s, value: flow_s06, status: statusLineB === 'critical' ? 'critical' : (statusLineB === 'warning' ? 'warning' : 'nominal') };
      return s;
    });

    const activeLossRate = isResolved ? 0.0 : (isHalted ? 0.0 : (isWarning ? 48.2 : 342.4));

    return {
      timestamp: new Date().toISOString(),
      systemStatus: isResolved ? 'NOMINAL' : (isWarning ? 'WARNING' : 'CRITICAL_ALERT'),
      leakMode: mode,
      pipelineStopped: isHalted,
      flowRateLpm: flow_s01,
      pressureBar: pressure_s01,
      waterLossLph: activeLossRate,
      totalLostLiters: totalLost,
      financialBleedInr: financialCost,
      leakSensors: [
        { sensorId: 'SEN-FL-01', value: flow_s01, status: 'nominal' },
        { sensorId: 'SEN-PR-01', value: pressure_s01, status: 'nominal' },
        { sensorId: 'SEN-AC-05', value: acoustic_s05, status: statusLineB },
        { sensorId: 'SEN-PR-03', value: pressure_s05, status: statusLineB }
      ],
      activeIncidents: incidentService.getIncidents(),
      sensors: this.sensors,
      activeLeak: {
        incidentId: isResolved ? 'INC-RESOLVED' : 'INC-2026-089',
        location: isResolved ? 'All lines operating nominally. Normal flow restored.' : 'Line B, Segment S05 (High-Pressure Bottling)',
        segmentId: 'S05',
        severity: isResolved ? 'Low' : (isWarning ? 'Warning' : 'Critical'),
        confidenceScore: isResolved ? 99.4 : (isWarning ? 82.5 : 94.8),
        currentLossRateLph: activeLossRate,
        projected24hLossLiters: isResolved ? 0 : (isWarning ? 1156 : 8217),
        financialBleedInrPerDay: isResolved ? 0 : (isWarning ? 4040 : 28760),
        detectedAt: '13:16:15 UTC',
        isIsolated: isHalted
      },
      systemStatusObj: {
        backend: 'online',
        database: 'online',
        mlEngine: 'online',
        webSockets: 'online',
        latencyMs: 14,
        connectedClients: connectedClientsCount,
        uptimeSeconds: Math.floor(process.uptime())
      }
    };
  }
}

export const telemetryService = new TelemetryService();
