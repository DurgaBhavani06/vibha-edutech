import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from app.models.enquiry import EnquiryType, EnquiryStatus


class EnquiryCreate(BaseModel):
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=120,
        description="Full name of the contact person",
        examples=["Priya Sharma"],
    )
    email: EmailStr = Field(
        ...,
        description="Valid email address for contact and notifications",
        examples=["priya.sharma@example.com"],
    )
    phone: str = Field(
        ...,
        min_length=7,
        max_length=24,
        description="Contact phone number with optional country code",
        examples=["+91 98765 43210"],
    )
    enquiry_type: EnquiryType = Field(
        ...,
        description="Type of enquiry: STUDENT, COLLEGE_TRAINING, CORPORATE_TRAINING, GENERAL_CONTACT",
        examples=[EnquiryType.STUDENT],
    )
    organization_or_college: Optional[str] = Field(
        None,
        max_length=200,
        description="Institution, university, or company name if applicable",
        examples=["R.V. College of Engineering"],
    )
    course_slug: Optional[str] = Field(
        None,
        max_length=100,
        description="Course slug if the enquiry is for a specific course",
        examples=["fullstack-web-engineering"],
    )
    message: str = Field(
        ...,
        min_length=10,
        max_length=2000,
        description="Enquiry message or requirements",
        examples=["I would like to inquire about syllabus details and weekend batch timings."],
    )
    # Honeypot field for anti-spam. Genuine users won't fill this field.
    hp_token: Optional[str] = Field(
        None,
        description="Anti-spam honeypot field. Must remain empty.",
    )

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = re.sub(r"[\s\-\(\)\.]", "", v)
        if not re.match(r"^\+?[0-9]{7,15}$", cleaned):
            raise ValueError("Phone number must contain between 7 and 15 digits, optionally prefixed with '+'")
        return v.strip()

    @field_validator("full_name")
    @classmethod
    def clean_name(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Full name cannot be blank")
        return cleaned


class EnquiryResponse(BaseModel):
    id: int
    reference_code: str
    full_name: str
    email: str
    phone: str
    enquiry_type: EnquiryType
    organization_or_college: Optional[str]
    course_slug: Optional[str]
    message: str
    status: EnquiryStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EnquirySubmitSuccess(BaseModel):
    success: bool = True
    reference_code: str
    message: str
    enquiry: EnquiryResponse
