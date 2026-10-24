import os
import json
from pathlib import Path
from typing import Optional, Any, Dict
import logging

from app.core.config import settings

logger = logging.getLogger("vibha.firebase")

# Global singleton client
_firestore_client = None
_is_live_firebase = False
_active_project_id = None


def resolve_credentials_path() -> Optional[Path]:
    """Resolves the location of firebase-key.json in workspace or backend directories."""
    candidate_paths = [
        Path(settings.FIREBASE_CREDENTIALS_PATH),
        Path(__file__).resolve().parent.parent.parent.parent.parent / "firebase-key.json",  # Workspace root
        Path(__file__).resolve().parent.parent.parent.parent / "firebase-key.json",          # Backend root
        Path.cwd() / "firebase-key.json",
        Path.cwd() / "backend" / "firebase-key.json",
    ]

    env_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if env_path:
        candidate_paths.insert(0, Path(env_path))

    for p in candidate_paths:
        if p.exists() and p.is_file():
            return p.resolve()
    return None


class MockFirestoreCollection:
    """Lightweight in-memory document collection for development and graceful fallback."""
    def __init__(self, name: str, parent_db):
        self.name = name
        self.db = parent_db

    def document(self, doc_id: str):
        return MockFirestoreDocument(self.name, str(doc_id), self.db)

    def where(self, field: str, op: str, value: Any):
        return MockFirestoreQuery(self.name, self.db, [(field, op, value)])

    def order_by(self, field: str, direction=None):
        return MockFirestoreQuery(self.name, self.db, [], order_field=field)

    def limit(self, count: int):
        return MockFirestoreQuery(self.name, self.db, [], limit_count=count)

    def stream(self):
        docs = self.db.store.get(self.name, {})
        for doc_id, data in docs.items():
            yield MockDocumentSnapshot(doc_id, data)

    def get(self):
        return list(self.stream())

    def add(self, data: dict):
        import uuid
        doc_id = str(uuid.uuid4())
        self.document(doc_id).set(data)
        return None, self.document(doc_id)


class MockFirestoreQuery:
    def __init__(self, collection_name: str, parent_db, filters=None, order_field=None, limit_count=None):
        self.collection_name = collection_name
        self.db = parent_db
        self.filters = filters or []
        self.order_field = order_field
        self.limit_count = limit_count

    def where(self, field: str, op: str, value: Any):
        self.filters.append((field, op, value))
        return self

    def limit(self, count: int):
        self.limit_count = count
        return self

    def stream(self):
        docs = self.db.store.get(self.collection_name, {})
        matched = []
        for doc_id, data in docs.items():
            matches = True
            for field, op, val in self.filters:
                actual = data.get(field)
                if op == "==" and actual != val:
                    matches = False
                    break
                elif op == "in" and actual not in val:
                    matches = False
                    break
            if matches:
                matched.append(MockDocumentSnapshot(doc_id, data))

        if self.limit_count:
            matched = matched[:self.limit_count]

        for s in matched:
            yield s

    def get(self):
        return list(self.stream())


class MockDocumentSnapshot:
    def __init__(self, doc_id: str, data: dict):
        self.id = doc_id
        self._data = data
        self.exists = bool(data)

    def to_dict(self) -> dict:
        return dict(self._data) if self._data else {}


class MockFirestoreDocument:
    def __init__(self, collection_name: str, doc_id: str, parent_db):
        self.collection_name = collection_name
        self.id = doc_id
        self.db = parent_db

    def get(self) -> MockDocumentSnapshot:
        coll = self.db.store.get(self.collection_name, {})
        data = coll.get(self.id)
        return MockDocumentSnapshot(self.id, data)

    def set(self, data: dict, merge: bool = False):
        if self.collection_name not in self.db.store:
            self.db.store[self.collection_name] = {}
        if merge and self.id in self.db.store[self.collection_name]:
            self.db.store[self.collection_name][self.id].update(data)
        else:
            self.db.store[self.collection_name][self.id] = dict(data)

    def update(self, data: dict):
        if self.collection_name not in self.db.store:
            self.db.store[self.collection_name] = {}
        if self.id in self.db.store[self.collection_name]:
            self.db.store[self.collection_name][self.id].update(data)
        else:
            self.db.store[self.collection_name][self.id] = dict(data)

    def delete(self):
        if self.collection_name in self.db.store and self.id in self.db.store[self.collection_name]:
            del self.db.store[self.collection_name][self.id]


class MockFirestoreClient:
    """In-memory Firestore client storing documents in memory until live credentials arrive."""
    def __init__(self):
        self.store: Dict[str, Dict[str, dict]] = {}

    def collection(self, name: str) -> MockFirestoreCollection:
        return MockFirestoreCollection(name, self)


def init_firestore():
    """Initializes Firebase Admin SDK with credentials from firebase-key.json.
    Falls back gracefully to MockFirestoreClient if the key is not yet present.
    """
    global _firestore_client, _is_live_firebase, _active_project_id

    key_path = resolve_credentials_path()

    if key_path and key_path.exists():
        try:
            import firebase_admin
            from firebase_admin import credentials, firestore

            # Check if already initialized
            if not firebase_admin._apps:
                cred = credentials.Certificate(str(key_path))
                app = firebase_admin.initialize_app(cred)
                with open(key_path, "r", encoding="utf-8") as f:
                    key_data = json.load(f)
                    _active_project_id = key_data.get("project_id", "firebase-project")
            else:
                app = firebase_admin.get_app()

            db_id = getattr(settings, "FIREBASE_DATABASE_ID", None)
            if db_id and db_id != "(default)":
                _firestore_client = firestore.client(database_id=db_id)
            else:
                _firestore_client = firestore.client()

            _is_live_firebase = True
            logger.info(f"[FIREBASE] Successfully connected to Google Cloud Firestore (Project: {_active_project_id}, Database: {db_id or '(default)'}) using {key_path.name}")
            return _firestore_client
        except Exception as exc:
            logger.warning(f"[FIREBASE] Failed initializing Firebase Admin with {key_path}: {exc}. Using memory buffer.")

    # Fallback to in-memory Firestore buffer
    logger.info("[FIREBASE] 'firebase-key.json' not found. Running in buffered mock mode. Place firebase-key.json in project root to connect live.")
    _firestore_client = MockFirestoreClient()
    _is_live_firebase = False
    _active_project_id = "local-buffered-emulator"
    return _firestore_client


def get_firestore_client():
    """Returns active Firestore client instance."""
    global _firestore_client
    if _firestore_client is None:
        return init_firestore()
    return _firestore_client


def is_firebase_live() -> bool:
    """Returns True if connected to Google Cloud Firestore."""
    return _is_live_firebase


def get_firebase_status() -> dict:
    """Returns status details of Firebase connection."""
    return {
        "is_live": _is_live_firebase,
        "project_id": _active_project_id,
        "database_id": getattr(settings, "FIREBASE_DATABASE_ID", "(default)"),
        "mode": "Google Cloud Firestore" if _is_live_firebase else "Buffered Emulator (Awaiting firebase-key.json)",
        "credentials_found": resolve_credentials_path() is not None,
    }
