"""Shared FastAPI dependencies."""
from __future__ import annotations

from fastapi import Depends, Query
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..services.asset_service import AssetService
from ..services.incident_service import IncidentService


class Pagination:
    def __init__(self, limit: int = Query(100, ge=1, le=1000), offset: int = Query(0, ge=0)):
        self.limit = limit
        self.offset = offset


def get_asset_service(db: Session = Depends(get_db)) -> AssetService:
    return AssetService(db)


def get_incident_service(db: Session = Depends(get_db)) -> IncidentService:
    return IncidentService(db)
