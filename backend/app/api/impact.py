from fastapi import APIRouter
import os

router = APIRouter()

@router.get("/api/impact/current")
def get_current_impact():
    from backend.app.simulator.api import simulator_state
    if "last_impact" in simulator_state:
        return simulator_state["last_impact"]
    return None
