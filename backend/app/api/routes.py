from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..models.domain import Plant, Zone, Line, Machine, Sensor
from ..schemas.responses import (
    PlantResponse, ZoneResponse, LineResponse, MachineResponse, SensorResponse,
    BaseResponse, Meta
)

router = APIRouter()

@router.get("/plants", response_model=BaseResponse)
def get_plants(db: Session = Depends(get_db)):
    plants = db.query(Plant).all()
    # Serialize manually or rely on Pydantic's from_attributes
    data = [PlantResponse.model_validate(p).model_dump() for p in plants]
    return BaseResponse(data=data, meta=Meta())

@router.get("/zones", response_model=BaseResponse)
def get_zones(db: Session = Depends(get_db)):
    zones = db.query(Zone).all()
    data = [ZoneResponse.model_validate(z).model_dump() for z in zones]
    return BaseResponse(data=data, meta=Meta())

@router.get("/lines", response_model=BaseResponse)
def get_lines(db: Session = Depends(get_db)):
    lines = db.query(Line).all()
    data = [LineResponse.model_validate(l).model_dump() for l in lines]
    return BaseResponse(data=data, meta=Meta())

@router.get("/machines", response_model=BaseResponse)
def get_machines(db: Session = Depends(get_db)):
    machines = db.query(Machine).all()
    data = [MachineResponse.model_validate(m).model_dump() for m in machines]
    return BaseResponse(data=data, meta=Meta())

@router.get("/sensors", response_model=BaseResponse)
def get_sensors(db: Session = Depends(get_db)):
    sensors = db.query(Sensor).all()
    data = [SensorResponse.model_validate(s).model_dump() for s in sensors]
    return BaseResponse(data=data, meta=Meta())
