from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserContextEnum(str, Enum):
    RESIDENTIAL = "residential"
    COMMERCIAL = "commercial"

class UserProfile(BaseModel):
    model_config = {"extra": "ignore"}

    user_id: str
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    building_name: Optional[str] = None
    unit_number: Optional[str] = None
    locality: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    has_home_charger: Optional[bool] = True
    context: UserContextEnum = UserContextEnum.RESIDENTIAL
    onboarding_completed: bool = True
    created_at: str
    updated_at: str

class UserUpdate(BaseModel):
    model_config = {"extra": "ignore"}

    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    building_name: Optional[str] = None
    unit_number: Optional[str] = None
    locality: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    has_home_charger: Optional[bool] = None
    context: Optional[UserContextEnum] = None
    onboarding_completed: Optional[bool] = None
