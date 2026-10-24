from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(120), nullable=False)
    code = Column(String(60), unique=True, index=True, nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    trainer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True)
    max_students = Column(Integer, default=40, nullable=False)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    course = relationship("Course")
    trainer = relationship("User", foreign_keys=[trainer_id])
    organization = relationship("Organization")
    memberships = relationship("BatchMembership", back_populates="batch", cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="batch", cascade="all, delete-orphan")
