import json
import os
import random
import numpy as np
from datetime import datetime
from .production import ProductionModel

class SimulationEngine:
    def __init__(self, base_dir="."):
        self.base_dir = base_dir
        with open(os.path.join(base_dir, "simulator/config/plant.json"), "r") as f:
            self.plant_config = json.load(f)
            
        with open(os.path.join(base_dir, "simulator/config/scenarios.json"), "r") as f:
            self.scenarios = json.load(f)["scenarios"]
            
        self.production = ProductionModel(os.path.join(base_dir, "simulator/config/production_profiles.json"))
        
        # State tracking for events
        self.active_event = None
        self.event_start_time = None
        self.event_end_time = None
        
        self.sensor_defaults = self.plant_config.get("sensor_defaults", {})
        
    def _add_noise(self, value, variance_pct=0.02, spike_prob=0.001):
        if random.random() < spike_prob:
            return value * (1.0 + random.uniform(0.1, 0.5) * random.choice([1, -1]))
            
        noise = np.random.normal(0, variance_pct * value)
        return value + noise

    def generate_step(self, current_time: datetime, scenario_override=None):
        prod_state = self.production.get_production_state(current_time)
        prod_level = prod_state["level"]
        
        telemetry = []
        
        # Evaluate scenario
        current_scenario_key = scenario_override or "NORMAL_OPERATION"
        scenario = self.scenarios[current_scenario_key]
        
        for zone in self.plant_config["topology"]["zones"]:
            for line in zone["lines"]:
                for machine in line["machines"]:
                    
                    # Expected base metrics based on production
                    base_flow = machine["base_flow_lph"] * prod_level
                    base_pressure = machine["base_pressure_bar"] * (0.8 + 0.2 * prod_level) if prod_level > 0 else 0
                    
                    actual_flow = base_flow
                    actual_pressure = base_pressure
                    
                    # Apply scenario physics
                    # In a real engine, we'd route this through a physics solver.
                    if scenario["type"] == "surge":
                        actual_flow *= scenario["multiplier"]
                        prod_level *= scenario["multiplier"] # Reflect higher demand
                    elif scenario["type"] == "leak":
                        actual_flow *= (1 + scenario["flow_increase_pct"])
                        actual_pressure *= (1 - scenario["pressure_drop_pct"])
                    elif scenario["type"] == "leak_gradual":
                        # Simplistic gradual logic for one step (in reality this needs state across time)
                        actual_flow *= (1 + scenario["target_flow_increase_pct"] / 2)
                        actual_pressure *= (1 - scenario["target_pressure_drop_pct"] / 2)
                    elif scenario["type"] == "disturbance":
                        actual_pressure *= (1 - scenario["pressure_drop_pct"])
                    elif scenario["type"] == "maintenance":
                        actual_flow = 0
                        actual_pressure = 0
                        prod_level = 0
                        prod_state["status"] = "MAINTENANCE"
                        
                    for sensor in machine["sensors"]:
                        reading = 0
                        stype = sensor["type"]
                        
                        if stype == "flow":
                            reading = self._add_noise(actual_flow, self.sensor_defaults.get("noise_level_pct", 0.02))
                        elif stype == "pressure":
                            reading = self._add_noise(actual_pressure, self.sensor_defaults.get("noise_level_pct", 0.02))
                            
                        # Apply sensor faults
                        if scenario["type"] == "fault":
                            fault_type = random.choice(scenario["fault_types"])
                            if fault_type == "stuck":
                                # Would need state to stay stuck, just randomize wildly for this mock
                                reading = sensor["range"][1] * 0.99 
                            elif fault_type == "missing":
                                reading = None
                        
                        if reading is not None:
                            reading = max(0, reading) # No negative physical values in this setup
                            
                            telemetry.append({
                                "timestamp": current_time.isoformat(),
                                "plant_id": self.plant_config["plant_id"],
                                "zone_id": zone["zone_id"],
                                "line_id": line["line_id"],
                                "machine_id": machine["machine_id"],
                                "sensor_id": sensor["sensor_id"],
                                "sensor_type": stype,
                                "value": round(reading, 3),
                                "production_level": round(prod_level, 3),
                                "machine_status": prod_state["status"],
                                "shift": prod_state["shift"],
                                "expected_value": round(base_flow if stype == "flow" else base_pressure, 3),
                                "event_type": current_scenario_key,
                                "leakage_status": 1 if "LEAK" in current_scenario_key else 0
                            })
                            
        return telemetry
