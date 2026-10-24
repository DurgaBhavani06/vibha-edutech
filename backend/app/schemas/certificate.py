from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class CertificateIssueRequest(BaseModel):
    course_id: int
    user_id: Optional[int] = None  # Admin can specify user; if None, current student


class CertificateRevokeRequest(BaseModel):
    reason: str


class CertificateResponse(BaseModel):
    id: int
    certificate_code: str
    user_id: int
    student_name: Optional[str] = None
    course_id: int
    course_title: Optional[str] = None
    issued_at: datetime
    is_revoked: bool
    revocation_reason: Optional[str] = None
    revoked_at: Optional[datetime] = None
    grade_percentage: Optional[float] = None
    verification_url: str

    model_config = ConfigDict(from_attributes=True)


class CertificateVerificationResponse(BaseModel):
    valid: bool
    certificate_code: str
    student_name: Optional[str] = None
    course_title: Optional[str] = None
    issued_at: Optional[str] = None
    is_revoked: bool = False
    revocation_reason: Optional[str] = None
    grade_percentage: Optional[float] = None
    message: str
