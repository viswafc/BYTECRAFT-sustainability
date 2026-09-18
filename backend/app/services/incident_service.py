from __future__ import annotations

from sqlalchemy.orm import Session

from ..core.errors import NotFoundError
from ..repositories import IncidentRepository
from ..schemas.incidents import IncidentResponse


class IncidentService:
    """Read-only in Phase 2. Detection/creation logic arrives with later phases."""

    def __init__(self, db: Session):
        self.repo = IncidentRepository(db)

    def list(self, limit, offset, **filters) -> list[IncidentResponse]:
        return [IncidentResponse.model_validate(i) for i in self.repo.list_filtered(limit=limit, offset=offset, **filters)]

    def get(self, incident_id: int) -> IncidentResponse:
        i = self.repo.get(incident_id)
        if not i:
            raise NotFoundError("Incident", incident_id)
        return IncidentResponse.model_validate(i)

    def count_active(self, plant_id: int | None = None) -> int:
        return self.repo.count_active(plant_id)
