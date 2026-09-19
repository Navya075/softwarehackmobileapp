from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from services.charger_service import ChargerService
from models.charger import ChargerItem, BookingSlotItem

router = APIRouter(prefix="/chargers", tags=["Chargers"])

@router.get("", response_model=List[ChargerItem])
async def list_chargers(
    context: Optional[str] = Query(None, description="residential or commercial filter"),
    speed: Optional[str] = Query(None, description="ac or dc filter"),
    only_available: bool = Query(False, description="only return chargers with open slots"),
    search: Optional[str] = Query(None, description="search name or location")
):
    """Lists chargers with optional filtering by context, speed, or availability."""
    return await ChargerService.get_chargers(
        context=context,
        speed_type=speed,
        only_available=only_available,
        search=search
    )

@router.get("/{charger_id}", response_model=ChargerItem)
async def get_charger(charger_id: str):
    """Retrieves specific charger details."""
    charger = await ChargerService.get_charger(charger_id)
    if not charger:
        raise HTTPException(status_code=404, detail="Charger not found")
    return charger

@router.get("/{charger_id}/slots", response_model=List[BookingSlotItem])
async def get_charger_slots(
    charger_id: str,
    date: str = Query(..., description="Date formatted as YYYY-MM-DD or readable string")
):
    """Returns time slot schedule and live availability for the charger on the given date."""
    return await ChargerService.get_available_slots(charger_id, date)
