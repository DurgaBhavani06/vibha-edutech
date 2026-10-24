from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, RoleChecker, get_token_from_request
from app.models.user import User, UserRole
from app.models.module import Module
from app.models.lesson import Lesson
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.lesson_progress import LessonProgress
from app.schemas.lesson import LessonDetail, LessonUpdate

router = APIRouter()


@router.get(
    "/{lesson_id}",
    response_model=LessonDetail,
    summary="Get lesson content and learning resources",
)
def get_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(get_token_from_request),
):
    """Retrieve lesson content, controlled video link, and attachments.
    Enforces enrolment authorization unless lesson is marked as preview.
    """
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found.",
        )

    module = db.query(Module).filter(Module.id == lesson.module_id).first()
    course_id = module.course_id if module else None

    # Check authentication & enrollment
    current_user: Optional[User] = None
    is_completed = False

    if token:
        try:
            current_user = get_current_user(db=db, token=token)
        except Exception:
            current_user = None

    if current_user:
        # Check completion record
        progress = db.query(LessonProgress).filter(
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id == lesson.id,
        ).first()
        if progress and progress.is_completed:
            is_completed = True

    # Authorization Check
    is_authorized = False
    if lesson.is_preview:
        is_authorized = True
    elif current_user:
        if current_user.role in [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TRAINER]:
            is_authorized = True
        elif course_id:
            # Check enrollment
            enrollment = db.query(Enrollment).filter(
                Enrollment.user_id == current_user.id,
                Enrollment.course_id == course_id,
            ).first()
            if enrollment:
                is_authorized = True

    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be enrolled in this course to access this lesson.",
        )

    return LessonDetail(
        id=lesson.id,
        module_id=lesson.module_id,
        title=lesson.title,
        slug=lesson.slug,
        lesson_type=lesson.lesson_type,
        duration_min=lesson.duration_min,
        content=lesson.content,
        video_url=lesson.video_url,
        resource_url=lesson.resource_url,
        order_index=lesson.order_index,
        is_preview=lesson.is_preview,
        is_completed=is_completed,
        created_at=lesson.created_at,
        updated_at=lesson.updated_at,
    )


@router.post(
    "/{lesson_id}/complete",
    summary="Mark lesson as completed and recalculate course progress",
)
def toggle_lesson_completion(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a lesson complete (or toggle status) and update overall course completion percentage."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found.",
        )

    module = db.query(Module).filter(Module.id == lesson.module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Parent module not found.")

    # Get enrollment
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == module.course_id,
    ).first()

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are not enrolled in the course associated with this lesson.",
        )

    # Find or create lesson progress record
    progress = db.query(LessonProgress).filter(
        LessonProgress.user_id == current_user.id,
        LessonProgress.lesson_id == lesson.id,
    ).first()

    now_utc = datetime.now(timezone.utc)
    if not progress:
        progress = LessonProgress(
            user_id=current_user.id,
            lesson_id=lesson.id,
            enrollment_id=enrollment.id,
            is_completed=True,
            completed_at=now_utc,
            last_accessed_at=now_utc,
        )
        db.add(progress)
    else:
        progress.is_completed = not progress.is_completed
        progress.completed_at = now_utc if progress.is_completed else None
        progress.last_accessed_at = now_utc

    db.flush()

    # Recalculate course percentage
    total_lessons = (
        db.query(Lesson)
        .join(Module, Lesson.module_id == Module.id)
        .filter(Module.course_id == module.course_id)
        .count()
    )

    completed_count = (
        db.query(LessonProgress)
        .filter(
            LessonProgress.enrollment_id == enrollment.id,
            LessonProgress.is_completed == True,
        )
        .count()
    )

    percentage = (completed_count / total_lessons * 100.0) if total_lessons > 0 else 0.0
    enrollment.progress_percentage = round(percentage, 1)

    if percentage >= 100.0:
        enrollment.status = EnrollmentStatus.COMPLETED
        enrollment.completed_at = now_utc
    else:
        enrollment.status = EnrollmentStatus.ACTIVE
        enrollment.completed_at = None

    db.commit()

    return {
        "lesson_id": lesson.id,
        "is_completed": progress.is_completed,
        "completed_at": progress.completed_at,
        "course_progress_percentage": enrollment.progress_percentage,
        "total_lessons": total_lessons,
        "completed_lessons": completed_count,
    }


@router.put(
    "/{lesson_id}",
    response_model=LessonDetail,
    summary="Update lesson details and learning assets (Admin & Trainer)",
)
def update_lesson(
    lesson_id: int,
    lesson_update: LessonUpdate,
    current_user: User = Depends(RoleChecker([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TRAINER])),
    db: Session = Depends(get_db),
):
    """Update lesson content, controlled video link, or title."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")

    if lesson_update.title is not None:
        lesson.title = lesson_update.title
    if lesson_update.lesson_type is not None:
        lesson.lesson_type = lesson_update.lesson_type
    if lesson_update.duration_min is not None:
        lesson.duration_min = lesson_update.duration_min
    if lesson_update.content is not None:
        lesson.content = lesson_update.content
    if lesson_update.video_url is not None:
        lesson.video_url = lesson_update.video_url
    if lesson_update.resource_url is not None:
        lesson.resource_url = lesson_update.resource_url
    if lesson_update.order_index is not None:
        lesson.order_index = lesson_update.order_index
    if lesson_update.is_preview is not None:
        lesson.is_preview = lesson_update.is_preview

    db.commit()
    db.refresh(lesson)
    return lesson


@router.delete(
    "/{lesson_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a lesson (Admin only)",
)
def delete_lesson(
    lesson_id: int,
    current_user: User = Depends(RoleChecker([UserRole.SUPER_ADMIN, UserRole.ADMIN])),
    db: Session = Depends(get_db),
):
    """Delete a lesson from module."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")
    db.delete(lesson)
    db.commit()
    return None
