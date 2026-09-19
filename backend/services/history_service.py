from typing import List, Optional, Dict, Any
from firebase.firestore import FirestoreRepository
from models.charging import ChargingSession

INITIAL_HISTORY = [
    {
        "session_id": "hist_1",
        "user_id": "user_demo_01",
        "vehicle_id": "EV-001",
        "start_time": "2026-09-18T00:30:00Z",
        "end_time": "2026-09-18T06:15:00Z",
        "start_soc": 35.0,
        "target_soc": 85.0,
        "final_soc": 85.0,
        "energy_delivered_kwh": 18.2,
        "charging_duration_minutes": 225,
        "charging_power_kw": 3.2,
        "estimated_cost": 118.0,
        "renewable_energy_kwh": 11.6,
        "grid_energy_kwh": 6.6,
        "status": "completed",
        "charger_name": "Home Level 2 Charger",
        "location": "Green Residency"
    },
    {
        "session_id": "hist_2",
        "user_id": "user_demo_01",
        "vehicle_id": "EV-001",
        "start_time": "2026-09-16T01:10:00Z",
        "end_time": "2026-09-16T05:20:00Z",
        "start_soc": 22.0,
        "target_soc": 85.0,
        "final_soc": 85.0,
        "energy_delivered_kwh": 24.5,
        "charging_duration_minutes": 250,
        "charging_power_kw": 4.0,
        "estimated_cost": 142.0,
        "renewable_energy_kwh": 17.6,
        "grid_energy_kwh": 6.9,
        "status": "completed",
        "charger_name": "Home Level 2 Charger",
        "location": "Green Residency"
    },
    {
        "session_id": "hist_3",
        "user_id": "user_demo_01",
        "vehicle_id": "EV-001",
        "start_time": "2026-09-14T16:50:00Z",
        "end_time": "2026-09-14T17:22:00Z",
        "start_soc": 50.0,
        "target_soc": 80.0,
        "final_soc": 80.0,
        "energy_delivered_kwh": 15.0,
        "charging_duration_minutes": 32,
        "charging_power_kw": 60.0,
        "estimated_cost": 180.0,
        "renewable_energy_kwh": 6.0,
        "grid_energy_kwh": 9.0,
        "status": "completed",
        "charger_name": "Phoenix Mall Fast Hub",
        "location": "B2 Parking, Slot C07"
    },
]

class HistoryService:
    COLLECTION = "chargingHistory"

    @classmethod
    async def seed_if_empty(cls, user_id: str):
        docs = await FirestoreRepository.query(cls.COLLECTION, filters=[("user_id", "==", user_id)])
        if not docs and user_id == "user_demo_01":
            for h in INITIAL_HISTORY:
                await FirestoreRepository.set(cls.COLLECTION, h["session_id"], h)

    @classmethod
    async def get_history(cls, user_id: str, date_filter: Optional[str] = None) -> List[ChargingSession]:
        await cls.seed_if_empty(user_id)
        docs = await FirestoreRepository.query(
            cls.COLLECTION,
            filters=[("user_id", "==", user_id)],
            order_by="start_time",
            descending=True
        )
        sessions = [ChargingSession(**d) for d in docs]
        if date_filter:
            sessions = [s for s in sessions if date_filter in s.start_time]
        return sessions

    @classmethod
    async def get_session_details(cls, session_id: str, user_id: str) -> Optional[ChargingSession]:
        await cls.seed_if_empty(user_id)
        doc = await FirestoreRepository.get(cls.COLLECTION, session_id)
        if not doc:
            return None
        session = ChargingSession(**doc)
        if session.user_id != user_id:
            return None
        return session
