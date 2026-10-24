import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class LessonType(str, enum.Enum):
    VIDEO = "VIDEO"
    TEXT = "TEXT"
    LAB = "LAB"
    RESOURCE = "RESOURCE"
    QUIZ = "QUIZ"
    ASSIGNMENT = "ASSIGNMENT"


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    module_id = Column(Integer, ForeignKey("modules.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(120), nullable=False, index=True)
    lesson_type = Column(Enum(LessonType), default=LessonType.TEXT, nullable=False)
    duration_min = Column(Integer, default=45, nullable=False)
    content = Column(Text, nullable=True)  # Markdown / Lecture Notes
    video_url = Column(String(500), nullable=True)  # Controlled link e.g. Vimeo/YouTube
    resource_url = Column(String(500), nullable=True)  # Downloadable slides/assets
    order_index = Column(Integer, default=1, nullable=False)
    is_preview = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    module = relationship("Module", back_populates="lessons")
    progress_records = relationship(
        "LessonProgress",
        back_populates="lesson",
        cascade="all, delete-orphan",
    )
