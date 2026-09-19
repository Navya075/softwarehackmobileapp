from typing import Dict, Any
from models.charging import ChargingStatusEnum
from models.telemetry import VehicleTelemetry

class SimulatedVehicle:
    def __init__(
        self,
        vehicle_id: str,
        manufacturer: str,
        model: str,
        battery_capacity_kwh: float,
        usable_battery_capacity_kwh: float,
        battery_health_percent: float,
        max_charging_power_kw: float,
        current_soc: float = 48.0,
        target_soc: float = 85.0,
        departure_time: str = "Tomorrow, 7:30 AM",
        plugged_in: bool = True,
        charging_power_kw: float = 3.2,
    ):
        self.vehicle_id = vehicle_id
        self.manufacturer = manufacturer
        self.model = model
        self.battery_capacity_kwh = battery_capacity_kwh
        self.usable_battery_capacity_kwh = usable_battery_capacity_kwh
        self.battery_health_percent = battery_health_percent
        self.max_charging_power_kw = max_charging_power_kw
        self.current_soc = current_soc
        self.target_soc = target_soc
        self.departure_time = departure_time
        self.plugged_in = plugged_in
        self.charging_power_kw = charging_power_kw if plugged_in else 0.0
        self.charging_status = ChargingStatusEnum.CHARGING if (plugged_in and charging_power_kw > 0) else ChargingStatusEnum.PAUSED
        self.energy_delivered_kwh = 12.8
        self.session_start_time = "11:15 PM"
        self.estimated_completion_time = "6:42 AM"

    def plug(self):
        self.plugged_in = True
        if self.current_soc < self.target_soc:
            self.charging_status = ChargingStatusEnum.CHARGING
            self.charging_power_kw = min(3.2, self.max_charging_power_kw)
        else:
            self.charging_status = ChargingStatusEnum.COMPLETED
            self.charging_power_kw = 0.0

    def unplug(self):
        self.plugged_in = False
        self.charging_status = ChargingStatusEnum.UNPLUGGED
        self.charging_power_kw = 0.0

    def pause(self):
        if self.plugged_in:
            self.charging_status = ChargingStatusEnum.PAUSED
            self.charging_power_kw = 0.0

    def resume(self):
        if self.plugged_in:
            if self.current_soc >= self.target_soc:
                self.charging_status = ChargingStatusEnum.COMPLETED
                self.charging_power_kw = 0.0
            else:
                self.charging_status = ChargingStatusEnum.CHARGING
                self.charging_power_kw = min(3.2, self.max_charging_power_kw)

    def set_power(self, power_kw: float):
        """Dispatches an external power setpoint (e.g. from optimizer command)."""
        if not self.plugged_in or self.charging_status == ChargingStatusEnum.PAUSED:
            self.charging_power_kw = 0.0
            return
        self.charging_power_kw = max(0.0, min(power_kw, self.max_charging_power_kw))
        if self.charging_power_kw == 0.0 and self.current_soc < self.target_soc:
            self.charging_status = ChargingStatusEnum.PAUSED
        elif self.charging_power_kw > 0.0:
            self.charging_status = ChargingStatusEnum.CHARGING

    def update_tick(self, delta_seconds: float, speed_multiplier: float):
        """Simulates physical charge accumulation without any optimization logic."""
        effective_delta_hours = (delta_seconds * speed_multiplier) / 3600.0
        
        if self.plugged_in and self.charging_status == ChargingStatusEnum.CHARGING and self.charging_power_kw > 0:
            energy_kwh = self.charging_power_kw * effective_delta_hours
            self.energy_delivered_kwh += energy_kwh
            
            # SOC increment based on usable pack capacity
            added_soc = (energy_kwh / self.usable_battery_capacity_kwh) * 100.0
            self.current_soc = min(100.0, self.current_soc + added_soc)
            
            if self.current_soc >= self.target_soc:
                self.charging_status = ChargingStatusEnum.COMPLETED
                self.charging_power_kw = 0.0

    def to_telemetry(self) -> VehicleTelemetry:
        est_range = round((self.current_soc / 100.0) * (self.usable_battery_capacity_kwh * 6.5), 1)
        voltage = 238.0
        current = round((self.charging_power_kw * 1000.0) / voltage, 1) if self.charging_power_kw > 0 else 0.0
        
        return VehicleTelemetry(
            vehicle_id=self.vehicle_id,
            current_soc=round(self.current_soc, 1),
            target_soc=round(self.target_soc, 1),
            battery_capacity_kwh=self.battery_capacity_kwh,
            usable_battery_capacity_kwh=self.usable_battery_capacity_kwh,
            battery_health_percent=self.battery_health_percent,
            charging_status=self.charging_status,
            plug_status=self.plugged_in,
            charging_power_kw=round(self.charging_power_kw, 1),
            max_charging_power_kw=self.max_charging_power_kw,
            estimated_range_km=est_range,
            voltage_v=voltage,
            current_a=current,
            departure_time=self.departure_time,
            session_start_time=self.session_start_time,
            energy_delivered_kwh=round(self.energy_delivered_kwh, 2),
            estimated_completion_time=self.estimated_completion_time,
            last_updated="Just now"
        )
