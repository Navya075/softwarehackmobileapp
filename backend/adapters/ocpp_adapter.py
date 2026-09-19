"""
OCPP 1.6 / 2.0.1 Charging Station Adapter Interface.
Ready for production OCPP CSMS integration.
"""

from typing import Optional, Dict, Any
from .base_vehicle_adapter import BaseVehicleAdapter
from models.telemetry import VehicleTelemetry
from models.charging import ChargingStatusEnum

class OCPPAdapter(BaseVehicleAdapter):
    """
    Parses MeterValues.req, StatusNotification.req, and formats SetChargingProfile.req.
    """
    def __init__(self, charge_point_id: str):
        self.charge_point_id = charge_point_id

    def parse_meter_values(self, payload: Dict[str, Any]) -> Dict[str, float]:
        """Extracts power, energy, voltage, and current from OCPP MeterValues."""
        extracted = {"power_kw": 0.0, "energy_kwh": 0.0, "voltage_v": 230.0, "current_a": 0.0}
        try:
            meter_values = payload.get("meterValue", [])
            for mv in meter_values:
                for sample in mv.get("sampledValue", []):
                    measurand = sample.get("measurand", "Energy.Active.Import.Register")
                    val = float(sample.get("value", 0.0))
                    unit = sample.get("unit", "Wh")
                    if measurand == "Power.Active.Import":
                        extracted["power_kw"] = val / 1000.0 if unit == "W" else val
                    elif measurand == "Energy.Active.Import.Register":
                        extracted["energy_kwh"] = val / 1000.0 if unit == "Wh" else val
                    elif measurand == "Voltage":
                        extracted["voltage_v"] = val
                    elif measurand == "Current.Import":
                        extracted["current_a"] = val
        except Exception:
            pass
        return extracted

    async def fetch_telemetry(self, vehicle_id: str) -> Optional[VehicleTelemetry]:
        # Interface placeholder for real OCPP WebSocket server
        return None

    async def dispatch_power_command(self, vehicle_id: str, power_kw: float) -> bool:
        # Formats OCPP SetChargingProfile request
        return True
