import { IncidentItem, LeakSimulationMode } from '../types';
import { initialIncidents } from '../data/seeds';

class IncidentService {
  private incidents: IncidentItem[] = [...initialIncidents];
  private currentLeakMode: LeakSimulationMode = 'critical_blowout';
  private isLineBIsolated: boolean = false;
  private isPipelineStoppedByAutoCutoff: boolean = true;
  private accumulatedLostLiters: number = 1420.0;

  getIncidents(): IncidentItem[] {
    return this.incidents;
  }

  getSimulationMode(): LeakSimulationMode {
    return this.currentLeakMode;
  }

  isLineIsolated(): boolean {
    return this.isLineBIsolated;
  }

  isPipelineHalted(): boolean {
    return this.isPipelineStoppedByAutoCutoff || this.isLineBIsolated;
  }

  getAccumulatedLoss(): number {
    return Math.round(this.accumulatedLostLiters * 10) / 10;
  }

  incrementAccumulatedLoss(amount: number): void {
    this.accumulatedLostLiters += amount;
  }

  setSimulationMode(mode: LeakSimulationMode): void {
    this.currentLeakMode = mode;

    if (mode === 'resolved' || mode === 'none') {
      this.isLineBIsolated = false;
      this.isPipelineStoppedByAutoCutoff = false;
      this.incidents = this.incidents.map(inc => ({
        ...inc,
        status: 'Resolved',
        severity: 'Low',
        leakRateLph: 0.0,
        automatedActions: [
          ...inc.automatedActions,
          `[SCADA ${new Date().toLocaleTimeString()}] Incident fully resolved. Normal flow recommissioned.`
        ]
      }));
    } else if (mode === 'warning_10') {
      this.isLineBIsolated = false;
      this.isPipelineStoppedByAutoCutoff = false;
      this.incidents = this.incidents.map(inc => ({
        ...inc,
        status: 'Active',
        severity: 'Warning',
        leakRateLph: 48.2,
        automatedActions: [
          ...inc.automatedActions,
          `[SCADA ${new Date().toLocaleTimeString()}] 10% seepage detected. Advisory alert dispatched. Pipeline operational.`
        ]
      }));
    } else if (mode === 'critical_blowout') {
      this.isPipelineStoppedByAutoCutoff = true;
      this.incidents = this.incidents.map(inc => ({
        ...inc,
        status: 'Active',
        severity: 'Critical',
        leakRateLph: 342.4,
        automatedActions: [
          ...inc.automatedActions,
          `[SCADA ${new Date().toLocaleTimeString()}] CRITICAL LEAK >30%: Automated safety cutoff engaged! Pipeline flow halted.`
        ]
      }));
    }
  }

  resolveIncident(): void {
    this.currentLeakMode = 'resolved';
    this.isLineBIsolated = false;
    this.isPipelineStoppedByAutoCutoff = false;

    this.incidents = this.incidents.map(inc => ({
      ...inc,
      status: 'Resolved',
      severity: 'Low',
      leakRateLph: 0.0,
      automatedActions: [
        ...inc.automatedActions,
        `[SCADA ${new Date().toLocaleTimeString()}] Flange seal replaced and pressure-tested. System nominal. Normal flow restored.`
      ]
    }));
  }

  isolateLine(line = 'Line B'): void {
    this.isLineBIsolated = true;
    this.incidents = this.incidents.map(inc => {
      if (inc.id === 'INC-2026-089' || inc.segmentId === 'S05') {
        return {
          ...inc,
          status: 'Isolated',
          automatedActions: [
            ...inc.automatedActions,
            `[SCADA ${new Date().toLocaleTimeString()}] Emergency isolation executed on ${line}. Solenoid V-104 tripped closed.`
          ]
        };
      }
      return inc;
    });
  }

  restoreLine(line = 'Line B'): void {
    this.isLineBIsolated = false;
    this.isPipelineStoppedByAutoCutoff = false;
    this.currentLeakMode = 'resolved';

    this.incidents = this.incidents.map(inc => ({
      ...inc,
      status: 'Resolved',
      severity: 'Low',
      leakRateLph: 0.0,
      automatedActions: [
        ...inc.automatedActions,
        `[SCADA ${new Date().toLocaleTimeString()}] Manual reset: Solenoid V-104 reopened on ${line}. Fluid flow restarted.`
      ]
    }));
  }
}

export const incidentService = new IncidentService();
