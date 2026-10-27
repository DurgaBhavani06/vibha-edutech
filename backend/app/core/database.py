import os
import tempfile
from pathlib import Path
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

# Engine configuration with appropriate SQLite/PostgreSQL parameters
connect_args = {}
db_url = settings.DATABASE_URL

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    if ":memory:" not in db_url:
        path_part = db_url.split("sqlite:///")[-1]
        target_path = Path(path_part).resolve()
        target_dir = target_path.parent
        try:
            target_dir.mkdir(parents=True, exist_ok=True)
            test_file = target_dir / f".write_test_{os.getpid()}"
            test_file.touch()
            test_file.unlink()
            p = target_path.as_posix()
            db_url = f"sqlite:///{p}"
        except Exception:
            # Fallback to system temp directory (always writable in Docker / Render)
            tmp_p = (Path(tempfile.gettempdir()) / "vibha.db").as_posix()
            db_url = f"sqlite:///{tmp_p}"

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=settings.DEBUG and not db_url.startswith("sqlite"),
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency that yields a database session and ensures clean closure."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
