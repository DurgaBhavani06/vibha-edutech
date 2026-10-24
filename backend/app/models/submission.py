import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class SubmissionStatus(str, enum.Enum):
    PENDING = "PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    GRADED = "GRADED"
    REJECTED = "REJECTED"


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="SET NULL"), nullable=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    github_url = Column(String(500), nullable=True)
    submission_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(Enum(SubmissionStatus), default=SubmissionStatus.PENDING, nullable=False, index=True)
    grade = Column(Float, nullable=True)  # Scale 0 to 100
    trainer_feedback = Column(Text, nullable=True)
    graded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    graded_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    course = relationship("Course")
    lesson = relationship("Lesson")
    student = relationship("User", foreign_keys=[student_id])
    grader = relationship("User", foreign_keys=[graded_by])
