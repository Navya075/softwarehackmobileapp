from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Optional
from pydantic import BaseModel
from firebase.auth import get_current_user, AuthUser
from services.user_service import UserService
from models.user import UserProfile, UserContextEnum, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])

class SwitchContextRequest(BaseModel):
    context: UserContextEnum

@router.get("/me", response_model=UserProfile)
async def get_my_profile(current_user: AuthUser = Depends(get_current_user)):
    """Retrieves profile of the authenticated user."""
    profile = await UserService.get_or_create_user(
        user_id=current_user.uid,
        email=current_user.email,
        name=current_user.name
    )
    return profile

@router.put("/me", response_model=UserProfile)
async def update_my_profile(
    updates: UserUpdate,
    current_user: AuthUser = Depends(get_current_user)
):
    """Updates profile of the authenticated user."""
    updated = await UserService.update_user(current_user.uid, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated

@router.post("/switch-context", response_model=UserProfile)
async def switch_user_context(
    req: SwitchContextRequest,
    current_user: AuthUser = Depends(get_current_user)
):
    """Toggles user context between Residential and Commercial."""
    updated = await UserService.update_context(current_user.uid, req.context)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated
