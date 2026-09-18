import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "app")))

from ml.impact.inference import ImpactEngine

def test_impact_accumulation_and_resolution():
    engine = ImpactEngine()
    
    # Tick 1: Event starts (Risk Score high)
    risk_tick_1 = {
        "event_id": "INC-01",
        "timestamp": "2024-01-01T12:00:00Z",
        "state": "CRITICAL_RISK",
        "trend": "RAPIDLY_RISING",
        "water_at_risk_lph": 600.0 # 600 L/h = 10 L/min
    }
    
    impact1 = engine.process_risk(risk_tick_1)
    assert impact1["status"] == "ACTIVE"
    assert impact1["cumulative_loss_m3"] == 0.01 # 10 L = 0.01 m3 for 1 min tick
    assert impact1["financial_impact"]["total_cost"] > 0
    assert "24h" in impact1["cost_of_waiting"]
    
    # Tick 2: Continues
    risk_tick_2 = {
        "event_id": "INC-01",
        "timestamp": "2024-01-01T12:01:00Z",
        "state": "CRITICAL_RISK",
        "trend": "STABLE",
        "water_at_risk_lph": 600.0
    }
    
    impact2 = engine.process_risk(risk_tick_2)
    assert impact2["status"] == "ACTIVE"
    assert impact2["cumulative_loss_m3"] == 0.02 # 0.01 + 0.01
    
    # Tick 3: RESOLVED (Operator intervenes, flow drops to normal, baseline deviation drops to 0, risk state drops)
    risk_tick_3 = {
        "event_id": "INC-01",
        "timestamp": "2024-01-01T12:02:00Z",
        "state": "NORMAL",
        "trend": "FALLING",
        "water_at_risk_lph": 0.0
    }
    
    impact3 = engine.process_risk(risk_tick_3)
    assert impact3["status"] == "RESOLVED"
    
    # The avoided volume should be calculated based on the peak flow (600 L/h) * 6 hours (360 mins)
    # 600 L/h = 10 L/min * 360 = 3600 L = 3.6 m3
    assert impact3["avoided_loss_m3"] == 3.6
    assert impact3["avoided_loss_cost"] > 0

if __name__ == "__main__":
    test_impact_accumulation_and_resolution()
    print("All Impact Engine tests passed!")
