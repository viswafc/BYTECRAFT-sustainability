"""Core entities (Phase 2). PostgreSQL-compatible, intentionally minimal.

Hierarchy:  plant -> zone -> line -> machine -> sensor -> sensor_reading
Ops:        incident (raised against a plant, optionally pinned to zone/line/machine/sensor)
ML:         model_registry -> model_runs
"""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin

# Free-text status columns use these vocabularies (validated at the schema layer, not by DB enums,
# so future phases can extend them without a migration).
ASSET_STATUSES = ("active", "inactive", "maintenance", "decommissioned")
SENSOR_STATUSES = ("online", "offline", "degraded", "maintenance", "unknown")
INCIDENT_SEVERITIES = ("low", "medium", "high", "critical")
INCIDENT_STATUSES = ("open", "acknowledged", "investigating", "resolved", "closed")
MODEL_STATUSES = ("registered", "active", "deprecated", "failed")


class Plant(TimestampMixin, Base):
    __tablename__ = "plants"
    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str | None] = mapped_column(String(255))
    timezone: Mapped[str] = mapped_column(String(64), nullable=False, default="UTC")
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="active", index=True)
    zones: Mapped[list["Zone"]] = relationship(back_populates="plant", cascade="all, delete-orphan")
    incidents: Mapped[list["Incident"]] = relationship(back_populates="plant")


class Zone(TimestampMixin, Base):
    __tablename__ = "zones"
    __table_args__ = (UniqueConstraint("plant_id", "code", name="uq_zone_plant_code"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    plant_id: Mapped[int] = mapped_column(ForeignKey("plants.id", ondelete="CASCADE"), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(64), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="active", index=True)
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    plant: Mapped[Plant] = relationship(back_populates="zones")
    lines: Mapped[list["Line"]] = relationship(back_populates="zone", cascade="all, delete-orphan")


class Line(TimestampMixin, Base):
    __tablename__ = "lines"
    __table_args__ = (UniqueConstraint("zone_id", "code", name="uq_line_zone_code"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    zone_id: Mapped[int] = mapped_column(ForeignKey("zones.id", ondelete="CASCADE"), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(64), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    line_type: Mapped[str | None] = mapped_column(String(64))  # cooling|production|process_water|recovery|...
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="active", index=True)
    zone: Mapped[Zone] = relationship(back_populates="lines")
    machines: Mapped[list["Machine"]] = relationship(back_populates="line", cascade="all, delete-orphan")


class Machine(TimestampMixin, Base):
    __tablename__ = "machines"
    __table_args__ = (UniqueConstraint("line_id", "code", name="uq_machine_line_code"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    line_id: Mapped[int] = mapped_column(ForeignKey("lines.id", ondelete="CASCADE"), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(64), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    machine_type: Mapped[str | None] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="active", index=True)
    line: Mapped[Line] = relationship(back_populates="machines")
    sensors: Mapped[list["Sensor"]] = relationship(back_populates="machine", cascade="all, delete-orphan")


class Sensor(TimestampMixin, Base):
    __tablename__ = "sensors"
    id: Mapped[int] = mapped_column(primary_key=True)
    machine_id: Mapped[int] = mapped_column(ForeignKey("machines.id", ondelete="CASCADE"), nullable=False, index=True)
    sensor_code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    sensor_type: Mapped[str] = mapped_column(String(32), nullable=False, index=True)  # pressure|flow|temperature|vibration|rpm|level
    unit: Mapped[str | None] = mapped_column(String(32))
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="unknown", index=True)
    installed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    machine: Mapped[Machine] = relationship(back_populates="sensors")


class SensorReading(Base):
    __tablename__ = "sensor_readings"
    __table_args__ = (Index("ix_sensor_readings_sensor_ts", "sensor_id", "timestamp"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sensor_id: Mapped[int] = mapped_column(ForeignKey("sensors.id", ondelete="CASCADE"), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    quality: Mapped[str | None] = mapped_column(String(16))  # good|suspect|bad


class Incident(TimestampMixin, Base):
    __tablename__ = "incidents"
    __table_args__ = (Index("ix_incidents_plant_status", "plant_id", "status"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    plant_id: Mapped[int] = mapped_column(ForeignKey("plants.id", ondelete="CASCADE"), nullable=False, index=True)
    zone_id: Mapped[int | None] = mapped_column(ForeignKey("zones.id", ondelete="SET NULL"))
    line_id: Mapped[int | None] = mapped_column(ForeignKey("lines.id", ondelete="SET NULL"))
    machine_id: Mapped[int | None] = mapped_column(ForeignKey("machines.id", ondelete="SET NULL"))
    sensor_id: Mapped[int | None] = mapped_column(ForeignKey("sensors.id", ondelete="SET NULL"))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    incident_type: Mapped[str] = mapped_column(String(32), nullable=False)  # leak|anomaly|sensor_fault|...
    severity: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="open", index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    summary: Mapped[str | None] = mapped_column(Text)
    details: Mapped[dict | None] = mapped_column(JSON)
    plant: Mapped[Plant] = relationship(back_populates="incidents")


class ModelRegistryEntry(TimestampMixin, Base):
    __tablename__ = "model_registry"
    __table_args__ = (UniqueConstraint("name", "version", name="uq_model_name_version"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False, index=True)  # e.g. B_sensor_only/random_forest
    version: Mapped[str] = mapped_column(String(32), nullable=False)
    model_type: Mapped[str] = mapped_column(String(64), nullable=False)  # leak_classifier|baseline|risk|...
    path: Mapped[str] = mapped_column(String(512), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="registered", index=True)
    features: Mapped[list | None] = mapped_column(JSON)
    target: Mapped[str | None] = mapped_column(String(64))
    training_dataset: Mapped[str | None] = mapped_column(String(512))
    training_dataset_sha256: Mapped[str | None] = mapped_column(String(64))
    metrics: Mapped[dict | None] = mapped_column(JSON)
    trained_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    runs: Mapped[list["ModelRun"]] = relationship(back_populates="model", cascade="all, delete-orphan")


class ModelRun(Base):
    __tablename__ = "model_runs"
    id: Mapped[int] = mapped_column(primary_key=True)
    model_id: Mapped[int] = mapped_column(ForeignKey("model_registry.id", ondelete="CASCADE"), nullable=False, index=True)
    run_type: Mapped[str] = mapped_column(String(16), nullable=False)  # train|evaluate|predict
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="running")
    n_rows: Mapped[int | None] = mapped_column(Integer)
    metrics: Mapped[dict | None] = mapped_column(JSON)
    error: Mapped[str | None] = mapped_column(Text)
    model: Mapped[ModelRegistryEntry] = relationship(back_populates="runs")
