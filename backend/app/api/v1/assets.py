from __future__ import annotations

from fastapi import APIRouter, Depends

from ...schemas import (Envelope, LineResponse, MachineResponse, PlantResponse, PlantSummary, SensorResponse,
                        ZoneResponse, ok, ok_list)
from ...services.asset_service import AssetService
from ..deps import Pagination, get_asset_service

router = APIRouter(tags=["assets"])


@router.get("/plants", response_model=Envelope[list[PlantResponse]])
def list_plants(p: Pagination = Depends(), status: str | None = None, svc: AssetService = Depends(get_asset_service)):
    return ok_list(svc.list_plants(p.limit, p.offset, status), limit=p.limit, offset=p.offset)


@router.get("/plants/{plant_id}", response_model=Envelope[PlantResponse])
def get_plant(plant_id: int, svc: AssetService = Depends(get_asset_service)):
    return ok(svc.get_plant(plant_id))


@router.get("/plants/{plant_id}/summary", response_model=Envelope[PlantSummary])
def plant_summary(plant_id: int, svc: AssetService = Depends(get_asset_service)):
    return ok(svc.plant_summary(plant_id))


@router.get("/zones", response_model=Envelope[list[ZoneResponse]])
def list_zones(p: Pagination = Depends(), plant_id: int | None = None, svc: AssetService = Depends(get_asset_service)):
    return ok_list(svc.list_zones(p.limit, p.offset, plant_id), limit=p.limit, offset=p.offset)


@router.get("/zones/{zone_id}", response_model=Envelope[ZoneResponse])
def get_zone(zone_id: int, svc: AssetService = Depends(get_asset_service)):
    return ok(svc.get_zone(zone_id))


@router.get("/lines", response_model=Envelope[list[LineResponse]])
def list_lines(p: Pagination = Depends(), zone_id: int | None = None, plant_id: int | None = None,
               svc: AssetService = Depends(get_asset_service)):
    return ok_list(svc.list_lines(p.limit, p.offset, zone_id, plant_id), limit=p.limit, offset=p.offset)


@router.get("/lines/{line_id}", response_model=Envelope[LineResponse])
def get_line(line_id: int, svc: AssetService = Depends(get_asset_service)):
    return ok(svc.get_line(line_id))


@router.get("/machines", response_model=Envelope[list[MachineResponse]])
def list_machines(p: Pagination = Depends(), line_id: int | None = None, plant_id: int | None = None,
                  svc: AssetService = Depends(get_asset_service)):
    return ok_list(svc.list_machines(p.limit, p.offset, line_id, plant_id), limit=p.limit, offset=p.offset)


@router.get("/machines/{machine_id}", response_model=Envelope[MachineResponse])
def get_machine(machine_id: int, svc: AssetService = Depends(get_asset_service)):
    return ok(svc.get_machine(machine_id))


@router.get("/sensors", response_model=Envelope[list[SensorResponse]])
def list_sensors(p: Pagination = Depends(), plant_id: int | None = None, machine_id: int | None = None,
                 sensor_type: str | None = None, status: str | None = None,
                 svc: AssetService = Depends(get_asset_service)):
    return ok_list(svc.list_sensors(p.limit, p.offset, plant_id=plant_id, machine_id=machine_id,
                                    sensor_type=sensor_type, status=status), limit=p.limit, offset=p.offset)


@router.get("/sensors/by-code/{sensor_code}", response_model=Envelope[SensorResponse])
def get_sensor_by_code(sensor_code: str, svc: AssetService = Depends(get_asset_service)):
    return ok(svc.get_sensor_by_code(sensor_code))


@router.get("/sensors/{sensor_id}", response_model=Envelope[SensorResponse])
def get_sensor(sensor_id: int, svc: AssetService = Depends(get_asset_service)):
    return ok(svc.get_sensor(sensor_id))
