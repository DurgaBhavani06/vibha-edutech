from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.course import Course
from app.models.module import Module
from app.models.lesson import Lesson
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.lesson_progress import LessonProgress
from app.schemas.enrollment import (
    EnrollmentCreate,
    EnrollmentResponse,
    CourseProgressSummary,
)

router = APIRouter()


@router.post(
    "",
    response_model=EnrollmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Enroll current user in a course",
)
def enroll_in_course(
    enroll_in: EnrollmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Enroll the authenticated student or professional learner in a course."""
    course = db.query(Course).filter(Course.id == enroll_in.course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found.",
        )

    if not course.is_published:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot enroll in an unpublished course.",
        )

    # Check existing enrollment
    existing = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course.id,
    ).first()

    if existing:
        return existing

    enrollment = Enrollment(
        user_id=current_user.id,
        course_id=course.id,
        status=EnrollmentStatus.ACTIVE,
        progress_percentage=0.0,
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


@router.get(
    "/my",
    response_model=List[EnrollmentResponse],
    summary="List courses enrolled by the current user",
)
def get_my_enrollments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve all active and completed course enrollments for the logged-in learner."""
    enrollments = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == current_user.id)
        .order_by(Enrollment.enrolled_at.desc())
        .all()
    )
    return enrollments


@router.get(
    "/{course_id}/progress",
    response_model=CourseProgressSummary,
    summary="Get user's granular progress in a course",
)
def get_course_progress(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get total lessons, completed lessons, and percentage for a course."""
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id,
    ).first()

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not enrolled in this course.",
        )

    # Count total lessons across all modules of this course
    total_lessons = (
        db.query(Lesson)
        .join(Module, Lesson.module_id == Module.id)
        .filter(Module.course_id == course_id)
        .count()
    )

    completed_records = (
        db.query(LessonProgress)
        .filter(
            LessonProgress.enrollment_id == enrollment.id,
            LessonProgress.is_completed == True,
        )
        .all()
    )

    completed_ids = [r.lesson_id for r in completed_records]
    percentage = (len(completed_ids) / total_lessons * 100.0) if total_lessons > 0 else 0.0

    return CourseProgressSummary(
        course_id=course_id,
        enrollment_id=enrollment.id,
        total_lessons=total_lessons,
        completed_lessons=len(completed_ids),
        progress_percentage=round(percentage, 1),
        completed_lesson_ids=completed_ids,
    )
