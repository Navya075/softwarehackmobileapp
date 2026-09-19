from typing import Dict, Any, Optional
from datetime import datetime, timezone

def make_ws_event(event_type: str, data: Dict[str, Any], vehicle_id: Optional[str] = None) -> Dict[str, Any]:
    """Generates standard typed WebSocket event payload."""
    payload = {
        "type": event_type,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": data,
    }
    if vehicle_id:
        payload["vehicle_id"] = vehicle_id
    return payload
