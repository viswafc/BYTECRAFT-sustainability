import pytest
from backend.app.ml.baseline.inference import BaselineInferenceEngine
from backend.app.ml.intelligence.inference import IntelligenceEngine

def get_engines():
    ai_engine = BaselineInferenceEngine()
    if not ai_engine.initialized:
        ai_engine.initialize("backend/app/ml/baseline/models/baseline_v1.joblib")
        
    intel = IntelligenceEngine()
    if not intel.initialized:
        intel.initialize("backend/app/ml/intelligence/models/anomaly_detector_v1.joblib", "backend/app/ml/intelligence/models/event_classifier_v1.joblib")
    return ai_engine, intel

def test_production_surge_is_not_leak():
    ai, intel = get_engines()
    telemetry = [{
        "timestamp": "2026-09-18T10:05:00",
        "sensor_id": "SENS-P1-L-CA-FLO-1",
        "value": 5000.0,
        "production_level": 1.0, 
        "machine_status": "ACTIVE",
        "shift": "SHIFT_1",
        "rate_of_change": 10.0,
        "rolling_std_3": 5.0
    }]
    ai_tel = ai.process_telemetry(telemetry)
    res = intel.process_telemetry(ai_tel)[0]
    
    assert res['event_type'] in ["NORMAL_PRODUCTION_VARIATION", "NORMAL_OPERATION"]
    assert res['severity'] == "LOW"

def test_gradual_leak():
    ai, intel = get_engines()
    telemetry = [{
        "timestamp": "2026-09-18T10:10:00",
        "sensor_id": "SENS-P1-L-CA-FLO-1",
        "value": 7000.0, 
        "production_level": 0.8, 
        "machine_status": "ACTIVE",
        "shift": "SHIFT_1",
        "rate_of_change": 100.0,
        "rolling_std_3": 50.0
    }]
    ai_tel = ai.process_telemetry(telemetry)
    res = intel.process_telemetry(ai_tel)[0]
    
    assert "LEAK" in res['event_type']
    
def test_maintenance_is_not_leak():
    ai, intel = get_engines()
    telemetry = [{
        "timestamp": "2026-09-18T10:15:00",
        "sensor_id": "SENS-P1-L-CA-FLO-1",
        "value": 0.0, 
        "production_level": 0.0, 
        "machine_status": "MAINTENANCE",
        "shift": "SHIFT_1",
        "rate_of_change": -50.0,
        "rolling_std_3": 10.0
    }]
    ai_tel = ai.process_telemetry(telemetry)
    res = intel.process_telemetry(ai_tel)[0]
    
    assert res['event_type'] in ["MAINTENANCE_EVENT", "MULTI_EVENT"]
    assert res['severity'] in ["LOW", "MEDIUM"]

def test_evidence_structure():
    ai, intel = get_engines()
    telemetry = [{
        "timestamp": "2026-09-18T10:10:00",
        "sensor_id": "SENS-P1-L-CA-FLO-1",
        "value": 7000.0, 
        "production_level": 0.8, 
        "machine_status": "ACTIVE",
        "shift": "SHIFT_1",
        "rate_of_change": 100.0,
        "rolling_std_3": 50.0
    }]
    ai_tel = ai.process_telemetry(telemetry)
    res = intel.process_telemetry(ai_tel)[0]
    
    assert isinstance(res['evidence'], list)
    assert any(e['feature'] == 'flow_deviation_lph' and e['direction'] == 'high' for e in res['evidence'])
