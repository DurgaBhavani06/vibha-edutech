from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    course = relationship("Course", back_populates="rel_modules")
    lessons = relationship(
        "Lesson",
        back_populates="module",
        cascade="all, delete-orphan",
        order_by="Lesson.order_index",
    )
