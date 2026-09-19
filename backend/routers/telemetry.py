from fastapi import APIRouter, Query
from typing import List, Optional
from services.telemetry_service import telemetry_service
from models.telemetry import VehicleTelemetry

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])

@router.get("/live", response_model=VehicleTelemetry)
async def get_live_telemetry(
    vehicle_id: Optional[str] = Query("EV-001", description="Vehicle ID to query")
):
    """
    Returns latest high-frequency vehicle telemetry from in-memory cache.
    Telemetry is buffered strictly in-memory and never written to persistent Firestore.
    """
    return telemetry_service.get_vehicle_telemetry(vehicle_id)

@router.get("/fleet", response_model=List[VehicleTelemetry])
async def get_fleet_telemetry():
    """Returns the latest telemetry for all known vehicles."""
    return telemetry_service.get_all_telemetry()
