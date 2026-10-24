from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Float, default=0.0, nullable=False)
    total_points = Column(Integer, default=0, nullable=False)
    percentage = Column(Float, default=0.0, nullable=False)
    passed = Column(Boolean, default=False, nullable=False, index=True)
    user_answers = Column(JSON, default=dict, nullable=False)  # {"q_id": "selected_id"}
    detailed_results = Column(JSON, default=list, nullable=True)  # Populated after completion
    is_completed = Column(Boolean, default=False, nullable=False, index=True)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    submitted_at = Column(DateTime, nullable=True)

    # Relationships
    assessment = relationship("Assessment", back_populates="attempts")
    user = relationship("User", foreign_keys=[user_id])
