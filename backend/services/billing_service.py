import uuid
from datetime import datetime, timezone
from typing import List, Optional
from firebase.firestore import FirestoreRepository
from models.billing import BillItem, BillingSummary
from models.charging import ChargingSession

INITIAL_BILLS = [
    {
        "bill_id": "bill_2026_09_18",
        "user_id": "user_demo_01",
        "vehicle_id": "EV-001",
        "session_id": "sess_1",
        "reservation_id": None,
        "charger_name": "Home Level 2 (Green Residency)",
        "energy_kwh": 18.2,
        "energy_cost": 118.0,
        "parking_cost": 0.0,
        "service_fee": 0.0,
        "total_cost": 118.0,
        "currency": "INR",
        "status": "paid",
        "created_at": "2026-09-18T06:45:00Z",
    },
    {
        "bill_id": "bill_2026_09_16",
        "user_id": "user_demo_01",
        "vehicle_id": "EV-001",
        "session_id": "sess_2",
        "reservation_id": None,
        "charger_name": "Home Level 2 (Green Residency)",
        "energy_kwh": 24.5,
        "energy_cost": 142.0,
        "parking_cost": 0.0,
        "service_fee": 0.0,
        "total_cost": 142.0,
        "currency": "INR",
        "status": "paid",
        "created_at": "2026-09-16T07:15:00Z",
    },
    {
        "bill_id": "bill_2026_09_14",
        "user_id": "user_demo_01",
        "vehicle_id": "EV-001",
        "session_id": "sess_3",
        "reservation_id": "res_demo_14",
        "charger_name": "Phoenix Mall Fast Hub",
        "energy_kwh": 15.0,
        "energy_cost": 180.0,
        "parking_cost": 30.0,
        "service_fee": 15.0,
        "total_cost": 225.0,
        "currency": "INR",
        "status": "paid",
        "created_at": "2026-09-14T17:30:00Z",
    },
]

class BillingService:
    COLLECTION = "billing"

    @classmethod
    async def seed_if_empty(cls, user_id: str):
        docs = await FirestoreRepository.query(cls.COLLECTION, filters=[("user_id", "==", user_id)])
        if not docs and user_id == "user_demo_01":
            for b in INITIAL_BILLS:
                await FirestoreRepository.set(cls.COLLECTION, b["bill_id"], b)

    @classmethod
    async def get_user_bills(cls, user_id: str) -> List[BillItem]:
        await cls.seed_if_empty(user_id)
        docs = await FirestoreRepository.query(
            cls.COLLECTION,
            filters=[("user_id", "==", user_id)],
            order_by="created_at",
            descending=True
        )
        return [BillItem(**d) for d in docs]

    @classmethod
    async def get_bill(cls, bill_id: str, user_id: str) -> Optional[BillItem]:
        await cls.seed_if_empty(user_id)
        doc = await FirestoreRepository.get(cls.COLLECTION, bill_id)
        if not doc:
            return None
        bill = BillItem(**doc)
        if bill.user_id != user_id:
            return None
        return bill

    @classmethod
    async def get_billing_summary(cls, user_id: str) -> BillingSummary:
        bills = await cls.get_user_bills(user_id)
        total = round(sum(b.total_cost for b in bills), 2)
        return BillingSummary(
            total_spent=total,
            total_sessions=len(bills),
            current_month_total=total,
            currency="INR",
            bills=bills
        )

    @classmethod
    async def create_bill_for_session(cls, session: ChargingSession) -> BillItem:
        bill_id = f"bill_{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc).isoformat()
        energy_cost = round(session.energy_delivered_kwh * 6.5, 2)
        
        bill = BillItem(
            bill_id=bill_id,
            user_id=session.user_id,
            vehicle_id=session.vehicle_id,
            session_id=session.session_id,
            charger_name=session.charger_name or "EV Charger",
            energy_kwh=round(session.energy_delivered_kwh, 2),
            energy_cost=energy_cost,
            parking_cost=0.0,
            service_fee=0.0,
            total_cost=energy_cost,
            currency="INR",
            status="paid",
            created_at=now
        )
        await FirestoreRepository.set(cls.COLLECTION, bill_id, bill.model_dump())
        return bill
