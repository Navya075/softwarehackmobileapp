from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from firebase.auth import get_current_user, AuthUser
from services.notification_service import NotificationService
from models.notification import NotificationItem, PushTokenRegistration

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.post("/register-token")
async def register_push_token(
    payload: PushTokenRegistration,
    current_user: AuthUser = Depends(get_current_user)
):
    """Registers an FCM push notification token for the current user."""
    await NotificationService.register_push_token(current_user.uid, payload.push_token)
    return {"status": "success", "user_id": current_user.uid}

@router.get("", response_model=List[NotificationItem])
async def list_notifications(current_user: AuthUser = Depends(get_current_user)):
    """Fetches all notification alerts for the current user."""
    return await NotificationService.get_notifications(current_user.uid)

@router.post("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: AuthUser = Depends(get_current_user)
):
    """Marks a specific notification as read."""
    success = await NotificationService.mark_read(notification_id, current_user.uid)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "success", "notification_id": notification_id}

@router.post("/read-all")
async def mark_all_notifications_read(current_user: AuthUser = Depends(get_current_user)):
    """Marks all user notifications as read."""
    count = await NotificationService.mark_all_read(current_user.uid)
    return {"status": "success", "updated_count": count}
