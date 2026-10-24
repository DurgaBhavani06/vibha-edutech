import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user, RoleChecker
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.assessment import Assessment
from app.models.assessment_attempt import AssessmentAttempt
from app.models.certificate import Certificate
from app.schemas.certificate import (
    CertificateIssueRequest,
    CertificateRevokeRequest,
    CertificateResponse,
    CertificateVerificationResponse,
)

router = APIRouter()


def generate_certificate_code() -> str:
    """Generate a tamper-resistant unique verification code."""
    year = datetime.now(timezone.utc).year
    suffix = uuid.uuid4().hex[:8].upper()
    return f"VIB-CERT-{year}-{suffix}"


@router.post("/claim", response_model=CertificateResponse)
def claim_certificate(
    payload: CertificateIssueRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Claim or issue a verified course completion certificate.
    Enforces strict eligibility requirements:
    1. Student must be enrolled in the course.
    2. Enrollment progress must be 100% (all lessons completed).
    3. If published assessments exist for the course, student must have at least one passing attempt.
    """
    target_user_id = current_user.id
    if payload.user_id and current_user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        target_user_id = payload.user_id

    student = db.query(User).filter(User.id == target_user_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")

    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    # 1. Check existing certificate (idempotent return)
    existing_cert = db.query(Certificate).filter(
        Certificate.user_id == target_user_id,
        Certificate.course_id == payload.course_id,
    ).first()
    if existing_cert:
        return CertificateResponse(
            id=existing_cert.id,
            certificate_code=existing_cert.certificate_code,
            user_id=existing_cert.user_id,
            student_name=student.full_name,
            course_id=existing_cert.course_id,
            course_title=course.title,
            issued_at=existing_cert.issued_at,
            is_revoked=existing_cert.is_revoked,
            revocation_reason=existing_cert.revocation_reason,
            revoked_at=existing_cert.revoked_at,
            grade_percentage=existing_cert.grade_percentage,
            verification_url=f"/verify/{existing_cert.certificate_code}",
        )

    # 2. Check enrollment eligibility
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == target_user_id,
        Enrollment.course_id == payload.course_id,
    ).first()

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ineligible: Student is not enrolled in this course.",
        )

    if enrollment.progress_percentage < 100.0 and enrollment.status != EnrollmentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ineligible: Course curriculum is only {enrollment.progress_percentage:.1f}% complete. 100% completion is strictly required.",
        )

    # 3. Check assessment eligibility if assessments exist
    course_assessments = (
        db.query(Assessment)
        .filter(Assessment.course_id == payload.course_id, Assessment.is_published == True)
        .all()
    )

    avg_grade = 100.0
    if course_assessments:
        passed_scores = []
        for a in course_assessments:
            passed_att = (
                db.query(AssessmentAttempt)
                .filter(
                    AssessmentAttempt.assessment_id == a.id,
                    AssessmentAttempt.user_id == target_user_id,
                    AssessmentAttempt.passed == True,
                )
                .first()
            )
            if not passed_att:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Ineligible: You must achieve a passing score on assessment '{a.title}' before receiving a certificate.",
                )
            passed_scores.append(passed_att.percentage)
        avg_grade = round(sum(passed_scores) / len(passed_scores), 1)

    # 4. Issue certificate
    cert_code = generate_certificate_code()
    now = datetime.now(timezone.utc)
    cert = Certificate(
        certificate_code=cert_code,
        user_id=target_user_id,
        course_id=payload.course_id,
        issued_at=now,
        is_revoked=False,
        grade_percentage=avg_grade,
        metadata_json={
            "student_name": student.full_name,
            "student_email": student.email,
            "course_title": course.title,
            "category": course.category,
            "duration_weeks": course.duration_weeks,
        },
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)

    return CertificateResponse(
        id=cert.id,
        certificate_code=cert.certificate_code,
        user_id=cert.user_id,
        student_name=student.full_name,
        course_id=cert.course_id,
        course_title=course.title,
        issued_at=cert.issued_at,
        is_revoked=cert.is_revoked,
        revocation_reason=None,
        revoked_at=None,
        grade_percentage=cert.grade_percentage,
        verification_url=f"/verify/{cert.certificate_code}",
    )


@router.get("/my", response_model=List[CertificateResponse])
def get_my_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all certificates earned by the current user."""
    certs = (
        db.query(Certificate)
        .filter(Certificate.user_id == current_user.id)
        .order_by(Certificate.issued_at.desc())
        .all()
    )

    return [
        CertificateResponse(
            id=c.id,
            certificate_code=c.certificate_code,
            user_id=c.user_id,
            student_name=current_user.full_name,
            course_id=c.course_id,
            course_title=c.course.title if c.course else None,
            issued_at=c.issued_at,
            is_revoked=c.is_revoked,
            revocation_reason=c.revocation_reason,
            revoked_at=c.revoked_at,
            grade_percentage=c.grade_percentage,
            verification_url=f"/verify/{c.certificate_code}",
        )
        for c in certs
    ]


@router.get("/verify/{code}", response_model=CertificateVerificationResponse)
def verify_certificate(
    code: str,
    db: Session = Depends(get_db),
):
    """Public certificate verification endpoint. No login required."""
    code_clean = code.strip().upper()
    cert = db.query(Certificate).filter(Certificate.certificate_code == code_clean).first()

    if not cert:
        return CertificateVerificationResponse(
            valid=False,
            certificate_code=code_clean,
            is_revoked=False,
            message="No matching certificate record found. Please verify the code and try again.",
        )

    if cert.is_revoked:
        return CertificateVerificationResponse(
            valid=False,
            certificate_code=cert.certificate_code,
            student_name=cert.user.full_name if cert.user else None,
            course_title=cert.course.title if cert.course else None,
            issued_at=cert.issued_at.strftime("%B %d, %Y") if cert.issued_at else None,
            is_revoked=True,
            revocation_reason=cert.revocation_reason,
            grade_percentage=cert.grade_percentage,
            message="This certificate was officially issued by VIBHA EdTech but has subsequently been REVOKED.",
        )

    return CertificateVerificationResponse(
        valid=True,
        certificate_code=cert.certificate_code,
        student_name=cert.user.full_name if cert.user else None,
        course_title=cert.course.title if cert.course else None,
        issued_at=cert.issued_at.strftime("%B %d, %Y") if cert.issued_at else None,
        is_revoked=False,
        revocation_reason=None,
        grade_percentage=cert.grade_percentage,
        message="Authentic Certificate: This certificate was legitimately earned and issued by VIBHA EdTech.",
    )


@router.patch("/{id}/revoke", response_model=CertificateResponse)
def revoke_certificate(
    id: int,
    payload: CertificateRevokeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.SUPER_ADMIN])),
):
    """Admin revokes an issued certificate."""
    cert = db.query(Certificate).filter(Certificate.id == id).first()
    if not cert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certificate not found.")

    cert.is_revoked = True
    cert.revocation_reason = payload.reason
    cert.revoked_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(cert)

    return CertificateResponse(
        id=cert.id,
        certificate_code=cert.certificate_code,
        user_id=cert.user_id,
        student_name=cert.user.full_name if cert.user else None,
        course_id=cert.course_id,
        course_title=cert.course.title if cert.course else None,
        issued_at=cert.issued_at,
        is_revoked=cert.is_revoked,
        revocation_reason=cert.revocation_reason,
        revoked_at=cert.revoked_at,
        grade_percentage=cert.grade_percentage,
        verification_url=f"/verify/{cert.certificate_code}",
    )
