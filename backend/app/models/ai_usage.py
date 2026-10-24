from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class AIUsage(Base):
    __tablename__ = "ai_usage"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    feature = Column(String(50), nullable=False, index=True)  # AI_TUTOR, DOCUMENT_ASSISTANT, QUESTION_GENERATOR
    model_name = Column(String(100), nullable=False)
    prompt_tokens = Column(Integer, default=0, nullable=False)
    completion_tokens = Column(Integer, default=0, nullable=False)
    total_tokens = Column(Integer, default=0, nullable=False)
    estimated_cost_usd = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
