from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.core.seeder import seed_courses_and_curriculum
from app.core.security_headers import SecurityHeadersMiddleware
from app.core.rate_limit import RateLimitMiddleware
from app.core.logging import setup_logging
from app.services.firebase.client import init_firestore
from app.api.v1.api import api_router
# Ensure all models are imported so Base.metadata knows about them
import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Configure structured logging with secret masking
    if settings.MASKED_LOGGING_ENABLED:
        setup_logging()

    # Initialize Firebase Cloud Firestore connection
    if settings.FIREBASE_ENABLED:
        init_firestore()

    # Startup: Ensure tables exist and seed courses safely
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_courses_and_curriculum(db)
        finally:
            db.close()
    except Exception as exc:
        import logging
        logging.getLogger("vibha.startup").warning(f"Database table initialization warning: {exc}")
    yield
    # Shutdown logic if any


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="VIBHA EdTech - Scalable Enterprise API for Public Platform & Learning Management System",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# 1. OWASP Security Headers (injected on all responses)
if settings.SECURITY_HEADERS_ENABLED:
    app.add_middleware(SecurityHeadersMiddleware)

# 2. Rate Limiting Middleware (IP and route based sliding window)
if settings.RATE_LIMIT_ENABLED:
    app.add_middleware(RateLimitMiddleware)

# 3. CORS Configuration
cors_origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]
# Filter out wildcard when allow_credentials=True to satisfy browser security
cors_origins = [o for o in cors_origins if o != "*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.onrender\.com|http://localhost:.*|http://127\.0\.0\.1:.*",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Global exception handler to protect against leaking internal stack traces in production."""
    if settings.DEBUG:
        # In debug mode during local development, return error string
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": f"Internal Server Error: {str(exc)}"},
        )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal error occurred. Please contact VIBHA support."},
    )


# Mount API V1
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to VIBHA EdTech API",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health",
        "version": settings.VERSION,
    }
