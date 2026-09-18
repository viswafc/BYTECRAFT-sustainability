import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "app")))

from ml.decision.inference import DecisionEngine

def test_decision_engine():
    engine = DecisionEngine()
    
    # 1. Critical Leak Scenario
    impact_snapshot_1 = {
        "event_id": "INC-01",
        "status": "ACTIVE",
        "financial_impact": {"total_cost": 5000},
        "cost_of_waiting": {"1h": {"volume_m3": 10.0}}
    }
    risk_snapshot_1 = {
        "state": "CRITICAL_RISK",
        "trend": "RAPIDLY_RISING"
    }
    loc_result_1 = {
        "event_type": "MAJOR_LEAK",
        "confidence": 0.95,
        "probable_segment": "P-104",
        "sensor": "S-01"
    }
    
    dec1 = engine.process_impact(impact_snapshot_1, risk_snapshot_1, loc_result_1)
    
    assert dec1["priority"] == "P0"
    assert dec1["urgency"] == "NOW"
    assert dec1["action_type"] == "ISOLATE"
    
    # 2. Sensor Fault Scenario
    impact_snapshot_2 = {
        "event_id": "INC-02",
        "status": "ACTIVE",
        "financial_impact": {"total_cost": 0},
        "cost_of_waiting": {"1h": {"volume_m3": 0.0}}
    }
    risk_snapshot_2 = {
        "state": "NORMAL",
        "trend": "STABLE"
    }
    loc_result_2 = {
        "event_type": "SENSOR_FAULT",
        "confidence": 0.20,
        "probable_segment": "Unknown",
        "sensor": "S-02"
    }
    
    dec2 = engine.process_impact(impact_snapshot_2, risk_snapshot_2, loc_result_2)
    
    assert dec2["priority"] == "P4"
    assert dec2["urgency"] == "MONITOR"
    assert dec2["action_type"] == "VERIFY"
    
if __name__ == "__main__":
    test_decision_engine()
    print("All Decision Engine tests passed!")
