import os
import logging
from typing import Optional

logger = logging.getLogger("voltflow.firebase")

_firebase_initialized = False
_firestore_client = None

def init_firebase(credentials_path: Optional[str] = None, project_id: Optional[str] = None):
    global _firebase_initialized, _firestore_client
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
        
        if not firebase_admin._apps:
            path = credentials_path or os.getenv("FIREBASE_CREDENTIALS_PATH")
            pid = project_id or os.getenv("FIREBASE_PROJECT_ID", "volt-flow-560cc")
            if path and os.path.exists(path):
                cred = credentials.Certificate(path)
                firebase_admin.initialize_app(cred, {"projectId": pid})
                logger.info("Firebase Admin initialized successfully with certificate for project: %s", pid)
            else:
                # Attempt default credentials or initialize with project ID
                firebase_admin.initialize_app(options={"projectId": pid})
                logger.info("Firebase Admin initialized with project ID: %s", pid)
        
        _firestore_client = firestore.client()
        _firebase_initialized = True
        return True
    except Exception as e:
        logger.warning("Firebase Admin initialization skipped (running in Demo Repository mode): %s", e)
        _firebase_initialized = False
        _firestore_client = None
        return False

def is_firebase_ready() -> bool:
    return _firebase_initialized and _firestore_client is not None

def get_firestore_client():
    return _firestore_client
