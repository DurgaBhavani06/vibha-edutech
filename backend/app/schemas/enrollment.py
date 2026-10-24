from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.models.enrollment import EnrollmentStatus
from app.schemas.course import CourseSummary


class EnrollmentCreate(BaseModel):
    course_id: int


class EnrollmentResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    status: EnrollmentStatus
    progress_percentage: float
    enrolled_at: datetime
    completed_at: Optional[datetime] = None
    course: Optional[CourseSummary] = None

    model_config = ConfigDict(from_attributes=True)


class LessonProgressToggle(BaseModel):
    is_completed: bool


class CourseProgressSummary(BaseModel):
    course_id: int
    enrollment_id: int
    total_lessons: int
    completed_lessons: int
    progress_percentage: float
    completed_lesson_ids: List[int] = []
