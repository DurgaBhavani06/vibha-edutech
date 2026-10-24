import re
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, RoleChecker, check_organization_access
from app.models.user import User, UserRole
from app.models.organization import Organization, OrganizationType
from app.schemas.organization import OrganizationCreate, OrganizationResponse, OrganizationUpdate

router = APIRouter()


def slugify(text: str) -> str:
    text = text.lower().strip()
    return re.sub(r"[^\w\s-]", "", text).replace(" ", "-")


@router.post(
    "",
    response_model=OrganizationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new college or corporate organization (Admin only)",
)
def create_organization(
    org_in: OrganizationCreate,
    current_user: User = Depends(RoleChecker([UserRole.SUPER_ADMIN, UserRole.ADMIN])),
    db: Session = Depends(get_db),
):
    """Create a new tenant organization (College, Corporate Partner)."""
    # Check code uniqueness
    existing_code = db.query(Organization).filter(Organization.code == org_in.code.upper().strip()).first()
    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An organization with code '{org_in.code}' already exists.",
        )

    base_slug = slugify(org_in.name)
    slug = base_slug
    idx = 1
    while db.query(Organization).filter(Organization.slug == slug).first():
        slug = f"{base_slug}-{idx}"
        idx += 1

    org = Organization(
        name=org_in.name,
        slug=slug,
        code=org_in.code.upper().strip(),
        type=org_in.type,
        website=org_in.website,
        contact_email=org_in.contact_email,
        contact_phone=org_in.contact_phone,
        address=org_in.address,
        is_active=True,
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


@router.get(
    "",
    response_model=List[OrganizationResponse],
    summary="List organizations (Restricted by role & tenant)",
)
def list_organizations(
    type: Optional[OrganizationType] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List organizations.
    - Admins and Super Admins see all organizations.
    - College Coordinators see only their own organization.
    """
    query = db.query(Organization)

    if current_user.role in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        if type:
            query = query.filter(Organization.type == type)
        return query.order_by(Organization.name.asc()).offset(skip).limit(limit).all()

    if current_user.role == UserRole.COLLEGE_COORDINATOR:
        if not current_user.organization_id:
            return []
        org = db.query(Organization).filter(Organization.id == current_user.organization_id).all()
        return org

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You are not authorized to view organization directories.",
    )


@router.get(
    "/{org_id}",
    response_model=OrganizationResponse,
    summary="Get organization by ID (Tenant-isolated)",
)
def get_organization(
    org_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve organization profile enforcing strict tenant authorization."""
    check_organization_access(organization_id=org_id, current_user=current_user)

    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found.")
    return org
