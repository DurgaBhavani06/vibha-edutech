import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, DateTime, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base


class EnrollmentStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    PAUSED = "PAUSED"
    DROPPED = "DROPPED"


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(Enum(EnrollmentStatus), default=EnrollmentStatus.ACTIVE, nullable=False, index=True)
    progress_percentage = Column(Float, default=0.0, nullable=False)
    enrolled_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("user_id", "course_id", name="uq_user_course_enrollment"),
    )

    # Relationships
    user = relationship("User")
    course = relationship("Course", back_populates="enrollments")
    progress_records = relationship(
        "LessonProgress",
        back_populates="enrollment",
        cascade="all, delete-orphan",
    )
