import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class QuestionType(str, enum.Enum):
    MCQ = "MCQ"
    CODING = "CODING"
    SHORT_ANSWER = "SHORT_ANSWER"


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    question_type = Column(Enum(QuestionType), default=QuestionType.MCQ, nullable=False)
    options = Column(JSON, default=list, nullable=False)  # List of {"id": "A", "text": "..."}
    correct_answer = Column(String(100), nullable=False)  # Hidden from student before submission
    points = Column(Integer, default=10, nullable=False)
    explanation = Column(Text, nullable=True)
    order_index = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    assessment = relationship("Assessment", back_populates="questions")
