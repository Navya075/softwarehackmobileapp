import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from websocket.manager import ws_manager
from websocket.events import make_ws_event
from services.telemetry_service import telemetry_service
from services.charger_service import ChargerService

# Routers
from routers.auth import router as auth_router
from routers.users import router as users_router
from routers.vehicles import router as vehicles_router
from routers.charging import router as charging_router
from routers.chargers import router as chargers_router
from routers.reservations import router as reservations_router
from routers.billing import router as billing_router
from routers.history import router as history_router
from routers.notifications import router as notifications_router
from routers.telemetry import router as telemetry_router
from routers.trips import router as trips_router
from routers.reports import router as reports_router
from routers.simulator import router as simulator_router
from routers.optimizer import router as optimizer_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voltflow.main")

# Background simulation broadcast task
simulation_task: asyncio.Task | None = None

async def _simulator_background_loop():
    """Advances simulator physical ticks every second and streams telemetry via WebSockets."""
    logger.info("Simulator background ticker started")
    try:
        while True:
            await asyncio.sleep(1.0)
            try:
                await telemetry_service.tick_simulation(delta_seconds=1.0)
            except Exception as e:
                logger.error("Error in simulator background tick: %s", e)
    except asyncio.CancelledError:
        logger.info("Simulator background ticker stopped")

@asynccontextmanager
async def lifespan(app: FastAPI):
    global simulation_task
    # Startup: initialize Firebase Admin SDK, seed chargers, start background physics ticker
    try:
        from firebase.client import init_firebase
        init_firebase(
            credentials_path=settings.FIREBASE_CREDENTIALS_PATH,
            project_id=settings.FIREBASE_PROJECT_ID
        )
    except Exception as e:
        logger.warning("Could not initialize Firebase Admin SDK on startup: %s", e)

    try:
        await ChargerService.seed_chargers_if_empty()
    except Exception as e:
        logger.warning("Could not seed chargers on startup: %s", e)
    
    simulation_task = asyncio.create_task(_simulator_background_loop())
    yield
    # Shutdown
    if simulation_task:
        simulation_task.cancel()
        try:
            await simulation_task
        except asyncio.CancelledError:
            pass

app = FastAPI(
    title="VoltFlow EV Telemetry & Charging Platform API",
    version="2.0.0",
    description=(
        "Full FastAPI Backend for EV Owner Mobile App and Control Room. "
        "Includes Firebase Auth verification, Firestore repository, vehicle management, "
        "charging sessions, reservations, billing, reports, multi-vehicle simulation, "
        "and clean external optimizer integration interface."
    ),
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers under /api
app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(vehicles_router, prefix="/api")
app.include_router(charging_router, prefix="/api")
app.include_router(chargers_router, prefix="/api")
app.include_router(reservations_router, prefix="/api")
app.include_router(billing_router, prefix="/api")
app.include_router(history_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(telemetry_router, prefix="/api")
app.include_router(trips_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(simulator_router, prefix="/api")
app.include_router(optimizer_router, prefix="/api")

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "VoltFlow EV Platform Backend",
        "version": "2.0.0",
        "demo_mode": settings.DEMO_MODE,
        "features": [
            "firebase-auth",
            "firestore-repository",
            "vehicle-management",
            "battery-health-tracking",
            "charging-sessions",
            "chargers-and-reservations",
            "double-booking-prevention-409",
            "billing-and-history",
            "carbon-reports",
            "in-memory-telemetry",
            "websocket-streaming",
            "multi-vehicle-simulator",
            "optimizer-adapter-interface"
        ]
    }

# Unified WebSocket endpoint /ws/live
@app.websocket("/ws/live")
async def live_websocket_endpoint(websocket: WebSocket, user_id: str = Query("guest")):
    """
    Real-time event and telemetry stream.
    Streams:
    - `telemetry_update`: Real-time vehicle physics, SOC, power, voltage, completion time
    - `charging_state_change`: Started, paused, resumed, completed
    - `notification`: Targeted customer notifications
    - `grid_state_change`: Building load and solar conditions
    """
    await ws_manager.connect(websocket, user_id=user_id)
    try:
        # Send initial snapshot immediately upon connection
        tel = telemetry_service.get_vehicle_telemetry()
        await websocket.send_json(make_ws_event("telemetry_snapshot", tel.model_dump()))
        
        while True:
            # Keep-alive heartbeat listener
            msg = await websocket.receive_text()
            if msg == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket, user_id=user_id)
    except Exception as e:
        logger.error("WebSocket exception: %s", e)
        await ws_manager.disconnect(websocket, user_id=user_id)

# Legacy alias for backward compatibility
@app.websocket("/ws/telemetry")
async def legacy_websocket_endpoint(websocket: WebSocket):
    await live_websocket_endpoint(websocket, user_id="guest")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

