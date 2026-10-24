from typing import Generator, List, Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User, UserRole

# OAuth2 scheme for Swagger UI & Authorization header
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False,
)


def get_token_from_request(
    request: Request,
    bearer_token: Optional[str] = Depends(oauth2_scheme),
) -> Optional[str]:
    """Extract token from Authorization header or secure HTTP-only cookie."""
    if bearer_token:
        return bearer_token
    # Fallback to cookie
    cookie_token = request.cookies.get("access_token")
    if cookie_token:
        if cookie_token.startswith("Bearer "):
            return cookie_token[7:]
        return cookie_token
    return None


def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(get_token_from_request),
) -> User:
    """Extract and validate current authenticated user.
    Always resolves role and permissions from trusted server-side database.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is missing subject.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account associated with this token no longer exists.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Please contact support.",
        )

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Convenience dependency returning active user."""
    return current_user


class RoleChecker:
    """Server-side RBAC dependency enforcing permitted roles."""

    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        # SUPER_ADMIN has access to all roles
        if current_user.role == UserRole.SUPER_ADMIN:
            return current_user

        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required role: {[r.value for r in self.allowed_roles]}. Your role: {current_user.role.value}.",
            )
        return current_user


def check_organization_access(
    organization_id: int,
    current_user: User = Depends(get_current_user),
) -> None:
    """Enforce multi-tenant data isolation:
    Users cannot access another organization's records unless they are Super Admin or Admin.
    """
    if current_user.role in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        return

    if current_user.organization_id != organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You do not have authorization for this organization's records.",
        )
