import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
    utc_now,
)
from app.api.deps import get_current_user
from app.models.user import User, UserRole
from app.models.organization import Organization
from app.models.password_reset import PasswordResetToken
from app.models.audit_log import AuditLog
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserLogin,
    PasswordResetRequest,
    PasswordResetConfirm,
    ChangePassword,
)
from app.schemas.token import Token

router = APIRouter()


def log_audit_event(
    db: Session,
    action: str,
    user_id: Optional[int] = None,
    target_type: Optional[str] = None,
    target_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    details: Optional[str] = None,
) -> None:
    """Helper to log security actions to audit trail."""
    try:
        log = AuditLog(
            user_id=user_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            ip_address=ip_address,
            details=details,
        )
        db.add(log)
        db.commit()
    except Exception:
        db.rollback()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new student or professional learner",
)
def register(
    user_in: UserCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    """Register a new user account with secure password hashing and email uniqueness verification."""
    # Check if email is already registered
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address is already registered.",
        )

    # Check organization code if provided
    org_id = None
    if user_in.organization_code:
        org = db.query(Organization).filter(Organization.code == user_in.organization_code.strip()).first()
        if org:
            org_id = org.id

    hashed_pw = get_password_hash(user_in.password)
    user = User(
        email=user_in.email.lower(),
        hashed_password=hashed_pw,
        full_name=user_in.full_name,
        phone=user_in.phone,
        role=user_in.role or UserRole.STUDENT,
        organization_id=org_id,
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    client_ip = request.client.host if request.client else None
    log_audit_event(
        db,
        action="USER_REGISTRATION",
        user_id=user.id,
        target_type="USER",
        target_id=str(user.id),
        ip_address=client_ip,
        details=f"Registered with role {user.role.value}",
    )

    return user


@router.post(
    "/login",
    response_model=Token,
    summary="User login & token issuance",
)
def login(
    response: Response,
    request: Request,
    login_data: UserLogin,
    db: Session = Depends(get_db),
):
    """Authenticate user credentials and issue signed JWT access & refresh tokens."""
    client_ip = request.client.host if request.client else None
    user = db.query(User).filter(User.email == login_data.email.lower()).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check account lockout
    if user.locked_until and user.locked_until > utc_now():
        remaining = max(1, int((user.locked_until - utc_now()).total_seconds() / 60))
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account is temporarily locked due to repeated failed login attempts. Please try again in {remaining} minutes.",
        )

    # Verify password
    if not verify_password(login_data.password, user.hashed_password):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= settings.MAX_LOGIN_ATTEMPTS:
            user.locked_until = utc_now() + timedelta(minutes=settings.LOCKOUT_DURATION_MINUTES)
            log_audit_event(
                db,
                action="ACCOUNT_LOCKED",
                user_id=user.id,
                ip_address=client_ip,
                details=f"Locked for {settings.LOCKOUT_DURATION_MINUTES} minutes after failed attempts",
            )
        db.commit()

        log_audit_event(
            db,
            action="LOGIN_FAILED",
            user_id=user.id,
            ip_address=client_ip,
            details="Invalid password attempt",
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Please contact support.",
        )

    # Successful login: reset failed attempts
    user.failed_login_attempts = 0
    user.locked_until = None
    db.commit()

    access_token = create_access_token(subject=user.id, role=user.role.value)
    refresh_token = create_refresh_token(subject=user.id)
    expires_in_seconds = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60

    # Set secure HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=expires_in_seconds,
        samesite="lax",
        secure=not settings.DEBUG,  # True in production HTTPS
    )

    log_audit_event(
        db,
        action="LOGIN_SUCCESS",
        user_id=user.id,
        ip_address=client_ip,
        details=f"Logged in successfully as {user.role.value}",
    )

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=expires_in_seconds,
    )


@router.post(
    "/logout",
    summary="User logout and session cookie invalidation",
)
def logout(response: Response, current_user: User = Depends(get_current_user)):
    """Clear session cookie and invalidate active browser session."""
    response.delete_cookie("access_token")
    return {"message": "Successfully logged out."}


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user profile",
)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve trusted profile and role information for the active user."""
    return current_user


@router.post(
    "/forgot-password",
    summary="Request a password reset link/token",
)
def forgot_password(
    data: PasswordResetRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Generate a secure password reset token with 1-hour expiration."""
    user = db.query(User).filter(User.email == data.email.lower()).first()
    
    # Generic message to avoid email enumeration attacks
    response_msg = "If your email is registered, you will receive password recovery instructions."

    if not user:
        return {"message": response_msg}

    # Invalidate previous unused reset tokens for this user
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.is_used == False,
    ).update({"is_used": True})

    # Generate random high-entropy token
    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    expires_at = utc_now() + timedelta(hours=1)

    reset_record = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
        is_used=False,
    )
    db.add(reset_record)
    db.commit()

    log_audit_event(
        db,
        action="PASSWORD_RESET_REQUESTED",
        user_id=user.id,
        ip_address=request.client.host if request.client else None,
    )

    # In development/debug mode, return token in response to facilitate testing & local flows
    response_data = {"message": response_msg}
    if settings.DEBUG:
        response_data["dev_reset_token"] = raw_token
        response_data["dev_reset_url"] = f"http://localhost:3000/reset-password?token={raw_token}"

    return response_data


@router.post(
    "/reset-password",
    summary="Reset password with valid recovery token",
)
def reset_password(
    data: PasswordResetConfirm,
    request: Request,
    db: Session = Depends(get_db),
):
    """Confirm password reset using verification token."""
    token_hash = hashlib.sha256(data.token.encode("utf-8")).hexdigest()
    reset_record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash,
        PasswordResetToken.is_used == False,
    ).first()

    if not reset_record or reset_record.expires_at < utc_now():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The password reset token is invalid or has expired.",
        )

    user = db.query(User).filter(User.id == reset_record.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Update password
    user.hashed_password = get_password_hash(data.new_password)
    user.failed_login_attempts = 0
    user.locked_until = None
    reset_record.is_used = True
    db.commit()

    log_audit_event(
        db,
        action="PASSWORD_RESET_COMPLETED",
        user_id=user.id,
        ip_address=request.client.host if request.client else None,
    )

    return {"message": "Your password has been successfully reset. You can now log in."}


@router.post(
    "/change-password",
    summary="Change password for authenticated user",
)
def change_password(
    data: ChangePassword,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Change password with verification of current password."""
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password verification failed.",
        )

    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()

    log_audit_event(
        db,
        action="PASSWORD_CHANGED",
        user_id=current_user.id,
    )

    return {"message": "Password changed successfully."}
