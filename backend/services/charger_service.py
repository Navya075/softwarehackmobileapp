from typing import List, Optional
from firebase.firestore import FirestoreRepository
from models.charger import ChargerItem, ChargerStatusEnum, BookingSlotItem

INITIAL_CHARGERS = [
    ChargerItem(
        charger_id="ch_phoenix_07",
        name="Phoenix Mall Fast Hub",
        location="B2 Parking, Slot C07",
        address="Hitec City, Main Road",
        latitude=17.4435,
        longitude=78.3772,
        connector="CCS2",
        charging_type="DC Fast",
        power_kw=120.0,
        price_per_kwh=12.0,
        parking_price_per_hour=30.0,
        status=ChargerStatusEnum.AVAILABLE,
        total_slots=8,
        available_slots=3,
        is_solar_powered=True,
        context="commercial",
    ),
    ChargerItem(
        charger_id="ch_green_res_01",
        name="Green Residency Community",
        location="Tower 4 Basement (C01)",
        address="Gachibowli Financial Dist",
        latitude=17.4410,
        longitude=78.3750,
        connector="Type 2",
        charging_type="Level 2 AC",
        power_kw=11.0,
        price_per_kwh=4.5,
        parking_price_per_hour=0.0,
        status=ChargerStatusEnum.AVAILABLE,
        total_slots=3,
        available_slots=2,
        is_solar_powered=True,
        context="residential",
    ),
    ChargerItem(
        charger_id="ch_cyber_towers",
        name="Cyber Towers Workplace Hub",
        location="Gate 3 Visitor Parking",
        address="Madhapur IT Corridor",
        latitude=17.4504,
        longitude=78.3808,
        connector="CCS2",
        charging_type="DC Fast",
        power_kw=60.0,
        price_per_kwh=10.0,
        parking_price_per_hour=20.0,
        status=ChargerStatusEnum.AVAILABLE,
        total_slots=10,
        available_slots=5,
        is_solar_powered=False,
        context="commercial",
    ),
    ChargerItem(
        charger_id="ch_orbit_tech",
        name="Orbit Tech Park Fleet Station",
        location="Podium Level 1",
        address="Knowledge City Road",
        latitude=17.4320,
        longitude=78.3860,
        connector="Type 2",
        charging_type="Level 2 AC",
        power_kw=22.0,
        price_per_kwh=7.0,
        parking_price_per_hour=15.0,
        status=ChargerStatusEnum.AVAILABLE,
        total_slots=6,
        available_slots=4,
        is_solar_powered=True,
        context="commercial",
    ),
    ChargerItem(
        charger_id="ch_inorbit_mall",
        name="Inorbit Superhub",
        location="Lower Ground B1",
        address="Durgam Cheruvu View",
        latitude=17.4344,
        longitude=78.3868,
        connector="CCS2",
        charging_type="DC Fast",
        power_kw=150.0,
        price_per_kwh=14.0,
        parking_price_per_hour=40.0,
        status=ChargerStatusEnum.AVAILABLE,
        total_slots=12,
        available_slots=6,
        is_solar_powered=True,
        context="commercial",
    ),
]

SLOT_SCHEDULES = [
    {"slot_id": "slot_0900", "time_range": "09:00 AM – 10:00 AM", "status_tag": "Available", "tag_variant": "neutral"},
    {"slot_id": "slot_1100", "time_range": "11:00 AM – 12:30 PM", "status_tag": "Peak Solar ☀️", "tag_variant": "solar"},
    {"slot_id": "slot_1400", "time_range": "02:00 PM – 03:00 PM", "status_tag": "Available", "tag_variant": "neutral"},
    {"slot_id": "slot_1630", "time_range": "04:30 PM – 05:30 PM", "status_tag": "Available", "tag_variant": "success"},
    {"slot_id": "slot_1830", "time_range": "06:30 PM – 07:30 PM", "status_tag": "High Demand", "tag_variant": "warning"},
    {"slot_id": "slot_2000", "time_range": "08:00 PM – 09:30 PM", "status_tag": "Off-Peak Rate", "tag_variant": "success"},
]

class ChargerService:
    COLLECTION = "chargers"

    @classmethod
    async def seed_chargers_if_empty(cls):
        docs = await FirestoreRepository.query(cls.COLLECTION)
        if not docs:
            for ch in INITIAL_CHARGERS:
                await FirestoreRepository.set(cls.COLLECTION, ch.charger_id, ch.model_dump())

    @classmethod
    async def get_chargers(
        cls,
        context: Optional[str] = None,
        speed_type: Optional[str] = None,  # "ac" | "dc"
        only_available: bool = False,
        search: Optional[str] = None,
    ) -> List[ChargerItem]:
        await cls.seed_chargers_if_empty()
        docs = await FirestoreRepository.query(cls.COLLECTION)
        chargers = [ChargerItem(**d) for d in docs]

        if context:
            chargers = [c for c in chargers if c.context == context]
        if speed_type:
            st = speed_type.lower()
            if st == "dc":
                chargers = [c for c in chargers if "DC" in c.charging_type or "Ultra" in c.charging_type]
            elif st == "ac":
                chargers = [c for c in chargers if "AC" in c.charging_type or "Level 2" in c.charging_type]
        if only_available:
            chargers = [c for c in chargers if c.available_slots > 0 and c.status == ChargerStatusEnum.AVAILABLE]
        if search and search.strip():
            q = search.lower()
            chargers = [c for c in chargers if q in c.name.lower() or q in c.location.lower()]
            
        return chargers

    @classmethod
    async def get_charger(cls, charger_id: str) -> Optional[ChargerItem]:
        await cls.seed_chargers_if_empty()
        doc = await FirestoreRepository.get(cls.COLLECTION, charger_id)
        return ChargerItem(**doc) if doc else None

    @classmethod
    async def get_available_slots(cls, charger_id: str, date: str) -> List[BookingSlotItem]:
        """
        Calculates slot availability for charger and date.
        Checks reservations to ensure booked slots show as non-available.
        """
        charger = await cls.get_charger(charger_id)
        price = charger.pricePerKwh if hasattr(charger, "pricePerKwh") else (charger.price_per_kwh if charger else 12.0)
        
        # Query active reservations for this charger and date to prevent double-booking
        from .reservation_service import ReservationService
        booked_times = await ReservationService.get_booked_times(charger_id, date)

        slots = []
        for s in SLOT_SCHEDULES:
            time_range = s["time_range"]
            is_booked = time_range in booked_times
            
            slots.append(BookingSlotItem(
                slot_id=s["slot_id"],
                time_range=time_range,
                is_available=not is_booked,
                status_tag="Booked" if is_booked else s["status_tag"],
                tag_variant="warning" if is_booked else s["tag_variant"],
                price_per_kwh=price
            ))
        return slots
