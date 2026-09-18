from __future__ import annotations

from fastapi import APIRouter, Depends

from ...schemas import Envelope, IncidentResponse, ok, ok_list
from ...services.incident_service import IncidentService
from ..deps import Pagination, get_incident_service

router = APIRouter(prefix="/incidents", tags=["incidents"])


@router.get("", response_model=Envelope[list[IncidentResponse]])
def list_incidents(p: Pagination = Depends(), plant_id: int | None = None, status: str | None = None,
                   severity: str | None = None, active_only: bool = False,
                   svc: IncidentService = Depends(get_incident_service)):
    return ok_list(svc.list(p.limit, p.offset, plant_id=plant_id, status=status, severity=severity,
                            active_only=active_only), limit=p.limit, offset=p.offset)


@router.get("/{incident_id}", response_model=Envelope[IncidentResponse])
def get_incident(incident_id: int, svc: IncidentService = Depends(get_incident_service)):
    return ok(svc.get(incident_id))
