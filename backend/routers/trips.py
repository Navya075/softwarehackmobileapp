from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from firebase.auth import get_current_user, AuthUser
from services.trip_service import TripService
from models.trip import TripItem, TripCreate

router = APIRouter(prefix="/trips", tags=["Trips"])

@router.get("", response_model=List[TripItem])
async def list_trips(current_user: AuthUser = Depends(get_current_user)):
    """Retrieves all planned trips for the current user."""
    return await TripService.get_user_trips(current_user.uid)

@router.post("", response_model=TripItem, status_code=status.HTTP_201_CREATED)
async def create_trip(
    trip_in: TripCreate,
    current_user: AuthUser = Depends(get_current_user)
):
    """Calculates additional energy needed for a journey and logs the trip."""
    return await TripService.create_trip(current_user.uid, trip_in)

@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(
    trip_id: str,
    current_user: AuthUser = Depends(get_current_user)
):
    """Deletes a planned trip."""
    deleted = await TripService.delete_trip(trip_id, current_user.uid)
    if not deleted:
        raise HTTPException(status_code=404, detail="Trip not found")
    return None
