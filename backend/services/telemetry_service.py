import logging
from typing import Dict, List, Optional
from models.telemetry import VehicleTelemetry
from simulator.simulator import simulator
from websocket.manager import ws_manager
from websocket.events import make_ws_event

from services.notification_service import NotificationService
from models.notification import NotificationEventType, NotificationSeverity

logger = logging.getLogger("voltflow.telemetry_service")

class TelemetryService:
    """
    In-memory vehicle telemetry service.
    
    CRITICAL ARCHITECTURAL GUARANTEE:
    High-frequency telemetry is NEVER written to Firestore.
    Telemetry is buffered entirely in-memory and streamed to clients via WebSockets.
    """

    def __init__(self):
        self._cache: Dict[str, VehicleTelemetry] = {}
        self._previous_states: Dict[str, dict] = {}
        # Warm the cache with simulator fleet state
        for t in simulator.get_all_telemetry():
            self._cache[t.vehicle_id] = t

    def get_vehicle_telemetry(self, vehicle_id: str = "EV-001") -> VehicleTelemetry:
        """Returns the latest cached telemetry for the vehicle, refreshing from simulator if needed."""
        if vehicle_id not in self._cache:
            tel = simulator.get_telemetry(vehicle_id)
            self._cache[vehicle_id] = tel
        return self._cache[vehicle_id]

    def get_all_telemetry(self) -> List[VehicleTelemetry]:
        """Returns the latest telemetry for all known vehicles."""
        return list(self._cache.values())

    async def update_vehicle_telemetry(self, telemetry: VehicleTelemetry):
        """Updates in-memory telemetry and broadcasts to all WebSocket subscribers."""
        self._cache[telemetry.vehicle_id] = telemetry
        await ws_manager.broadcast(
            make_ws_event("telemetry_update", telemetry.model_dump(), vehicle_id=telemetry.vehicle_id)
        )

    async def _evaluate_state_transitions(self, all_tel: List[VehicleTelemetry]):
        """Detects vehicle state transitions and triggers deduplicated real push/in-app notifications."""
        for tel in all_tel:
            vid = tel.vehicle_id
            curr_status = tel.charging_status
            curr_soc = tel.current_soc
            target_soc = tel.target_soc
            plugged_in = tel.plug_status
            power_kw = tel.charging_power_kw

            sim_v = simulator.get_vehicle(vid)
            make = sim_v.manufacturer if sim_v else "EV"
            model = sim_v.model if sim_v else vid
            vehicle_name = f"{make} {model}"
            user_id = getattr(sim_v, "user_id", None) or "user_demo_01"

            prev = self._previous_states.get(vid)
            if prev is None:
                self._previous_states[vid] = {
                    "charging_status": curr_status,
                    "current_soc": curr_soc,
                    "target_soc": target_soc,
                    "is_plugged_in": plugged_in,
                    "charging_power_kw": power_kw,
                    "departure_risk": False,
                }
                continue

            prev_status = prev.get("charging_status")
            prev_plugged = prev.get("is_plugged_in")
            prev_power = prev.get("charging_power_kw", 0.0)
            prev_risk = prev.get("departure_risk", False)

            curr_risk = False
            if curr_status in ("paused", "charging") and power_kw < 2.0 and (target_soc - curr_soc) > 30.0:
                curr_risk = True

            # 1. PUSH: Charging Started
            if prev_status != "charging" and curr_status == "charging":
                await NotificationService.create_notification(
                    user_id=user_id,
                    event_type=NotificationEventType.CHARGING_START,
                    title="Charging Started",
                    message=f"Your {vehicle_name} has started charging.",
                    severity=NotificationSeverity.INFO,
                    metadata={"vehicle_id": vid, "soc": curr_soc}
                )

            # 2. PUSH: Charging Completed
            elif prev_status == "charging" and (curr_status in ("completed", "target_reached") or curr_soc >= target_soc):
                await NotificationService.create_notification(
                    user_id=user_id,
                    event_type=NotificationEventType.CHARGING_COMPLETED,
                    title="Charging Completed",
                    message=f"Your {vehicle_name} has completed charging.",
                    severity=NotificationSeverity.SUCCESS,
                    metadata={"vehicle_id": vid, "soc": curr_soc}
                )

            # 3. PUSH: Charging Interrupted
            elif prev_status == "charging" and curr_status in ("paused", "error", "unplugged") and curr_soc < target_soc:
                await NotificationService.create_notification(
                    user_id=user_id,
                    event_type=NotificationEventType.CHARGING_INTERRUPTED,
                    title="Charging Interrupted",
                    message=f"Charging Interrupted: Your {vehicle_name} charging session was stopped.",
                    severity=NotificationSeverity.WARNING,
                    metadata={"vehicle_id": vid, "soc": curr_soc}
                )

            # 4. PUSH: Departure Risk
            if not prev_risk and curr_risk:
                await NotificationService.create_notification(
                    user_id=user_id,
                    event_type=NotificationEventType.DEPARTURE_RISK,
                    title="Departure Risk Warning",
                    message=f"Departure Risk: Your {vehicle_name} may not reach target charge before departure.",
                    severity=NotificationSeverity.URGENT,
                    metadata={"vehicle_id": vid}
                )

            # 5. INFORMATIONAL: Plug/Unplug
            if prev_plugged != plugged_in:
                title = "Vehicle Plugged In" if plugged_in else "Vehicle Unplugged"
                msg = f"{vehicle_name} was plugged into charger." if plugged_in else f"{vehicle_name} was unplugged."
                await NotificationService.create_notification(
                    user_id=user_id,
                    event_type=NotificationEventType.PLUG_EVENT if plugged_in else NotificationEventType.UNPLUG_EVENT,
                    title=title,
                    message=msg,
                    severity=NotificationSeverity.INFO,
                    metadata={"vehicle_id": vid}
                )

            # 6. INFORMATIONAL: Charging Rate Slowed
            if prev_power > 5.0 and power_kw <= 3.5 and curr_status == "charging":
                await NotificationService.create_notification(
                    user_id=user_id,
                    event_type=NotificationEventType.CHARGING_SLOWED,
                    title="Charging Slowed",
                    message=f"Charging rate adjusted for {vehicle_name} to protect building load.",
                    severity=NotificationSeverity.INFO,
                    metadata={"vehicle_id": vid, "power_kw": power_kw}
                )

            # 7. INFORMATIONAL: Departure Guaranteed
            if prev_risk and not curr_risk:
                await NotificationService.create_notification(
                    user_id=user_id,
                    event_type=NotificationEventType.DEPARTURE_GUARANTEED,
                    title="Departure Guaranteed",
                    message=f"Target battery level for {vehicle_name} is on track for departure.",
                    severity=NotificationSeverity.SUCCESS,
                    metadata={"vehicle_id": vid}
                )

            self._previous_states[vid] = {
                "charging_status": curr_status,
                "current_soc": curr_soc,
                "target_soc": target_soc,
                "is_plugged_in": plugged_in,
                "charging_power_kw": power_kw,
                "departure_risk": curr_risk,
            }

    async def tick_simulation(self, delta_seconds: float = 1.0) -> List[VehicleTelemetry]:
        """
        Advances the simulator physical tick, evaluates state transitions, updates cache, and broadcasts telemetry.
        """
        simulator.tick(delta_seconds=delta_seconds)
        all_tel = simulator.get_all_telemetry()
        for tel in all_tel:
            self._cache[tel.vehicle_id] = tel

        await self._evaluate_state_transitions(all_tel)

        # Broadcast fleet summary or active telemetry
        active_tel = self._cache.get(simulator.active_vehicle_id, all_tel[0] if all_tel else None)
        if active_tel:
            await ws_manager.broadcast(
                make_ws_event("telemetry_update", active_tel.model_dump(), vehicle_id=active_tel.vehicle_id)
            )

        return all_tel

telemetry_service = TelemetryService()
