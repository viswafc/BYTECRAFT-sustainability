from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class Plant(Base):
    __tablename__ = "plants"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    code = Column(String, unique=True, index=True)
    location = Column(String)
    timezone = Column(String, default="UTC")
    status = Column(String, default="active", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    zones = relationship("Zone", back_populates="plant")

class Zone(Base):
    __tablename__ = "zones"
    id = Column(Integer, primary_key=True, index=True)
    plant_id = Column(Integer, ForeignKey("plants.id"), index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True)
    status = Column(String, default="active")

    plant = relationship("Plant", back_populates="zones")
    lines = relationship("Line", back_populates="zone")

class Line(Base):
    __tablename__ = "lines"
    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True)
    status = Column(String, default="active")

    zone = relationship("Zone", back_populates="lines")
    machines = relationship("Machine", back_populates="line")

class Machine(Base):
    __tablename__ = "machines"
    id = Column(Integer, primary_key=True, index=True)
    line_id = Column(Integer, ForeignKey("lines.id"), index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True)
    machine_type = Column(String)
    status = Column(String, default="active")

    line = relationship("Line", back_populates="machines")
    sensors = relationship("Sensor", back_populates="machine")

class Sensor(Base):
    __tablename__ = "sensors"
    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id"), index=True)
    sensor_code = Column(String, unique=True, index=True)
    sensor_type = Column(String) # pressure, flow, vibration
    unit = Column(String)
    status = Column(String, default="active", index=True)
    installed_at = Column(DateTime(timezone=True), server_default=func.now())

    machine = relationship("Machine", back_populates="sensors")
    readings = relationship("SensorReading", back_populates="sensor")

class SensorReading(Base):
    __tablename__ = "sensor_readings"
    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(Integer, ForeignKey("sensors.id"), index=True)
    timestamp = Column(DateTime(timezone=True), default=func.now(), index=True)
    value = Column(Float, nullable=False)
    quality = Column(String, default="good")

    sensor = relationship("Sensor", back_populates="readings")

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    plant_id = Column(Integer, ForeignKey("plants.id"), index=True)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False) # e.g. leak, pressure_drop
    severity = Column(String) # critical, high, medium, low
    status = Column(String, default="open", index=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)

class ModelRegistry(Base):
    __tablename__ = "model_registry"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    type = Column(String)
    path = Column(String, nullable=False)
    status = Column(String, default="active")
    metrics = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class BaselinePrediction(Base):
    __tablename__ = "baseline_predictions"
    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String, index=True)
    timestamp = Column(DateTime, index=True)
    expected_flow_lph = Column(Float)
    actual_flow_lph = Column(Float)
    deviation_pct = Column(Float)
    confidence = Column(String)
    persistence_score = Column(String)
    baseline_state = Column(String)
    model_version = Column(String, default="v1")
    created_at = Column(DateTime, default=func.now())

class IntelligenceEvent(Base):
    __tablename__ = "intelligence_events"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, index=True)
    sensor_id = Column(String, index=True)
    plant_id = Column(String, index=True)
    event_type = Column(String, index=True)
    severity = Column(String, index=True)
    confidence = Column(Float)
    anomaly_score = Column(Float)
    evidence = Column(JSON)
    model_version = Column(String)
    created_at = Column(DateTime, default=func.now())

class LocalizationResult(Base):
    __tablename__ = "localization_results"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, index=True) # References IntelligenceEvent somehow, or arbitrary string
    timestamp = Column(DateTime, index=True)
    probable_node = Column(String, index=True)
    probable_segment = Column(String, index=True)
    leak_confidence = Column(Float)
    localization_confidence = Column(Float)
    supporting_sensors = Column(JSON)
    evidence = Column(JSON)
    algorithm_version = Column(String)
    created_at = Column(DateTime, default=func.now())

class RiskSnapshot(Base):
    __tablename__ = "risk_snapshots"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, index=True) 
    timestamp = Column(DateTime, index=True)
    risk_score = Column(Float)
    severity = Column(String)
    trend = Column(String)
    state = Column(String)
    water_at_risk_lph = Column(Float)
    forecast = Column(JSON)
    evidence = Column(JSON)
    created_at = Column(DateTime, default=func.now())

class CostProfile(Base):
    __tablename__ = "cost_profiles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    raw_water_cost = Column(Float)
    treatment_cost = Column(Float)
    wastewater_cost = Column(Float)
    energy_cost = Column(Float)
    operational_cost = Column(Float)
    currency = Column(String, default="INR")
    active = Column(Integer, default=1)

class WaterLossEvent(Base):
    __tablename__ = "water_loss_events"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, index=True)
    sensor_id = Column(String, index=True)
    event_type = Column(String)
    start_time = Column(DateTime)
    detection_time = Column(DateTime)
    intervention_time = Column(DateTime, nullable=True)
    recovery_time = Column(DateTime, nullable=True)
    duration_minutes = Column(Float)
    average_excess_flow_lph = Column(Float)
    peak_excess_flow_lph = Column(Float)
    estimated_volume_m3 = Column(Float)
    confidence = Column(Float)
    status = Column(String) # ACTIVE, RESOLVED
    created_at = Column(DateTime, default=func.now())

class FinancialImpact(Base):
    __tablename__ = "financial_impacts"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, index=True)
    water_cost = Column(Float)
    treatment_cost = Column(Float)
    energy_cost = Column(Float)
    wastewater_cost = Column(Float)
    total_cost = Column(Float)
    currency = Column(String)
    cost_basis = Column(JSON)
    calculated_at = Column(DateTime, default=func.now())

class CostOfWaitingSnapshot(Base):
    __tablename__ = "cost_of_waiting"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, index=True)
    timestamp = Column(DateTime, index=True)
    projection_10m_cost = Column(Float)
    projection_30m_cost = Column(Float)
    projection_1h_cost = Column(Float)
    projection_6h_cost = Column(Float)
    projection_24h_cost = Column(Float)
    projection_10m_vol = Column(Float)
    projection_30m_vol = Column(Float)
    projection_1h_vol = Column(Float)
    projection_6h_vol = Column(Float)
    projection_24h_vol = Column(Float)
    created_at = Column(DateTime, default=func.now())

class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, index=True)
    action_type = Column(String) # VERIFY, INVESTIGATE, ISOLATE, ESCALATE, MONITOR
    title = Column(String)
    priority = Column(String) # P0, P1, P2, P3, P4
    urgency = Column(String) # NOW, WITHIN_15_MIN, etc.
    confidence = Column(Float)
    reason = Column(String)
    evidence = Column(JSON)
    expected_benefit = Column(JSON)
    status = Column(String) # NEW, ACKNOWLEDGED, COMPLETED, DISMISSED
    created_at = Column(DateTime, default=func.now())
    acknowledged_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

class DecisionAuditLog(Base):
    __tablename__ = "decision_audit_log"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, index=True)
    decision_context = Column(JSON)
    candidate_actions = Column(JSON)
    selected_action = Column(String)
    timestamp = Column(DateTime, default=func.now())
