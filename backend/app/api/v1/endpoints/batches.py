from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.api.deps import get_current_user, RoleChecker
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.batch import Batch
from app.models.batch_membership import BatchMembership
from app.models.organization import Organization
from app.schemas.batch import (
    BatchCreate,
    BatchUpdate,
    BatchMemberAdd,
    BatchResponse,
    BatchDetailResponse,
    BatchStudentRosterItem,
)

router = APIRouter()


@router.get("", response_model=List[BatchResponse])
def list_batches(
    course_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List batches based on user role:
    - Super Admin / Admin: view all batches.
    - Trainer: view batches assigned to them.
    - College Coordinator: view batches affiliated with their organization.
    - Student: view batches they are members of.
    """
    query = db.query(Batch)

    if current_user.role in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        pass  # sees all
    elif current_user.role == UserRole.TRAINER:
        query = query.filter(Batch.trainer_id == current_user.id)
    elif current_user.role == UserRole.COLLEGE_COORDINATOR:
        if not current_user.organization_id:
            return []
        query = query.filter(Batch.organization_id == current_user.organization_id)
    elif current_user.role in [UserRole.STUDENT, UserRole.PROFESSIONAL_LEARNER]:
        subquery = db.query(BatchMembership.batch_id).filter(BatchMembership.student_id == current_user.id)
        query = query.filter(Batch.id.in_(subquery))

    if course_id:
        query = query.filter(Batch.course_id == course_id)

    batches = query.order_by(Batch.created_at.desc()).all()
    results = []
    for b in batches:
        student_count = db.query(BatchMembership).filter(BatchMembership.batch_id == b.id).count()
        results.append(
            BatchResponse(
                id=b.id,
                name=b.name,
                code=b.code,
                course_id=b.course_id,
                course_title=b.course.title if b.course else None,
                trainer_id=b.trainer_id,
                trainer_name=b.trainer.full_name if b.trainer else None,
                organization_id=b.organization_id,
                organization_name=b.organization.name if b.organization else None,
                max_students=b.max_students,
                is_active=b.is_active,
                student_count=student_count,
                start_date=b.start_date,
                end_date=b.end_date,
                created_at=b.created_at,
            )
        )
    return results


@router.post("", response_model=BatchResponse, status_code=status.HTTP_201_CREATED)
def create_batch(
    payload: BatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.SUPER_ADMIN])),
):
    """Admin creates a new training cohort / batch."""
    # Check if code already exists
    existing = db.query(Batch).filter(Batch.code == payload.code.upper().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Batch code '{payload.code}' already exists.",
        )

    # Verify course exists
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referenced course not found.")

    # Verify trainer if provided
    trainer = None
    if payload.trainer_id:
        trainer = db.query(User).filter(User.id == payload.trainer_id, User.role == UserRole.TRAINER).first()
        if not trainer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assigned trainer not found or does not have TRAINER role.",
            )

    batch = Batch(
        name=payload.name,
        code=payload.code.upper().strip(),
        course_id=payload.course_id,
        trainer_id=payload.trainer_id,
        organization_id=payload.organization_id,
        max_students=payload.max_students,
        start_date=payload.start_date,
        end_date=payload.end_date,
        is_active=True,
    )
    db.add(batch)
    db.commit()
    db.refresh(batch)

    return BatchResponse(
        id=batch.id,
        name=batch.name,
        code=batch.code,
        course_id=batch.course_id,
        course_title=course.title,
        trainer_id=batch.trainer_id,
        trainer_name=trainer.full_name if trainer else None,
        organization_id=batch.organization_id,
        organization_name=batch.organization.name if batch.organization else None,
        max_students=batch.max_students,
        is_active=batch.is_active,
        student_count=0,
        start_date=batch.start_date,
        end_date=batch.end_date,
        created_at=batch.created_at,
    )


@router.get("/{id}", response_model=BatchDetailResponse)
def get_batch_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get batch details along with the student roster."""
    batch = db.query(Batch).filter(Batch.id == id).first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found.")

    # Authorization
    if current_user.role == UserRole.TRAINER and batch.trainer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: Not assigned to this batch.")
    elif current_user.role == UserRole.COLLEGE_COORDINATOR and batch.organization_id != current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: Not your college's batch.")

    memberships = db.query(BatchMembership).filter(BatchMembership.batch_id == batch.id).all()
    students_roster = []
    for m in memberships:
        student = db.query(User).filter(User.id == m.student_id).first()
        if student:
            students_roster.append(
                BatchStudentRosterItem(
                    student_id=student.id,
                    full_name=student.full_name,
                    email=student.email,
                    enrolled_at=m.enrolled_at,
                )
            )

    return BatchDetailResponse(
        id=batch.id,
        name=batch.name,
        code=batch.code,
        course_id=batch.course_id,
        course_title=batch.course.title if batch.course else None,
        trainer_id=batch.trainer_id,
        trainer_name=batch.trainer.full_name if batch.trainer else None,
        organization_id=batch.organization_id,
        organization_name=batch.organization.name if batch.organization else None,
        max_students=batch.max_students,
        is_active=batch.is_active,
        student_count=len(students_roster),
        start_date=batch.start_date,
        end_date=batch.end_date,
        created_at=batch.created_at,
        students=students_roster,
    )


@router.post("/{id}/students", response_model=BatchDetailResponse)
def add_students_to_batch(
    id: int,
    payload: BatchMemberAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.TRAINER, UserRole.COLLEGE_COORDINATOR])),
):
    """Add student IDs to the batch cohort."""
    batch = db.query(Batch).filter(Batch.id == id).first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found.")

    if current_user.role == UserRole.TRAINER and batch.trainer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not assigned to this batch.")
    if current_user.role == UserRole.COLLEGE_COORDINATOR and batch.organization_id != current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your college's batch.")

    for s_id in payload.student_ids:
        # Check student exists
        student = db.query(User).filter(User.id == s_id).first()
        if not student:
            continue
        # Check if already added
        exists = db.query(BatchMembership).filter(
            BatchMembership.batch_id == batch.id,
            BatchMembership.student_id == s_id,
        ).first()
        if not exists:
            membership = BatchMembership(batch_id=batch.id, student_id=s_id)
            db.add(membership)

    db.commit()
    return get_batch_detail(id=batch.id, db=db, current_user=current_user)
