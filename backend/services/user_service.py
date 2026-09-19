from datetime import datetime, timezone
from typing import Optional
from firebase.firestore import FirestoreRepository
from models.user import UserProfile, UserContextEnum, UserUpdate
from config import settings

class UserService:
    COLLECTION = "users"

    @classmethod
    async def get_or_create_user(
        cls, user_id: str, email: str, name: Optional[str] = None
    ) -> UserProfile:
        doc = await FirestoreRepository.get(cls.COLLECTION, user_id)
        now = datetime.now(timezone.utc).isoformat()
        if not doc:
            user = UserProfile(
                user_id=user_id,
                name=name or email.split("@")[0],
                email=email,
                phone="+1 (555) 234-5678",
                address="San Francisco, CA",
                context=UserContextEnum.RESIDENTIAL,
                onboarding_completed=True,
                created_at=now,
                updated_at=now,
            )
            await FirestoreRepository.set(cls.COLLECTION, user_id, user.model_dump())
            return user
        return UserProfile(**doc)

    @classmethod
    async def update_user(cls, user_id: str, updates: UserUpdate) -> Optional[UserProfile]:
        await cls.get_or_create_user(user_id, f"{user_id}@voltflow.io")
        data = updates.model_dump(exclude_unset=True)
        if not data:
            doc = await FirestoreRepository.get(cls.COLLECTION, user_id)
            return UserProfile(**doc) if doc else None

        # Synthesize full address for backward compatibility if location fields are updated
        if "address" not in data or not data["address"]:
            parts = [p for p in [data.get("unit_number"), data.get("building_name"), data.get("locality"), data.get("city"), data.get("pincode")] if p]
            if parts:
                data["address"] = ", ".join(parts)

        data["updated_at"] = datetime.now(timezone.utc).isoformat()
        updated = await FirestoreRepository.update(cls.COLLECTION, user_id, data)
        return UserProfile(**updated) if updated else None

    @classmethod
    async def update_context(cls, user_id: str, context: UserContextEnum) -> Optional[UserProfile]:
        return await cls.update_user(user_id, UserUpdate(context=context))
