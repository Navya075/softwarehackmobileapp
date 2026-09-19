from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from firebase.auth import get_current_user, AuthUser
from services.vehicle_service import VehicleService
from models.vehicle import VehicleProfile, VehicleCreate, VehicleUpdate, BatteryHealthData

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

@router.get("", response_model=List[VehicleProfile])
async def list_vehicles(current_user: AuthUser = Depends(get_current_user)):
    """Lists all vehicles registered to the authenticated user."""
    return await VehicleService.get_user_vehicles(current_user.uid)

@router.post("", response_model=VehicleProfile, status_code=status.HTTP_201_CREATED)
async def create_vehicle(
    vehicle_in: VehicleCreate,
    current_user: AuthUser = Depends(get_current_user)
):
    """Registers a new EV under the user's account."""
    return await VehicleService.create_vehicle(current_user.uid, vehicle_in)

@router.get("/{vehicle_id}", response_model=VehicleProfile)
async def get_vehicle(
    vehicle_id: str,
    current_user: AuthUser = Depends(get_current_user)
):
    """Gets details for a specific EV."""
    v = await VehicleService.get_vehicle(vehicle_id, current_user.uid)
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return v

@router.put("/{vehicle_id}", response_model=VehicleProfile)
async def update_vehicle(
    vehicle_id: str,
    updates: VehicleUpdate,
    current_user: AuthUser = Depends(get_current_user)
):
    """Updates vehicle properties (target SOC, plugged status, nickname, etc.)."""
    v = await VehicleService.update_vehicle(vehicle_id, current_user.uid, updates)
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return v

@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vehicle(
    vehicle_id: str,
    current_user: AuthUser = Depends(get_current_user)
):
    """Removes a vehicle."""
    deleted = await VehicleService.delete_vehicle(vehicle_id, current_user.uid)
    if not deleted:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return None

@router.get("/{vehicle_id}/battery-health", response_model=BatteryHealthData)
async def get_battery_health(
    vehicle_id: str,
    current_user: AuthUser = Depends(get_current_user)
):
    """
    Returns Battery Health metrics (health %, original vs usable capacity).
    Distinct from current battery percentage (SOC).
    """
    data = await VehicleService.get_battery_health(vehicle_id, current_user.uid)
    if not data:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return data
