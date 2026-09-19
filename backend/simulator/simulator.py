import logging
from typing import Dict, List, Optional
from .vehicle_state import SimulatedVehicle
from models.telemetry import VehicleTelemetry

logger = logging.getLogger("voltflow.simulator")

class MultiVehicleSimulator:
    """
    Multi-vehicle simulation engine.
    
    IMPORTANT:
    This simulator models physical vehicle charging behavior and electrical states.
    It does NOT make optimization decisions (peak shaving, grid load balancing).
    It faithfully executes charging power setpoints provided by the backend / optimizer.
    """
    def __init__(self):
        self.speed_multiplier: int = 1
        self.valid_speeds = [1, 5, 15, 30, 60, 120]
        
        # Grid and building electrical conditions (input constraints)
        self.building_load_kw: float = 61.0
        self.grid_limit_kw: float = 85.0
        self.solar_generation_kw: float = 18.0
        
        # Vehicle fleet
        self.vehicles: Dict[str, SimulatedVehicle] = {}
        self.active_vehicle_id: str = "EV-001"
        self._init_fleet()

    def _init_fleet(self):
        """Initializes the three benchmark vehicles specified in requirements."""
        self.vehicles = {
            # EV-001: Tesla Model 3 (75 kWh pack, 11 kW max AC)
            "EV-001": SimulatedVehicle(
                vehicle_id="EV-001",
                manufacturer="Tesla",
                model="Model 3 Long Range",
                battery_capacity_kwh=75.0,
                usable_battery_capacity_kwh=71.2,
                battery_health_percent=94.0,
                max_charging_power_kw=11.0,
                current_soc=48.0,
                target_soc=85.0,
                departure_time="Tomorrow, 7:30 AM",
                plugged_in=True,
                charging_power_kw=3.2,
            ),
            # EV-002: Hyundai Ioniq 5 (77.4 kWh pack, 22 kW max AC)
            "EV-002": SimulatedVehicle(
                vehicle_id="EV-002",
                manufacturer="Hyundai",
                model="Ioniq 5 AWD",
                battery_capacity_kwh=77.4,
                usable_battery_capacity_kwh=74.0,
                battery_health_percent=97.0,
                max_charging_power_kw=22.0,
                current_soc=32.0,
                target_soc=80.0,
                departure_time="Tomorrow, 8:00 AM",
                plugged_in=True,
                charging_power_kw=7.4,
            ),
            # EV-003: Nissan Leaf (40 kWh pack, 6.6 kW max AC)
            "EV-003": SimulatedVehicle(
                vehicle_id="EV-003",
                manufacturer="Nissan",
                model="Leaf e+",
                battery_capacity_kwh=40.0,
                usable_battery_capacity_kwh=38.0,
                battery_health_percent=91.0,
                max_charging_power_kw=6.6,
                current_soc=65.0,
                target_soc=90.0,
                departure_time="Tomorrow, 6:30 AM",
                plugged_in=False,
                charging_power_kw=0.0,
            ),
        }

    def get_vehicle(self, vehicle_id: Optional[str] = None) -> SimulatedVehicle:
        vid = vehicle_id or self.active_vehicle_id
        if vid not in self.vehicles:
            vid = "EV-001"
        return self.vehicles[vid]

    def set_active_vehicle(self, vehicle_id: str):
        if vehicle_id in self.vehicles:
            self.active_vehicle_id = vehicle_id

    def set_speed(self, speed: int) -> int:
        if speed in self.valid_speeds:
            self.speed_multiplier = speed
            logger.info("Simulation speed updated to %dx", speed)
        return self.speed_multiplier

    def plug(self, vehicle_id: Optional[str] = None):
        v = self.get_vehicle(vehicle_id)
        v.plug()

    def unplug(self, vehicle_id: Optional[str] = None):
        v = self.get_vehicle(vehicle_id)
        v.unplug()

    def pause(self, vehicle_id: Optional[str] = None):
        v = self.get_vehicle(vehicle_id)
        v.pause()

    def resume(self, vehicle_id: Optional[str] = None):
        v = self.get_vehicle(vehicle_id)
        v.resume()

    def set_target_soc(self, soc: float, vehicle_id: Optional[str] = None):
        v = self.get_vehicle(vehicle_id)
        v.target_soc = max(0.0, min(100.0, soc))

    def set_departure_time(self, departure: str, vehicle_id: Optional[str] = None):
        v = self.get_vehicle(vehicle_id)
        v.departure_time = departure

    def override_power(self, power_kw: float, vehicle_id: Optional[str] = None):
        """Overrides the physical charging power setpoint for a vehicle."""
        v = self.get_vehicle(vehicle_id)
        v.set_power(power_kw)

    def set_building_load(self, load_kw: float):
        self.building_load_kw = max(0.0, load_kw)

    def set_grid_limit(self, limit_kw: float):
        self.grid_limit_kw = max(10.0, limit_kw)

    def set_solar(self, solar_kw: float):
        self.solar_generation_kw = max(0.0, solar_kw)

    def reset_demo(self):
        """Resets the multi-vehicle fleet and grid conditions to benchmark demo defaults."""
        self.speed_multiplier = 1
        self.building_load_kw = 61.0
        self.grid_limit_kw = 85.0
        self.solar_generation_kw = 18.0
        self._init_fleet()
        logger.info("Simulator reset to demo defaults")

    def tick(self, delta_seconds: float = 1.0):
        """Advances physics for all vehicles."""
        for v in self.vehicles.values():
            v.update_tick(delta_seconds, self.speed_multiplier)

    def get_telemetry(self, vehicle_id: Optional[str] = None) -> VehicleTelemetry:
        v = self.get_vehicle(vehicle_id)
        return v.to_telemetry()

    def get_all_telemetry(self) -> List[VehicleTelemetry]:
        return [v.to_telemetry() for v in self.vehicles.values()]

    def get_total_ev_load_kw(self) -> float:
        return round(sum(v.charging_power_kw for v in self.vehicles.values()), 1)

    def get_state_summary(self) -> dict:
        return {
            "active_vehicle_id": self.active_vehicle_id,
            "speed_multiplier": self.speed_multiplier,
            "building_load_kw": self.building_load_kw,
            "grid_limit_kw": self.grid_limit_kw,
            "solar_generation_kw": self.solar_generation_kw,
            "current_ev_load_kw": self.get_total_ev_load_kw(),
            "vehicles": [
                {
                    "vehicle_id": v.vehicle_id,
                    "manufacturer": v.manufacturer,
                    "model": v.model,
                    "current_soc": round(v.current_soc, 1),
                    "target_soc": round(v.target_soc, 1),
                    "charging_power_kw": round(v.charging_power_kw, 1),
                    "plugged_in": v.plugged_in,
                    "charging_status": v.charging_status,
                }
                for v in self.vehicles.values()
            ],
        }

# Global simulator singleton
simulator = MultiVehicleSimulator()
