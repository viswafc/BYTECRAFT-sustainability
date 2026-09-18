from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..models.domain import BaselinePrediction
from ..schemas.baseline import BaselinePredictionResponse

baseline_router = APIRouter()

@baseline_router.get("/current", response_model=List[BaselinePredictionResponse])
def get_current_baseline(db: Session = Depends(get_db)):
    """Returns the most recent baseline prediction for all active sensors."""
    # Group by sensor_id and get the latest. For SQLite/FastAPI simplicity we fetch the last 100 
    # and sort them out in code, or just fetch all recent ones.
    # In Postgres we'd use DISTINCT ON.
    recent = db.query(BaselinePrediction).order_by(BaselinePrediction.timestamp.desc()).limit(20).all()
    
    seen = set()
    result = []
    for r in recent:
        if r.sensor_id not in seen:
            seen.add(r.sensor_id)
            result.append(r)
            
    return result

@baseline_router.get("/sensor/{sensor_id}", response_model=List[BaselinePredictionResponse])
def get_sensor_history(sensor_id: str, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(BaselinePrediction).filter(BaselinePrediction.sensor_id == sensor_id).order_by(BaselinePrediction.timestamp.desc()).limit(limit).all()
