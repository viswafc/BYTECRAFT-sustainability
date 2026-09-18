"""Generic repository. Services depend on these, never on raw sessions."""
from __future__ import annotations

from typing import Generic, TypeVar

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models.base import Base

T = TypeVar("T", bound=Base)


class Repository(Generic[T]):
    model: type[T]

    def __init__(self, db: Session):
        self.db = db

    def get(self, id_: int) -> T | None:
        return self.db.get(self.model, id_)

    def list(self, *, limit: int = 100, offset: int = 0, **filters) -> list[T]:
        stmt = select(self.model)
        for k, v in filters.items():
            if v is not None:
                stmt = stmt.where(getattr(self.model, k) == v)
        stmt = stmt.order_by(self.model.id).limit(limit).offset(offset)
        return list(self.db.scalars(stmt))

    def count(self, **filters) -> int:
        stmt = select(func.count()).select_from(self.model)
        for k, v in filters.items():
            if v is not None:
                stmt = stmt.where(getattr(self.model, k) == v)
        return int(self.db.scalar(stmt) or 0)

    def add(self, obj: T) -> T:
        self.db.add(obj)
        self.db.flush()
        return obj
