import sys
import os
from datetime import datetime, timedelta

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from simulator.engine.core import SimulationEngine

def run_acceptance_test():
    engine = SimulationEngine()
    
    current_time = datetime.utcnow()
    print("--- SCENARIO 1: NORMAL PRODUCTION SURGE ---")
    telemetry = engine.generate_step(current_time, "NORMAL_PRODUCTION_VARIATION")
    for t in telemetry:
        if t["sensor_type"] == "flow":
            print(f"[{t['event_type']}] Actual Flow: {t['value']}, Expected: {t['expected_value']}, Leak Label: {t['leakage_status']}")
            assert t["leakage_status"] == 0
            
    print("\n--- SCENARIO 2: GRADUAL LEAK ---")
    telemetry = engine.generate_step(current_time, "GRADUAL_LEAK")
    for t in telemetry:
        if t["sensor_type"] == "flow":
            print(f"[{t['event_type']}] Actual Flow: {t['value']}, Expected: {t['expected_value']}, Leak Label: {t['leakage_status']}")
            assert t["leakage_status"] == 1
            
    print("\n--- SCENARIO 3: SENSOR FAULT ---")
    telemetry = engine.generate_step(current_time, "SENSOR_FAULT")
    for t in telemetry:
        if t["sensor_type"] == "flow":
            print(f"[{t['event_type']}] Actual Flow: {t['value']}, Expected: {t['expected_value']}, Leak Label: {t['leakage_status']}")
            assert t["leakage_status"] == 0
            
    print("\nACCEPTANCE TEST PASSED!")
    
if __name__ == "__main__":
    run_acceptance_test()
