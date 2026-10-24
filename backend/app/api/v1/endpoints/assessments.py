from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user, RoleChecker
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.assessment import Assessment
from app.models.question import Question
from app.models.assessment_attempt import AssessmentAttempt
from app.schemas.assessment import (
    AssessmentCreate,
    AssessmentStudentResponse,
    QuestionStudentResponse,
    QuestionAdminResponse,
    AssessmentAttemptSubmit,
    AssessmentAttemptResponse,
)

router = APIRouter()


@router.get("/course/{course_id}", response_model=List[AssessmentStudentResponse])
def list_course_assessments(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List published assessments for a course. Questions never reveal answer keys."""
    assessments = (
        db.query(Assessment)
        .filter(Assessment.course_id == course_id, Assessment.is_published == True)
        .all()
    )

    results = []
    for a in assessments:
        questions_resp = [
            QuestionStudentResponse(
                id=q.id,
                assessment_id=q.assessment_id,
                question_text=q.question_text,
                question_type=q.question_type,
                options=q.options,
                points=q.points,
                order_index=q.order_index,
            )
            for q in a.questions
        ]
        results.append(
            AssessmentStudentResponse(
                id=a.id,
                course_id=a.course_id,
                module_id=a.module_id,
                lesson_id=a.lesson_id,
                title=a.title,
                description=a.description,
                assessment_type=a.assessment_type,
                passing_score=a.passing_score,
                time_limit_minutes=a.time_limit_minutes,
                is_published=a.is_published,
                question_count=len(questions_resp),
                questions=questions_resp,
            )
        )
    return results


@router.get("/{id}", response_model=AssessmentStudentResponse)
def get_assessment(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get assessment metadata and questions. Strips correct answers for learners."""
    assessment = db.query(Assessment).filter(Assessment.id == id).first()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found.")

    questions_resp = [
        QuestionStudentResponse(
            id=q.id,
            assessment_id=q.assessment_id,
            question_text=q.question_text,
            question_type=q.question_type,
            options=q.options,
            points=q.points,
            order_index=q.order_index,
        )
        for q in assessment.questions
    ]

    return AssessmentStudentResponse(
        id=assessment.id,
        course_id=assessment.course_id,
        module_id=assessment.module_id,
        lesson_id=assessment.lesson_id,
        title=assessment.title,
        description=assessment.description,
        assessment_type=assessment.assessment_type,
        passing_score=assessment.passing_score,
        time_limit_minutes=assessment.time_limit_minutes,
        is_published=assessment.is_published,
        question_count=len(questions_resp),
        questions=questions_resp,
    )


@router.post("", response_model=AssessmentStudentResponse, status_code=status.HTTP_201_CREATED)
def create_assessment(
    payload: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.TRAINER])),
):
    """Create an assessment with multiple-choice questions."""
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    assessment = Assessment(
        course_id=payload.course_id,
        module_id=payload.module_id,
        lesson_id=payload.lesson_id,
        title=payload.title,
        description=payload.description,
        assessment_type=payload.assessment_type,
        passing_score=payload.passing_score,
        time_limit_minutes=payload.time_limit_minutes,
        is_published=payload.is_published,
    )
    db.add(assessment)
    db.flush()

    if payload.questions:
        for q_in in payload.questions:
            q_obj = Question(
                assessment_id=assessment.id,
                question_text=q_in.question_text,
                question_type=q_in.question_type,
                options=q_in.options,
                correct_answer=q_in.correct_answer.strip(),
                points=q_in.points,
                explanation=q_in.explanation,
                order_index=q_in.order_index,
            )
            db.add(q_obj)

    db.commit()
    db.refresh(assessment)

    questions_resp = [
        QuestionStudentResponse(
            id=q.id,
            assessment_id=q.assessment_id,
            question_text=q.question_text,
            question_type=q.question_type,
            options=q.options,
            points=q.points,
            order_index=q.order_index,
        )
        for q in assessment.questions
    ]

    return AssessmentStudentResponse(
        id=assessment.id,
        course_id=assessment.course_id,
        module_id=assessment.module_id,
        lesson_id=assessment.lesson_id,
        title=assessment.title,
        description=assessment.description,
        assessment_type=assessment.assessment_type,
        passing_score=assessment.passing_score,
        time_limit_minutes=assessment.time_limit_minutes,
        is_published=assessment.is_published,
        question_count=len(questions_resp),
        questions=questions_resp,
    )


@router.post("/{id}/attempt", response_model=AssessmentAttemptResponse)
def submit_assessment_attempt(
    id: int,
    payload: AssessmentAttemptSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit answers for an assessment.
    Evaluates submitted answers server-side against protected answer keys.
    Computes score, percentage, and returns detailed results with explanations.
    """
    assessment = db.query(Assessment).filter(Assessment.id == id).first()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found.")

    if not assessment.is_published:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assessment is not currently published.")

    questions = db.query(Question).filter(Question.assessment_id == id).order_by(Question.order_index).all()
    if not questions:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This assessment has no questions configured.")

    total_possible_points = sum(q.points for q in questions)
    earned_points = 0
    detailed_results = []

    for q in questions:
        # User answer passed with question id as string or int key
        user_ans = payload.answers.get(str(q.id), "").strip()
        is_correct = (user_ans.lower() == q.correct_answer.lower())
        points_awarded = q.points if is_correct else 0
        earned_points += points_awarded

        detailed_results.append({
            "question_id": q.id,
            "question_text": q.question_text,
            "user_answer": user_ans,
            "correct_answer": q.correct_answer,
            "is_correct": is_correct,
            "points_awarded": points_awarded,
            "points_possible": q.points,
            "explanation": q.explanation,
        })

    percentage = round((earned_points / total_possible_points * 100), 2) if total_possible_points > 0 else 0.0
    passed = percentage >= assessment.passing_score

    now = datetime.now(timezone.utc)
    attempt = AssessmentAttempt(
        assessment_id=assessment.id,
        user_id=current_user.id,
        score=float(earned_points),
        total_points=total_possible_points,
        percentage=percentage,
        passed=passed,
        user_answers=payload.answers,
        detailed_results=detailed_results,
        is_completed=True,
        started_at=now,
        submitted_at=now,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return AssessmentAttemptResponse(
        id=attempt.id,
        assessment_id=attempt.assessment_id,
        assessment_title=assessment.title,
        user_id=attempt.user_id,
        score=attempt.score,
        total_points=attempt.total_points,
        percentage=attempt.percentage,
        passed=attempt.passed,
        is_completed=attempt.is_completed,
        started_at=attempt.started_at,
        submitted_at=attempt.submitted_at,
        detailed_results=attempt.detailed_results,
    )


@router.get("/{id}/attempts/my", response_model=List[AssessmentAttemptResponse])
def get_my_assessment_attempts(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get current user's past attempts on this assessment."""
    assessment = db.query(Assessment).filter(Assessment.id == id).first()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found.")

    attempts = (
        db.query(AssessmentAttempt)
        .filter(AssessmentAttempt.assessment_id == id, AssessmentAttempt.user_id == current_user.id)
        .order_by(AssessmentAttempt.submitted_at.desc())
        .all()
    )

    return [
        AssessmentAttemptResponse(
            id=att.id,
            assessment_id=att.assessment_id,
            assessment_title=assessment.title,
            user_id=att.user_id,
            score=att.score,
            total_points=att.total_points,
            percentage=att.percentage,
            passed=att.passed,
            is_completed=att.is_completed,
            started_at=att.started_at,
            submitted_at=att.submitted_at,
            detailed_results=att.detailed_results,
        )
        for att in attempts
    ]
