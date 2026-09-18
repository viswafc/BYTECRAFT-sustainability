from fastapi import FastAPI, Depends
from pydantic import BaseModel
import asyncio
import json
import sys
import os
from sqlalchemy.orm import Session
from sqlalchemy import text
from .core.database import get_db

# To ensure ml can be imported if needed
sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from .config import settings
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import router as api_router
from .api.network import router as network_router
from .api.risk import router as risk_router
from .api.impact import router as impact_router
from .api.decision import router as decision_router
from .api.copilot import router as copilot_router

app = FastAPI(
    title="AquaRisk AI API",
    description="Backend API for Predictive Water Loss Engine",
    version=settings.VERSION
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")
from .websocket.routes import ws_router
app.include_router(ws_router, prefix="/api")
from .simulator.api import sim_router
app.include_router(sim_router, prefix="/api/simulator")
from .api.baseline import baseline_router
app.include_router(baseline_router, prefix="/api/baseline")
from .api.intelligence import intel_router
app.include_router(intel_router, prefix="/api/intelligence")

class StatusResponse(BaseModel):
    status: str
    version: str

@app.get("/health", response_model=StatusResponse)
def health_check():
    return {"status": "healthy", "version": settings.VERSION}

@app.get("/api/version")
def get_version():
    return {"version": settings.VERSION}

from .ml.service import ml_service

@app.get("/api/system/status")
async def system_status(db: Session = Depends(get_db)):
    try:
        # Test MySQL connection
        db.execute(text("SELECT 1"))
        db_status = "ONLINE"
    except Exception as e:
        print(f"Database error: {e}")
        db_status = "OFFLINE"
        
    return {
        "status": "online",
        "Backend": "ONLINE",
        "Database": db_status,
        "ML": "READY",
        "WebSocket": "READY"
    }
