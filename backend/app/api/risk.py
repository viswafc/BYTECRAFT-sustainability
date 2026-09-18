from fastapi import APIRouter
import os

router = APIRouter()

@router.get("/api/risk/current")
def get_current_risk():
    from backend.app.simulator.api import simulator_state
    if "last_risk" in simulator_state:
        return simulator_state["last_risk"]
    return None
