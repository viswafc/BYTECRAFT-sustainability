# Synthetic Data Methodology

## Why Synthetic Data?
Industrial water telemetry from live networks is highly sensitive and often proprietary. The AquaRisk AI project relies on synthetic telemetry generation to provide a robust, repeatable, and scalable foundation for training the Leak Detection and Production Baseline intelligence modules.

## How the Simulator Works
1. **Network Configuration**: A plant topology configures relationships between nodes (Main Tank -> Cooling Line -> Pump -> Flow Sensor).
2. **Production Baseline**: The `ProductionModel` creates daily profiles representing factory shifts (e.g. Ramp-up, Idle, Peak). This base level directly governs the expected volumetric flow rate.
3. **Event Injection**: The Scenario engine injects one of 12 patterns (e.g., Gradual Leak, Production Surge).
4. **Sensor Faults**: Sensors may experience localized faults (noise spikes, drift) independent of hydraulic physics.

## Limitations
- **Simplified Physics**: We use static multipliers and simplistic pressure drops rather than a full Navier-Stokes hydraulic solver.
- **Independence**: Minor branching effects (pressure drop at node A affecting branch B) are simulated linearly.

Real plant data would seamlessly replace this synthetic data since both adhere to the same canonical `TELEMETRY_SCHEMA.md`.
