from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from firebase.auth import get_current_user, AuthUser
from services.history_service import HistoryService
from models.charging import ChargingSession

router = APIRouter(prefix="/history", tags=["History"])

@router.get("", response_model=List[ChargingSession])
async def list_history(
    date: Optional[str] = Query(None, description="filter sessions by date string e.g. 2026-09"),
    current_user: AuthUser = Depends(get_current_user)
):
    """Lists past charging sessions for the current user."""
    return await HistoryService.get_history(current_user.uid, date_filter=date)

@router.get("/{session_id}", response_model=ChargingSession)
async def get_history_session(
    session_id: str,
    current_user: AuthUser = Depends(get_current_user)
):
    """Retrieves specific past charging session details."""
    session = await HistoryService.get_session_details(session_id, current_user.uid)
    if not session:
        raise HTTPException(status_code=404, detail="Historical session not found")
    return session
