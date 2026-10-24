from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, JSON, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    certificate_code = Column(String(64), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    issued_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    is_revoked = Column(Boolean, default=False, nullable=False, index=True)
    revocation_reason = Column(String(255), nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    grade_percentage = Column(Float, nullable=True)
    metadata_json = Column(JSON, default=dict, nullable=True)

    __table_args__ = (
        UniqueConstraint("user_id", "course_id", name="uq_user_course_certificate"),
    )

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    course = relationship("Course", foreign_keys=[course_id])
