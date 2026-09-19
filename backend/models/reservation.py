from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field

class ReservationStatusEnum(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class ReservationItem(BaseModel):
    reservation_id: str
    user_id: str
    vehicle_id: str
    charger_id: str
    charger_name: str
    location: str
    date: str
    start_time: str
    end_time: str
    status: ReservationStatusEnum = ReservationStatusEnum.CONFIRMED
    estimated_energy_kwh: float = 16.0
    estimated_charging_cost: float = 192.0
    parking_cost: float = 30.0
    service_fee: float = 15.0
    total_estimated_cost: float = 237.0
    created_at: str

class ReservationCreate(BaseModel):
    vehicle_id: str
    charger_id: str
    date: str
    time_slot: str
    estimated_kwh: Optional[float] = 16.0
