from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base


class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True)
    enrollment_id = Column(Integer, ForeignKey("enrollments.id", ondelete="CASCADE"), nullable=False, index=True)
    is_completed = Column(Boolean, default=False, nullable=False, index=True)
    completed_at = Column(DateTime, nullable=True)
    last_accessed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "lesson_id", name="uq_user_lesson_progress"),
    )

    # Relationships
    user = relationship("User")
    lesson = relationship("Lesson", back_populates="progress_records")
    enrollment = relationship("Enrollment", back_populates="progress_records")
