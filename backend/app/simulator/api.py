from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
import time
import asyncio
from typing import Optional

# We use the simulation engine built earlier
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
from simulator.engine.core import SimulationEngine
from datetime import datetime, timedelta

sim_router = APIRouter()
engine = SimulationEngine()

class SimulatorRequest(BaseModel):
    scenario: str
    duration_minutes: int
    speed_multiplier: int = 1

simulator_state = {
    "is_running": False,
    "current_scenario": None,
    "started_at": None,
    "points_generated": 0
}

async def run_simulation(scenario: str, duration_minutes: int, speed: int):
    simulator_state["is_running"] = True
    simulator_state["current_scenario"] = scenario
    simulator_state["started_at"] = datetime.utcnow().isoformat()
    simulator_state["points_generated"] = 0
    
    current_sim_time = datetime.utcnow()
    
    # We will generate a point, sleep based on speed, repeat
    for _ in range(duration_minutes):
        if not simulator_state["is_running"]:
            break
            
        telemetry = engine.generate_step(current_sim_time, scenario)
        
        # Pass through Baseline Intelligence
        from backend.app.ml.baseline.inference import BaselineInferenceEngine
        from backend.app.ml.intelligence.inference import IntelligenceEngine
        
        ai_engine = BaselineInferenceEngine()
        if not ai_engine.initialized:
            ai_engine.initialize("backend/app/ml/baseline/models/baseline_v1.joblib")
            
        ai_telemetry = ai_engine.process_telemetry(telemetry)
        
        # Pass through Intelligence Engine
        intel_engine = IntelligenceEngine()
        if not intel_engine.initialized:
            intel_engine.initialize("backend/app/ml/intelligence/models/anomaly_detector_v1.joblib", "backend/app/ml/intelligence/models/event_classifier_v1.joblib")
            
        intel_events = intel_engine.process_telemetry(ai_telemetry)
        
        # Pass through Localization Engine
        from backend.app.network.localization import LocalizationEngine
        from backend.app.ml.risk.inference import RiskEngine
        from backend.app.ml.impact.inference import ImpactEngine
        from backend.app.ml.decision.inference import DecisionEngine
        loc_engine = LocalizationEngine(os.path.dirname(__file__))
        
        if "risk_engine" not in simulator_state:
            simulator_state["risk_engine"] = RiskEngine()
        if "impact_engine" not in simulator_state:
            simulator_state["impact_engine"] = ImpactEngine()
        if "decision_engine" not in simulator_state:
            simulator_state["decision_engine"] = DecisionEngine()
            
        risk_engine = simulator_state["risk_engine"]
        impact_engine = simulator_state["impact_engine"]
        decision_engine = simulator_state["decision_engine"]
        
        loc_results = []
        risk_results = []
        impact_results = []
        decision_results = []
        for ev in intel_events:
            # We only localize anomalies
            if ev["event_type"] not in ["NORMAL_OPERATION", "MAINTENANCE_EVENT", "NORMAL_PRODUCTION_VARIATION"]:
                res = loc_engine.localize_event(ev, ai_telemetry)
                if res:
                    loc_results.append(res)
                    simulator_state["last_localization"] = res
                    
                    # Pass into Risk Engine
                    risk = risk_engine.process_localization(res, ai_telemetry)
                    if risk:
                        risk_results.append(risk)
                        simulator_state["last_risk"] = risk
                        
                        # Pass into Impact Engine
                        impact = impact_engine.process_risk(risk)
                        if impact:
                            impact_results.append(impact)
                            simulator_state["last_impact"] = impact
                            
                            # Pass into Decision Engine
                            decision = decision_engine.process_impact(impact, risk, res)
                            if decision:
                                decision_results.append(decision)
        
        # Save to DB
        from backend.app.core.database import SessionLocal
        from backend.app.models.domain import BaselinePrediction, IntelligenceEvent, LocalizationResult, RiskSnapshot, WaterLossEvent, FinancialImpact, Recommendation
        db = SessionLocal()
        try:
            for t in ai_telemetry:
                if 'expected_value_ai' in t: # Only save if AI processed it
                    pred = BaselinePrediction(
                        sensor_id=t['sensor_id'],
                        timestamp=current_sim_time,
                        expected_flow_lph=t['expected_value_ai'],
                        actual_flow_lph=t['value'],
                        deviation_pct=t['deviation_pct_ai'],
                        confidence=t['baseline_confidence'],
                        persistence_score=t['persistence'],
                        baseline_state=t['baseline_context']
                    )
                    db.add(pred)
                    
            for ev in intel_events:
                intel_pred = IntelligenceEvent(
                    timestamp=ev['timestamp'],
                    sensor_id=ev['sensor_id'],
                    plant_id=ev['plant_id'],
                    event_type=ev['event_type'],
                    severity=ev['severity'],
                    confidence=ev['confidence'],
                    anomaly_score=ev['anomaly_score'],
                    evidence=ev['evidence'],
                    model_version=ev['model_version']
                )
                db.add(intel_pred)
                
            for lr in loc_results:
                loc_pred = LocalizationResult(
                    event_id=lr['event_id'],
                    timestamp=lr['timestamp'],
                    probable_node=lr['probable_node'],
                    probable_segment=lr['probable_segment'],
                    leak_confidence=lr['leak_confidence'],
                    localization_confidence=lr['localization_confidence'],
                    supporting_sensors=lr['supporting_sensors'],
                    evidence=lr['evidence'],
                    algorithm_version=lr['algorithm_version']
                )
                db.add(loc_pred)
                
            for rr in risk_results:
                risk_snap = RiskSnapshot(
                    event_id=rr['event_id'],
                    timestamp=rr['timestamp'],
                    risk_score=rr['risk_score'],
                    severity=rr['severity'],
                    trend=rr['trend'],
                    state=rr['state'],
                    water_at_risk_lph=rr['water_at_risk_lph'],
                    forecast=rr['forecast'],
                    evidence=rr['evidence']
                )
                db.add(risk_snap)
                
            for ir in impact_results:
                loss_ev = WaterLossEvent(
                    event_id=ir['event_id'],
                    start_time=ir['timestamp'],
                    duration_minutes=ir['duration_minutes'],
                    estimated_volume_m3=ir['cumulative_loss_m3'],
                    status=ir['status']
                )
                db.add(loss_ev)
                
            for dr in decision_results:
                rec = Recommendation(
                    event_id=dr['event_id'],
                    action_type=dr['action_type'],
                    title=dr['title'],
                    priority=dr['priority'],
                    urgency=dr['urgency'],
                    confidence=dr['confidence'],
                    reason=dr['reason'],
                    evidence=dr['evidence'],
                    expected_benefit=dr['expected_benefit'],
                    status=dr['status']
                )
                db.add(rec)
                
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"Error saving intelligence predictions: {e}")
        finally:
            db.close()

        simulator_state["points_generated"] += len(telemetry)
        sleep_time = 60.0 / float(speed)
        await asyncio.sleep(min(sleep_time, 2.0)) # Don't sleep more than 2s for UI responsiveness
        current_sim_time += timedelta(minutes=1)
        
    simulator_state["is_running"] = False

@sim_router.post("/start")
def start_simulator(req: SimulatorRequest, background_tasks: BackgroundTasks):
    if simulator_state["is_running"]:
        return {"status": "error", "message": "Simulator is already running."}
        
    background_tasks.add_task(run_simulation, req.scenario, req.duration_minutes, req.speed_multiplier)
    return {"status": "success", "message": "Simulator started."}

@sim_router.post("/stop")
def stop_simulator():
    simulator_state["is_running"] = False
    return {"status": "success", "message": "Simulator stopping."}

@sim_router.get("/status")
def get_status():
    return simulator_state
