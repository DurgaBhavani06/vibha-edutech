from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.lesson import LessonType


class LessonBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    lesson_type: LessonType = LessonType.TEXT
    duration_min: int = Field(45, ge=1, le=600)
    content: Optional[str] = None
    video_url: Optional[str] = None
    resource_url: Optional[str] = None
    order_index: int = Field(1, ge=1)
    is_preview: bool = False


class LessonCreate(LessonBase):
    pass


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    lesson_type: Optional[LessonType] = None
    duration_min: Optional[int] = None
    content: Optional[str] = None
    video_url: Optional[str] = None
    resource_url: Optional[str] = None
    order_index: Optional[int] = None
    is_preview: Optional[bool] = None


class LessonSummary(BaseModel):
    id: int
    module_id: int
    title: str
    slug: str
    lesson_type: LessonType
    duration_min: int
    order_index: int
    is_preview: bool
    is_completed: Optional[bool] = False

    model_config = ConfigDict(from_attributes=True)


class LessonDetail(LessonBase):
    id: int
    module_id: int
    slug: str
    is_completed: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
