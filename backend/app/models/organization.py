import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base


class OrganizationType(str, enum.Enum):
    COLLEGE = "COLLEGE"
    CORPORATE = "CORPORATE"
    INTERNAL = "INTERNAL"


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    slug = Column(String(120), unique=True, index=True, nullable=False)
    code = Column(String(32), unique=True, index=True, nullable=False)
    type = Column(Enum(OrganizationType), default=OrganizationType.COLLEGE, nullable=False, index=True)
    website = Column(String(255), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(32), nullable=True)
    address = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    users = relationship("User", back_populates="organization", foreign_keys="User.organization_id")
    memberships = relationship("OrganizationMembership", back_populates="organization", cascade="all, delete-orphan")
