from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ChargingStatusEnum(str, Enum):
    CHARGING = "charging"
    PAUSED = "paused"
    IDLE = "idle"
    COMPLETED = "completed"
    UNPLUGGED = "unplugged"

class SeverityEnum(str, Enum):
    INFO = "info"
    WARNING = "warning"
    SUCCESS = "success"
    URGENT = "urgent"

class NotificationTypeEnum(str, Enum):
    CHARGING_START = "charging_start"
    OPTIMIZATION_CURTAILMENT = "optimization_curtailment"
    OPTIMIZATION_RESTORED = "optimization_restored"
    TARGET_REACHED = "target_reached"
    PLUG_EVENT = "plug_event"
    DEPARTURE_RISK = "departure_risk"
    SOLAR_OPPORTUNITY = "solar_opportunity"
    CHARGER_EVENT = "charger_event"
    BILLING_EVENT = "billing_event"
    ALERT = "alert"

class VehicleTelemetry(BaseModel):
    vehicle_id: str
    make: str = "Tesla"
    model: str = "Model 3"
    current_soc: float = Field(..., ge=0, le=100)
    target_soc: float = Field(..., ge=0, le=100)
    battery_capacity_kwh: float
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

class BuildingGridState(BaseModel):
    base_load_kw: float
    grid_limit_kw: float
    current_ev_load_kw: float
    total_demand_kw: float
    curtailment_active: bool = False
    current_tariff_rate: float = 6.5
    solar_generation_kw: float = 18.0

class OptimizationDecision(BaseModel):
    recommended_power_kw: float
    departure_guaranteed: bool
    departure_risk: bool
    reason_codes: List[str]
    explanation_summary: str
    reasons: List[str]
    renewable_percentage: float
    estimated_cost_inr: float

class NotificationEvent(BaseModel):
    id: str
    timestamp: str
    type: NotificationTypeEnum
    severity: SeverityEnum
    title: str
    message: str
    read: bool = False
    metadata: Optional[Dict[str, Any]] = None
