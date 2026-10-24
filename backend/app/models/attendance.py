import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Date, DateTime, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base


class AttendanceStatus(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    LATE = "LATE"
    EXCUSED = "EXCUSED"


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    batch_id = Column(Integer, ForeignKey("batches.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_date = Column(Date, nullable=False, index=True)
    status = Column(Enum(AttendanceStatus), default=AttendanceStatus.PRESENT, nullable=False)
    marked_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    remarks = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("batch_id", "student_id", "session_date", name="uq_batch_student_date_attendance"),
    )

    # Relationships
    batch = relationship("Batch", back_populates="attendances")
    student = relationship("User", foreign_keys=[student_id])
    marker = relationship("User", foreign_keys=[marked_by])
