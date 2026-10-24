import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class AssessmentType(str, enum.Enum):
    QUIZ = "QUIZ"
    EXAM = "EXAM"
    ASSIGNMENT = "ASSIGNMENT"


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    module_id = Column(Integer, ForeignKey("modules.id", ondelete="SET NULL"), nullable=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    assessment_type = Column(Enum(AssessmentType), default=AssessmentType.QUIZ, nullable=False)
    passing_score = Column(Integer, default=70, nullable=False)  # in percentage
    time_limit_minutes = Column(Integer, default=30, nullable=False)
    is_published = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    course = relationship("Course")
    module = relationship("Module")
    lesson = relationship("Lesson")
    questions = relationship(
        "Question",
        back_populates="assessment",
        cascade="all, delete-orphan",
        order_by="Question.order_index",
    )
    attempts = relationship(
        "AssessmentAttempt",
        back_populates="assessment",
        cascade="all, delete-orphan",
    )
