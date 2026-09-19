import logging
import os
import json
from typing import Dict, Any, List, Optional
from .client import is_firebase_ready, get_firestore_client

logger = logging.getLogger("voltflow.firestore")

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
LOCAL_DB_PATH = os.path.join(DATA_DIR, "local_db.json")

# In-memory backing store for demo mode & local testing
_in_memory_store: Dict[str, Dict[str, Dict[str, Any]]] = {
    "users": {},
    "vehicles": {},
    "chargingPreferences": {},
    "chargingSessions": {},
    "chargers": {},
    "reservations": {},
    "billing": {},
    "chargingHistory": {},
    "carbonReports": {},
    "trips": {},
    "reports": {},
    "notifications": {},
}

def _load_in_memory_store():
    if os.getenv("PYTEST_CURRENT_TEST"):
        return
    if os.path.exists(LOCAL_DB_PATH):
        try:
            with open(LOCAL_DB_PATH, "r", encoding="utf-8") as f:
                loaded = json.load(f)
                for k, v in loaded.items():
                    if k in _in_memory_store:
                        _in_memory_store[k].update(v)
                    else:
                        _in_memory_store[k] = v
        except Exception as e:
            logger.warning("Could not load local_db.json: %s", e)

def _save_in_memory_store():
    if os.getenv("PYTEST_CURRENT_TEST"):
        return
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(LOCAL_DB_PATH, "w", encoding="utf-8") as f:
            json.dump(_in_memory_store, f, indent=2)
    except Exception as e:
        logger.warning("Could not persist local_db.json: %s", e)

_load_in_memory_store()

class FirestoreRepository:
    """
    Unified Firestore Repository.
    Reads/writes to Cloud Firestore when Firebase Admin is initialized;
    falls back cleanly to in-memory store for local testing/demo without changing caller code.
    IMPORTANT: High-frequency telemetry ticks are NEVER stored in Firestore.
    """

    @classmethod
    async def get(cls, collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        if is_firebase_ready():
            try:
                db = get_firestore_client()
                doc = db.collection(collection).document(doc_id).get()
                if doc.exists:
                    data = doc.to_dict()
                    data["id"] = doc.id
                    return data
                return None
            except Exception as e:
                logger.error("Error reading Firestore collection %s doc %s: %s", collection, doc_id, e)
        # In-memory fallback
        coll = _in_memory_store.get(collection, {})
        data = coll.get(doc_id)
        return dict(data) if data else None

    @classmethod
    async def set(cls, collection: str, doc_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        if is_firebase_ready():
            try:
                db = get_firestore_client()
                db.collection(collection).document(doc_id).set(data)
            except Exception as e:
                logger.error("Error writing Firestore collection %s doc %s: %s", collection, doc_id, e)
        # In-memory store
        if collection not in _in_memory_store:
            _in_memory_store[collection] = {}
        _in_memory_store[collection][doc_id] = dict(data)
        _save_in_memory_store()
        return data

    @classmethod
    async def update(cls, collection: str, doc_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if is_firebase_ready():
            try:
                db = get_firestore_client()
                db.collection(collection).document(doc_id).set(data, merge=True)
                return await cls.get(collection, doc_id)
            except Exception as e:
                logger.error("Error updating Firestore collection %s doc %s: %s", collection, doc_id, e)
        # In-memory store
        coll = _in_memory_store.get(collection, {})
        if doc_id in coll:
            coll[doc_id].update(data)
            _save_in_memory_store()
            return coll[doc_id]
        return None

    @classmethod
    async def delete(cls, collection: str, doc_id: str) -> bool:
        if is_firebase_ready():
            try:
                db = get_firestore_client()
                db.collection(collection).document(doc_id).delete()
            except Exception as e:
                logger.error("Error deleting Firestore collection %s doc %s: %s", collection, doc_id, e)
        # In-memory store
        coll = _in_memory_store.get(collection, {})
        if doc_id in coll:
            del coll[doc_id]
            _save_in_memory_store()
            return True
        return False

    @classmethod
    async def query(
        cls,
        collection: str,
        filters: Optional[List[tuple]] = None,
        order_by: Optional[str] = None,
        descending: bool = False,
        limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Query collection documents with filters [(field, op, value)].
        """
        if is_firebase_ready():
            try:
                db = get_firestore_client()
                q = db.collection(collection)
                if filters:
                    for field, op, val in filters:
                        q = q.where(field, op, val)
                docs = q.stream()
                res = []
                for d in docs:
                    item = d.to_dict()
                    item["id"] = d.id
                    res.append(item)
                if order_by:
                    res.sort(key=lambda x: x.get(order_by, ""), reverse=descending)
                if limit:
                    res = res[:limit]
                return res
            except Exception as e:
                logger.error("Error querying Firestore collection %s: %s", collection, e)

        # In-memory fallback querying
        coll = _in_memory_store.get(collection, {})
        items = list(coll.values())
        if filters:
            for field, op, val in filters:
                if op in ("==", "="):
                    items = [it for it in items if it.get(field) == val]
                elif op == "!=":
                    items = [it for it in items if it.get(field) != val]
                elif op == ">":
                    items = [it for it in items if it.get(field, 0) > val]
                elif op == "<":
                    items = [it for it in items if it.get(field, 0) < val]
                elif op == "in":
                    items = [it for it in items if it.get(field) in val]
        if order_by:
            items.sort(key=lambda x: x.get(order_by, ""), reverse=descending)
        if limit:
            items = items[:limit]
        return items

    @classmethod
    def reset_in_memory_store(cls):
        """Used in test suites to reset mock storage between runs."""
        for key in _in_memory_store:
            _in_memory_store[key].clear()
