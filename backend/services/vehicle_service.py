from datetime import datetime, timezone
from typing import List, Optional
from firebase.firestore import FirestoreRepository
from models.vehicle import VehicleProfile, VehicleCreate, VehicleUpdate, BatteryHealthData
from simulator.simulator import simulator

class VehicleService:
    COLLECTION = "vehicles"

    @classmethod
    async def get_user_vehicles(cls, user_id: str) -> List[VehicleProfile]:
        docs = await FirestoreRepository.query(cls.COLLECTION, filters=[("user_id", "==", user_id)])
        if not docs and user_id:
            # Seed default benchmark vehicle for smooth demo experience
            now = datetime.now(timezone.utc).isoformat()
            default_vehicle = VehicleProfile(
                vehicle_id="EV-001",
                user_id=user_id,
                manufacturer="Tesla",
                model="Model 3 Long Range",
                variant="Dual Motor AWD",
                year=2024,
                battery_capacity_kwh=75.0,
                usable_battery_capacity_kwh=71.2,
                battery_health_percent=94.0,
                current_soc=48.0,
                target_soc=85.0,
                max_charging_power_kw=11.0,
                ac_charging_power_kw=11.0,
                dc_charging_power_kw=170.0,
                connector="CCS2 / Type 2",
                estimated_range_km=156.0,
                plugged_in=True,
                charging_status="charging",
                created_at=now,
                updated_at=now,
            )
            await FirestoreRepository.set(cls.COLLECTION, "EV-001", default_vehicle.model_dump())
            return [default_vehicle]
        return [VehicleProfile(**d) for d in docs]

    @classmethod
    async def get_vehicle(cls, vehicle_id: str, user_id: Optional[str] = None) -> Optional[VehicleProfile]:
        doc = await FirestoreRepository.get(cls.COLLECTION, vehicle_id)
        if not doc and vehicle_id == "EV-001":
            # Auto-seed EV-001 if requested directly
            vehicles = await cls.get_user_vehicles(user_id or "user_demo_01")
            return vehicles[0] if vehicles else None
        if not doc:
            return None
        profile = VehicleProfile(**doc)
        if user_id and profile.user_id != user_id:
            return None
        return profile

    @classmethod
    async def create_vehicle(cls, user_id: str, vehicle_in: VehicleCreate) -> VehicleProfile:
        import uuid
        now = datetime.now(timezone.utc).isoformat()
        vehicle_id = f"EV-{uuid.uuid4().hex[:6].upper()}"
        usable = vehicle_in.usable_battery_capacity_kwh or (vehicle_in.battery_capacity_kwh * 0.95)

        vehicle = VehicleProfile(
            vehicle_id=vehicle_id,
            user_id=user_id,
            vehicle_type=vehicle_in.vehicle_type or "car",
            manufacturer=vehicle_in.manufacturer,
            model=vehicle_in.model,
            variant=vehicle_in.variant,
            year=vehicle_in.year,
            battery_capacity_kwh=vehicle_in.battery_capacity_kwh,
            usable_battery_capacity_kwh=usable,
            battery_health_percent=vehicle_in.battery_health_percent or 94.0,
            current_soc=50.0,
            target_soc=85.0,
            max_charging_power_kw=vehicle_in.max_charging_power_kw or 11.0,
            ac_charging_power_kw=vehicle_in.max_charging_power_kw or 11.0,
            dc_charging_power_kw=170.0,
            connector=vehicle_in.connector or "CCS2 / Type 2",
            estimated_range_km=round((50.0 / 100.0) * (usable * 6.5), 1),
            plugged_in=False,
            charging_status="idle",
            created_at=now,
            updated_at=now,
        )
        await FirestoreRepository.set(cls.COLLECTION, vehicle_id, vehicle.model_dump())
        return vehicle

    @classmethod
    async def update_vehicle(
        cls, vehicle_id: str, user_id: str, updates: VehicleUpdate
    ) -> Optional[VehicleProfile]:
        existing = await cls.get_vehicle(vehicle_id, user_id)
        if not existing:
            return None
        
        data = updates.model_dump(exclude_unset=True)
        if not data:
            return existing
        
        data["updated_at"] = datetime.now(timezone.utc).isoformat()
        updated = await FirestoreRepository.update(cls.COLLECTION, vehicle_id, data)
        
        # Mirror change into physical simulator if present
        if "target_soc" in data:
            simulator.set_target_soc(data["target_soc"], vehicle_id)
        if "plugged_in" in data:
            if data["plugged_in"]:
                simulator.plug(vehicle_id)
            else:
                simulator.unplug(vehicle_id)
                
        return VehicleProfile(**updated) if updated else None

    @classmethod
    async def delete_vehicle(cls, vehicle_id: str, user_id: str) -> bool:
        existing = await cls.get_vehicle(vehicle_id, user_id)
        if not existing:
            return False
        return await FirestoreRepository.delete(cls.COLLECTION, vehicle_id)

    @classmethod
    async def get_battery_health(cls, vehicle_id: str, user_id: Optional[str] = None) -> Optional[BatteryHealthData]:
        """
        Retrieves dedicated Battery Health metrics (distinct from Battery Level / SOC).
        Does NOT run any unapproved degradation algorithms.
        """
        vehicle = await cls.get_vehicle(vehicle_id, user_id)
        if not vehicle:
            return None
            
        original = vehicle.battery_capacity_kwh
        usable = vehicle.usable_battery_capacity_kwh
        degradation = round(max(0.0, ((original - usable) / original) * 100.0), 1)
        
        return BatteryHealthData(
            battery_health_percent=vehicle.battery_health_percent,
            usable_capacity_kwh=usable,
            original_capacity_kwh=original,
            degradation_percent=degradation,
            cell_condition="Healthy (Uniform Voltage)",
            operating_temperature_c=28.4,
            cycle_count=84,
            last_health_update="Sep 18, 2026, 6:00 PM"
        )
