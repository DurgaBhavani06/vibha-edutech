import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Enum, DateTime
from app.core.database import Base


class EnquiryType(str, enum.Enum):
    STUDENT = "STUDENT"
    COLLEGE_TRAINING = "COLLEGE_TRAINING"
    CORPORATE_TRAINING = "CORPORATE_TRAINING"
    GENERAL_CONTACT = "GENERAL_CONTACT"


class EnquiryStatus(str, enum.Enum):
    NEW = "NEW"
    IN_REVIEW = "IN_REVIEW"
    CONTACTED = "CONTACTED"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class Enquiry(Base):
    __tablename__ = "enquiries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    reference_code = Column(String(32), unique=True, index=True, nullable=False)
    full_name = Column(String(120), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(24), nullable=False)
    enquiry_type = Column(Enum(EnquiryType), nullable=False, index=True)
    organization_or_college = Column(String(200), nullable=True)
    course_slug = Column(String(100), nullable=True, index=True)
    message = Column(Text, nullable=False)
    status = Column(Enum(EnquiryStatus), default=EnquiryStatus.NEW, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
