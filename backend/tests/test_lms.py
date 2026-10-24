import pytest
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.module import Module
from app.models.lesson import Lesson, LessonType
from app.models.enrollment import Enrollment, EnrollmentStatus


@pytest.fixture
def admin_auth_token(client, db_session):
    admin = User(
        email="lms_admin@vibha-edtech.com",
        hashed_password=get_password_hash("AdminPass123!"),
        full_name="LMS Admin",
        role=UserRole.ADMIN,
        is_active=True,
    )
    db_session.add(admin)
    db_session.commit()

    res = client.post("/api/v1/auth/login", json={
        "email": "lms_admin@vibha-edtech.com",
        "password": "AdminPass123!",
    })
    return res.json()["access_token"]


@pytest.fixture
def student_auth_token(client, db_session):
    student = User(
        email="lms_student@example.com",
        hashed_password=get_password_hash("StudentPass123!"),
        full_name="LMS Student",
        role=UserRole.STUDENT,
        is_active=True,
    )
    db_session.add(student)
    db_session.commit()

    res = client.post("/api/v1/auth/login", json={
        "email": "lms_student@example.com",
        "password": "StudentPass123!",
    })
    return res.json()["access_token"]


def test_admin_create_course(client, admin_auth_token):
    payload = {
        "title": "Systems Programming with Rust",
        "tagline": "Master ownership, memory safety, and concurrency in Rust.",
        "description": "An intensive systems engineering program building operating system utilities.",
        "category": "Systems Engineering",
        "level": "Advanced",
        "audience": "working-professionals",
        "duration_weeks": 10,
        "hours_per_week": 8,
        "is_published": True,
    }
    res = client.post(
        "/api/v1/courses",
        json=payload,
        headers={"Authorization": f"Bearer {admin_auth_token}"},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Systems Programming with Rust"
    assert data["slug"] == "systems-programming-with-rust"


def test_admin_publish_unpublish_course(client, admin_auth_token, db_session):
    course = Course(
        title="Draft Course",
        slug="draft-course",
        tagline="Draft Tagline for testing",
        description="Draft Description",
        category="Testing",
        level="Beginner",
        audience="students",
        duration_weeks=4,
        hours_per_week=5,
        is_published=False,
    )
    db_session.add(course)
    db_session.commit()

    # Publish
    pub_res = client.patch(
        f"/api/v1/courses/{course.id}/publish",
        headers={"Authorization": f"Bearer {admin_auth_token}"},
    )
    assert pub_res.status_code == 200
    assert pub_res.json()["is_published"] is True

    # Unpublish
    unpub_res = client.patch(
        f"/api/v1/courses/{course.id}/publish",
        headers={"Authorization": f"Bearer {admin_auth_token}"},
    )
    assert unpub_res.status_code == 200
    assert unpub_res.json()["is_published"] is False


def test_admin_add_module_and_lesson(client, admin_auth_token, db_session):
    course = Course(
        title="Go Microservices",
        slug="go-microservices",
        tagline="High-throughput services in Go",
        description="Go concurrency patterns and gRPC.",
        category="Backend",
        level="Intermediate",
        audience="freshers",
        duration_weeks=8,
        hours_per_week=6,
        is_published=True,
    )
    db_session.add(course)
    db_session.commit()

    # Add Module
    mod_res = client.post(
        f"/api/v1/courses/{course.id}/modules",
        json={"title": "Go Concurrency Basics", "description": "Goroutines and Channels", "order_index": 1},
        headers={"Authorization": f"Bearer {admin_auth_token}"},
    )
    assert mod_res.status_code == 201
    mod_id = mod_res.json()["id"]

    # Verify Module list
    list_res = client.get(f"/api/v1/courses/{course.id}/modules")
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1


def test_student_enroll_and_progress_lifecycle(client, student_auth_token, db_session):
    # Setup Course with 2 lessons
    course = Course(
        title="Applied Linux Fundamentals",
        slug="applied-linux",
        tagline="Command line, processes and shell scripting",
        description="Practical Linux skills for developers.",
        category="DevOps",
        level="Beginner",
        audience="students",
        duration_weeks=2,
        hours_per_week=4,
        is_published=True,
    )
    db_session.add(course)
    db_session.flush()

    module = Module(course_id=course.id, title="Shell Basics", order_index=1)
    db_session.add(module)
    db_session.flush()

    lesson1 = Lesson(
        module_id=module.id,
        title="Navigation & Pipes",
        slug="navigation-pipes",
        lesson_type=LessonType.TEXT,
        content="Learn ls, cd, grep and pipes.",
        is_preview=True,
        order_index=1,
    )
    lesson2 = Lesson(
        module_id=module.id,
        title="Bash Scripting",
        slug="bash-scripting",
        lesson_type=LessonType.LAB,
        content="Writing automation scripts.",
        is_preview=False,
        order_index=2,
    )
    db_session.add_all([lesson1, lesson2])
    db_session.commit()

    # 1. Preview lesson is accessible even without enrollment
    preview_res = client.get(f"/api/v1/lessons/{lesson1.id}")
    assert preview_res.status_code == 200
    assert preview_res.json()["title"] == "Navigation & Pipes"

    # 2. Non-preview lesson is FORBIDDEN without enrollment
    locked_res = client.get(
        f"/api/v1/lessons/{lesson2.id}",
        headers={"Authorization": f"Bearer {student_auth_token}"},
    )
    assert locked_res.status_code == 403

    # 3. Student enrolls in the course
    enroll_res = client.post(
        "/api/v1/enrollments",
        json={"course_id": course.id},
        headers={"Authorization": f"Bearer {student_auth_token}"},
    )
    assert enroll_res.status_code == 201
    assert enroll_res.json()["progress_percentage"] == 0.0
    assert enroll_res.json()["status"] == "ACTIVE"

    # 4. Now student can access lesson 2
    unlocked_res = client.get(
        f"/api/v1/lessons/{lesson2.id}",
        headers={"Authorization": f"Bearer {student_auth_token}"},
    )
    assert unlocked_res.status_code == 200
    assert unlocked_res.json()["title"] == "Bash Scripting"

    # 5. Student completes Lesson 1 (1 of 2 = 50%)
    c1_res = client.post(
        f"/api/v1/lessons/{lesson1.id}/complete",
        headers={"Authorization": f"Bearer {student_auth_token}"},
    )
    assert c1_res.status_code == 200
    assert c1_res.json()["is_completed"] is True
    assert c1_res.json()["course_progress_percentage"] == 50.0

    # 6. Check my enrollments list
    my_res = client.get(
        "/api/v1/enrollments/my",
        headers={"Authorization": f"Bearer {student_auth_token}"},
    )
    assert my_res.status_code == 200
    assert len(my_res.json()) == 1
    assert my_res.json()[0]["progress_percentage"] == 50.0

    # 7. Student completes Lesson 2 (2 of 2 = 100%)
    c2_res = client.post(
        f"/api/v1/lessons/{lesson2.id}/complete",
        headers={"Authorization": f"Bearer {student_auth_token}"},
    )
    assert c2_res.status_code == 200
    assert c2_res.json()["course_progress_percentage"] == 100.0

    # Verify status changed to COMPLETED
    my_updated = client.get(
        "/api/v1/enrollments/my",
        headers={"Authorization": f"Bearer {student_auth_token}"},
    )
    assert my_updated.json()[0]["status"] == "COMPLETED"
    assert my_updated.json()[0]["progress_percentage"] == 100.0
