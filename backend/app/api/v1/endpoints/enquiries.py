import secrets
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.enquiry import Enquiry, EnquiryType, EnquiryStatus
from app.schemas.enquiry import (
    EnquiryCreate,
    EnquiryResponse,
    EnquirySubmitSuccess,
)

router = APIRouter()


def generate_reference_code() -> str:
    """Generate a clean, professional reference code for the enquiry."""
    year = datetime.now(timezone.utc).strftime("%Y")
    hex_suffix = secrets.token_hex(3).upper()
    return f"VIB-{year}-{hex_suffix}"


@router.post(
    "",
    response_model=EnquirySubmitSuccess,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a contact or training enquiry",
)
def create_enquiry(
    enquiry_in: EnquiryCreate,
    db: Session = Depends(get_db),
):
    """Submit a validated enquiry for:
    - Student course consultations
    - College training partnerships
    - Corporate technical upskilling
    - General contact requests

    Includes anti-spam validation and unique reference tracking.
    """
    # Anti-spam Honeypot Protection:
    # If the invisible honeypot field is populated, it is automated bot spam.
    if enquiry_in.hp_token:
        # Return synthetic success to mislead the bot, but do not persist spam
        synthetic_ref = generate_reference_code()
        return EnquirySubmitSuccess(
            success=True,
            reference_code=synthetic_ref,
            message="Thank you for reaching out to VIBHA EdTech. Our academic team will review your enquiry.",
            enquiry=EnquiryResponse(
                id=0,
                reference_code=synthetic_ref,
                full_name=enquiry_in.full_name,
                email=enquiry_in.email,
                phone=enquiry_in.phone,
                enquiry_type=enquiry_in.enquiry_type,
                organization_or_college=enquiry_in.organization_or_college,
                course_slug=enquiry_in.course_slug,
                message=enquiry_in.message,
                status=EnquiryStatus.NEW,
                created_at=datetime.now(timezone.utc),
            ),
        )

    # Generate unique reference code
    ref_code = generate_reference_code()
    while db.query(Enquiry).filter(Enquiry.reference_code == ref_code).first():
        ref_code = generate_reference_code()

    db_enquiry = Enquiry(
        reference_code=ref_code,
        full_name=enquiry_in.full_name,
        email=enquiry_in.email,
        phone=enquiry_in.phone,
        enquiry_type=enquiry_in.enquiry_type,
        organization_or_college=enquiry_in.organization_or_college,
        course_slug=enquiry_in.course_slug,
        message=enquiry_in.message,
        status=EnquiryStatus.NEW,
    )

    db.add(db_enquiry)
    db.commit()
    db.refresh(db_enquiry)

    return EnquirySubmitSuccess(
        success=True,
        reference_code=db_enquiry.reference_code,
        message="Thank you for contacting VIBHA EdTech. Your enquiry has been received and logged.",
        enquiry=EnquiryResponse.model_validate(db_enquiry),
    )


@router.get(
    "",
    response_model=List[EnquiryResponse],
    summary="List recent enquiries (Staff / Verification)",
)
def list_enquiries(
    enquiry_type: Optional[EnquiryType] = Query(None, description="Filter by enquiry type"),
    status: Optional[EnquiryStatus] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=100, description="Max records to return"),
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    db: Session = Depends(get_db),
):
    """Retrieve enquiries with optional filtering."""
    query = db.query(Enquiry)
    if enquiry_type:
        query = query.filter(Enquiry.enquiry_type == enquiry_type)
    if status:
        query = query.filter(Enquiry.status == status)

    enquiries = query.order_by(Enquiry.created_at.desc()).offset(skip).limit(limit).all()
    return [EnquiryResponse.model_validate(item) for item in enquiries]


@router.get(
    "/{reference_code}",
    response_model=EnquiryResponse,
    summary="Get enquiry by reference code",
)
def get_enquiry_by_reference(
    reference_code: str,
    db: Session = Depends(get_db),
):
    """Lookup enquiry details by reference code."""
    enquiry = db.query(Enquiry).filter(Enquiry.reference_code == reference_code).first()
    if not enquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Enquiry with reference code '{reference_code}' not found.",
        )
    return EnquiryResponse.model_validate(enquiry)
