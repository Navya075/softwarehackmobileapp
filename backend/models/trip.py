from typing import Optional
from pydantic import BaseModel

class TripItem(BaseModel):
    trip_id: str
    user_id: str
    vehicle_id: str
    origin: str
    destination: str
    distance_km: float
    current_range_km: float
    recommended_target_soc: float
    additional_energy_required_kwh: float
    estimated_charging_time_min: int = 22
    created_at: str

class TripCreate(BaseModel):
    vehicle_id: str
    origin: str
    destination: str
    distance_km: float
