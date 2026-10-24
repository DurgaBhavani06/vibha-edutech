import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class TrainingRequestStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    SCHEDULED = "SCHEDULED"
    COMPLETED = "COMPLETED"
    REJECTED = "REJECTED"


class TrainingRequest(Base):
    __tablename__ = "training_requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    requester_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(200), nullable=False)
    target_audience = Column(String(100), nullable=False)  # e.g., "B.Tech CSE Final Year"
    estimated_students = Column(Integer, default=60, nullable=False)
    preferred_start_date = Column(Date, nullable=True)
    training_mode = Column(String(50), default="HYBRID", nullable=False)  # ON_CAMPUS, ONLINE, HYBRID
    notes = Column(Text, nullable=True)
    status = Column(Enum(TrainingRequestStatus), default=TrainingRequestStatus.PENDING, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    organization = relationship("Organization")
    requester = relationship("User", foreign_keys=[requester_id])
    course = relationship("Course", foreign_keys=[course_id])
