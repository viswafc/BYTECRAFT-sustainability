import pytest
import pandas as pd
from backend.app.ml.baseline.inference import BaselineInferenceEngine

def get_engine():
    engine = BaselineInferenceEngine()
    if not engine.initialized:
        engine.initialize("backend/app/ml/baseline/models/baseline_v1.joblib")
    return engine

def test_production_surge():
    engine = get_engine()
    
    # 1. Normal
    normal_telemetry = [{
        "timestamp": "2026-09-18T10:00:00",
        "sensor_id": "SENS-P1-L-CA-FLO-1",
        "value": 4000.0,
        "production_level": 0.8,
        "machine_status": "ACTIVE",
        "shift": "SHIFT_1",
    }]
    
    # 2. Surge
    surge_telemetry = [{
        "timestamp": "2026-09-18T10:05:00",
        "sensor_id": "SENS-P1-L-CA-FLO-1",
        "value": 5000.0,
        "production_level": 1.0, # SURGE
        "machine_status": "ACTIVE",
        "shift": "SHIFT_1",
    }]
    
    res1 = engine.process_telemetry(normal_telemetry)[0]
    res2 = engine.process_telemetry(surge_telemetry)[0]
    
    assert res1['baseline_context'] == "BASELINE_NORMAL"
    # Even though flow jumped 25%, production jumped 25%, so it should not trigger UNEXPLAINED_DEVIATION
    assert res2['baseline_context'] in ["BASELINE_NORMAL", "BASELINE_PRODUCTION_CHANGE"]

def test_leak():
    engine = get_engine()
    
    # Leak (Production stable at 80%, but flow jumped massively to 7000!)
    leak_telemetry = [{
        "timestamp": "2026-09-18T10:10:00",
        "sensor_id": "SENS-P1-L-CA-FLO-1",
        "value": 7000.0, 
        "production_level": 0.8, 
        "machine_status": "ACTIVE",
        "shift": "SHIFT_1",
    }]
    
    res = engine.process_telemetry(leak_telemetry)[0]
    
    # Flow is 7000 but expected is ~4000. Massive unexplained deviation.
    assert "UNEXPLAINED_DEVIATION" in res['baseline_context']
    
def test_maintenance():
    engine = get_engine()
    
    maint_telemetry = [{
        "timestamp": "2026-09-18T12:10:00",
        "sensor_id": "SENS-P1-L-CA-FLO-1",
        "value": 0.0, 
        "production_level": 0.0, 
        "machine_status": "MAINTENANCE",
        "shift": "SHIFT_1",
    }]
    
    res = engine.process_telemetry(maint_telemetry)[0]
    assert res['baseline_context'] in ["BASELINE_MAINTENANCE", "BASELINE_LOW_CONFIDENCE"]
