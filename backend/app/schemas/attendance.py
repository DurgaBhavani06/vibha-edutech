from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.models.attendance import AttendanceStatus


class AttendanceRecord(BaseModel):
    student_id: int
    status: AttendanceStatus = AttendanceStatus.PRESENT
    remarks: Optional[str] = None


class BatchAttendanceCreate(BaseModel):
    batch_id: int
    session_date: date
    records: List[AttendanceRecord]


class AttendanceResponse(BaseModel):
    id: int
    batch_id: int
    student_id: int
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    session_date: date
    status: AttendanceStatus
    remarks: Optional[str] = None
    marked_by: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StudentAttendanceStat(BaseModel):
    student_id: int
    full_name: str
    email: str
    total_sessions: int
    present_count: int
    absent_count: int
    late_count: int
    excused_count: int
    attendance_percentage: float


class BatchAttendanceSummary(BaseModel):
    batch_id: int
    batch_name: str
    total_dates_recorded: int
    student_stats: List[StudentAttendanceStat]
