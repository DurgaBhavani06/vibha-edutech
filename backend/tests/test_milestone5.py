import pytest
from fastapi.testclient import TestClient
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.organization import Organization, OrganizationType
from app.models.course import Course
from app.models.batch import Batch
from app.models.batch_membership import BatchMembership
from app.models.attendance import Attendance, AttendanceStatus


@pytest.fixture
def admin_token_headers(client: TestClient, db_session):
    admin = User(
        email="m5_admin@vibha-edtech.com",
        hashed_password=get_password_hash("AdminPass123!"),
        full_name="Milestone 5 Admin",
        role=UserRole.ADMIN,
        is_active=True,
    )
    db_session.add(admin)
    db_session.commit()

    res = client.post("/api/v1/auth/login", json={
        "email": "m5_admin@vibha-edtech.com",
        "password": "AdminPass123!",
    })
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def college_setup(client: TestClient, db_session):
    """Sets up two isolated colleges with coordinators and students."""
    # College A
    org_a = Organization(
        name="RV College of Engineering",
        slug="rvce",
        code="RVCE",
        type=OrganizationType.COLLEGE,
        website="https://rvce.edu.in",
        contact_email="principal@rvce.edu.in",
        is_active=True,
    )
    # College B
    org_b = Organization(
        name="BMS College of Engineering",
        slug="bmsce",
        code="BMSCE",
        type=OrganizationType.COLLEGE,
        website="https://bmsce.ac.in",
        contact_email="principal@bmsce.ac.in",
        is_active=True,
    )
    db_session.add_all([org_a, org_b])
    db_session.commit()

    # Coordinator A
    coord_a = User(
        email="coord_a@rvce.edu.in",
        hashed_password=get_password_hash("CoordPass123!"),
        full_name="Coordinator RVCE",
        role=UserRole.COLLEGE_COORDINATOR,
        organization_id=org_a.id,
        is_active=True,
    )
    # Coordinator B
    coord_b = User(
        email="coord_b@bmsce.ac.in",
        hashed_password=get_password_hash("CoordPass123!"),
        full_name="Coordinator BMSCE",
        role=UserRole.COLLEGE_COORDINATOR,
        organization_id=org_b.id,
        is_active=True,
    )
    # Student in College A
    student_a = User(
        email="student_a@rvce.edu.in",
        hashed_password=get_password_hash("StudentPass123!"),
        full_name="RVCE Student One",
        role=UserRole.STUDENT,
        organization_id=org_a.id,
        is_active=True,
    )
    db_session.add_all([coord_a, coord_b, student_a])
    db_session.commit()

    # Logins
    res_a = client.post("/api/v1/auth/login", json={"email": "coord_a@rvce.edu.in", "password": "CoordPass123!"})
    token_a = res_a.json()["access_token"]

    res_b = client.post("/api/v1/auth/login", json={"email": "coord_b@bmsce.ac.in", "password": "CoordPass123!"})
    token_b = res_b.json()["access_token"]

    # Sample Course
    course = Course(
        title="Autonomous Systems & ROS",
        slug="ros-autonomous-systems",
        tagline="Robotics software architecture",
        description="Applied ROS 2 programming",
        category="Robotics",
        level="Intermediate",
        audience="colleges",
        duration_weeks=10,
        hours_per_week=6,
        is_published=True,
    )
    db_session.add(course)
    db_session.commit()

    return {
        "org_a": org_a,
        "org_b": org_b,
        "headers_a": {"Authorization": f"Bearer {token_a}"},
        "headers_b": {"Authorization": f"Bearer {token_b}"},
        "student_a": student_a,
        "course": course,
    }


def test_college_coordinator_profile_and_tenant_boundary(client: TestClient, college_setup: dict):
    org_a = college_setup["org_a"]
    org_b = college_setup["org_b"]
    headers_a = college_setup["headers_a"]
    headers_b = college_setup["headers_b"]

    # 1. Coordinator A views their own profile
    my_resp = client.get("/api/v1/colleges/my", headers=headers_a)
    assert my_resp.status_code == 200
    assert my_resp.json()["code"] == "RVCE"

    # 2. Coordinator A views College A profile by ID
    a_resp = client.get(f"/api/v1/colleges/{org_a.id}/profile", headers=headers_a)
    assert a_resp.status_code == 200
    assert a_resp.json()["name"] == "RV College of Engineering"

    # 3. Coordinator A tries to access College B profile -> 403 Forbidden!
    forbidden_resp = client.get(f"/api/v1/colleges/{org_b.id}/profile", headers=headers_a)
    assert forbidden_resp.status_code == 403
    assert "Access forbidden" in forbidden_resp.json()["detail"]

    # 4. Coordinator A updates their own college address
    update_resp = client.put(
        f"/api/v1/colleges/{org_a.id}/profile",
        headers=headers_a,
        json={"address": "Mysuru Road, RV Vidyaniketan, Bengaluru"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["address"] == "Mysuru Road, RV Vidyaniketan, Bengaluru"


def test_cross_college_student_isolation(client: TestClient, college_setup: dict):
    org_a = college_setup["org_a"]
    org_b = college_setup["org_b"]
    headers_a = college_setup["headers_a"]
    headers_b = college_setup["headers_b"]

    # 1. Coordinator A lists students for College A -> sees student_a
    students_resp = client.get(f"/api/v1/colleges/{org_a.id}/students", headers=headers_a)
    assert students_resp.status_code == 200
    roster = students_resp.json()
    assert len(roster) == 1
    assert roster[0]["email"] == "student_a@rvce.edu.in"

    # 2. Coordinator B attempts to query College A's student list -> 403 Forbidden!
    cross_resp = client.get(f"/api/v1/colleges/{org_a.id}/students", headers=headers_b)
    assert cross_resp.status_code == 403
    assert "Access forbidden" in cross_resp.json()["detail"]


def test_college_batch_creation_and_isolation(client: TestClient, college_setup: dict):
    org_a = college_setup["org_a"]
    org_b = college_setup["org_b"]
    headers_a = college_setup["headers_a"]
    headers_b = college_setup["headers_b"]
    course = college_setup["course"]

    # 1. Coordinator A creates a batch for College A
    batch_resp = client.post(
        f"/api/v1/colleges/{org_a.id}/batches",
        headers=headers_a,
        json={
            "name": "RVCE Robotics Batch 2026",
            "code": "RVCE-ROB-2026",
            "course_id": course.id,
            "max_students": 50,
        },
    )
    assert batch_resp.status_code == 201
    assert batch_resp.json()["organization_name"] == "RV College of Engineering"

    # 2. Coordinator A lists batches for College A -> 1 batch
    list_resp = client.get(f"/api/v1/colleges/{org_a.id}/batches", headers=headers_a)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1

    # 3. Coordinator B attempts to view College A's batches -> 403 Forbidden!
    cross_resp = client.get(f"/api/v1/colleges/{org_a.id}/batches", headers=headers_b)
    assert cross_resp.status_code == 403

    # 4. Coordinator B attempts to create batch under College A -> 403 Forbidden!
    tamper_resp = client.post(
        f"/api/v1/colleges/{org_a.id}/batches",
        headers=headers_b,
        json={
            "name": "Unauthorized Batch",
            "code": "HACK-2026",
            "course_id": course.id,
        },
    )
    assert tamper_resp.status_code == 403


def test_college_reports_and_csv_export(client: TestClient, college_setup: dict):
    org_a = college_setup["org_a"]
    org_b = college_setup["org_b"]
    headers_a = college_setup["headers_a"]
    headers_b = college_setup["headers_b"]

    # 1. Coordinator A retrieves performance report
    report_resp = client.get(f"/api/v1/colleges/{org_a.id}/reports", headers=headers_a)
    assert report_resp.status_code == 200
    report_data = report_resp.json()
    assert report_data["organization_code"] == "RVCE"
    assert "naac_nba_criterion_summary" in report_data
    assert report_data["total_registered_students"] >= 1

    # 2. Coordinator A exports CSV report
    csv_resp = client.get(f"/api/v1/colleges/{org_a.id}/reports/export", headers=headers_a)
    assert csv_resp.status_code == 200
    assert "text/csv" in csv_resp.headers["content-type"]
    assert "RVCE" in csv_resp.text
    assert "Institution Code,Institution Name" in csv_resp.text

    # 3. Coordinator B attempts to access College A reports -> 403 Forbidden!
    cross_report = client.get(f"/api/v1/colleges/{org_a.id}/reports", headers=headers_b)
    assert cross_report.status_code == 403


def test_college_training_request_proposal_flow(client: TestClient, college_setup: dict, admin_token_headers: dict):
    org_a = college_setup["org_a"]
    headers_a = college_setup["headers_a"]
    headers_b = college_setup["headers_b"]
    course = college_setup["course"]

    # 1. Coordinator A submits semester training proposal
    req_resp = client.post(
        f"/api/v1/colleges/{org_a.id}/training-requests",
        headers=headers_a,
        json={
            "title": "Semester 6 ROS Robotics Bootcamp",
            "course_id": course.id,
            "target_audience": "B.Tech Mechanical & Mechatronics 6th Sem",
            "estimated_students": 75,
            "training_mode": "HYBRID",
            "notes": "Include hardware simulation and ROS 2 navigation packages.",
        },
    )
    assert req_resp.status_code == 201
    req_id = req_resp.json()["id"]
    assert req_resp.json()["status"] == "PENDING"

    # 2. Coordinator A lists training requests
    list_req = client.get(f"/api/v1/colleges/{org_a.id}/training-requests", headers=headers_a)
    assert list_req.status_code == 200
    assert len(list_req.json()) == 1

    # 3. Coordinator B cannot view College A's training requests -> 403 Forbidden!
    cross_req = client.get(f"/api/v1/colleges/{org_a.id}/training-requests", headers=headers_b)
    assert cross_req.status_code == 403

    # 4. Admin approves proposal
    approve_resp = client.patch(
        f"/api/v1/colleges/training-requests/{req_id}/status",
        headers=admin_token_headers,
        json={"status": "APPROVED", "notes": "Approved for Spring 2026 schedule with assigned trainer."},
    )
    assert approve_resp.status_code == 200
    assert approve_resp.json()["status"] == "APPROVED"
