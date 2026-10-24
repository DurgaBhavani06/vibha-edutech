import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    TRAINER = "TRAINER"
    COLLEGE_COORDINATOR = "COLLEGE_COORDINATOR"
    STUDENT = "STUDENT"
    PROFESSIONAL_LEARNER = "PROFESSIONAL_LEARNER"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(120), nullable=False, index=True)
    phone = Column(String(24), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.STUDENT, nullable=False, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    organization = relationship("Organization", back_populates="users", foreign_keys=[organization_id])
    memberships = relationship("OrganizationMembership", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
    reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")
