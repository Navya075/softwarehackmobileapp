from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from firebase.auth import get_current_user, AuthUser
from services.reservation_service import ReservationService
from models.reservation import ReservationItem, ReservationCreate

router = APIRouter(prefix="/reservations", tags=["Reservations"])

@router.get("", response_model=List[ReservationItem])
async def list_user_reservations(current_user: AuthUser = Depends(get_current_user)):
    """Retrieves all reservations made by the current user."""
    return await ReservationService.get_user_reservations(current_user.uid)

@router.post("", response_model=ReservationItem, status_code=status.HTTP_201_CREATED)
async def create_reservation(
    booking_in: ReservationCreate,
    current_user: AuthUser = Depends(get_current_user)
):
    """
    Books a charger time slot.
    Returns HTTP 409 Conflict if the requested slot is already taken.
    """
    return await ReservationService.create_reservation(current_user.uid, booking_in)

@router.get("/{reservation_id}", response_model=ReservationItem)
async def get_reservation(
    reservation_id: str,
    current_user: AuthUser = Depends(get_current_user)
):
    """Fetches details for a specific reservation."""
    res = await ReservationService.get_reservation(reservation_id, current_user.uid)
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return res

@router.post("/{reservation_id}/cancel", response_model=ReservationItem)
async def cancel_reservation(
    reservation_id: str,
    current_user: AuthUser = Depends(get_current_user)
):
    """Cancels a reservation and frees up the time slot."""
    res = await ReservationService.cancel_reservation(reservation_id, current_user.uid)
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found or unauthorized")
    return res
