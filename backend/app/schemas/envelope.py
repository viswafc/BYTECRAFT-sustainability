"""Uniform response envelope: {"data": ..., "meta": {"timestamp", "version", ...}}"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

from ..core.config import APP_VERSION

T = TypeVar("T")


class Meta(BaseModel):
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    version: str = APP_VERSION
    count: int | None = None
    limit: int | None = None
    offset: int | None = None
    source: str | None = None  # telemetry provider name etc.


class Envelope(BaseModel, Generic[T]):
    data: T
    meta: Meta = Field(default_factory=Meta)


def ok(data: Any, **meta) -> dict:
    """Build an envelope dict (used with response_model=Envelope[...])."""
    return {"data": data, "meta": Meta(**meta)}


def ok_list(items: list, *, limit: int | None = None, offset: int | None = None, **meta) -> dict:
    return {"data": items, "meta": Meta(count=len(items), limit=limit, offset=offset, **meta)}
