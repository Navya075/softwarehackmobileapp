from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field

class ChargingStatusEnum(str, Enum):
    CHARGING = "charging"
    PAUSED = "paused"
    IDLE = "idle"
    COMPLETED = "completed"
    UNPLUGGED = "unplugged"

class ChargingPreferences(BaseModel):
    user_id: str
    target_soc: float = Field(default=85.0, ge=0, le=100)
    departure_date: str = "Tomorrow"
    departure_time: str = "7:30 AM"
    prefer_renewable: bool = True
    prefer_lower_cost: bool = True
    allow_smart_charging: bool = True
    allow_charging_delay: bool = True
    emergency_charging: bool = False
    charge_faster: bool = False
    departure_readiness_guarantee: bool = True

class ChargingPreferencesUpdate(BaseModel):
    target_soc: Optional[float] = None
    departure_date: Optional[str] = None
    departure_time: Optional[str] = None
    prefer_renewable: Optional[bool] = None
    prefer_lower_cost: Optional[bool] = None
    allow_smart_charging: Optional[bool] = None
    allow_charging_delay: Optional[bool] = None
    emergency_charging: Optional[bool] = None
    charge_faster: Optional[bool] = None
    departure_readiness_guarantee: Optional[bool] = None

class ChargingSession(BaseModel):
    session_id: str
    user_id: str
    vehicle_id: str
    start_time: str
    end_time: Optional[str] = None
    start_soc: float
    target_soc: float
    final_soc: Optional[float] = None
    energy_delivered_kwh: float = 0.0
    charging_duration_minutes: int = 0
    charging_power_kw: float = 0.0
    estimated_cost: float = 0.0
    renewable_energy_kwh: float = 0.0
    grid_energy_kwh: float = 0.0
    status: ChargingStatusEnum = ChargingStatusEnum.CHARGING
    charger_name: Optional[str] = "Home Level 2 Charger"
    location: Optional[str] = "Green Residency"

class StartSessionRequest(BaseModel):
    vehicle_id: str
    charger_name: Optional[str] = "Home Level 2 Charger"
    target_soc: Optional[float] = None
