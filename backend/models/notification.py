from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel

class NotificationSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    SUCCESS = "success"
    URGENT = "urgent"

class NotificationEventType(str, Enum):
    CHARGING_START = "charging_start"
    CHARGING_PAUSED = "charging_paused"
    CHARGING_RESUMED = "charging_resumed"
    CHARGING_COMPLETED = "charging_completed"
    CHARGING_INTERRUPTED = "charging_interrupted"
    TARGET_REACHED = "target_reached"
    PLUG_EVENT = "plug_event"
    UNPLUG_EVENT = "unplug_event"
    DEPARTURE_RISK = "departure_risk"
    DEPARTURE_GUARANTEED = "departure_guaranteed"
    CHARGING_SLOWED = "charging_slowed"
    CHARGING_RESTORED = "charging_restored"
    SOLAR_OPPORTUNITY = "solar_opportunity"
    RESERVATION_CONFIRMED = "reservation_confirmed"
    RESERVATION_REMINDER = "reservation_reminder"
    RESERVATION_CANCELLED = "reservation_cancelled"
    BILLING_GENERATED = "billing_generated"
    CHARGER_UNAVAILABLE = "charger_unavailable"
    CHARGE_FASTER_ACTIVE = "charge_faster_active"
    SMART_PLAN_UPDATED = "smart_plan_updated"
    ALERT = "alert"

class PushTokenRegistration(BaseModel):
    push_token: str

class NotificationItem(BaseModel):
    id: str
    user_id: str
    timestamp: str
    type: NotificationEventType
    severity: NotificationSeverity
    title: str
    message: str
    read: bool = False
    action_label: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
