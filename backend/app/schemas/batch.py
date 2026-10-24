from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class BatchBase(BaseModel):
    name: str
    code: str
    course_id: int
    trainer_id: Optional[int] = None
    organization_id: Optional[int] = None
    max_students: int = 40
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class BatchCreate(BatchBase):
    pass


class BatchUpdate(BaseModel):
    name: Optional[str] = None
    trainer_id: Optional[int] = None
    max_students: Optional[int] = None
    is_active: Optional[bool] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class BatchMemberAdd(BaseModel):
    student_ids: List[int]


class BatchStudentRosterItem(BaseModel):
    student_id: int
    full_name: str
    email: str
    enrolled_at: datetime


class BatchResponse(BatchBase):
    id: int
    course_title: Optional[str] = None
    trainer_name: Optional[str] = None
    organization_name: Optional[str] = None
    is_active: bool
    student_count: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BatchDetailResponse(BatchResponse):
    students: List[BatchStudentRosterItem] = []
