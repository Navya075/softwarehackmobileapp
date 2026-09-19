import os
from typing import List
from pydantic import BaseModel, Field

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

class Settings(BaseModel):
    PROJECT_NAME: str = "VoltFlow Platform API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Firebase configuration
    FIREBASE_CREDENTIALS_PATH: str = Field(default_factory=lambda: os.getenv("FIREBASE_CREDENTIALS_PATH", ""))
    FIREBASE_PROJECT_ID: str = Field(default_factory=lambda: os.getenv("FIREBASE_PROJECT_ID", "volt-flow-560cc"))
    DEMO_MODE: bool = Field(default_factory=lambda: os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes"))
    
    # Twilio & WhatsApp configuration
    TWILIO_ACCOUNT_SID: str = Field(default_factory=lambda: os.getenv("TWILIO_ACCOUNT_SID", ""))
    TWILIO_AUTH_TOKEN: str = Field(default_factory=lambda: os.getenv("TWILIO_AUTH_TOKEN", ""))
    TWILIO_API_KEY_SID: str = Field(default_factory=lambda: os.getenv("TWILIO_API_KEY_SID", ""))
    TWILIO_API_KEY_SECRET: str = Field(default_factory=lambda: os.getenv("TWILIO_API_KEY_SECRET", ""))
    TWILIO_WHATSAPP_FROM: str = Field(default_factory=lambda: os.getenv("TWILIO_WHATSAPP_FROM", ""))
    TWILIO_WHATSAPP_TO: str = Field(default_factory=lambda: os.getenv("TWILIO_WHATSAPP_TO", ""))
    TWILIO_WHATSAPP_CONTENT_SID: str = Field(default_factory=lambda: os.getenv("TWILIO_WHATSAPP_CONTENT_SID", ""))
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    # Simulation defaults
    DEFAULT_SIMULATION_SPEED: int = 1
    
    # Demo User
    DEMO_USER_ID: str = "user_demo_01"
    DEMO_USER_EMAIL: str = "alex.rivera@mobility.io"
    DEMO_USER_NAME: str = "Alex Rivera"

settings = Settings()
