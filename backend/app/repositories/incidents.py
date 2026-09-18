from __future__ import annotations

from sqlalchemy import select

from ..models import Incident
from .base import Repository

ACTIVE = ("open", "acknowledged", "investigating")


class IncidentRepository(Repository[Incident]):
    model = Incident

    def list_filtered(self, *, plant_id: int | None = None, status: str | None = None,
                      severity: str | None = None, active_only: bool = False,
                      limit: int = 100, offset: int = 0) -> list[Incident]:
        stmt = select(Incident)
        if plant_id is not None:
            stmt = stmt.where(Incident.plant_id == plant_id)
        if status:
            stmt = stmt.where(Incident.status == status)
        if severity:
            stmt = stmt.where(Incident.severity == severity)
        if active_only:
            stmt = stmt.where(Incident.status.in_(ACTIVE))
        return list(self.db.scalars(stmt.order_by(Incident.started_at.desc()).limit(limit).offset(offset)))

    def count_active(self, plant_id: int | None = None) -> int:
        from sqlalchemy import func
        stmt = select(func.count()).select_from(Incident).where(Incident.status.in_(ACTIVE))
        if plant_id is not None:
            stmt = stmt.where(Incident.plant_id == plant_id)
        return int(self.db.scalar(stmt) or 0)
