import pytest
from app.services.firebase.client import get_firestore_client, get_firebase_status, is_firebase_live
from app.services.firebase.repositories import (
    UsersRepository,
    CoursesRepository,
    EnrollmentsRepository,
    EnquiriesRepository,
    DocumentsRepository,
)


def test_firebase_client_initialization_and_status():
    """Verifies that the Firebase client initializes cleanly and returns operational metadata."""
    client = get_firestore_client()
    assert client is not None

    status = get_firebase_status()
    assert "mode" in status
    assert "project_id" in status
    assert "credentials_found" in status


def test_firestore_users_repository_crud_and_lockout():
    """Verifies user creation, email query, and brute-force lockout logic in Firestore."""
    user_data = {
        "email": "firebase_student@vibha.io",
        "full_name": "Firebase Student",
        "role": "STUDENT",
        "hashed_password": "$2b$12$dummyHashedPasswordStringForTestOnly",
        "is_active": True,
    }
    created = UsersRepository.save_user(user_data, user_id="fb_user_101")
    assert created["id"] == "fb_user_101"

    # Query by email
    found = UsersRepository.get_by_email("firebase_student@vibha.io")
    assert found is not None
    assert found["full_name"] == "Firebase Student"

    # Query by ID
    by_id = UsersRepository.get_by_id("fb_user_101")
    assert by_id is not None
    assert by_id["email"] == "firebase_student@vibha.io"

    # Test lockout mechanism
    for _ in range(5):
        UsersRepository.record_failed_login("fb_user_101", max_attempts=5, lockout_minutes=15)

    locked_user = UsersRepository.get_by_id("fb_user_101")
    assert locked_user.get("failed_login_attempts") == 5
    assert locked_user.get("locked_until") is not None

    # Reset lockout
    UsersRepository.reset_failed_logins("fb_user_101")
    unlocked_user = UsersRepository.get_by_id("fb_user_101")
    assert unlocked_user.get("failed_login_attempts") == 0
    assert unlocked_user.get("locked_until") is None


def test_firestore_courses_repository_and_search():
    """Verifies course catalog creation, slug lookup, and search in Firestore."""
    course_data = {
        "slug": "firebase-cloud-computing",
        "title": "Cloud Computing with Google Cloud & Firebase",
        "tagline": "Master serverless cloud functions and real-time data.",
        "description": "Comprehensive course on Firestore and Cloud Run architecture.",
        "category": "Cloud Computing",
        "level": "INTERMEDIATE",
        "is_published": True,
        "modules": [
            {
                "title": "Module 1: Serverless Architecture",
                "lessons": [{"title": "Lesson 1: Firestore Setup", "duration_min": 30}],
            }
        ],
    }
    CoursesRepository.save_course(course_data, course_id="course_fb_1")

    # Lookup by slug
    course = CoursesRepository.get_by_slug("firebase-cloud-computing")
    assert course is not None
    assert course["title"] == "Cloud Computing with Google Cloud & Firebase"

    # List & filter
    listed = CoursesRepository.list_courses(category="Cloud Computing")
    assert len(listed) >= 1
    assert any(c["slug"] == "firebase-cloud-computing" for c in listed)

    # Search keyword
    searched = CoursesRepository.list_courses(search="serverless")
    assert len(searched) >= 1


def test_firestore_enrollments_repository_and_progress_tracking():
    """Verifies student enrollment and lesson progress calculation in Firestore."""
    import uuid
    uid = f"fb_user_{uuid.uuid4().hex[:8]}"
    cid = f"course_fb_{uuid.uuid4().hex[:8]}"
    CoursesRepository.save_course(
        {
            "title": "Enrollment Test Course",
            "slug": f"test-course-{uuid.uuid4().hex[:8]}",
            "is_active": True,
            "modules": [
                {
                    "id": "mod_1",
                    "title": "Module 1",
                    "lessons": [{"id": "lesson_1", "title": "Lesson 1"}],
                }
            ],
        },
        course_id=cid,
    )

    enr = EnrollmentsRepository.enroll_student(user_id=uid, course_id=cid)
    assert enr["status"] == "ACTIVE"
    assert enr["progress_percentage"] == 0

    # Mark lesson complete
    updated = EnrollmentsRepository.update_progress(
        user_id=uid, course_id=cid, lesson_id="lesson_1"
    )
    assert "lesson_1" in updated["completed_lessons"]
    assert updated["progress_percentage"] == 100


def test_firestore_enquiries_repository():
    """Verifies enquiries submission and retrieval in Firestore."""
    enq_data = {
        "full_name": "Priya Sharma",
        "email": "priya@college.edu",
        "enquiry_type": "COLLEGE_TRAINING",
        "message": "Interested in campus batch training for 120 final year engineers.",
    }
    created = EnquiriesRepository.create_enquiry(enq_data)
    assert created["id"] is not None

    all_enqs = EnquiriesRepository.list_enquiries()
    assert len(all_enqs) >= 1
    assert any(e["email"] == "priya@college.edu" for e in all_enqs)
