import uuid
from datetime import datetime, timezone
from typing import List, Optional
from firebase.firestore import FirestoreRepository
from models.trip import TripItem, TripCreate
from simulator.simulator import simulator

INITIAL_TRIPS = [
    {
        "trip_id": "trip_hyd_vja",
        "user_id": "user_demo_01",
        "vehicle_id": "EV-001",
        "origin": "Hyderabad",
        "destination": "Vijayawada",
        "distance_km": 275.0,
        "current_range_km": 180.0,
        "recommended_target_soc": 92.0,
        "additional_energy_required_kwh": 16.5,
        "estimated_charging_time_min": 22,
        "created_at": "2026-09-18T10:00:00Z"
    }
]

class TripService:
    COLLECTION = "trips"

    @classmethod
    async def seed_if_empty(cls, user_id: str):
        docs = await FirestoreRepository.query(cls.COLLECTION, filters=[("user_id", "==", user_id)])
        if not docs and user_id == "user_demo_01":
            for t in INITIAL_TRIPS:
                await FirestoreRepository.set(cls.COLLECTION, t["trip_id"], t)

    @classmethod
    async def get_user_trips(cls, user_id: str) -> List[TripItem]:
        await cls.seed_if_empty(user_id)
        docs = await FirestoreRepository.query(cls.COLLECTION, filters=[("user_id", "==", user_id)])
        return [TripItem(**d) for d in docs]

    @classmethod
    async def get_trip(cls, trip_id: str, user_id: str) -> Optional[TripItem]:
        await cls.seed_if_empty(user_id)
        doc = await FirestoreRepository.get(cls.COLLECTION, trip_id)
        if not doc:
            return None
        item = TripItem(**doc)
        if item.user_id != user_id:
            return None
        return item

    @classmethod
    async def create_trip(cls, user_id: str, data: TripCreate) -> TripItem:
        trip_id = f"trip_{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc).isoformat()
        telemetry = simulator.get_telemetry(data.vehicle_id)
        
        current_range = telemetry.estimated_range_km
        diff_km = max(0.0, data.distance_km - current_range)
        extra_kwh = round(diff_km / 6.5, 1) if diff_km > 0 else 0.0
        
        trip = TripItem(
            trip_id=trip_id,
            user_id=user_id,
            vehicle_id=data.vehicle_id,
            origin=data.origin,
            destination=data.destination,
            distance_km=data.distance_km,
            current_range_km=current_range,
            recommended_target_soc=min(100.0, max(85.0, round((data.distance_km / 350.0) * 100.0))),
            additional_energy_required_kwh=extra_kwh,
            estimated_charging_time_min=round(extra_kwh / 0.8) if extra_kwh > 0 else 0,
            created_at=now
        )
        await FirestoreRepository.set(cls.COLLECTION, trip_id, trip.model_dump())
        return trip

    @classmethod
    async def delete_trip(cls, trip_id: str, user_id: str) -> bool:
        trip = await cls.get_trip(trip_id, user_id)
        if not trip:
            return False
        return await FirestoreRepository.delete(cls.COLLECTION, trip_id)
