from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=120)
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)
    role: Optional[UserRole] = UserRole.STUDENT
    organization_code: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        # Check basic complexity
        has_digit = any(char.isdigit() for char in v)
        has_upper = any(char.isupper() for char in v)
        has_lower = any(char.islower() for char in v)
        if not (has_digit and (has_upper or has_lower)):
            raise ValueError("Password must contain letters and at least one number")
        return v

    @field_validator("role")
    @classmethod
    def prevent_unauthorized_self_registration(cls, v: Optional[UserRole]) -> UserRole:
        # Prevent self-registering as Super Admin or Admin through public registration
        if v in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
            raise ValueError("Administrative roles cannot be self-assigned during registration.")
        return v or UserRole.STUDENT


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=120)
    phone: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    role: UserRole
    organization_id: Optional[int] = None
    is_active: bool
    is_verified: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=100)

    @field_validator("new_password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        has_digit = any(char.isdigit() for char in v)
        if not has_digit:
            raise ValueError("Password must contain at least one number")
        return v


class ChangePassword(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=120)
    phone: Optional[str] = None
