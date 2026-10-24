from typing import List, Optional
from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.api.deps import get_current_user, RoleChecker
from app.models.user import User, UserRole
from app.models.batch import Batch
from app.models.batch_membership import BatchMembership
from app.models.attendance import Attendance, AttendanceStatus
from app.schemas.attendance import (
    BatchAttendanceCreate,
    AttendanceResponse,
    BatchAttendanceSummary,
    StudentAttendanceStat,
)

router = APIRouter()


@router.post("/batch/{batch_id}", response_model=List[AttendanceResponse])
def mark_batch_attendance(
    batch_id: int,
    payload: BatchAttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.TRAINER, UserRole.ADMIN, UserRole.SUPER_ADMIN])),
):
    """Mark attendance for students in a batch on a specific session date."""
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found.")

    if current_user.role == UserRole.TRAINER and batch.trainer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You are not the assigned trainer for this batch.",
        )

    saved_records = []
    for rec in payload.records:
        # Check if record already exists for batch, student, and date (upsert)
        existing = db.query(Attendance).filter(
            Attendance.batch_id == batch_id,
            Attendance.student_id == rec.student_id,
            Attendance.session_date == payload.session_date,
        ).first()

        if existing:
            existing.status = rec.status
            existing.remarks = rec.remarks
            existing.marked_by = current_user.id
            existing.updated_at = datetime.now(timezone.utc)
            record_obj = existing
        else:
            record_obj = Attendance(
                batch_id=batch_id,
                student_id=rec.student_id,
                session_date=payload.session_date,
                status=rec.status,
                remarks=rec.remarks,
                marked_by=current_user.id,
            )
            db.add(record_obj)

        saved_records.append(record_obj)

    db.commit()

    # Build response with student details
    responses = []
    for r in saved_records:
        db.refresh(r)
        student = db.query(User).filter(User.id == r.student_id).first()
        responses.append(
            AttendanceResponse(
                id=r.id,
                batch_id=r.batch_id,
                student_id=r.student_id,
                student_name=student.full_name if student else None,
                student_email=student.email if student else None,
                session_date=r.session_date,
                status=r.status,
                remarks=r.remarks,
                marked_by=r.marked_by,
                created_at=r.created_at,
            )
        )
    return responses


@router.get("/batch/{batch_id}", response_model=BatchAttendanceSummary)
def get_batch_attendance_summary(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve attendance statistics and percentages for all students in a batch."""
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found.")

    if current_user.role == UserRole.TRAINER and batch.trainer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not assigned to this batch.")
    elif current_user.role == UserRole.COLLEGE_COORDINATOR and batch.organization_id != current_user.organization_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your college's batch.")

    # Distinct dates recorded
    distinct_dates = (
        db.query(Attendance.session_date)
        .filter(Attendance.batch_id == batch_id)
        .distinct()
        .count()
    )

    memberships = db.query(BatchMembership).filter(BatchMembership.batch_id == batch_id).all()
    stats = []

    for m in memberships:
        student = db.query(User).filter(User.id == m.student_id).first()
        if not student:
            continue

        records = db.query(Attendance).filter(
            Attendance.batch_id == batch_id,
            Attendance.student_id == student.id,
        ).all()

        present_c = sum(1 for r in records if r.status in [AttendanceStatus.PRESENT, AttendanceStatus.LATE])
        absent_c = sum(1 for r in records if r.status == AttendanceStatus.ABSENT)
        late_c = sum(1 for r in records if r.status == AttendanceStatus.LATE)
        excused_c = sum(1 for r in records if r.status == AttendanceStatus.EXCUSED)
        total_rec = len(records)
        pct = round((present_c / total_rec * 100), 1) if total_rec > 0 else 0.0

        stats.append(
            StudentAttendanceStat(
                student_id=student.id,
                full_name=student.full_name,
                email=student.email,
                total_sessions=total_rec,
                present_count=present_c,
                absent_count=absent_c,
                late_count=late_c,
                excused_count=excused_c,
                attendance_percentage=pct,
            )
        )

    return BatchAttendanceSummary(
        batch_id=batch.id,
        batch_name=batch.name,
        total_dates_recorded=distinct_dates,
        student_stats=stats,
    )


@router.get("/my", response_model=List[AttendanceResponse])
def get_my_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT, UserRole.PROFESSIONAL_LEARNER])),
):
    """Student views their personal session attendance history."""
    records = (
        db.query(Attendance)
        .filter(Attendance.student_id == current_user.id)
        .order_by(Attendance.session_date.desc())
        .all()
    )

    return [
        AttendanceResponse(
            id=r.id,
            batch_id=r.batch_id,
            student_id=r.student_id,
            student_name=current_user.full_name,
            student_email=current_user.email,
            session_date=r.session_date,
            status=r.status,
            remarks=r.remarks,
            marked_by=r.marked_by,
            created_at=r.created_at,
        )
        for r in records
    ]
