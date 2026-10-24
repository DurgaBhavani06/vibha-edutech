from datetime import datetime, timezone
from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base


class BatchMembership(Base):
    __tablename__ = "batch_memberships"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    batch_id = Column(Integer, ForeignKey("batches.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    enrolled_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("batch_id", "student_id", name="uq_batch_student_membership"),
    )

    # Relationships
    batch = relationship("Batch", back_populates="memberships")
    student = relationship("User", foreign_keys=[student_id])
