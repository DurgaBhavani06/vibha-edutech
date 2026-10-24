from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    enquiries,
    courses,
    auth,
    users,
    organizations,
    enrollments,
    lessons,
    batches,
    attendance,
    assessments,
    submissions,
    certificates,
    college,
    ai,
)

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(enquiries.router, prefix="/enquiries", tags=["Enquiries"])
api_router.include_router(courses.router, prefix="/courses", tags=["Courses"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Session"])
api_router.include_router(users.router, prefix="/users", tags=["Users & Profiles"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["Organizations & Tenants"])
api_router.include_router(enrollments.router, prefix="/enrollments", tags=["LMS Enrollments & Progress"])
api_router.include_router(lessons.router, prefix="/lessons", tags=["LMS Lessons & Content"])
api_router.include_router(batches.router, prefix="/batches", tags=["Batches & Cohorts"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["Attendance"])
api_router.include_router(assessments.router, prefix="/assessments", tags=["Assessments & Quizzes"])
api_router.include_router(submissions.router, prefix="/submissions", tags=["Assignments & Submissions"])
api_router.include_router(certificates.router, prefix="/certificates", tags=["Certificates & Verification"])
api_router.include_router(college.router, prefix="/colleges", tags=["College Management & NAAC Reports"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Tutor, RAG & Question Generator"])
