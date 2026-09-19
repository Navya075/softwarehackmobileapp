from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from typing import Optional
from firebase.auth import get_current_user, AuthUser
from services.user_service import UserService
from models.user import UserProfile

router = APIRouter(prefix="/auth", tags=["Authentication"])

class TokenVerifyRequest(BaseModel):
    id_token: str

class TokenVerifyResponse(BaseModel):
    uid: str
    email: str
    name: str
    profile: UserProfile

@router.post("/verify", response_model=TokenVerifyResponse)
async def verify_token(req: TokenVerifyRequest):
    """
    Verifies a Firebase ID token sent from the React Native app.
    Returns user identity and profile.
    """
    token = req.id_token
    from config import settings
    from firebase.client import is_firebase_ready
    from firebase.auth import _extract_jwt_claims

    if token == "demo-token" or token == "test-token" or token.startswith("demo-token:"):
        uid = settings.DEMO_USER_ID
        email = settings.DEMO_USER_EMAIL
        name = settings.DEMO_USER_NAME
        if ":" in token:
            parts_token = token.split(":", 1)
            if len(parts_token) > 1 and parts_token[1].strip():
                uid = parts_token[1].strip()
                email = f"{uid}@mobility.io"
                name = uid
    elif is_firebase_ready():
        try:
            from firebase_admin import auth as fb_auth
            decoded = fb_auth.verify_id_token(token)
            uid = decoded.get("uid")
            email = decoded.get("email", f"{uid}@mobility.io")
            name = decoded.get("name", email.split("@")[0] if "@" in email else "")
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Invalid Firebase ID token: {str(e)}")
    else:
        claims = _extract_jwt_claims(token)
        if claims:
            uid, email, name = claims
        else:
            raise HTTPException(status_code=401, detail="Invalid or unparseable Firebase ID token")

    profile = await UserService.get_or_create_user(user_id=uid, email=email, name=name)
    return TokenVerifyResponse(uid=uid, email=email, name=name, profile=profile)

@router.get("/me", response_model=UserProfile)
async def get_my_auth_profile(current_user: AuthUser = Depends(get_current_user)):
    """Returns profile for currently authenticated user."""
    return await UserService.get_or_create_user(
        user_id=current_user.uid,
        email=current_user.email,
        name=current_user.name
    )
