import uuid
from datetime import datetime, timezone
from typing import Optional, List
from firebase.firestore import FirestoreRepository
from models.charging import (
    ChargingSession,
    ChargingStatusEnum,
    ChargingPreferences,
    ChargingPreferencesUpdate,
)
from models.notification import NotificationEventType, NotificationSeverity
from simulator.simulator import simulator
from websocket.manager import ws_manager
from websocket.events import make_ws_event

class ChargingService:
    PREFERENCES_COLLECTION = "chargingPreferences"
    SESSIONS_COLLECTION = "chargingSessions"

    # --- Preferences ---
    @classmethod
    async def get_preferences(cls, user_id: str) -> ChargingPreferences:
        doc = await FirestoreRepository.get(cls.PREFERENCES_COLLECTION, user_id)
        if not doc:
            prefs = ChargingPreferences(user_id=user_id)
            await FirestoreRepository.set(cls.PREFERENCES_COLLECTION, user_id, prefs.model_dump())
            return prefs
        return ChargingPreferences(**doc)

    @classmethod
    async def update_preferences(
        cls, user_id: str, updates: ChargingPreferencesUpdate
    ) -> ChargingPreferences:
        existing = await cls.get_preferences(user_id)
        data = updates.model_dump(exclude_unset=True)
        if not data:
            return existing
        
        merged = existing.model_dump()
        merged.update(data)
        await FirestoreRepository.set(cls.PREFERENCES_COLLECTION, user_id, merged)
        
        # Mirror target SOC to simulator if changed
        if "target_soc" in data:
            simulator.set_target_soc(data["target_soc"])
            
        return ChargingPreferences(**merged)

    # --- Charging Session Lifecycle ---
    @classmethod
    async def get_current_session(cls, user_id: str) -> Optional[ChargingSession]:
        # Find active session
        sessions = await FirestoreRepository.query(
            cls.SESSIONS_COLLECTION,
            filters=[("user_id", "==", user_id), ("status", "in", ["charging", "paused"])],
            limit=1
        )
        if sessions:
            return ChargingSession(**sessions[0])
            
        # If no active session in DB, inspect simulator to reflect physical vehicle state
        telemetry = simulator.get_telemetry()
        if telemetry.charging_status in (ChargingStatusEnum.CHARGING, ChargingStatusEnum.PAUSED):
            session_id = f"sess_{user_id[:8]}_active"
            now = datetime.now(timezone.utc).isoformat()
            active_session = ChargingSession(
                session_id=session_id,
                user_id=user_id,
                vehicle_id=telemetry.vehicle_id,
                start_time=telemetry.session_start_time or now,
                start_soc=42.0,
                target_soc=telemetry.target_soc,
                energy_delivered_kwh=telemetry.energy_delivered_kwh,
                charging_duration_minutes=68,
                charging_power_kw=telemetry.charging_power_kw,
                estimated_cost=round(telemetry.energy_delivered_kwh * 6.5, 1),
                renewable_energy_kwh=round(telemetry.energy_delivered_kwh * 0.68, 1),
                grid_energy_kwh=round(telemetry.energy_delivered_kwh * 0.32, 1),
                status=telemetry.charging_status,
                charger_name="Home Level 2 Charger",
                location="Green Residency"
            )
            await FirestoreRepository.set(cls.SESSIONS_COLLECTION, session_id, active_session.model_dump())
            return active_session
        return None

    @classmethod
    async def start_session(
        cls, user_id: str, vehicle_id: str, charger_name: str = "Home Level 2 Charger", target_soc: Optional[float] = None
    ) -> ChargingSession:
        now = datetime.now(timezone.utc).isoformat()
        session_id = f"sess_{uuid.uuid4().hex[:8]}"
        telemetry = simulator.get_telemetry(vehicle_id)
        
        # Physical plug and resume in simulator
        simulator.plug(vehicle_id)
        if target_soc:
            simulator.set_target_soc(target_soc, vehicle_id)
            
        session = ChargingSession(
            session_id=session_id,
            user_id=user_id,
            vehicle_id=vehicle_id,
            start_time=now,
            start_soc=telemetry.current_soc,
            target_soc=target_soc or telemetry.target_soc,
            energy_delivered_kwh=0.0,
            charging_duration_minutes=0,
            charging_power_kw=simulator.get_vehicle(vehicle_id).charging_power_kw,
            estimated_cost=0.0,
            renewable_energy_kwh=0.0,
            grid_energy_kwh=0.0,
            status=ChargingStatusEnum.CHARGING,
            charger_name=charger_name,
            location="Green Residency"
        )
        await FirestoreRepository.set(cls.SESSIONS_COLLECTION, session_id, session.model_dump())
        
        # Broadcast event
        await ws_manager.broadcast(make_ws_event(
            "charging_state_change",
            {"action": "started", "session": session.model_dump()},
            vehicle_id=vehicle_id
        ))
        
        # Create notification
        from .notification_service import NotificationService
        await NotificationService.create_notification(
            user_id=user_id,
            event_type=NotificationEventType.CHARGING_START,
            title="Charging Started",
            message=f"Connected to {charger_name}. Target {session.target_soc}% scheduled.",
            severity=NotificationSeverity.INFO
        )
        return session

    @classmethod
    async def pause_session(cls, user_id: str, session_id: Optional[str] = None) -> Optional[ChargingSession]:
        session = await cls.get_current_session(user_id)
        if not session:
            return None
            
        simulator.pause(session.vehicle_id)
        session.status = ChargingStatusEnum.PAUSED
        session.charging_power_kw = 0.0
        await FirestoreRepository.update(cls.SESSIONS_COLLECTION, session.session_id, session.model_dump())
        
        # Broadcast
        await ws_manager.broadcast(make_ws_event(
            "charging_state_change",
            {"action": "paused", "session_id": session.session_id},
            vehicle_id=session.vehicle_id
        ))
        return session

    @classmethod
    async def resume_session(cls, user_id: str, session_id: Optional[str] = None) -> Optional[ChargingSession]:
        session = await cls.get_current_session(user_id)
        if not session:
            return None
            
        simulator.resume(session.vehicle_id)
        session.status = ChargingStatusEnum.CHARGING
        session.charging_power_kw = simulator.get_vehicle(session.vehicle_id).charging_power_kw
        await FirestoreRepository.update(cls.SESSIONS_COLLECTION, session.session_id, session.model_dump())
        
        # Broadcast
        await ws_manager.broadcast(make_ws_event(
            "charging_state_change",
            {"action": "resumed", "session_id": session.session_id},
            vehicle_id=session.vehicle_id
        ))
        return session

    @classmethod
    async def complete_session(cls, user_id: str, session_id: Optional[str] = None) -> Optional[ChargingSession]:
        session = await cls.get_current_session(user_id)
        if not session:
            return None
            
        now = datetime.now(timezone.utc).isoformat()
        telemetry = simulator.get_telemetry(session.vehicle_id)
        simulator.pause(session.vehicle_id)
        
        session.end_time = now
        session.final_soc = telemetry.current_soc
        session.status = ChargingStatusEnum.COMPLETED
        session.charging_power_kw = 0.0
        session.energy_delivered_kwh = max(session.energy_delivered_kwh, telemetry.energy_delivered_kwh)
        session.estimated_cost = round(session.energy_delivered_kwh * 6.5, 2)
        
        await FirestoreRepository.update(cls.SESSIONS_COLLECTION, session.session_id, session.model_dump())
        
        # Generate automatic Bill item
        from .billing_service import BillingService
        await BillingService.create_bill_for_session(session)
        
        # Create notification
        from .notification_service import NotificationService
        await NotificationService.create_notification(
            user_id=user_id,
            event_type=NotificationEventType.CHARGING_COMPLETED,
            title="Charging Completed",
            message=f"Reached {int(session.final_soc or 85)}%. Total {session.energy_delivered_kwh} kWh delivered (₹{int(session.estimated_cost)}).",
            severity=NotificationSeverity.SUCCESS
        )
        
        # Broadcast
        await ws_manager.broadcast(make_ws_event(
            "charging_state_change",
            {"action": "completed", "session": session.model_dump()},
            vehicle_id=session.vehicle_id
        ))
        return session

    @classmethod
    async def trigger_charge_faster(cls, user_id: str, vehicle_id: Optional[str] = None) -> ChargingPreferences:
        prefs = await cls.get_preferences(user_id)
        prefs.charge_faster = True
        await FirestoreRepository.set(cls.PREFERENCES_COLLECTION, user_id, prefs.model_dump())
        
        v = simulator.get_vehicle(vehicle_id)
        simulator.override_power(v.max_charging_power_kw, v.vehicle_id)
        simulator.resume(v.vehicle_id)
        
        from .notification_service import NotificationService
        await NotificationService.create_notification(
            user_id=user_id,
            event_type=NotificationEventType.CHARGE_FASTER_ACTIVE,
            title="Charge Faster Active",
            message="Optimizer setpoint elevated to maximum available rate for faster departure readiness.",
            severity=NotificationSeverity.INFO
        )
        return prefs

