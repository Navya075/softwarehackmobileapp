from typing import Optional
from .base_vehicle_adapter import BaseVehicleAdapter
from simulator.simulator import simulator
from models.telemetry import VehicleTelemetry

class SimulatorAdapter(BaseVehicleAdapter):
    """
    Working adapter implementation reading and writing state directly from MultiVehicleSimulator.
    """
    async def fetch_telemetry(self, vehicle_id: str) -> Optional[VehicleTelemetry]:
        return simulator.get_telemetry(vehicle_id)

    async def dispatch_power_command(self, vehicle_id: str, power_kw: float) -> bool:
        simulator.override_power(power_kw, vehicle_id)
        return True
