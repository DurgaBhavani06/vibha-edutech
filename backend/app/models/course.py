import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class CourseLevel(str, enum.Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"


class CourseAudience(str, enum.Enum):
    STUDENTS = "students"
    FRESHERS = "freshers"
    WORKING_PROFESSIONALS = "working-professionals"
    COLLEGES = "colleges"
    ALL = "all"


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    slug = Column(String(120), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    tagline = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    level = Column(String(50), nullable=False)  # Beginner / Intermediate / Advanced
    audience = Column(String(50), nullable=False, index=True)  # students, freshers, working-professionals, colleges
    duration_weeks = Column(Integer, nullable=False)
    hours_per_week = Column(Integer, nullable=False)
    format = Column(String(100), default="Live Interactive + Guided Projects", nullable=False)
    prerequisites = Column(JSON, default=list, nullable=False)
    key_skills = Column(JSON, default=list, nullable=False)
    modules = Column(JSON, default=list, nullable=False)
    projects = Column(JSON, default=list, nullable=False)
    is_published = Column(Boolean, default=True, nullable=False, index=True)
    trainer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Normalized LMS Relationships
    trainer = relationship("User", foreign_keys=[trainer_id])
    rel_modules = relationship(
        "Module",
        back_populates="course",
        cascade="all, delete-orphan",
        order_by="Module.order_index",
    )
    enrollments = relationship(
        "Enrollment",
        back_populates="course",
        cascade="all, delete-orphan",
    )
