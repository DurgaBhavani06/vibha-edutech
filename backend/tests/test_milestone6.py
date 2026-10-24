import pytest
from fastapi.testclient import TestClient
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.course import Course
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.ai_usage import AIUsage
from app.core.config import settings


@pytest.fixture
def student_auth(client: TestClient, db_session):
    student = User(
        email="ai_student@vibha.io",
        hashed_password=get_password_hash("StudentPass123!"),
        full_name="AI Student",
        role=UserRole.STUDENT,
        is_active=True,
    )
    db_session.add(student)
    db_session.commit()

    res = client.post("/api/v1/auth/login", json={"email": "ai_student@vibha.io", "password": "StudentPass123!"})
    token = res.json()["access_token"]
    return {"user": student, "headers": {"Authorization": f"Bearer {token}"}}


@pytest.fixture
def trainer_auth(client: TestClient, db_session):
    trainer = User(
        email="ai_trainer@vibha.io",
        hashed_password=get_password_hash("TrainerPass123!"),
        full_name="AI Trainer Lead",
        role=UserRole.TRAINER,
        is_active=True,
    )
    db_session.add(trainer)
    db_session.commit()

    res = client.post("/api/v1/auth/login", json={"email": "ai_trainer@vibha.io", "password": "TrainerPass123!"})
    token = res.json()["access_token"]
    return {"user": trainer, "headers": {"Authorization": f"Bearer {token}"}}


@pytest.fixture
def sample_course(db_session):
    course = Course(
        title="Scalable Microservices with FastAPI",
        slug="fastapi-microservices",
        tagline="Production async APIs and Docker containers",
        description="Async web development with Python 3.12",
        category="Backend",
        level="Intermediate",
        audience="students",
        duration_weeks=8,
        hours_per_week=6,
        is_published=True,
    )
    db_session.add(course)
    db_session.commit()
    return course


def test_ai_tutor_modes_hints_vs_explanation(client: TestClient, student_auth: dict):
    headers = student_auth["headers"]

    # 1. HINT Mode
    hint_resp = client.post(
        "/api/v1/ai/tutor",
        headers=headers,
        json={
            "prompt": "How do I invert a binary tree without recursion?",
            "mode": "HINT",
            "difficulty": "BEGINNER",
        },
    )
    assert hint_resp.status_code == 200
    h_data = hint_resp.json()
    assert h_data["mode"] == "HINT"
    assert "hints" in h_data["response"].lower() or "guidance" in h_data["response"].lower()
    assert h_data["tokens_used"] > 0

    # 2. CODE_EXAMPLE Mode
    code_resp = client.post(
        "/api/v1/ai/tutor",
        headers=headers,
        json={
            "prompt": "Show me an example of an asyncio task queue",
            "mode": "CODE_EXAMPLE",
            "difficulty": "INTERMEDIATE",
        },
    )
    assert code_resp.status_code == 200
    c_data = code_resp.json()
    assert c_data["mode"] == "CODE_EXAMPLE"
    assert "```python" in c_data["response"]


def test_ai_quota_rate_limiting(client: TestClient, student_auth: dict, db_session):
    headers = student_auth["headers"]
    user = student_auth["user"]

    # Pre-populate token usage exceeding quota
    heavy_usage = AIUsage(
        user_id=user.id,
        feature="AI_TUTOR",
        model_name="mock",
        total_tokens=settings.AI_DAILY_TOKEN_QUOTA_PER_USER + 500,
        prompt_tokens=25000,
        completion_tokens=25500,
    )
    db_session.add(heavy_usage)
    db_session.commit()

    # Next call must be blocked with 429
    blocked_resp = client.post(
        "/api/v1/ai/tutor",
        headers=headers,
        json={"prompt": "Explain dependency injection", "mode": "EXPLAIN"},
    )
    assert blocked_resp.status_code == 429
    assert "quota" in blocked_resp.json()["detail"].lower()


def test_rag_document_assistant_grounding_and_citations(
    client: TestClient, student_auth: dict, sample_course: Course, db_session
):
    headers = student_auth["headers"]

    # Seed approved document and chunk
    doc = Document(
        course_id=sample_course.id,
        title="Microservices Architecture Specification",
        source_filename="microservices_spec.md",
        file_type="MARKDOWN",
        is_approved=True,
    )
    db_session.add(doc)
    db_session.flush()

    chunk1 = DocumentChunk(
        document_id=doc.id,
        chunk_index=1,
        content="Service discovery and circuit breaker patterns prevent cascading failures in distributed FastAPI microservices.",
        token_count=20,
    )
    db_session.add(chunk1)
    db_session.commit()

    # 1. Query with matching term "circuit breaker"
    rag_resp = client.post(
        "/api/v1/ai/rag",
        headers=headers,
        json={
            "course_id": sample_course.id,
            "query": "What is the purpose of a circuit breaker pattern in microservices?",
        },
    )
    assert rag_resp.status_code == 200
    r_data = rag_resp.json()
    assert r_data["is_grounded"] is True
    assert len(r_data["citations"]) >= 1
    assert r_data["citations"][0]["document_title"] == "Microservices Architecture Specification"

    # 2. Query with unrelated term (no matching approved document)
    unrelated_resp = client.post(
        "/api/v1/ai/rag",
        headers=headers,
        json={
            "course_id": sample_course.id,
            "query": "Quantum entanglement in particle physics",
        },
    )
    assert unrelated_resp.status_code == 200
    u_data = unrelated_resp.json()
    assert u_data["is_grounded"] is False
    assert len(u_data["citations"]) == 0


def test_question_generator_role_enforcement_and_trainer_review(
    client: TestClient, trainer_auth: dict, student_auth: dict, sample_course: Course
):
    # 1. Student attempting to generate questions is rejected with 403 Forbidden!
    forbidden_resp = client.post(
        "/api/v1/ai/generate-questions",
        headers=student_auth["headers"],
        json={"course_id": sample_course.id, "topic": "Docker Containers", "count": 2},
    )
    assert forbidden_resp.status_code == 403

    # 2. Trainer calls question generator
    gen_resp = client.post(
        "/api/v1/ai/generate-questions",
        headers=trainer_auth["headers"],
        json={
            "course_id": sample_course.id,
            "topic": "SQL Indexing & Query Plans",
            "difficulty": "ADVANCED",
            "count": 2,
        },
    )
    assert gen_resp.status_code == 200
    g_data = gen_resp.json()
    assert g_data["topic"] == "SQL Indexing & Query Plans"
    assert g_data["review_required"] is True  # Enforces human-in-the-loop
    assert len(g_data["draft_questions"]) == 2
    for q in g_data["draft_questions"]:
        assert len(q["options"]) == 4
        assert q["correct_answer"] in ["A", "B", "C", "D"]
        assert q["explanation"] is not None


def test_ai_usage_stats(client: TestClient, student_auth: dict, db_session):
    headers = student_auth["headers"]
    user = student_auth["user"]

    # Record some usage
    db_session.add(AIUsage(user_id=user.id, feature="AI_TUTOR", model_name="mock", total_tokens=150, estimated_cost_usd=0.0002))
    db_session.commit()

    usage_resp = client.get("/api/v1/ai/usage", headers=headers)
    assert usage_resp.status_code == 200
    u_data = usage_resp.json()
    assert u_data["total_requests"] >= 1
    assert u_data["total_tokens_used_today"] >= 150
    assert u_data["quota_remaining"] <= settings.AI_DAILY_TOKEN_QUOTA_PER_USER
