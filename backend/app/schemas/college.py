from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from app.models.training_request import TrainingRequestStatus


class CollegeStudentItem(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    registered_at: datetime
    is_active: bool
    enrolled_courses_count: int = 0
    completed_courses_count: int = 0
    certificates_count: int = 0
    active_batch_names: List[str] = []

    model_config = ConfigDict(from_attributes=True)


class CollegeBatchCreate(BaseModel):
    name: str
    code: str
    course_id: int
    trainer_id: Optional[int] = None
    max_students: int = 60
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class CollegeBatchReportItem(BaseModel):
    batch_id: int
    batch_name: str
    batch_code: str
    course_title: str
    trainer_name: Optional[str] = None
    enrolled_count: int
    attendance_rate: float
    quiz_pass_rate: float


class CollegePerformanceReport(BaseModel):
    organization_id: int
    organization_name: str
    organization_code: str
    total_registered_students: int
    total_active_cohorts: int
    average_attendance_percentage: float
    average_quiz_score_percentage: float
    total_certificates_issued: int
    naac_nba_criterion_summary: Dict[str, Any]
    cohorts: List[CollegeBatchReportItem] = []


class TrainingRequestCreate(BaseModel):
    title: str
    course_id: Optional[int] = None
    target_audience: str = "B.Tech Final & Pre-Final Year"
    estimated_students: int = 60
    preferred_start_date: Optional[date] = None
    training_mode: str = "HYBRID"
    notes: Optional[str] = None


class TrainingRequestUpdate(BaseModel):
    status: TrainingRequestStatus
    notes: Optional[str] = None


class TrainingRequestResponse(BaseModel):
    id: int
    organization_id: int
    organization_name: Optional[str] = None
    requester_id: Optional[int] = None
    requester_name: Optional[str] = None
    course_id: Optional[int] = None
    course_title: Optional[str] = None
    title: str
    target_audience: str
    estimated_students: int
    preferred_start_date: Optional[date] = None
    training_mode: str
    notes: Optional[str] = None
    status: TrainingRequestStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
