from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..models.domain import IntelligenceEvent
from ..schemas.intelligence import IntelligenceEventResponse

intel_router = APIRouter()

@intel_router.get("/current", response_model=List[IntelligenceEventResponse])
def get_current_intelligence(limit: int = 50, db: Session = Depends(get_db)):
    """Returns the most recent intelligence events."""
    recent = db.query(IntelligenceEvent).order_by(IntelligenceEvent.timestamp.desc()).limit(limit).all()
    return recent
