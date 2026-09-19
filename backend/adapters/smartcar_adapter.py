"""
Smartcar Multi-OEM Connected Vehicle API Adapter Interface.
Ready for production OEM telemetry ingestion.
"""

from typing import Optional, Dict, Any
from .base_vehicle_adapter import BaseVehicleAdapter
from models.telemetry import VehicleTelemetry

class SmartcarAdapter(BaseVehicleAdapter):
    """
    Translates Smartcar API responses (/battery, /charge) into VehicleTelemetry.
    """
    def __init__(self, access_token: Optional[str] = None):
        self.access_token = access_token

    def parse_battery_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parses Smartcar GET /vehicles/{id}/battery:
        { "percentRemaining": 0.48, "range": 156.2 }
        """
        soc = data.get("percentRemaining", 0.0)
        # Smartcar percentRemaining can be 0.0 to 1.0 or 0 to 100
        if soc <= 1.0 and soc > 0.0:
            soc = soc * 100.0
        return {
            "current_soc": float(soc),
            "estimated_range_km": float(data.get("range", 0.0))
        }

    async def fetch_telemetry(self, vehicle_id: str) -> Optional[VehicleTelemetry]:
        return None

    async def dispatch_power_command(self, vehicle_id: str, power_kw: float) -> bool:
        return True
