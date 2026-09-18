"""Core entities for future phases. PostgreSQL-compatible, intentionally minimal.

Hierarchy:  plant -> zone -> line -> machine -> sensor -> sensor_reading
Ops:        incident (raised against a zone/line/machine/sensor)
ML:         ml_model -> model_run
"""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class Plant(TimestampMixin, Base):
    __tablename__ = "plants"
    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    zones: Mapped[list["Zone"]] = relationship(back_populates="plant")


class Zone(TimestampMixin, Base):
    __tablename__ = "zones"
    __table_args__ = (UniqueConstraint("plant_id", "code", name="uq_zone_plant_code"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    plant_id: Mapped[int] = mapped_column(ForeignKey("plants.id", ondelete="CASCADE"), nullable=False)
    code: Mapped[str] = mapped_column(String(64), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    plant: Mapped[Plant] = relationship(back_populates="zones")
    lines: Mapped[list["Line"]] = relationship(back_populates="zone")


class Line(TimestampMixin, Base):
    __tablename__ = "lines"
    __table_args__ = (UniqueConstraint("zone_id", "code", name="uq_line_zone_code"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    zone_id: Mapped[int] = mapped_column(ForeignKey("zones.id", ondelete="CASCADE"), nullable=False)
    code: Mapped[str] = mapped_column(String(64), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    zone: Mapped[Zone] = relationship(back_populates="lines")
    machines: Mapped[list["Machine"]] = relationship(back_populates="line")


class Machine(TimestampMixin, Base):
    __tablename__ = "machines"
    __table_args__ = (UniqueConstraint("line_id", "code", name="uq_machine_line_code"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    line_id: Mapped[int] = mapped_column(ForeignKey("lines.id", ondelete="CASCADE"), nullable=False)
    code: Mapped[str] = mapped_column(String(64), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    machine_type: Mapped[str | None] = mapped_column(String(64))
    line: Mapped[Line] = relationship(back_populates="machines")
    sensors: Mapped[list["Sensor"]] = relationship(back_populates="machine")


class Sensor(TimestampMixin, Base):
    __tablename__ = "sensors"
    id: Mapped[int] = mapped_column(primary_key=True)
    machine_id: Mapped[int | None] = mapped_column(ForeignKey("machines.id", ondelete="SET NULL"))
    zone_id: Mapped[int | None] = mapped_column(ForeignKey("zones.id", ondelete="SET NULL"))
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    sensor_type: Mapped[str] = mapped_column(String(32), nullable=False)  # pressure|flow|temperature|vibration|rpm|...
    unit: Mapped[str | None] = mapped_column(String(32))
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    machine: Mapped[Machine | None] = relationship(back_populates="sensors")


class SensorReading(Base):
    __tablename__ = "sensor_readings"
    __table_args__ = (Index("ix_sensor_readings_sensor_ts", "sensor_id", "ts"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sensor_id: Mapped[int] = mapped_column(ForeignKey("sensors.id", ondelete="CASCADE"), nullable=False)
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    quality: Mapped[str | None] = mapped_column(String(16))  # good|suspect|bad


class Incident(TimestampMixin, Base):
    __tablename__ = "incidents"
    id: Mapped[int] = mapped_column(primary_key=True)
    zone_id: Mapped[int | None] = mapped_column(ForeignKey("zones.id", ondelete="SET NULL"))
    line_id: Mapped[int | None] = mapped_column(ForeignKey("lines.id", ondelete="SET NULL"))
    machine_id: Mapped[int | None] = mapped_column(ForeignKey("machines.id", ondelete="SET NULL"))
    sensor_id: Mapped[int | None] = mapped_column(ForeignKey("sensors.id", ondelete="SET NULL"))
    incident_type: Mapped[str] = mapped_column(String(32), nullable=False)  # leak|anomaly|...
    severity: Mapped[str] = mapped_column(String(16), nullable=False)  # low|medium|high|critical
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="open")
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    summary: Mapped[str | None] = mapped_column(Text)
    details: Mapped[dict | None] = mapped_column(JSON)


class MLModel(TimestampMixin, Base):
    __tablename__ = "models"
    __table_args__ = (UniqueConstraint("name", "feature_config", "version", name="uq_model_name_cfg_version"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(64), nullable=False)
    feature_config: Mapped[str] = mapped_column(String(64), nullable=False)
    version: Mapped[str] = mapped_column(String(32), nullable=False)
    artifact_path: Mapped[str] = mapped_column(String(512), nullable=False)
    features: Mapped[list | None] = mapped_column(JSON)
    target: Mapped[str | None] = mapped_column(String(64))
    training_dataset: Mapped[str | None] = mapped_column(String(512))
    training_dataset_sha256: Mapped[str | None] = mapped_column(String(64))
    metrics: Mapped[dict | None] = mapped_column(JSON)
    trained_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    runs: Mapped[list["ModelRun"]] = relationship(back_populates="model")


class ModelRun(Base):
    __tablename__ = "model_runs"
    id: Mapped[int] = mapped_column(primary_key=True)
    model_id: Mapped[int] = mapped_column(ForeignKey("models.id", ondelete="CASCADE"), nullable=False)
    run_type: Mapped[str] = mapped_column(String(16), nullable=False)  # train|evaluate|predict
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="running")
    n_rows: Mapped[int | None] = mapped_column(Integer)
    metrics: Mapped[dict | None] = mapped_column(JSON)
    error: Mapped[str | None] = mapped_column(Text)
    model: Mapped[MLModel] = relationship(back_populates="runs")
