import pytest
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.organization import Organization, OrganizationType


@pytest.fixture
def test_admin_token(client, db_session):
    admin = User(
        email="org_admin@vibha-edtech.com",
        hashed_password=get_password_hash("AdminPass123!"),
        full_name="Admin",
        role=UserRole.ADMIN,
        is_active=True,
    )
    db_session.add(admin)
    db_session.commit()

    res = client.post("/api/v1/auth/login", json={
        "email": "org_admin@vibha-edtech.com",
        "password": "AdminPass123!",
    })
    return res.json()["access_token"]


def test_create_and_list_organization_by_admin(client, test_admin_token):
    payload = {
        "name": "R.V. College of Engineering",
        "code": "RVCE-01",
        "type": "COLLEGE",
        "website": "https://rvce.edu.in",
        "contact_email": "principal@rvce.edu.in",
    }
    response = client.post(
        "/api/v1/organizations",
        json=payload,
        headers={"Authorization": f"Bearer {test_admin_token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "R.V. College of Engineering"
    assert data["code"] == "RVCE-01"
    assert data["slug"] == "rv-college-of-engineering"

    # List organizations as admin
    list_res = client.get(
        "/api/v1/organizations",
        headers={"Authorization": f"Bearer {test_admin_token}"},
    )
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1


def test_tenant_isolation_college_coordinator(client, db_session, test_admin_token):
    # Admin creates two colleges
    org1 = Organization(
        name="Apex Institute of Technology",
        slug="apex-institute",
        code="APEX-01",
        type=OrganizationType.COLLEGE,
        is_active=True,
    )
    org2 = Organization(
        name="Zenith Engineering Academy",
        slug="zenith-academy",
        code="ZENITH-01",
        type=OrganizationType.COLLEGE,
        is_active=True,
    )
    db_session.add_all([org1, org2])
    db_session.commit()
    db_session.refresh(org1)
    db_session.refresh(org2)

    # Create College Coordinator user belonging to Apex (org1)
    coord1 = User(
        email="coordinator@apex.edu",
        hashed_password=get_password_hash("CoordPass123!"),
        full_name="Apex Coordinator",
        role=UserRole.COLLEGE_COORDINATOR,
        organization_id=org1.id,
        is_active=True,
    )
    db_session.add(coord1)
    db_session.commit()

    # Login as coordinator
    login = client.post("/api/v1/auth/login", json={
        "email": "coordinator@apex.edu",
        "password": "CoordPass123!",
    })
    coord_token = login.json()["access_token"]

    # 1. Coordinator can access own organization (org1)
    own_org_res = client.get(
        f"/api/v1/organizations/{org1.id}",
        headers={"Authorization": f"Bearer {coord_token}"},
    )
    assert own_org_res.status_code == 200
    assert own_org_res.json()["name"] == "Apex Institute of Technology"

    # 2. Coordinator is FORBIDDEN from accessing different organization (org2)
    other_org_res = client.get(
        f"/api/v1/organizations/{org2.id}",
        headers={"Authorization": f"Bearer {coord_token}"},
    )
    assert other_org_res.status_code == 403
    assert "forbidden" in other_org_res.json()["detail"].lower()

    # 3. Coordinator listing organizations only sees own organization
    list_res = client.get(
        "/api/v1/organizations",
        headers={"Authorization": f"Bearer {coord_token}"},
    )
    assert list_res.status_code == 200
    org_list = list_res.json()
    assert len(org_list) == 1
    assert org_list[0]["id"] == org1.id
