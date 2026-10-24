import pytest
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.organization import Organization, OrganizationType


@pytest.fixture
def test_admin_user(db_session):
    admin = User(
        email="admin@vibha-edtech.com",
        hashed_password=get_password_hash("AdminPass123!"),
        full_name="Platform Admin",
        role=UserRole.ADMIN,
        is_active=True,
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


@pytest.fixture
def admin_token(client, test_admin_user):
    res = client.post("/api/v1/auth/login", json={
        "email": "admin@vibha-edtech.com",
        "password": "AdminPass123!",
    })
    return res.json()["access_token"]


def test_register_student_success(client):
    payload = {
        "email": "student1@example.com",
        "password": "SecurePassword1",
        "full_name": "Rohan Deshmukh",
        "phone": "+91 9876543210",
        "role": "STUDENT",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "student1@example.com"
    assert data["full_name"] == "Rohan Deshmukh"
    assert data["role"] == "STUDENT"
    assert data["is_active"] is True
    assert "id" in data


def test_register_duplicate_email_fails(client):
    payload = {
        "email": "duplicate@example.com",
        "password": "SecurePassword1",
        "full_name": "First User",
    }
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already registered" in res2.json()["detail"].lower()


def test_register_weak_password_fails(client):
    # Short password
    res = client.post("/api/v1/auth/register", json={
        "email": "short@example.com",
        "password": "short",
        "full_name": "Test User",
    })
    assert res.status_code == 422

    # Password without digits
    res2 = client.post("/api/v1/auth/register", json={
        "email": "nodigits@example.com",
        "password": "NoDigitsHere",
        "full_name": "Test User",
    })
    assert res2.status_code == 422


def test_register_admin_role_escalation_prevented(client):
    """Public registration cannot assign ADMIN or SUPER_ADMIN roles."""
    res = client.post("/api/v1/auth/register", json={
        "email": "hacker@example.com",
        "password": "SecurePassword1",
        "full_name": "Fake Admin",
        "role": "SUPER_ADMIN",
    })
    assert res.status_code == 422


def test_login_success_and_cookie(client):
    # Register user
    client.post("/api/v1/auth/register", json={
        "email": "loginuser@example.com",
        "password": "ValidPassword9",
        "full_name": "Login User",
    })

    # Login
    response = client.post("/api/v1/auth/login", json={
        "email": "loginuser@example.com",
        "password": "ValidPassword9",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    # Verify HTTP-only cookie set
    assert "access_token" in response.cookies


def test_login_wrong_password_fails(client):
    client.post("/api/v1/auth/register", json={
        "email": "wrongpw@example.com",
        "password": "CorrectPassword1",
        "full_name": "User",
    })
    response = client.post("/api/v1/auth/login", json={
        "email": "wrongpw@example.com",
        "password": "IncorrectPassword999",
    })
    assert response.status_code == 401


def test_login_account_lockout_after_failed_attempts(client):
    client.post("/api/v1/auth/register", json={
        "email": "lockout@example.com",
        "password": "CorrectPassword1",
        "full_name": "Lockout User",
    })

    # Fail 5 times
    for _ in range(5):
        client.post("/api/v1/auth/login", json={
            "email": "lockout@example.com",
            "password": "WrongPassword!",
        })

    # 6th attempt is locked
    res = client.post("/api/v1/auth/login", json={
        "email": "lockout@example.com",
        "password": "CorrectPassword1",
    })
    assert res.status_code == 403
    assert "locked" in res.json()["detail"].lower()


def test_get_me_authenticated(client):
    reg = client.post("/api/v1/auth/register", json={
        "email": "metest@example.com",
        "password": "Password123",
        "full_name": "Me User",
    })
    user_id = reg.json()["id"]

    login = client.post("/api/v1/auth/login", json={
        "email": "metest@example.com",
        "password": "Password123",
    })
    token = login.json()["access_token"]

    # Call /me with Bearer token
    res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["id"] == user_id
    assert res.json()["email"] == "metest@example.com"


def test_get_me_unauthenticated_fails(client):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401


def test_rbac_student_forbidden_from_admin_route(client):
    # Register student
    client.post("/api/v1/auth/register", json={
        "email": "student_rbac@example.com",
        "password": "Password123",
        "full_name": "Student RBAC",
        "role": "STUDENT",
    })
    login = client.post("/api/v1/auth/login", json={
        "email": "student_rbac@example.com",
        "password": "Password123",
    })
    student_token = login.json()["access_token"]

    # Student attempts to list all users (Admin only)
    res = client.get("/api/v1/users", headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 403
    assert "not permitted" in res.json()["detail"].lower()


def test_rbac_admin_allowed_on_admin_route(client, admin_token):
    res = client.get("/api/v1/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_password_reset_flow(client):
    # Register
    client.post("/api/v1/auth/register", json={
        "email": "resetuser@example.com",
        "password": "OldPassword1",
        "full_name": "Reset User",
    })

    # Request reset
    forgot_res = client.post("/api/v1/auth/forgot-password", json={
        "email": "resetuser@example.com",
    })
    assert forgot_res.status_code == 200
    dev_token = forgot_res.json()["dev_reset_token"]
    assert dev_token is not None

    # Confirm reset
    confirm_res = client.post("/api/v1/auth/reset-password", json={
        "token": dev_token,
        "new_password": "BrandNewPassword2",
    })
    assert confirm_res.status_code == 200

    # Old password no longer works
    old_login = client.post("/api/v1/auth/login", json={
        "email": "resetuser@example.com",
        "password": "OldPassword1",
    })
    assert old_login.status_code == 401

    # New password works
    new_login = client.post("/api/v1/auth/login", json={
        "email": "resetuser@example.com",
        "password": "BrandNewPassword2",
    })
    assert new_login.status_code == 200
    assert "access_token" in new_login.json()
