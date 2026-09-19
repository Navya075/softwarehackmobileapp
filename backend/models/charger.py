from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field

class ChargerStatusEnum(str, Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    RESERVED = "reserved"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"

class BookingSlotItem(BaseModel):
    slot_id: str
    time_range: str
    is_available: bool = True
    status_tag: Optional[str] = "Available"
    tag_variant: Optional[str] = "neutral"
    price_per_kwh: float = 12.0

class ChargerItem(BaseModel):
    charger_id: str
    name: str
    location: str
    address: str
    latitude: float
    longitude: float
    connector: str
    charging_type: str  # "DC Fast" | "Level 2 AC"
    power_kw: float
    price_per_kwh: float
    parking_price_per_hour: float = 0.0
    status: ChargerStatusEnum = ChargerStatusEnum.AVAILABLE
    total_slots: int = 8
    available_slots: int = 3
    is_solar_powered: bool = False
    context: str = "commercial"  # "residential" | "commercial"
