import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Incident, SensorReading, TelemetryPayload, DigitalTwinNode, TimelineEvent, NotificationItem, PageId, PlantId, PlantInfo, LeakSimulationMode } from '../types';
import { 
  INITIAL_INCIDENTS, 
  INITIAL_SENSORS, 
  DIGITAL_TWIN_NODES, 
  INCIDENT_TIMELINE_STORY,
  PLANTS_CATALOG,
  PLANT_NODES_MAP,
  PLANT_INCIDENTS_MAP,
  PLANT_SENSORS_MAP,
  PLANT_TELEMETRY_MAP
} from '../data/mockData';

interface TelemetryContextType {
  currentPlantId: PlantId;
  currentPlant: PlantInfo;
  plants: PlantInfo[];
  setCurrentPlantId: (plantId: PlantId) => void;
  telemetry: TelemetryPayload;
  sensors: SensorReading[];
  incidents: Incident[];
  activeIncidents: Incident[];
  timeline: TimelineEvent[];
  digitalTwinNodes: DigitalTwinNode[];
  isStreaming: boolean;
  toggleStreaming: () => void;
  isConnectedWs: boolean;
  emergencyTriggered: boolean;
  triggerEmergencyOverride: () => void;
  resetEmergencyOverride: () => void;
  acknowledgeIncident: (id: string, notes?: string) => void;
  resolveIncident: (id?: string) => void;
  toggleValveState: (nodeId: string, openPercent: number) => void;
  isV104Isolated: boolean;
  isolateLineB: (isolate?: boolean) => void;
  selectedTwinNodeId: string;
  setSelectedTwinNodeId: (id: string) => void;
  leakSimulationMode: LeakSimulationMode;
  setLeakSimulationMode: (mode: LeakSimulationMode) => void;
  isPipelineAutoStopped: boolean;
  fleetHealthScore: number;
  systemHealth: {
    backend: 'online' | 'degraded' | 'offline';
    database: 'online' | 'degraded' | 'offline';
    mlEngine: 'online' | 'degraded' | 'offline';
    webSockets: 'online' | 'degraded' | 'offline';
    latencyMs: number;
    uptimeSeconds: number;
  };
  notifications: NotificationItem[];
  clearNotifications: () => void;
}

const TelemetryContext = createContext<TelemetryContextType | null>(null);

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPlantId, setCurrentPlantIdState] = useState<PlantId>('plant-01');
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [sensors, setSensors] = useState<SensorReading[]>(INITIAL_SENSORS);
  const [digitalTwinNodes, setDigitalTwinNodes] = useState<DigitalTwinNode[]>(DIGITAL_TWIN_NODES);
  const [timeline] = useState<TimelineEvent[]>(INCIDENT_TIMELINE_STORY);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [isConnectedWs, setIsConnectedWs] = useState<boolean>(false);
  const [emergencyTriggered, setEmergencyTriggered] = useState<boolean>(false);
  const [isV104Isolated, setIsV104Isolated] = useState<boolean>(false);
  const [leakSimulationMode, setLeakSimulationModeState] = useState<LeakSimulationMode>('critical_blowout');
  const [isPipelineAutoStopped, setIsPipelineAutoStopped] = useState<boolean>(true);
  const [selectedTwinNodeId, setSelectedTwinNodeId] = useState<string>('NODE-SEG-S05');
  const [uptime, setUptime] = useState<number>(432900); // 5 days uptime
  const [latency, setLatency] = useState<number>(14);

  const currentPlant = PLANTS_CATALOG.find(p => p.id === currentPlantId) || PLANTS_CATALOG[0];

  const setCurrentPlantId = useCallback((plantId: PlantId) => {
    setCurrentPlantIdState(plantId);
    setIncidents(PLANT_INCIDENTS_MAP[plantId] || INITIAL_INCIDENTS);
    setSensors(PLANT_SENSORS_MAP[plantId] || INITIAL_SENSORS);
    const nodes = PLANT_NODES_MAP[plantId] || DIGITAL_TWIN_NODES;
    setDigitalTwinNodes(nodes);
    setTelemetry(PLANT_TELEMETRY_MAP[plantId] || PLANT_TELEMETRY_MAP['plant-01']);
    
    // Select the key interesting/breach node for this plant
    const breachNode = nodes.find(n => n.status === 'critical') || nodes.find(n => n.status === 'warning') || nodes[0];
    if (breachNode) {
      setSelectedTwinNodeId(breachNode.id);
    }

    setIsV104Isolated(false);
    setEmergencyTriggered(false);

    const targetPlant = PLANTS_CATALOG.find(p => p.id === plantId);
    if (targetPlant) {
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          title: `Switched to ${targetPlant.shortName}`,
          message: `${targetPlant.name} online. Status: ${targetPlant.statusLabel}`,
          type: targetPlant.status === 'critical' ? 'critical' : targetPlant.status === 'warning' ? 'warning' : 'info',
          time: 'Just now',
          targetPage: 'digital-twin'
        },
        ...prev.slice(0, 8)
      ]);
    }
  }, []);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'High Acoustic Anomaly on Line B',
      message: 'Hydrophone SEN-AC-05 flagged 58.4 dB ultrasonic cavitation at Segment S05.',
      type: 'critical',
      time: '3m ago',
      targetPage: 'digital-twin',
      targetNodeId: 'NODE-SEG-S05'
    },
    {
      id: 'notif-2',
      title: 'Pressure Drop Detected',
      message: 'Pressure dropped to 2.15 Bar at high-pressure junction S05-HPJ.',
      type: 'critical',
      time: '7m ago',
      targetPage: 'command-center',
      targetIncidentId: 'INC-8921'
    },
    {
      id: 'notif-3',
      title: 'Booster Pump P-02 Vibration Warning',
      message: 'Radial vibration elevated to 3.85 mm/s. SCADA dampener engaged.',
      type: 'warning',
      time: '12m ago',
      targetPage: 'digital-twin',
      targetNodeId: 'NODE-PUMP-01'
    }
  ]);

  const [telemetry, setTelemetry] = useState<TelemetryPayload>({
    timestamp: new Date().toISOString(),
    activeLeak: {
      incidentId: 'INC-8921',
      location: 'Line B, Segment S05 (High-Pressure Bottling)',
      segmentId: 'S05',
      severity: 'Critical',
      confidenceScore: 94.8,
      currentLossRateLph: 342.4,
      projected24hLossLiters: 8217,
      financialBleedInrPerDay: 28760,
      detectedAt: '13:16:15 UTC'
    },
    sensors: INITIAL_SENSORS,
    systemStatus: {
      backend: 'online',
      database: 'online',
      mlEngine: 'online',
      webSockets: 'online',
      latencyMs: 14,
      connectedClients: 3,
      uptimeSeconds: 432900
    }
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Connect to WebSocket endpoint
  const connectWebSocket = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws/telemetry`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnectedWs(true);
        setLatency(Math.floor(10 + Math.random() * 8));
      };

      ws.onmessage = (event) => {
        if (!isStreaming) return;
        try {
          const data = JSON.parse(event.data);
          if (data && data.sensors) {
            setSensors(data.sensors);
            if (data.activeLeak) {
              setTelemetry(prev => ({
                ...prev,
                timestamp: data.timestamp || new Date().toISOString(),
                activeLeak: data.activeLeak,
                sensors: data.sensors,
                systemStatus: data.systemStatus || prev.systemStatus
              }));
            }
          }
        } catch {
          // ignore malformed ws messages
        }
      };

      ws.onerror = () => {
        setIsConnectedWs(false);
      };

      ws.onclose = () => {
        setIsConnectedWs(false);
        // Attempt reconnect in 4 seconds
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connectWebSocket();
        }, 4000);
      };
    } catch {
      setIsConnectedWs(false);
    }
  }, [isStreaming]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  // Fallback high-fidelity live telemetry simulator when WebSocket is disconnected or streaming
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setUptime(prev => prev + 2);

      // Jitter sensor values realistically
      setSensors(prevSensors => {
        return prevSensors.map(sensor => {
          let jitter = 0;
          let newValue = sensor.value;

          if (emergencyTriggered) {
            if (sensor.type === 'pressure') {
              newValue = Math.max(0.2, Number((sensor.value * 0.92).toFixed(2)));
            } else if (sensor.type === 'flow') {
              newValue = Math.max(0, Number((sensor.value * 0.85).toFixed(1)));
            }
            return {
              ...sensor,
              value: newValue,
              status: sensor.value < 10 ? 'nominal' : sensor.status,
              lastUpdated: 'Just now'
            };
          }

          if (isV104Isolated) {
            if (sensor.sensorId === 'SEN-AC-05') {
              jitter = (Math.random() - 0.5) * 0.4;
              return {
                ...sensor,
                value: Number((12.4 + jitter).toFixed(1)),
                status: 'nominal',
                lastUpdated: 'Just now',
                trend: 'stable'
              };
            } else if (sensor.sensorId === 'SEN-FL-03') {
              return {
                ...sensor,
                value: 0.0,
                status: 'nominal',
                lastUpdated: 'Just now',
                trend: 'stable'
              };
            } else if (sensor.sensorId === 'SEN-PR-03') {
              return {
                ...sensor,
                value: 0.15,
                status: 'nominal',
                lastUpdated: 'Just now',
                trend: 'stable'
              };
            }
          }

          if (sensor.sensorId === 'SEN-AC-05') {
            // High leak noise jitter
            jitter = (Math.random() - 0.48) * 2.2;
            newValue = Math.min(68, Math.max(50, Number((sensor.value + jitter).toFixed(1))));
          } else if (sensor.sensorId === 'SEN-FL-03') {
            // Elevated leak flow
            jitter = (Math.random() - 0.5) * 4.0;
            newValue = Math.min(420, Math.max(380, Number((sensor.value + jitter).toFixed(1))));
          } else if (sensor.sensorId === 'SEN-PR-03') {
            // Depressed pressure
            jitter = (Math.random() - 0.5) * 0.12;
            newValue = Math.min(2.5, Math.max(1.9, Number((sensor.value + jitter).toFixed(2))));
          } else if (sensor.type === 'flow') {
            jitter = (Math.random() - 0.5) * 2.5;
            newValue = Math.max(0, Number((sensor.value + jitter).toFixed(1)));
          } else if (sensor.type === 'pressure') {
            jitter = (Math.random() - 0.5) * 0.05;
            newValue = Math.max(0, Number((sensor.value + jitter).toFixed(2)));
          } else if (sensor.type === 'acoustic') {
            jitter = (Math.random() - 0.5) * 0.8;
            newValue = Math.max(10, Number((sensor.value + jitter).toFixed(1)));
          } else if (sensor.type === 'vibration') {
            jitter = (Math.random() - 0.5) * 0.1;
            newValue = Math.max(0.2, Number((sensor.value + jitter).toFixed(2)));
          }

          return {
            ...sensor,
            value: newValue,
            lastUpdated: 'Just now',
            trend: jitter > 0.05 ? 'up' : jitter < -0.05 ? 'down' : 'stable'
          };
        });
      });

      // Update active leak metrics
      setTelemetry(prev => {
        const lossRate = isV104Isolated ? 0.0 : emergencyTriggered ? 45.0 : 342.4 + (Math.random() - 0.5) * 12.0;
        const loss24h = isV104Isolated ? 0 : emergencyTriggered ? 1080 : Math.round(lossRate * 24);
        const finBleed = isV104Isolated ? 0 : emergencyTriggered ? 3780 : Math.round(loss24h * 3.5);

        return {
          ...prev,
          timestamp: new Date().toISOString(),
          activeLeak: {
            ...prev.activeLeak,
            currentLossRateLph: Number(lossRate.toFixed(1)),
            projected24hLossLiters: loss24h,
            financialBleedInrPerDay: finBleed,
            isIsolated: isV104Isolated
          },
          systemStatus: {
            ...prev.systemStatus,
            uptimeSeconds: uptime,
            latencyMs: Math.floor(12 + Math.random() * 6)
          }
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isStreaming, emergencyTriggered, isV104Isolated, uptime]);

  const toggleStreaming = useCallback(() => {
    setIsStreaming(prev => !prev);
  }, []);

  const isolateLineB = useCallback((isolate: boolean = true) => {
    setIsV104Isolated(isolate);

    // 1. Update Digital Twin nodes
    setDigitalTwinNodes(prev => prev.map(node => {
      if (node.id === 'NODE-V104') {
        return {
          ...node,
          status: isolate ? 'closed' : 'nominal',
          valveOpenPercent: isolate ? 0 : 100,
          flowLpm: isolate ? 0 : 380
        };
      }
      if (node.id === 'NODE-SEG-S05') {
        return {
          ...node,
          status: isolate ? 'nominal' : 'critical',
          flowLpm: isolate ? 0 : 342.4,
          pressureBar: isolate ? 0.15 : 2.15,
          acousticKhz: isolate ? 12.0 : 38.4,
          healthIndex: isolate ? 98 : 42
        };
      }
      if (node.id === 'NODE-TERM-B') {
        return {
          ...node,
          status: isolate ? 'nominal' : 'warning',
          pressureBar: isolate ? 0.1 : 1.8
        };
      }
      return node;
    }));

    // 2. Update Sensors
    setSensors(prev => prev.map(s => {
      if (s.sensorId === 'SEN-AC-05') {
        return {
          ...s,
          value: isolate ? 12.4 : 58.4,
          status: isolate ? 'nominal' : 'critical',
          lastUpdated: 'Just now'
        };
      }
      if (s.sensorId === 'SEN-FL-03') {
        return {
          ...s,
          value: isolate ? 0.0 : 402.1,
          status: isolate ? 'nominal' : 'critical',
          lastUpdated: 'Just now'
        };
      }
      if (s.sensorId === 'SEN-PR-03') {
        return {
          ...s,
          value: isolate ? 0.15 : 2.15,
          status: isolate ? 'nominal' : 'critical',
          lastUpdated: 'Just now'
        };
      }
      return s;
    }));

    // 3. Update telemetry activeLeak & KPIs
    setTelemetry(prev => ({
      ...prev,
      activeLeak: {
        ...prev.activeLeak,
        currentLossRateLph: isolate ? 0.0 : 342.4,
        projected24hLossLiters: isolate ? 0 : 8217,
        financialBleedInrPerDay: isolate ? 0 : 28760,
        isIsolated: isolate
      }
    }));

    // 4. Update incident status
    setIncidents(prev => prev.map(inc => {
      if (inc.id === 'INC-8921') {
        return {
          ...inc,
          status: isolate ? 'Isolated' : 'Active',
          automatedActions: [
            ...inc.automatedActions,
            isolate 
              ? `[SCADA ${new Date().toLocaleTimeString()}] Solenoid Valve V-104 actuated to 0% aperture. Line B Segment S05 isolated. Loss halted to 0.0 L/hr.`
              : `[SCADA ${new Date().toLocaleTimeString()}] Solenoid Valve V-104 aperture restored to 100%. Flow recommenced.`
          ]
        };
      }
      return inc;
    }));

    // 5. Add notification with navigation target
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: isolate ? 'Valve V-104 Isolated (Breach Contained)' : 'Valve V-104 Re-Opened',
        message: isolate 
          ? 'Autonomous SCADA isolation commanded 0% aperture on V-104. Water loss on Line B halted to 0.0 L/hr. Line depressurized safely.'
          : 'Valve V-104 returned to 100% aperture. Line B pressure nominal.',
        type: isolate ? 'info' : 'warning',
        time: 'Just now',
        targetPage: 'digital-twin',
        targetNodeId: 'NODE-SEG-S05'
      },
      ...prev
    ]);
  }, []);

  const triggerEmergencyOverride = useCallback(() => {
    setEmergencyTriggered(true);
    // Update digital twin nodes to isolated
    setDigitalTwinNodes(prev => prev.map(node => {
      if (node.type === 'valve') {
        return { ...node, status: 'closed', valveOpenPercent: 0 };
      }
      if (node.id === 'NODE-PUMP-01') {
        return { ...node, status: 'warning', flowLpm: 150 };
      }
      return node;
    }));

    // Add alert notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'EMERGENCY OVERRIDE ENGAGED',
        message: 'Master plant isolation triggered. All automatic solenoid valves commanded to 0% aperture. SCADA dispatch dispatched.',
        type: 'critical',
        time: 'Just now',
        targetPage: 'command-center'
      },
      ...prev
    ]);
  }, []);

  const resetEmergencyOverride = useCallback(() => {
    setEmergencyTriggered(false);
    setDigitalTwinNodes(DIGITAL_TWIN_NODES);
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Emergency Override Cleared',
        message: 'System returned to standard supervisory control. Valves restored to programmed setpoints.',
        type: 'info',
        time: 'Just now',
        targetPage: 'command-center'
      },
      ...prev
    ]);
  }, []);

  const acknowledgeIncident = useCallback((id: string, notes?: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return {
          ...inc,
          acknowledged: true,
          status: 'Investigating',
          acknowledgedBy: 'Chief Control Operator (Station 01)',
          acknowledgedAt: new Date().toISOString(),
          automatedActions: [
            ...inc.automatedActions,
            `Operator acknowledged alert${notes ? `: "${notes}"` : ''} - Dispatch team standing by`
          ]
        };
      }
      return inc;
    }));

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: `Incident ${id} Acknowledged`,
        message: 'Operator logged acknowledgment. Maintenance cell assigned.',
        type: 'info',
        time: 'Just now',
        targetPage: 'incident-center',
        targetIncidentId: id
      },
      ...prev
    ]);
  }, []);

  const setLeakSimulationMode = useCallback(async (mode: LeakSimulationMode) => {
    setLeakSimulationModeState(mode);

    if (mode === 'resolved' || mode === 'none') {
      setIsV104Isolated(false);
      setIsPipelineAutoStopped(false);

      // 1. Return all sensors to nominal green and resume normal fluid flow!
      setSensors(prev => prev.map(s => {
        let val = s.value;
        if (s.sensorId === 'SEN-AC-05') val = 14.2;
        if (s.sensorId === 'SEN-PR-03') val = 4.35;
        if (s.sensorId === 'SEN-FL-03') val = 195.0; // Flow resumed!
        if (s.sensorId === 'SEN-AC-06') val = 12.0;
        return {
          ...s,
          value: val,
          status: 'nominal',
          trend: 'stable'
        };
      }));

      // 2. Return Digital Twin Nodes to nominal status
      setDigitalTwinNodes(prev => prev.map(node => {
        if (node.id === 'NODE-SEG-S05' || node.id === 'NODE-V104' || node.id === 'NODE-TERM-B') {
          return {
            ...node,
            status: 'nominal',
            valveOpenPercent: 100,
            flowLpm: 380.0,
            pressureBar: 4.4,
            acousticKhz: 12.0,
            healthIndex: 99
          };
        }
        return node;
      }));

      // 3. Reset Active Leak metrics
      setTelemetry(prev => ({
        ...prev,
        activeLeak: {
          ...prev.activeLeak,
          currentLossRateLph: 0.0,
          projected24hLossLiters: 0,
          financialBleedInrPerDay: 0,
          severity: 'Low',
          location: 'All pipelines nominal. Fluid flow operating at target setpoint.',
          isIsolated: false
        }
      }));

      // 4. Mark incidents resolved
      setIncidents(prev => prev.map(inc => ({
        ...inc,
        status: 'Resolved',
        severity: 'Low',
        leakRateLph: 0.0,
        automatedActions: [
          ...inc.automatedActions,
          `[SCADA ${new Date().toLocaleTimeString()}] Pipeline repair verified. All sensors returned to NOMINAL and fluid flow restarted.`
        ]
      })));

      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          title: '✓ Pipeline Repaired & Normal Flow Running',
          message: 'All sensor readings returned to nominal status. Fluid flow safely recommenced at 380 L/min.',
          type: 'info',
          time: 'Just now',
          targetPage: 'digital-twin'
        },
        ...prev
      ]);
    } else if (mode === 'warning_10') {
      setIsV104Isolated(false);
      setIsPipelineAutoStopped(false); // Pipeline continues running!

      setSensors(prev => prev.map(s => {
        if (s.sensorId === 'SEN-AC-05') return { ...s, value: 32.8, status: 'warning', trend: 'up' };
        if (s.sensorId === 'SEN-PR-03') return { ...s, value: 3.82, status: 'warning', trend: 'down' };
        if (s.sensorId === 'SEN-FL-03') return { ...s, value: 175.2, status: 'warning', trend: 'up' };
        return s;
      }));

      setTelemetry(prev => ({
        ...prev,
        activeLeak: {
          ...prev.activeLeak,
          currentLossRateLph: 48.2,
          projected24hLossLiters: 1156,
          financialBleedInrPerDay: 4040,
          severity: 'Warning',
          confidenceScore: 82.5,
          location: 'Line B, Segment S05 (10% Seepage Anomaly)',
          isIsolated: false
        }
      }));

      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          title: '⚠️ 10% Pipe Seepage Detected (Line B)',
          message: 'Minor hydraulic anomaly detected (+48.2 L/h). Advisory alert dispatched to technicians. Pipeline continues running.',
          type: 'warning',
          time: 'Just now',
          targetPage: 'digital-twin'
        },
        ...prev
      ]);
    } else if (mode === 'critical_blowout') {
      setIsPipelineAutoStopped(true); // SCADA Emergency Cutoff engages!

      setSensors(prev => prev.map(s => {
        if (s.sensorId === 'SEN-AC-05') return { ...s, value: 12.0, status: 'nominal' };
        if (s.sensorId === 'SEN-PR-03') return { ...s, value: 0.15, status: 'nominal' };
        if (s.sensorId === 'SEN-FL-03') return { ...s, value: 0.0, status: 'nominal' }; // Stopped!
        return s;
      }));

      setDigitalTwinNodes(prev => prev.map(node => {
        if (node.id === 'NODE-V104') {
          return { ...node, status: 'closed', valveOpenPercent: 0, flowLpm: 0 };
        }
        if (node.id === 'NODE-SEG-S05') {
          return { ...node, status: 'critical', flowLpm: 0, pressureBar: 0.15, healthIndex: 42 };
        }
        return node;
      }));

      setTelemetry(prev => ({
        ...prev,
        activeLeak: {
          ...prev.activeLeak,
          currentLossRateLph: 0.0,
          severity: 'Critical',
          confidenceScore: 94.8,
          location: 'Line B, Segment S05 - AUTO CUTOFF TRIPPED',
          isIsolated: true
        }
      }));

      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          title: '🛑 SCADA AUTOMATIC EMERGENCY CUTOFF ENGAGED',
          message: 'Leak exceeded 30% critical threshold. Safety interlock automatically halted the pipeline and tripped isolation valves to prevent catastrophic rupture.',
          type: 'critical',
          time: 'Just now',
          targetPage: 'digital-twin'
        },
        ...prev
      ]);
    }

    try {
      await fetch('/api/leak/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
    } catch {
      // Offline fallback state already set
    }
  }, []);

  const resolveIncident = useCallback((_id?: string) => {
    setLeakSimulationMode('resolved');
  }, [setLeakSimulationMode]);

  const toggleValveState = useCallback((nodeId: string, openPercent: number) => {
    if (nodeId === 'NODE-V104') {
      isolateLineB(openPercent === 0);
      return;
    }

    setDigitalTwinNodes(prev => prev.map(node => {
      if (node.id === nodeId) {
        const isClosed = openPercent === 0;
        return {
          ...node,
          valveOpenPercent: openPercent,
          status: isClosed ? 'closed' : openPercent < 50 ? 'warning' : 'nominal',
          flowLpm: Number((node.flowLpm * (openPercent / 100)).toFixed(1))
        };
      }
      return node;
    }));
  }, [isolateLineB]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const activeIncidents = incidents.filter(i => i.status === 'Active' || i.status === 'Investigating');

  const totalSensors = sensors.length;
  const nominalCount = sensors.filter(s => s.status === 'nominal').length;
  const warningCount = sensors.filter(s => s.status === 'warning').length;
  const criticalCount = sensors.filter(s => s.status === 'critical').length;
  const fleetHealthScore = totalSensors > 0
    ? Math.round(((nominalCount * 1.0 + warningCount * 0.6 + criticalCount * 0.2) / totalSensors) * 100)
    : 95;

  const systemHealth = {
    backend: 'online' as const,
    database: 'online' as const,
    mlEngine: 'online' as const,
    webSockets: isConnectedWs || isStreaming ? ('online' as const) : ('degraded' as const),
    latencyMs: latency,
    uptimeSeconds: uptime
  };

  return (
    <TelemetryContext.Provider
      value={{
        currentPlantId,
        currentPlant,
        plants: PLANTS_CATALOG,
        setCurrentPlantId,
        telemetry,
        sensors,
        incidents,
        activeIncidents,
        timeline,
        digitalTwinNodes,
        isStreaming,
        toggleStreaming,
        isConnectedWs,
        emergencyTriggered,
        triggerEmergencyOverride,
        resetEmergencyOverride,
        acknowledgeIncident,
        resolveIncident,
        toggleValveState,
        isV104Isolated,
        isolateLineB,
        selectedTwinNodeId,
        setSelectedTwinNodeId,
        leakSimulationMode,
        setLeakSimulationMode,
        isPipelineAutoStopped,
        fleetHealthScore,
        systemHealth,
        notifications,
        clearNotifications
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
};
