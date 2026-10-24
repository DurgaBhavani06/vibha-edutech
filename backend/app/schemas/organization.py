from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.organization import OrganizationType


class OrganizationBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    code: str = Field(..., min_length=2, max_length=32)
    type: OrganizationType = OrganizationType.COLLEGE
    website: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    website: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None


class OrganizationResponse(OrganizationBase):
    id: int
    slug: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
