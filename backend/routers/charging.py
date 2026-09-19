from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Optional
from pydantic import BaseModel
from firebase.auth import get_current_user, AuthUser
from services.charging_service import ChargingService
from models.charging import (
    ChargingSession,
    ChargingPreferences,
    ChargingPreferencesUpdate
)

router = APIRouter(prefix="/charging", tags=["Charging"])

class StartSessionRequest(BaseModel):
    vehicle_id: str = "EV-001"
    charger_name: str = "Home Level 2 Charger"
    target_soc: Optional[float] = None

class ChargeFasterRequest(BaseModel):
    vehicle_id: Optional[str] = "EV-001"

@router.get("/preferences", response_model=ChargingPreferences)
async def get_preferences(current_user: AuthUser = Depends(get_current_user)):
    """Retrieves current charging preferences and optimization constraints."""
    return await ChargingService.get_preferences(current_user.uid)

@router.put("/preferences", response_model=ChargingPreferences)
async def update_preferences(
    updates: ChargingPreferencesUpdate,
    current_user: AuthUser = Depends(get_current_user)
):
    """Updates charging preferences (target SOC, departure time, charge faster mode)."""
    return await ChargingService.update_preferences(current_user.uid, updates)

@router.get("/session/active", response_model=Optional[ChargingSession])
async def get_active_session(current_user: AuthUser = Depends(get_current_user)):
    """Returns active charging session, if one is underway."""
    return await ChargingService.get_current_session(current_user.uid)

@router.post("/session/start", response_model=ChargingSession)
async def start_charging_session(
    req: StartSessionRequest,
    current_user: AuthUser = Depends(get_current_user)
):
    """Initiates a charging session for the specified vehicle."""
    return await ChargingService.start_session(
        user_id=current_user.uid,
        vehicle_id=req.vehicle_id,
        charger_name=req.charger_name,
        target_soc=req.target_soc
    )

@router.post("/session/pause", response_model=Optional[ChargingSession])
async def pause_charging_session(current_user: AuthUser = Depends(get_current_user)):
    """Temporarily pauses the active charging session."""
    session = await ChargingService.pause_session(current_user.uid)
    if not session:
        raise HTTPException(status_code=404, detail="No active charging session to pause")
    return session

@router.post("/session/resume", response_model=Optional[ChargingSession])
async def resume_charging_session(current_user: AuthUser = Depends(get_current_user)):
    """Resumes the active charging session."""
    session = await ChargingService.resume_session(current_user.uid)
    if not session:
        raise HTTPException(status_code=404, detail="No active charging session to resume")
    return session

@router.post("/session/stop", response_model=Optional[ChargingSession])
async def stop_charging_session(current_user: AuthUser = Depends(get_current_user)):
    """Completes the active charging session and generates billing record."""
    session = await ChargingService.complete_session(current_user.uid)
    if not session:
        raise HTTPException(status_code=404, detail="No active charging session to stop")
    return session

@router.post("/charge-faster", response_model=ChargingPreferences)
async def trigger_charge_faster(
    req: ChargeFasterRequest,
    current_user: AuthUser = Depends(get_current_user)
):
    """Overrides grid throttling to charge at maximum physical rate."""
    return await ChargingService.trigger_charge_faster(current_user.uid, req.vehicle_id)
