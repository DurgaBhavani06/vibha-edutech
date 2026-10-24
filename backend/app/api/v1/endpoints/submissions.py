from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user, RoleChecker
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.lesson import Lesson
from app.models.submission import Submission, SubmissionStatus
from app.schemas.submission import (
    SubmissionCreate,
    SubmissionGradeUpdate,
    SubmissionResponse,
)

router = APIRouter()


@router.post("", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
def create_submission(
    payload: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.STUDENT, UserRole.PROFESSIONAL_LEARNER, UserRole.ADMIN])),
):
    """Student submits an assignment with project GitHub link and notes."""
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    lesson = None
    if payload.lesson_id:
        lesson = db.query(Lesson).filter(Lesson.id == payload.lesson_id).first()
        if not lesson:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referenced lesson not found.")

    submission = Submission(
        course_id=payload.course_id,
        lesson_id=payload.lesson_id,
        student_id=current_user.id,
        title=payload.title,
        github_url=payload.github_url,
        submission_url=payload.submission_url,
        notes=payload.notes,
        status=SubmissionStatus.PENDING,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return SubmissionResponse(
        id=submission.id,
        course_id=submission.course_id,
        course_title=course.title,
        lesson_id=submission.lesson_id,
        lesson_title=lesson.title if lesson else None,
        student_id=submission.student_id,
        student_name=current_user.full_name,
        student_email=current_user.email,
        title=submission.title,
        github_url=submission.github_url,
        submission_url=submission.submission_url,
        notes=submission.notes,
        status=submission.status,
        grade=submission.grade,
        trainer_feedback=submission.trainer_feedback,
        graded_by=submission.graded_by,
        graded_by_name=None,
        graded_at=submission.graded_at,
        created_at=submission.created_at,
        updated_at=submission.updated_at,
    )


@router.get("/my", response_model=List[SubmissionResponse])
def get_my_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all submissions made by the authenticated student."""
    submissions = (
        db.query(Submission)
        .filter(Submission.student_id == current_user.id)
        .order_by(Submission.created_at.desc())
        .all()
    )

    results = []
    for s in submissions:
        grader_name = s.grader.full_name if s.grader else None
        results.append(
            SubmissionResponse(
                id=s.id,
                course_id=s.course_id,
                course_title=s.course.title if s.course else None,
                lesson_id=s.lesson_id,
                lesson_title=s.lesson.title if s.lesson else None,
                student_id=s.student_id,
                student_name=current_user.full_name,
                student_email=current_user.email,
                title=s.title,
                github_url=s.github_url,
                submission_url=s.submission_url,
                notes=s.notes,
                status=s.status,
                grade=s.grade,
                trainer_feedback=s.trainer_feedback,
                graded_by=s.graded_by,
                graded_by_name=grader_name,
                graded_at=s.graded_at,
                created_at=s.created_at,
                updated_at=s.updated_at,
            )
        )
    return results


@router.get("/pending", response_model=List[SubmissionResponse])
def get_pending_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.TRAINER, UserRole.ADMIN, UserRole.SUPER_ADMIN])),
):
    """Trainer / Admin queue of pending assignment submissions to review and grade."""
    submissions = (
        db.query(Submission)
        .filter(Submission.status.in_([SubmissionStatus.PENDING, SubmissionStatus.UNDER_REVIEW]))
        .order_by(Submission.created_at.asc())
        .all()
    )

    results = []
    for s in submissions:
        student = db.query(User).filter(User.id == s.student_id).first()
        results.append(
            SubmissionResponse(
                id=s.id,
                course_id=s.course_id,
                course_title=s.course.title if s.course else None,
                lesson_id=s.lesson_id,
                lesson_title=s.lesson.title if s.lesson else None,
                student_id=s.student_id,
                student_name=student.full_name if student else None,
                student_email=student.email if student else None,
                title=s.title,
                github_url=s.github_url,
                submission_url=s.submission_url,
                notes=s.notes,
                status=s.status,
                grade=s.grade,
                trainer_feedback=s.trainer_feedback,
                graded_by=s.graded_by,
                graded_by_name=None,
                graded_at=s.graded_at,
                created_at=s.created_at,
                updated_at=s.updated_at,
            )
        )
    return results


@router.put("/{id}/grade", response_model=SubmissionResponse)
def grade_submission(
    id: int,
    payload: SubmissionGradeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.TRAINER, UserRole.ADMIN, UserRole.SUPER_ADMIN])),
):
    """Trainer or Admin reviews and grades an assignment submission."""
    submission = db.query(Submission).filter(Submission.id == id).first()
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found.")

    submission.status = payload.status
    submission.grade = payload.grade
    submission.trainer_feedback = payload.trainer_feedback
    submission.graded_by = current_user.id
    submission.graded_at = datetime.now(timezone.utc)
    submission.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(submission)

    student = db.query(User).filter(User.id == submission.student_id).first()
    return SubmissionResponse(
        id=submission.id,
        course_id=submission.course_id,
        course_title=submission.course.title if submission.course else None,
        lesson_id=submission.lesson_id,
        lesson_title=submission.lesson.title if submission.lesson else None,
        student_id=submission.student_id,
        student_name=student.full_name if student else None,
        student_email=student.email if student else None,
        title=submission.title,
        github_url=submission.github_url,
        submission_url=submission.submission_url,
        notes=submission.notes,
        status=submission.status,
        grade=submission.grade,
        trainer_feedback=submission.trainer_feedback,
        graded_by=submission.graded_by,
        graded_by_name=current_user.full_name,
        graded_at=submission.graded_at,
        created_at=submission.created_at,
        updated_at=submission.updated_at,
    )
