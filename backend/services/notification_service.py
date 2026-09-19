import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from firebase.firestore import FirestoreRepository
from models.notification import (
    NotificationItem,
    NotificationEventType,
    NotificationSeverity,
)
from websocket.manager import ws_manager
from websocket.events import make_ws_event

INITIAL_NOTIFICATIONS = [
    {
        "id": "notif_1",
        "user_id": "user_demo_01",
        "timestamp": "11:15 PM",
        "type": "charging_start",
        "severity": "info",
        "title": "Charging Started",
        "message": "Connected to Level 2 home charger. Target 85% scheduled for 7:30 AM departure.",
        "read": False,
        "action_label": None,
        "metadata": None
    },
    {
        "id": "notif_2",
        "user_id": "user_demo_01",
        "timestamp": "8:30 PM",
        "type": "charging_slowed",
        "severity": "info",
        "title": "Charging slowed",
        "message": "Your building is using more electricity right now. Your EV is still on track for departure.",
        "read": False,
        "action_label": "View Plan",
        "metadata": None
    },
    {
        "id": "notif_3",
        "user_id": "user_demo_01",
        "timestamp": "1:00 PM",
        "type": "solar_opportunity",
        "severity": "success",
        "title": "Solar Charging Window Active",
        "message": "Rooftop solar is generating surplus clean energy. Charging rate increased cleanly.",
        "read": True,
        "action_label": None,
        "metadata": None
    },
    {
        "id": "notif_4",
        "user_id": "user_demo_01",
        "timestamp": "Yesterday",
        "type": "billing_generated",
        "severity": "info",
        "title": "Session Receipt Ready",
        "message": "Overnight session completed. 18.2 kWh delivered for ₹118.",
        "read": True,
        "action_label": "View Receipt",
        "metadata": None
    }
]

class NotificationService:
    COLLECTION = "notifications"

    @classmethod
    async def seed_if_empty(cls, user_id: str):
        docs = await FirestoreRepository.query(cls.COLLECTION, filters=[("user_id", "==", user_id)])
        if not docs and user_id == "user_demo_01":
            for n in INITIAL_NOTIFICATIONS:
                await FirestoreRepository.set(cls.COLLECTION, n["id"], n)

    @classmethod
    async def create_notification(
        cls,
        user_id: str,
        event_type: NotificationEventType,
        title: str,
        message: str,
        severity: NotificationSeverity = NotificationSeverity.INFO,
        action_label: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> NotificationItem:
        notif_id = f"notif_{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc).isoformat()
        
        notif = NotificationItem(
            id=notif_id,
            user_id=user_id,
            timestamp="Just now",
            type=event_type,
            severity=severity,
            title=title,
            message=message,
            read=False,
            action_label=action_label,
            metadata=metadata
        )
        await FirestoreRepository.set(cls.COLLECTION, notif_id, notif.model_dump())
        
        # Broadcast via WebSocket
        ws_payload = make_ws_event("notification", notif.model_dump())
        await ws_manager.send_to_user(user_id, ws_payload)

        # Trigger OS-level FCM push for the 4 key real push notification types
        PUSH_EVENT_TYPES = {
            NotificationEventType.CHARGING_START,
            NotificationEventType.CHARGING_COMPLETED,
            NotificationEventType.DEPARTURE_RISK,
            NotificationEventType.CHARGING_INTERRUPTED,
        }
        if event_type in PUSH_EVENT_TYPES:
            await cls.send_fcm_push(
                user_id=user_id,
                title=title,
                body=message,
                data={"notif_id": notif_id, "type": event_type.value}
            )
            await cls.send_twilio_whatsapp(
                user_id=user_id,
                title=title,
                body=message,
                event_type=event_type
            )
        
        return notif

    _last_twilio_result: Optional[Dict[str, Any]] = None

    @classmethod
    async def send_twilio_whatsapp(
        cls,
        user_id: str,
        title: str,
        body: str,
        event_type: NotificationEventType
    ) -> bool:
        """
        Sends a WhatsApp notification using Twilio REST API.
        Errors are caught and logged silently to guarantee zero interference with charging execution.
        """
        try:
            from dotenv import load_dotenv
            load_dotenv()
            import os, urllib.parse, urllib.request, base64, json, logging
            account_sid = os.getenv("TWILIO_ACCOUNT_SID")
            auth_token = os.getenv("TWILIO_AUTH_TOKEN")
            whatsapp_from = os.getenv("TWILIO_WHATSAPP_FROM")
            whatsapp_to = os.getenv("TWILIO_WHATSAPP_TO")
            content_sid = os.getenv("TWILIO_WHATSAPP_CONTENT_SID")

            if not (account_sid and auth_token and whatsapp_from and whatsapp_to):
                cls._last_twilio_result = {"error": "Missing Twilio env vars", "success": False}
                return False

            url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
            
            payload_dict = {
                "To": whatsapp_to,
                "From": whatsapp_from,
            }
            if content_sid:
                payload_dict["ContentSid"] = content_sid
            else:
                payload_dict["Body"] = f"{title}: {body}"

            data = urllib.parse.urlencode(payload_dict).encode("utf-8")
            req = urllib.request.Request(url, data=data, method="POST")

            auth_str = f"{account_sid}:{auth_token}"
            b64_auth = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")
            req.add_header("Authorization", f"Basic {b64_auth}")
            req.add_header("Content-Type", "application/x-www-form-urlencoded")

            with urllib.request.urlopen(req) as response:
                resp_body = response.read().decode("utf-8")
                resp_json = json.loads(resp_body)
                sid = resp_json.get("sid")
                status = resp_json.get("status")
                logging.getLogger("voltflow.notifications").info(
                    "Twilio WhatsApp sent successfully (SID: %s, Status: %s)", sid, status
                )
                cls._last_twilio_result = {"sid": sid, "status": status, "success": True}
                return True
        except Exception as e:
            import logging
            logging.getLogger("voltflow.notifications").warning("Twilio WhatsApp send failed silently: %s", e)
            cls._last_twilio_result = {"error": str(e), "success": False}
            return False

    @classmethod
    async def register_push_token(cls, user_id: str, push_token: str):
        """Stores FCM push token under users/{user_id}."""
        user_doc = await FirestoreRepository.get("users", user_id)
        if user_doc:
            await FirestoreRepository.update("users", user_id, {"fcm_token": push_token})
        else:
            await FirestoreRepository.set("users", user_id, {"uid": user_id, "fcm_token": push_token})

    @classmethod
    async def send_fcm_push(
        cls,
        user_id: str,
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None
    ) -> bool:
        """
        Sends an OS-level push notification using Firebase Cloud Messaging (FCM).
        Errors are caught and logged silently to guarantee zero interference with charging execution.
        """
        try:
            user_doc = await FirestoreRepository.get("users", user_id)
            if not user_doc or not user_doc.get("fcm_token"):
                return False

            fcm_token = user_doc["fcm_token"]
            from firebase.client import is_firebase_ready
            if not is_firebase_ready():
                return False

            import firebase_admin.messaging as messaging
            msg = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                data=data or {},
                token=fcm_token,
            )
            messaging.send(msg)
            return True
        except Exception as e:
            import logging
            logging.getLogger("voltflow.notifications").warning("FCM push send failed silently: %s", e)
            return False

    @classmethod
    async def get_notifications(cls, user_id: str) -> List[NotificationItem]:
        await cls.seed_if_empty(user_id)
        docs = await FirestoreRepository.query(
            cls.COLLECTION,
            filters=[("user_id", "==", user_id)],
            limit=50
        )
        return [NotificationItem(**d) for d in docs]

    @classmethod
    async def mark_read(cls, notif_id: str, user_id: str) -> bool:
        doc = await FirestoreRepository.get(cls.COLLECTION, notif_id)
        if not doc or doc.get("user_id") != user_id:
            return False
        await FirestoreRepository.update(cls.COLLECTION, notif_id, {"read": True})
        return True

    @classmethod
    async def mark_all_read(cls, user_id: str) -> int:
        notifs = await cls.get_notifications(user_id)
        count = 0
        for n in notifs:
            if not n.read:
                await FirestoreRepository.update(cls.COLLECTION, n.id, {"read": True})
                count += 1
        return count
