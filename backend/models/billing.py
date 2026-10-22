from typing import Optional, List
from pydantic import BaseModel

class BillItem(BaseModel):
    bill_id: str
    user_id: str
    vehicle_id: str
    session_id: Optional[str] = None
    reservation_id: Optional[str] = None
    charger_name: str
    energy_kwh: float
    energy_cost: float
    parking_cost: float = 0.0
    service_fee: float = 0.0
    total_cost: float
    currency: str = "INR"
    status: str = "paid"  # "paid" | "pending"
    created_at: str
    invoice_number: Optional[str] = None
    payment_method: Optional[str] = None
    paid_at: Optional[str] = None
    duration: Optional[str] = None
    rate_per_kwh: Optional[float] = None
    customer_name: Optional[str] = None
    vehicle_model: Optional[str] = None
    license_plate: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = None

class BillingSummary(BaseModel):
    total_spent: float
    total_sessions: int
    current_month_total: float
    currency: str = "INR"
    bills: List[BillItem]
