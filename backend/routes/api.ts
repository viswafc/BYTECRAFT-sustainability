import { Router, Request, Response } from 'express';
import { incidentService } from '../services/incidentService';
import { telemetryService } from '../services/telemetryService';
import { LeakSimulationMode } from '../types';

export const apiRouter = Router();

// System status and machine learning engine health
apiRouter.get('/system/status', (_req: Request, res: Response) => {
  const currentLeakMode = incidentService.getSimulationMode();
  res.json({
    status: currentLeakMode === 'resolved' || currentLeakMode === 'none' ? 'nominal' : (currentLeakMode === 'warning_10' ? 'warning' : 'critical'),
    service: 'AquaRisk AI Core Telemetry & Prediction Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: 'sqlite_connected',
    scada_connected: true,
    leakMode: currentLeakMode,
    pipelineStopped: incidentService.isPipelineHalted(),
    active_models: [
      'Acoustic_SpecResNet_v2.4',
      'Hydrodynamic_PressureDecay_v3.1'
    ]
  });
});

// Real-time sensors state
apiRouter.get('/sensors', (_req: Request, res: Response) => {
  res.json(telemetryService.getSensors());
});

// Fleet sensor health analytics
apiRouter.get('/sensors/health', (_req: Request, res: Response) => {
  res.json(telemetryService.getFleetHealth());
});

// Active and historical incidents
apiRouter.get('/incidents', (_req: Request, res: Response) => {
  res.json(incidentService.getIncidents());
});

// Simulation mode switcher (none | warning_10 | critical_blowout | resolved)
apiRouter.post('/leak/mode', (req: Request, res: Response) => {
  const { mode } = req.body as { mode: LeakSimulationMode };
  if (['none', 'warning_10', 'critical_blowout', 'resolved'].includes(mode)) {
    incidentService.setSimulationMode(mode);
    if (mode === 'resolved' || mode === 'none') {
      telemetryService.resetSensorsToNominal();
    }
    res.json({
      success: true,
      mode,
      pipelineStopped: incidentService.isPipelineHalted(),
      message: `Leak mode shifted to ${mode}`
    });
  } else {
    res.status(400).json({ error: 'Invalid mode' });
  }
});

// Incident resolution endpoint: restores normal flow and resets sensors to nominal
apiRouter.post('/leak/resolve', (_req: Request, res: Response) => {
  incidentService.resolveIncident();
  telemetryService.resetSensorsToNominal();

  res.json({
    success: true,
    message: 'Leak resolved. Pipeline restarted and all sensors set to nominal normal state.',
    pipelineStatus: 'RUNNING_NORMAL'
  });
});

// Emergency line isolation
apiRouter.post('/emergency/isolate', (req: Request, res: Response) => {
  const line = req.body?.line || 'Line B';
  incidentService.isolateLine(line);

  res.json({
    success: true,
    message: `SCADA Isolation command dispatched to ${line}. Solenoid V-104 tripped closed.`,
    timestamp: new Date().toISOString()
  });
});

// Emergency restoration
apiRouter.post('/emergency/restore', (req: Request, res: Response) => {
  const line = req.body?.line || 'Line B';
  incidentService.restoreLine(line);
  telemetryService.resetSensorsToNominal();

  res.json({
    success: true,
    message: `Isolation reversed on ${line}. Pipeline restarted and nominal flow running.`,
    timestamp: new Date().toISOString()
  });
});
