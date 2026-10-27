from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "VIBHA EdTech Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Security & Tokens
    SECRET_KEY: str = "vibha-edtech-development-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours for development
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # Rate Limiting & Security Hardening
    MAX_LOGIN_ATTEMPTS: int = 5
    LOCKOUT_DURATION_MINUTES: int = 15
    RATE_LIMIT_ENABLED: bool = True
    SECURITY_HEADERS_ENABLED: bool = True
    MASKED_LOGGING_ENABLED: bool = True
    FILE_STORAGE_PATH: str = "./uploads"

    # Database & Storage
    DATABASE_BACKEND: str = "firebase"  # "firebase", "sqlite", "postgres"
    DATABASE_URL: str = "sqlite:///./vibha.db"
    
    # Firebase Cloud Firestore Configuration
    FIREBASE_ENABLED: bool = True
    FIREBASE_CREDENTIALS_PATH: str = "firebase-key.json"
    FIREBASE_PROJECT_ID: Union[str, None] = None
    FIREBASE_DATABASE_ID: str = "bhavani"
    
    # AI & LLM Services
    AI_ENABLED: bool = True
    AI_PROVIDER: str = "mock"  # "mock", "openai", "gemini"
    AI_MODEL_NAME: str = "vibha-ai-deterministic-v1"
    OPENAI_API_KEY: Union[str, None] = None
    GEMINI_API_KEY: Union[str, None] = None
    AI_DAILY_TOKEN_QUOTA_PER_USER: int = 50000
    AI_REQUEST_TIMEOUT_SECONDS: int = 15

    # Security & CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return ["*"]
            if v.startswith("["):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        raise ValueError(v)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
