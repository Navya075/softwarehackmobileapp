from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from simulator.simulator import simulator
from services.telemetry_service import telemetry_service
from websocket.manager import ws_manager
from websocket.events import make_ws_event

router = APIRouter(prefix="/simulator", tags=["Simulator"])

class SpeedRequest(BaseModel):
    speed: int

class VehicleActionRequest(BaseModel):
    vehicle_id: Optional[str] = None

class PowerOverrideRequest(BaseModel):
    power_kw: float
    vehicle_id: Optional[str] = None

class GridSettingsRequest(BaseModel):
    building_load_kw: Optional[float] = None
    solar_generation_kw: Optional[float] = None
    grid_limit_kw: Optional[float] = None

@router.get("/status")
def get_simulator_status():
    """Returns complete state of the multi-vehicle physical simulation engine."""
    return simulator.get_state_summary()

@router.post("/speed")
async def set_simulator_speed(req: SpeedRequest):
    """Sets simulation speed multiplier (1, 5, 15, 30, 60, 120)."""
    if req.speed not in simulator.valid_speeds:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid speed {req.speed}. Valid multipliers: {simulator.valid_speeds}"
        )
    speed = simulator.set_speed(req.speed)
    await ws_manager.broadcast(make_ws_event("simulator_speed_change", {"speed": speed}))
    return {"status": "ok", "speed": speed}

@router.post("/plug")
async def plug_vehicle(req: VehicleActionRequest):
    """Physically plugs in vehicle."""
    simulator.plug(req.vehicle_id)
    vid = req.vehicle_id or simulator.active_vehicle_id
    tel = simulator.get_telemetry(vid)
    await telemetry_service.update_vehicle_telemetry(tel)
    return {"status": "ok", "action": "plugged", "vehicle_id": vid}

@router.post("/unplug")
async def unplug_vehicle(req: VehicleActionRequest):
    """Physically unplugs vehicle."""
    simulator.unplug(req.vehicle_id)
    vid = req.vehicle_id or simulator.active_vehicle_id
    tel = simulator.get_telemetry(vid)
    await telemetry_service.update_vehicle_telemetry(tel)
    return {"status": "ok", "action": "unplugged", "vehicle_id": vid}

@router.post("/pause")
async def pause_vehicle(req: VehicleActionRequest):
    """Pauses charging for the vehicle."""
    simulator.pause(req.vehicle_id)
    vid = req.vehicle_id or simulator.active_vehicle_id
    tel = simulator.get_telemetry(vid)
    await telemetry_service.update_vehicle_telemetry(tel)
    return {"status": "ok", "action": "paused", "vehicle_id": vid}

@router.post("/resume")
async def resume_vehicle(req: VehicleActionRequest):
    """Resumes charging for the vehicle."""
    simulator.resume(req.vehicle_id)
    vid = req.vehicle_id or simulator.active_vehicle_id
    tel = simulator.get_telemetry(vid)
    await telemetry_service.update_vehicle_telemetry(tel)
    return {"status": "ok", "action": "resumed", "vehicle_id": vid}

@router.post("/power")
async def override_charging_power(req: PowerOverrideRequest):
    """Overrides charging power setpoint for vehicle."""
    simulator.override_power(req.power_kw, req.vehicle_id)
    vid = req.vehicle_id or simulator.active_vehicle_id
    tel = simulator.get_telemetry(vid)
    await telemetry_service.update_vehicle_telemetry(tel)
    return {"status": "ok", "vehicle_id": vid, "power_kw": req.power_kw}

@router.post("/grid")
async def update_grid_settings(req: GridSettingsRequest):
    """Updates external electrical conditions (building load, solar, grid limit)."""
    if req.building_load_kw is not None:
        simulator.set_building_load(req.building_load_kw)
    if req.solar_generation_kw is not None:
        simulator.set_solar(req.solar_generation_kw)
    if req.grid_limit_kw is not None:
        simulator.set_grid_limit(req.grid_limit_kw)

    summary = simulator.get_state_summary()
    await ws_manager.broadcast(make_ws_event("grid_state_change", summary))
    return {"status": "ok", "grid_state": summary}

@router.post("/reset")
async def reset_simulator():
    """Resets simulator fleet and electrical states to benchmark demo defaults."""
    simulator.reset_demo()
    for tel in simulator.get_all_telemetry():
        await telemetry_service.update_vehicle_telemetry(tel)
    return {"status": "ok", "message": "Simulator reset to demo defaults"}

@router.post("/tick")
async def manual_tick():
    """Manually executes a simulation tick (useful for deterministic tests)."""
    telemetries = await telemetry_service.tick_simulation(delta_seconds=1.0)
    return {"status": "ok", "tick_count": 1, "fleet_size": len(telemetries)}
