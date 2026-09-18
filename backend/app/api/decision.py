from fastapi import APIRouter
import os

router = APIRouter()

@router.get("/api/decisions/current")
def get_current_decision():
    from backend.app.simulator.api import simulator_state
    if "decision_engine" in simulator_state:
        return simulator_state["decision_engine"].get_current()
    return None

@router.post("/api/decisions/events/{event_id}/{status}")
def update_decision_status(event_id: str, status: str):
    from backend.app.simulator.api import simulator_state
    if "decision_engine" in simulator_state:
        success = simulator_state["decision_engine"].set_status(event_id, status.upper())
        return {"success": success, "status": status.upper()}
    return {"success": False}

@router.post("/api/simulator/intervene")
def simulate_intervention():
    """
    Hackathon hook to allow the UI to manually 'fix' the leak in the simulator, 
    driving deviation to 0 to trigger the RESOLVED state in the pipeline.
    """
    from backend.app.simulator.api import simulator_state
    
    # In a real environment, we'd send a command to SCADA. 
    # Here, we set a flag in the simulator state that tells the mock generator to kill the anomaly.
    simulator_state["force_intervention"] = True
    return {"success": True, "message": "Intervention triggered. Flow normalizing."}
