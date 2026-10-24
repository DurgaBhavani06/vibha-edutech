from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    source_filename = Column(String(255), nullable=False)
    file_type = Column(String(50), default="MARKDOWN", nullable=False)  # PDF, MARKDOWN, TEXT
    is_approved = Column(Boolean, default=True, nullable=False, index=True)
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    course = relationship("Course")
    uploader = relationship("User", foreign_keys=[uploaded_by])
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
