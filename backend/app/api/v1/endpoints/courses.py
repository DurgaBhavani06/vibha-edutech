import re
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import RoleChecker, get_current_user
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.module import Module
from app.models.lesson import Lesson
from app.data.sample_courses import SAMPLE_COURSES
from app.schemas.course import (
    CourseSummary,
    CourseDetail,
    CourseListResponse,
    CourseCreate,
    CourseUpdate,
)
from app.schemas.module import ModuleCreate, ModuleResponse
from app.schemas.lesson import LessonCreate, LessonDetail

router = APIRouter()


def slugify(text: str) -> str:
    text = text.lower().strip()
    return re.sub(r"[^\w\s-]", "", text).replace(" ", "-")


@router.get(
    "",
    response_model=CourseListResponse,
    summary="List courses with audience, category, and keyword filters",
)
def list_courses(
    audience: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    include_unpublished: bool = Query(False),
    db: Session = Depends(get_db),
):
    """Retrieve course catalog. Reads from database with fallback to verified sample curricula."""
    query = db.query(Course)
    if not include_unpublished:
        query = query.filter(Course.is_published == True)

    if audience and audience != "all":
        query = query.filter(Course.audience == audience)

    if category:
        query = query.filter(Course.category.ilike(f"%{category}%"))

    if search:
        s = f"%{search}%"
        query = query.filter(
            Course.title.ilike(s) | Course.tagline.ilike(s) | Course.description.ilike(s)
        )

    db_courses = query.order_by(Course.id.asc()).all()

    if db_courses:
        items = [CourseSummary.model_validate(c) for c in db_courses]
        return CourseListResponse(
            total=len(items),
            items=items,
            sample_notice="This catalog contains verified sample courses showcasing VIBHA's curriculum standards.",
        )

    # Fallback to in-memory sample courses
    results = SAMPLE_COURSES
    if audience and audience != "all":
        results = [c for c in results if c["audience"] == audience or c.get("audience") == "all"]
    if category:
        cat_lower = category.lower()
        results = [c for c in results if cat_lower in c["category"].lower()]
    if search:
        s_lower = search.lower()
        results = [
            c for c in results
            if s_lower in c["title"].lower()
            or s_lower in c["tagline"].lower()
            or any(s_lower in skill.lower() for skill in c.get("key_skills", []))
        ]

    summaries = [CourseSummary(**course) for course in results]
    return CourseListResponse(
        total=len(summaries),
        items=summaries,
        sample_notice="This catalog contains verified sample courses showcasing VIBHA's curriculum standards.",
    )


@router.get(
    "/{slug}",
    response_model=CourseDetail,
    summary="Get comprehensive course details by slug",
)
def get_course_detail(slug: str, db: Session = Depends(get_db)):
    """Retrieve detailed course syllabus, modules, lessons, prerequisites, and project showcase."""
    course = db.query(Course).filter(Course.slug == slug).first()
    if course:
        # If relational modules exist, attach them
        return CourseDetail.model_validate(course)

    # Fallback to in-memory sample courses
    for sample in SAMPLE_COURSES:
        if sample["slug"] == slug:
            return CourseDetail(**sample)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Course with slug '{slug}' not found in the VIBHA course catalog.",
    )


@router.post(
    "",
    response_model=CourseSummary,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new course (Admin only)",
)
def create_course(
    course_in: CourseCreate,
    current_user: User = Depends(RoleChecker([UserRole.SUPER_ADMIN, UserRole.ADMIN])),
    db: Session = Depends(get_db),
):
    """Create a new course in the curriculum catalog."""
    base_slug = course_in.slug or slugify(course_in.title)
    slug = base_slug
    idx = 1
    while db.query(Course).filter(Course.slug == slug).first():
        slug = f"{base_slug}-{idx}"
        idx += 1

    course = Course(
        title=course_in.title,
        slug=slug,
        tagline=course_in.tagline,
        description=course_in.description,
        category=course_in.category,
        level=course_in.level,
        audience=course_in.audience,
        duration_weeks=course_in.duration_weeks,
        hours_per_week=course_in.hours_per_week,
        format=course_in.format,
        prerequisites=course_in.prerequisites,
        key_skills=course_in.key_skills,
        trainer_id=course_in.trainer_id,
        is_published=course_in.is_published,
        modules=[],
        projects=[],
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return CourseSummary.model_validate(course)


@router.put(
    "/{course_id}",
    response_model=CourseSummary,
    summary="Update course details & assign trainer (Admin only)",
)
def update_course(
    course_id: int,
    course_update: CourseUpdate,
    current_user: User = Depends(RoleChecker([UserRole.SUPER_ADMIN, UserRole.ADMIN])),
    db: Session = Depends(get_db),
):
    """Update course attributes, prerequisites, or assign a trainer."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")

    for field, val in course_update.model_dump(exclude_unset=True).items():
        setattr(course, field, val)

    db.commit()
    db.refresh(course)
    return CourseSummary.model_validate(course)


@router.patch(
    "/{course_id}/publish",
    response_model=CourseSummary,
    summary="Toggle course publish status (Admin only)",
)
def toggle_course_publish(
    course_id: int,
    current_user: User = Depends(RoleChecker([UserRole.SUPER_ADMIN, UserRole.ADMIN])),
    db: Session = Depends(get_db),
):
    """Publish or unpublish a course."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")

    course.is_published = not course.is_published
    db.commit()
    db.refresh(course)
    return CourseSummary.model_validate(course)


@router.post(
    "/{course_id}/modules",
    response_model=ModuleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a module to a course (Admin only)",
)
def add_module(
    course_id: int,
    module_in: ModuleCreate,
    current_user: User = Depends(RoleChecker([UserRole.SUPER_ADMIN, UserRole.ADMIN])),
    db: Session = Depends(get_db),
):
    """Create a structured module within a course."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")

    module = Module(
        course_id=course.id,
        title=module_in.title,
        description=module_in.description,
        order_index=module_in.order_index,
    )
    db.add(module)
    db.commit()
    db.refresh(module)
    return module


@router.get(
    "/{course_id}/modules",
    response_model=List[ModuleResponse],
    summary="Get course modules and lessons list",
)
def get_course_modules(
    course_id: int,
    db: Session = Depends(get_db),
):
    """Retrieve normalized modules and lessons for a course."""
    modules = (
        db.query(Module)
        .filter(Module.course_id == course_id)
        .order_by(Module.order_index.asc())
        .all()
    )
    return modules


@router.post(
    "/{course_id}/modules/{module_id}/lessons",
    response_model=LessonDetail,
    status_code=status.HTTP_201_CREATED,
    summary="Add a lesson to a course module (Admin & Trainer)",
)
def add_lesson_to_module(
    course_id: int,
    module_id: int,
    lesson_in: LessonCreate,
    current_user: User = Depends(RoleChecker([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TRAINER])),
    db: Session = Depends(get_db),
):
    """Create a structured lesson within a module."""
    module = db.query(Module).filter(Module.id == module_id, Module.course_id == course_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found in this course.")

    slug_val = slugify(lesson_in.title)
    lesson = Lesson(
        module_id=module.id,
        title=lesson_in.title,
        slug=slug_val,
        lesson_type=lesson_in.lesson_type,
        duration_min=lesson_in.duration_min,
        content=lesson_in.content,
        video_url=lesson_in.video_url,
        resource_url=lesson_in.resource_url,
        order_index=lesson_in.order_index,
        is_preview=lesson_in.is_preview,
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson

