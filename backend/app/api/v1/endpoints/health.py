import time
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.services.firebase.client import get_firebase_status

router = APIRouter()


@router.get("", summary="System Health Check")
def health_check(db: Session = Depends(get_db)):
    """Comprehensive health check endpoint verifying API status, database connectivity,
    roundtrip query latency, and operational security controls.
    """
    db_status = "ok"
    db_latency_ms = None
    start_time = time.perf_counter()
    try:
        db.execute(text("SELECT 1"))
        db_latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    is_healthy = db_status == "ok"

    return {
        "status": "healthy" if is_healthy else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": "ok" if is_healthy else db_status,
        "database_latency_ms": db_latency_ms,
        "firebase": get_firebase_status(),
        "security": {
            "rate_limiting": settings.RATE_LIMIT_ENABLED,
            "security_headers": settings.SECURITY_HEADERS_ENABLED,
            "masked_logging": settings.MASKED_LOGGING_ENABLED,
        },
        "ai_engine": {
            "enabled": settings.AI_ENABLED,
            "provider": settings.AI_PROVIDER,
            "model": settings.AI_MODEL_NAME,
        },
    }

