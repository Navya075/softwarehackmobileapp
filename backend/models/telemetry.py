from typing import Optional
from pydantic import BaseModel, Field
from .charging import ChargingStatusEnum

class VehicleTelemetry(BaseModel):
    vehicle_id: str
    current_soc: float = Field(..., ge=0, le=100)
    target_soc: float = Field(..., ge=0, le=100)
    battery_capacity_kwh: float
    usable_battery_capacity_kwh: float
    battery_health_percent: float = 94.0
    charging_status: ChargingStatusEnum
    plug_status: bool
    charging_power_kw: float
    max_charging_power_kw: float
    estimated_range_km: float
    voltage_v: float = 238.0
    current_a: float = 13.5
    departure_time: str
    session_start_time: str
    energy_delivered_kwh: float = 0.0
    estimated_completion_time: str
    last_updated: str
