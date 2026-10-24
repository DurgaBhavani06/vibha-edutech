from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class ModuleLesson(BaseModel):
    title: str
    type: str = "lecture"  # lecture, lab, quiz, project
    duration_min: int = 45


class CourseModule(BaseModel):
    module_number: int
    title: str
    description: str
    lessons: List[ModuleLesson] = []


class CourseProject(BaseModel):
    title: str
    description: str
    tech_stack: List[str]


class CourseSummary(BaseModel):
    id: int
    slug: str
    title: str
    tagline: str
    description: str
    category: str
    level: str
    audience: str
    duration_weeks: int
    hours_per_week: int
    format: str
    key_skills: List[str]
    is_published: bool = True
    trainer_id: Optional[int] = None
    is_sample: bool = True

    model_config = ConfigDict(from_attributes=True)


class CourseDetail(CourseSummary):
    prerequisites: List[str]
    modules: List[CourseModule]
    projects: List[CourseProject]

    model_config = ConfigDict(from_attributes=True)


class CourseCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    slug: Optional[str] = None
    tagline: str = Field(..., min_length=5, max_length=255)
    description: str = Field(..., min_length=10)
    category: str = Field(..., min_length=2, max_length=100)
    level: str = "Intermediate"
    audience: str = "students"
    duration_weeks: int = Field(12, ge=1, le=52)
    hours_per_week: int = Field(10, ge=1, le=40)
    format: str = "Live Interactive + Guided Projects"
    prerequisites: List[str] = []
    key_skills: List[str] = []
    trainer_id: Optional[int] = None
    is_published: bool = True


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    audience: Optional[str] = None
    duration_weeks: Optional[int] = None
    hours_per_week: Optional[int] = None
    format: Optional[str] = None
    prerequisites: Optional[List[str]] = None
    key_skills: Optional[List[str]] = None
    trainer_id: Optional[int] = None
    is_published: Optional[bool] = None


class CourseListResponse(BaseModel):
    total: int
    items: List[CourseSummary]
    sample_notice: str = "This catalog contains verified sample courses showcasing VIBHA's curriculum standards."
