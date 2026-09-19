from abc import ABC, abstractmethod
from typing import Optional
from models.telemetry import VehicleTelemetry

class BaseVehicleAdapter(ABC):
    """
    Common Vehicle Data Layer base adapter.
    Translates raw vehicle protocol signals into standardized VehicleTelemetry.
    """
    @abstractmethod
    async def fetch_telemetry(self, vehicle_id: str) -> Optional[VehicleTelemetry]:
        pass

    @abstractmethod
    async def dispatch_power_command(self, vehicle_id: str, power_kw: float) -> bool:
        pass
