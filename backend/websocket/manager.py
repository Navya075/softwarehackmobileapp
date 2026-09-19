import logging
import asyncio
from typing import List, Dict, Set
from fastapi import WebSocket

logger = logging.getLogger("voltflow.websocket")

class WebSocketManager:
    """
    Robust WebSocket Connection Manager for `/ws/live`.
    Supports multiple connected clients, targeted user notifications, and broadcast telemetry.
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[str, Set[WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, user_id: str = "guest"):
        await websocket.accept()
        async with self._lock:
            self.active_connections.append(websocket)
            if user_id not in self.user_connections:
                self.user_connections[user_id] = set()
            self.user_connections[user_id].add(websocket)
        logger.info("WebSocket client connected. Total active: %d", len(self.active_connections))

    async def disconnect(self, websocket: WebSocket, user_id: str = "guest"):
        async with self._lock:
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)
            if user_id in self.user_connections and websocket in self.user_connections[user_id]:
                self.user_connections[user_id].remove(websocket)
                if not self.user_connections[user_id]:
                    del self.user_connections[user_id]
        logger.info("WebSocket client disconnected. Total active: %d", len(self.active_connections))

    async def broadcast(self, message: dict):
        """Broadcasts event payload to all connected clients."""
        dead_connections = []
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.append(connection)
        
        if dead_connections:
            async with self._lock:
                for dc in dead_connections:
                    if dc in self.active_connections:
                        self.active_connections.remove(dc)

    async def send_to_user(self, user_id: str, message: dict):
        """Sends targeted event payload to all sockets belonging to a specific user."""
        sockets = list(self.user_connections.get(user_id, set()))
        dead_connections = []
        for socket in sockets:
            try:
                await socket.send_json(message)
            except Exception:
                dead_connections.append(socket)
        
        if dead_connections:
            async with self._lock:
                for dc in dead_connections:
                    if user_id in self.user_connections and dc in self.user_connections[user_id]:
                        self.user_connections[user_id].remove(dc)

ws_manager = WebSocketManager()
