from typing import Optional
from pydantic import BaseModel, Field

class BatteryHealthData(BaseModel):
    battery_health_percent: float = Field(..., ge=0, le=100)
    usable_capacity_kwh: float
    original_capacity_kwh: float
    degradation_percent: float = 0.0
    cell_condition: str = "Healthy (Uniform Voltage)"
    operating_temperature_c: float = 28.4
    cycle_count: int = 84
    last_health_update: str

class VehicleProfile(BaseModel):
    vehicle_id: str
    user_id: str
    vehicle_type: str = "car"
    manufacturer: str
    model: str
    variant: Optional[str] = None
    year: int
    battery_capacity_kwh: float
    usable_battery_capacity_kwh: float
    battery_health_percent: float = 94.0
    current_soc: float = Field(default=48.0, ge=0, le=100)
    target_soc: float = Field(default=85.0, ge=0, le=100)
    max_charging_power_kw: float = 11.0
    ac_charging_power_kw: float = 7.2
    dc_charging_power_kw: float = 50.0
    connector: str = "CCS2 / Type 2"
    estimated_range_km: float = 156.0
    plugged_in: bool = True
    charging_status: str = "charging"
    created_at: str
    updated_at: str

class VehicleCreate(BaseModel):
    vehicle_type: Optional[str] = "car"
    manufacturer: str
    model: str
    variant: Optional[str] = None
    year: int
    battery_capacity_kwh: float
    usable_battery_capacity_kwh: Optional[float] = None
    battery_health_percent: Optional[float] = 94.0
    max_charging_power_kw: Optional[float] = 11.0
    connector: Optional[str] = "CCS2 / Type 2"

class VehicleUpdate(BaseModel):
    vehicle_type: Optional[str] = None
    target_soc: Optional[float] = None
    current_soc: Optional[float] = None
    plugged_in: Optional[bool] = None
    charging_status: Optional[str] = None
    estimated_range_km: Optional[float] = None
    battery_health_percent: Optional[float] = None
    usable_battery_capacity_kwh: Optional[float] = None
