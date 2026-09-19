import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from firebase.firestore import FirestoreRepository
from models.reservation import ReservationItem, ReservationCreate, ReservationStatusEnum
from models.notification import NotificationEventType, NotificationSeverity

class ReservationService:
    COLLECTION = "reservations"

    @classmethod
    async def get_booked_times(cls, charger_id: str, date: str) -> List[str]:
        """Returns all confirmed slot time ranges for a charger on a date."""
        docs = await FirestoreRepository.query(
            cls.COLLECTION,
            filters=[
                ("charger_id", "==", charger_id),
                ("date", "==", date),
                ("status", "==", ReservationStatusEnum.CONFIRMED.value),
            ]
        )
        return [f"{d.get('start_time')} – {d.get('end_time')}" for d in docs]

    @classmethod
    async def create_reservation(cls, user_id: str, data: ReservationCreate) -> ReservationItem:
        # Check slot availability & prevent double-booking
        time_slot = data.time_slot
        booked_times = await cls.get_booked_times(data.charger_id, data.date)
        if time_slot in booked_times:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Time slot '{time_slot}' on {data.date} is already reserved. Please pick another slot."
            )

        from .charger_service import ChargerService
        charger = await ChargerService.get_charger(data.charger_id)
        charger_name = charger.name if charger else "EV Fast Charger"
        location = charger.location if charger else "Main Hub"
        price_per_kwh = charger.price_per_kwh if charger else 12.0
        parking_rate = charger.parking_price_per_hour if charger else 30.0

        times = [t.strip() for t in time_slot.split("–")]
        start_time = times[0] if len(times) > 0 else "04:30 PM"
        end_time = times[1] if len(times) > 1 else "05:30 PM"

        energy_cost = round((data.estimated_kwh or 16.0) * price_per_kwh, 2)
        parking_cost = float(parking_rate)
        service_fee = 15.0
        total_cost = round(energy_cost + parking_cost + service_fee, 2)

        reservation_id = f"res_{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc).isoformat()

        reservation = ReservationItem(
            reservation_id=reservation_id,
            user_id=user_id,
            vehicle_id=data.vehicle_id,
            charger_id=data.charger_id,
            charger_name=charger_name,
            location=location,
            date=data.date,
            start_time=start_time,
            end_time=end_time,
            status=ReservationStatusEnum.CONFIRMED,
            estimated_energy_kwh=data.estimated_kwh or 16.0,
            estimated_charging_cost=energy_cost,
            parking_cost=parking_cost,
            service_fee=service_fee,
            total_estimated_cost=total_cost,
            created_at=now,
        )

        await FirestoreRepository.set(cls.COLLECTION, reservation_id, reservation.model_dump())

        # Notify user
        from .notification_service import NotificationService
        await NotificationService.create_notification(
            user_id=user_id,
            event_type=NotificationEventType.RESERVATION_CONFIRMED,
            title="Charger Slot Reserved",
            message=f"Reserved {charger_name} for {data.date} at {time_slot}. 15-minute grace period active.",
            severity=NotificationSeverity.SUCCESS
        )

        return reservation

    @classmethod
    async def get_user_reservations(cls, user_id: str) -> List[ReservationItem]:
        docs = await FirestoreRepository.query(
            cls.COLLECTION,
            filters=[("user_id", "==", user_id)],
            order_by="created_at",
            descending=True
        )
        return [ReservationItem(**d) for d in docs]

    @classmethod
    async def get_reservation(cls, reservation_id: str, user_id: str) -> Optional[ReservationItem]:
        doc = await FirestoreRepository.get(cls.COLLECTION, reservation_id)
        if not doc:
            return None
        res = ReservationItem(**doc)
        if res.user_id != user_id:
            return None
        return res

    @classmethod
    async def cancel_reservation(cls, reservation_id: str, user_id: str) -> Optional[ReservationItem]:
        res = await cls.get_reservation(reservation_id, user_id)
        if not res:
            return None

        res.status = ReservationStatusEnum.CANCELLED
        await FirestoreRepository.update(cls.COLLECTION, reservation_id, {"status": ReservationStatusEnum.CANCELLED.value})

        from .notification_service import NotificationService
        await NotificationService.create_notification(
            user_id=user_id,
            event_type=NotificationEventType.RESERVATION_CANCELLED,
            title="Reservation Cancelled",
            message=f"Your booking for {res.charger_name} on {res.date} ({res.start_time}) was cancelled.",
            severity=NotificationSeverity.INFO
        )

        return res
