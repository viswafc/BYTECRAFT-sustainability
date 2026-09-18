import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "app")))

from ml.risk.inference import RiskEngine

def test_risk_gradual_leak():
    engine = RiskEngine()
    
    mock_telemetry = [
        {"sensor_id": "SENS-01", "event_type": "POSSIBLE_LEAK", "value": 1500, "expected_value_ai": 1000, "deviation_pct_ai": 0.5, "sensor_type": "flow"}
    ]
    
    mock_loc = {
        "event_id": "INC-01",
        "timestamp": "2024-01-01T12:00:00Z",
        "probable_node": "SENS-01",
        "localization_confidence": 0.9,
    }
    
    # Tick 1
    res1 = engine.process_localization(mock_loc, mock_telemetry)
    assert res1["severity"] == "CRITICAL"
    assert res1["water_at_risk_lph"] == 500.0
    assert res1["trend"] == "STABLE"
    assert res1["state"] == "CRITICAL_RISK"
    
def test_risk_sensor_fault():
    engine = RiskEngine()
    
    mock_telemetry = [
        {"sensor_id": "SENS-01", "event_type": "SENSOR_FAULT", "value": 1500, "expected_value_ai": 1000, "deviation_pct_ai": 0.5, "sensor_type": "flow"}
    ]
    
    mock_loc = {
        "event_id": "INC-01",
        "timestamp": "2024-01-01T12:00:00Z",
        "probable_node": "SENS-01",
        "localization_confidence": 0.5,
    }
    
    res = engine.process_localization(mock_loc, mock_telemetry)
    assert res["severity"] == "LOW"
    assert res["state"] == "NORMAL"
    assert "fault" in res["evidence"][0]
    
def test_risk_trend_escalation():
    engine = RiskEngine()
    
    # Simulate gradual increasing deviation
    devs = [0.10, 0.15, 0.20, 0.45]
    
    for dev in devs:
        mock_telemetry = [
            {"sensor_id": "SENS-01", "event_type": "POSSIBLE_LEAK", "value": 1000 * (1+dev), "expected_value_ai": 1000, "deviation_pct_ai": dev, "sensor_type": "flow"}
        ]
        
        mock_loc = {
            "event_id": "INC-01",
            "timestamp": "2024-01-01T12:00:00Z",
            "probable_node": "SENS-01",
            "localization_confidence": 0.9,
        }
        
        res = engine.process_localization(mock_loc, mock_telemetry)
        
    # After the 4th tick, deviation is 0.45 (massive), so it should jump to rapidly rising and critical
    assert res["trend"] in ["RISING", "RAPIDLY_RISING"]
    assert res["state"] == "CRITICAL_RISK"

if __name__ == "__main__":
    test_risk_gradual_leak()
    test_risk_sensor_fault()
    test_risk_trend_escalation()
    print("All Risk Engine tests passed!")
