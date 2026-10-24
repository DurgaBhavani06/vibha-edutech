from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from app.models.assessment import AssessmentType
from app.models.question import QuestionType


class QuestionOption(BaseModel):
    id: str  # e.g. "A", "B", "C", "D"
    text: str


class QuestionCreate(BaseModel):
    question_text: str
    question_type: QuestionType = QuestionType.MCQ
    options: List[Dict[str, Any]]
    correct_answer: str
    points: int = 10
    explanation: Optional[str] = None
    order_index: int = 1


class QuestionStudentResponse(BaseModel):
    """Student-facing question schema: NEVER includes correct_answer or explanation."""
    id: int
    assessment_id: int
    question_text: str
    question_type: QuestionType
    options: List[Dict[str, Any]]
    points: int
    order_index: int

    model_config = ConfigDict(from_attributes=True)


class QuestionAdminResponse(QuestionStudentResponse):
    correct_answer: str
    explanation: Optional[str] = None


class AssessmentCreate(BaseModel):
    course_id: int
    module_id: Optional[int] = None
    lesson_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    assessment_type: AssessmentType = AssessmentType.QUIZ
    passing_score: int = 70
    time_limit_minutes: int = 30
    is_published: bool = True
    questions: Optional[List[QuestionCreate]] = None


class AssessmentStudentResponse(BaseModel):
    id: int
    course_id: int
    module_id: Optional[int] = None
    lesson_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    assessment_type: AssessmentType
    passing_score: int
    time_limit_minutes: int
    is_published: bool
    question_count: int = 0
    questions: List[QuestionStudentResponse] = []

    model_config = ConfigDict(from_attributes=True)


class AssessmentAttemptSubmit(BaseModel):
    answers: Dict[str, str]  # question_id (as str) -> selected_option_id


class AssessmentAttemptResponse(BaseModel):
    id: int
    assessment_id: int
    assessment_title: Optional[str] = None
    user_id: int
    score: float
    total_points: int
    percentage: float
    passed: bool
    is_completed: bool
    started_at: datetime
    submitted_at: Optional[datetime] = None
    detailed_results: Optional[List[Dict[str, Any]]] = None

    model_config = ConfigDict(from_attributes=True)
