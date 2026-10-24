from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.lesson import LessonSummary


class ModuleBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    order_index: int = Field(1, ge=1)


class ModuleCreate(ModuleBase):
    pass


class ModuleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None


class ModuleResponse(ModuleBase):
    id: int
    course_id: int
    lessons: List[LessonSummary] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
