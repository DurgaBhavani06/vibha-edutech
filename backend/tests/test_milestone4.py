from datetime import date
import pytest
from fastapi.testclient import TestClient
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.attendance import AttendanceStatus
from app.models.submission import SubmissionStatus


@pytest.fixture
def admin_token_headers(client: TestClient, db_session):
    admin = User(
        email="m4_admin@vibha-edtech.com",
        hashed_password=get_password_hash("AdminPass123!"),
        full_name="Milestone 4 Admin",
        role=UserRole.ADMIN,
        is_active=True,
    )
    db_session.add(admin)
    db_session.commit()

    res = client.post("/api/v1/auth/login", json={
        "email": "m4_admin@vibha-edtech.com",
        "password": "AdminPass123!",
    })
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_batch_creation_and_student_roster(client: TestClient, admin_token_headers: dict):
    # 1. Create course
    course_resp = client.post(
        "/api/v1/courses",
        headers=admin_token_headers,
        json={
            "slug": "m4-test-course-batches",
            "title": "Batch Test Course",
            "tagline": "Test Tagline",
            "description": "Test Description",
            "category": "Web Development",
            "level": "Beginner",
            "audience": "students",
            "duration_weeks": 8,
            "hours_per_week": 6,
            "format": "Online",
            "prerequisites": [],
            "key_skills": ["Python"],
            "projects": [],
        },
    )
    assert course_resp.status_code == 201
    course_id = course_resp.json()["id"]

    # 2. Register student
    student_resp = client.post(
        "/api/v1/auth/register",
        json={"email": "m4_student@vibha.io", "password": "StudentPassword123!", "full_name": "Test Student"},
    )
    assert student_resp.status_code == 201
    student_id = student_resp.json()["id"]

    # 3. Admin creates batch
    batch_resp = client.post(
        "/api/v1/batches",
        headers=admin_token_headers,
        json={
            "name": "Alpha Cohort 2026",
            "code": "ALPHA-2026",
            "course_id": course_id,
            "max_students": 30,
        },
    )
    assert batch_resp.status_code == 201
    batch_id = batch_resp.json()["id"]

    # 4. Add student to batch
    add_resp = client.post(
        f"/api/v1/batches/{batch_id}/students",
        headers=admin_token_headers,
        json={"student_ids": [student_id]},
    )
    assert add_resp.status_code == 200
    roster = add_resp.json()["students"]
    assert len(roster) == 1
    assert roster[0]["student_id"] == student_id


def test_attendance_marking_and_summary(client: TestClient, admin_token_headers: dict):
    # Setup course, batch, student
    course_resp = client.post(
        "/api/v1/courses",
        headers=admin_token_headers,
        json={
            "slug": "m4-test-course-attendance",
            "title": "Attendance Test Course",
            "tagline": "Test Tagline",
            "description": "Test Description",
            "category": "Cloud Computing",
            "level": "Beginner",
            "audience": "students",
            "duration_weeks": 8,
            "hours_per_week": 6,
            "format": "Online",
            "prerequisites": [],
            "key_skills": ["AWS"],
            "projects": [],
        },
    )
    course_id = course_resp.json()["id"]

    student_resp = client.post(
        "/api/v1/auth/register",
        json={"email": "attendee_student@vibha.io", "password": "StudentPassword123!", "full_name": "Attendee Student"},
    )
    student_id = student_resp.json()["id"]

    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "attendee_student@vibha.io", "password": "StudentPassword123!"},
    )
    student_headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    batch_resp = client.post(
        "/api/v1/batches",
        headers=admin_token_headers,
        json={"name": "Beta Cohort 2026", "code": "BETA-2026", "course_id": course_id},
    )
    batch_id = batch_resp.json()["id"]

    client.post(
        f"/api/v1/batches/{batch_id}/students",
        headers=admin_token_headers,
        json={"student_ids": [student_id]},
    )

    # Mark attendance
    mark_resp = client.post(
        f"/api/v1/attendance/batch/{batch_id}",
        headers=admin_token_headers,
        json={
            "batch_id": batch_id,
            "session_date": "2026-10-23",
            "records": [
                {"student_id": student_id, "status": "PRESENT", "remarks": "On time, active participation"}
            ],
        },
    )
    assert mark_resp.status_code == 200
    assert len(mark_resp.json()) == 1
    assert mark_resp.json()[0]["status"] == "PRESENT"

    # Get batch summary
    summary_resp = client.get(
        f"/api/v1/attendance/batch/{batch_id}",
        headers=admin_token_headers,
    )
    assert summary_resp.status_code == 200
    stats = summary_resp.json()["student_stats"]
    assert len(stats) == 1
    assert stats[0]["attendance_percentage"] == 100.0

    # Student views their personal attendance
    my_att_resp = client.get("/api/v1/attendance/my", headers=student_headers)
    assert my_att_resp.status_code == 200
    assert len(my_att_resp.json()) == 1


def test_assessment_flow_answers_hidden_and_evaluation(client: TestClient, admin_token_headers: dict):
    # 1. Create course
    course_resp = client.post(
        "/api/v1/courses",
        headers=admin_token_headers,
        json={
            "slug": "m4-test-assessment-course",
            "title": "Assessment Test Course",
            "tagline": "Test Tagline",
            "description": "Test Description",
            "category": "Software Engineering",
            "level": "Intermediate",
            "audience": "students",
            "duration_weeks": 6,
            "hours_per_week": 5,
            "format": "Online",
            "prerequisites": [],
            "key_skills": ["SQL"],
            "projects": [],
        },
    )
    course_id = course_resp.json()["id"]

    # 2. Admin creates assessment with questions
    assessment_resp = client.post(
        "/api/v1/assessments",
        headers=admin_token_headers,
        json={
            "course_id": course_id,
            "title": "SQL & Relational DB Quiz",
            "description": "Test understanding of JOINs and ACID transactions",
            "assessment_type": "QUIZ",
            "passing_score": 70,
            "time_limit_minutes": 25,
            "questions": [
                {
                    "question_text": "Which SQL clause filters records after aggregation with GROUP BY?",
                    "question_type": "MCQ",
                    "options": [{"id": "A", "text": "WHERE"}, {"id": "B", "text": "HAVING"}, {"id": "C", "text": "LIMIT"}, {"id": "D", "text": "ORDER BY"}],
                    "correct_answer": "B",
                    "points": 50,
                    "explanation": "HAVING filters grouped rows after aggregation.",
                    "order_index": 1,
                },
                {
                    "question_text": "Which normal form addresses transitive dependencies?",
                    "question_type": "MCQ",
                    "options": [{"id": "A", "text": "1NF"}, {"id": "B", "text": "2NF"}, {"id": "C", "text": "3NF"}, {"id": "D", "text": "BCNF"}],
                    "correct_answer": "C",
                    "points": 50,
                    "explanation": "3NF requires that no non-key attribute is transitively dependent on the primary key.",
                    "order_index": 2,
                },
            ],
        },
    )
    assert assessment_resp.status_code == 201
    assessment_id = assessment_resp.json()["id"]

    # 3. Student registers and fetches assessment
    client.post(
        "/api/v1/auth/register",
        json={"email": "quiz_student@vibha.io", "password": "StudentPassword123!", "full_name": "Quiz Taker"},
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "quiz_student@vibha.io", "password": "StudentPassword123!"},
    )
    student_headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    get_resp = client.get(f"/api/v1/assessments/{assessment_id}", headers=student_headers)
    assert get_resp.status_code == 200
    q_list = get_resp.json()["questions"]
    assert len(q_list) == 2
    # CRITICAL: Verify correct_answer and explanation are NOT leaked to the student!
    for q in q_list:
        assert "correct_answer" not in q
        assert "explanation" not in q

    q1_id = str(q_list[0]["id"])
    q2_id = str(q_list[1]["id"])

    # 4. Student submits answers (1 correct, 1 wrong = 50% score -> Fail)
    attempt1_resp = client.post(
        f"/api/v1/assessments/{assessment_id}/attempt",
        headers=student_headers,
        json={"answers": {q1_id: "B", q2_id: "A"}},
    )
    assert attempt1_resp.status_code == 200
    att1_data = attempt1_resp.json()
    assert att1_data["score"] == 50.0
    assert att1_data["percentage"] == 50.0
    assert att1_data["passed"] is False
    assert len(att1_data["detailed_results"]) == 2

    # 5. Student retakes and passes (both correct = 100% -> Pass)
    attempt2_resp = client.post(
        f"/api/v1/assessments/{assessment_id}/attempt",
        headers=student_headers,
        json={"answers": {q1_id: "B", q2_id: "C"}},
    )
    assert attempt2_resp.status_code == 200
    att2_data = attempt2_resp.json()
    assert att2_data["score"] == 100.0
    assert att2_data["percentage"] == 100.0
    assert att2_data["passed"] is True


def test_assignment_submission_and_trainer_grading(client: TestClient, admin_token_headers: dict):
    # Setup course
    course_resp = client.post(
        "/api/v1/courses",
        headers=admin_token_headers,
        json={
            "slug": "m4-test-assignment-course",
            "title": "Assignment Course",
            "tagline": "Test Tagline",
            "description": "Test Description",
            "category": "Full Stack",
            "level": "Intermediate",
            "audience": "students",
            "duration_weeks": 8,
            "hours_per_week": 6,
            "format": "Online",
            "prerequisites": [],
            "key_skills": ["React"],
            "projects": [],
        },
    )
    course_id = course_resp.json()["id"]

    client.post(
        "/api/v1/auth/register",
        json={"email": "assign_student@vibha.io", "password": "StudentPassword123!", "full_name": "Assignment Student"},
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "assign_student@vibha.io", "password": "StudentPassword123!"},
    )
    student_headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    # Student submits assignment
    sub_resp = client.post(
        "/api/v1/submissions",
        headers=student_headers,
        json={
            "course_id": course_id,
            "title": "Full-Stack E-Commerce Capstone",
            "github_url": "https://github.com/student/vibha-ecommerce-capstone",
            "notes": "Implemented JWT auth, stripe webhooks, and unit tests with 90% coverage.",
        },
    )
    assert sub_resp.status_code == 201
    submission_id = sub_resp.json()["id"]
    assert sub_resp.json()["status"] == "PENDING"

    # Trainer/Admin fetches pending queue
    pending_resp = client.get("/api/v1/submissions/pending", headers=admin_token_headers)
    assert pending_resp.status_code == 200
    pending_ids = [s["id"] for s in pending_resp.json()]
    assert submission_id in pending_ids

    # Grade submission
    grade_resp = client.put(
        f"/api/v1/submissions/{submission_id}/grade",
        headers=admin_token_headers,
        json={
            "status": "GRADED",
            "grade": 94.5,
            "trainer_feedback": "Excellent clean architecture! Great separation of repository layers and comprehensive test suite.",
        },
    )
    assert grade_resp.status_code == 200
    assert grade_resp.json()["status"] == "GRADED"
    assert grade_resp.json()["grade"] == 94.5

    # Student views their updated submission
    my_subs = client.get("/api/v1/submissions/my", headers=student_headers)
    assert my_subs.status_code == 200
    assert my_subs.json()[0]["status"] == "GRADED"
    assert my_subs.json()[0]["trainer_feedback"] is not None


def test_certificate_eligibility_and_public_verification(client: TestClient, admin_token_headers: dict):
    # Setup course with module and 1 lesson
    course_resp = client.post(
        "/api/v1/courses",
        headers=admin_token_headers,
        json={
            "slug": "m4-test-cert-course",
            "title": "Certificate Verified Course",
            "tagline": "Test Tagline",
            "description": "Test Description",
            "category": "Cloud Computing",
            "level": "Beginner",
            "audience": "students",
            "duration_weeks": 4,
            "hours_per_week": 4,
            "format": "Online",
            "prerequisites": [],
            "key_skills": ["Docker"],
            "projects": [],
        },
    )
    course_id = course_resp.json()["id"]

    mod_resp = client.post(
        f"/api/v1/courses/{course_id}/modules",
        headers=admin_token_headers,
        json={"title": "Container Fundamentals", "order_index": 1},
    )
    mod_id = mod_resp.json()["id"]

    lesson_resp = client.post(
        f"/api/v1/courses/{course_id}/modules/{mod_id}/lessons",
        headers=admin_token_headers,
        json={"title": "Introduction to Docker", "slug": "intro-docker", "lesson_type": "TEXT", "duration_min": 30, "order_index": 1},
    )
    lesson_id = lesson_resp.json()["id"]

    # Student registers and enrolls
    client.post(
        "/api/v1/auth/register",
        json={"email": "cert_student@vibha.io", "password": "StudentPassword123!", "full_name": "Graduating Student"},
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "cert_student@vibha.io", "password": "StudentPassword123!"},
    )
    student_headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    client.post("/api/v1/enrollments", headers=student_headers, json={"course_id": course_id})

    # Ineligible attempt: progress is 0%
    claim_resp1 = client.post(
        "/api/v1/certificates/claim",
        headers=student_headers,
        json={"course_id": course_id},
    )
    assert claim_resp1.status_code == 400
    assert "Ineligible" in claim_resp1.json()["detail"]

    # Student completes lesson -> progress becomes 100%
    client.post(f"/api/v1/lessons/{lesson_id}/complete", headers=student_headers)

    # Now eligible! Claim certificate
    claim_resp2 = client.post(
        "/api/v1/certificates/claim",
        headers=student_headers,
        json={"course_id": course_id},
    )
    assert claim_resp2.status_code == 200
    cert_data = claim_resp2.json()
    cert_code = cert_data["certificate_code"]
    cert_id = cert_data["id"]
    assert "VIB-CERT-" in cert_code
    assert cert_data["is_revoked"] is False

    # Public verification (no auth headers required)
    pub_resp = client.get(f"/api/v1/certificates/verify/{cert_code}")
    assert pub_resp.status_code == 200
    assert pub_resp.json()["valid"] is True
    assert pub_resp.json()["student_name"] == "Graduating Student"

    # Admin revokes certificate
    revoke_resp = client.patch(
        f"/api/v1/certificates/{cert_id}/revoke",
        headers=admin_token_headers,
        json={"reason": "Plagiarism detected in submission audit"},
    )
    assert revoke_resp.status_code == 200
    assert revoke_resp.json()["is_revoked"] is True

    # Public verification now reflects revocation
    pub_resp2 = client.get(f"/api/v1/certificates/verify/{cert_code}")
    assert pub_resp2.status_code == 200
    assert pub_resp2.json()["valid"] is False
    assert pub_resp2.json()["is_revoked"] is True
    assert "REVOKED" in pub_resp2.json()["message"]
