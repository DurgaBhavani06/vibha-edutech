from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, RoleChecker
from app.models.user import User, UserRole
from app.schemas.user import UserResponse, UserUpdate, UserProfileUpdate

router = APIRouter()


@router.get(
    "",
    response_model=List[UserResponse],
    summary="List all users (Admin & Super Admin only)",
)
def list_users(
    role: Optional[UserRole] = Query(None, description="Filter by user role"),
    organization_id: Optional[int] = Query(None, description="Filter by organization"),
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    current_user: User = Depends(RoleChecker([UserRole.SUPER_ADMIN, UserRole.ADMIN])),
    db: Session = Depends(get_db),
):
    """Retrieve platform users with optional filters. Restricted to administrators."""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if organization_id:
        query = query.filter(User.organization_id == organization_id)

    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    return users


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Get user details by ID",
)
def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve user details. Users can access their own profile; admins can access any profile."""
    if current_user.id != user_id and current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view another user's profile.",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


@router.patch(
    "/{user_id}",
    response_model=UserResponse,
    summary="Update user profile",
)
def update_user(
    user_id: int,
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update profile attributes. Regular users can modify their name/phone; only admins can toggle status."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    is_admin = current_user.role in [UserRole.SUPER_ADMIN, UserRole.ADMIN]
    if current_user.id != user_id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to edit this profile.",
        )

    if update_data.full_name is not None:
        user.full_name = update_data.full_name
    if update_data.phone is not None:
        user.phone = update_data.phone

    # Status toggle restricted to admins
    if update_data.is_active is not None:
        if not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can modify account activation status.",
            )
        user.is_active = update_data.is_active

    db.commit()
    db.refresh(user)
    return user
