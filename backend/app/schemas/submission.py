from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.submission import SubmissionStatus


class SubmissionCreate(BaseModel):
    course_id: int
    lesson_id: Optional[int] = None
    title: str
    github_url: Optional[str] = None
    submission_url: Optional[str] = None
    notes: Optional[str] = None


class SubmissionGradeUpdate(BaseModel):
    status: SubmissionStatus
    grade: Optional[float] = None  # Scale 0 to 100
    trainer_feedback: Optional[str] = None


class SubmissionResponse(BaseModel):
    id: int
    course_id: int
    course_title: Optional[str] = None
    lesson_id: Optional[int] = None
    lesson_title: Optional[str] = None
    student_id: int
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    title: str
    github_url: Optional[str] = None
    submission_url: Optional[str] = None
    notes: Optional[str] = None
    status: SubmissionStatus
    grade: Optional[float] = None
    trainer_feedback: Optional[str] = None
    graded_by: Optional[int] = None
    graded_by_name: Optional[str] = None
    graded_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
