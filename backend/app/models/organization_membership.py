from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base


class OrganizationMembership(Base):
    __tablename__ = "organization_memberships"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role_in_org = Column(String(50), default="MEMBER", nullable=False)  # COORDINATOR, STUDENT, FACULTY
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("organization_id", "user_id", name="uq_org_user_membership"),
    )

    # Relationships
    organization = relationship("Organization", back_populates="memberships")
    user = relationship("User", back_populates="memberships")
