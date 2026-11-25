"""Auth request/response schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """Student registration request."""

    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    phone: str | None = Field(default=None, max_length=20)


class LoginRequest(BaseModel):
    """Login request."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Internal token response (not sent to browser directly)."""

    access_token: str
    refresh_token: str
    csrf_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    """Public user representation."""

    id: UUID
    email: str
    first_name: str
    last_name: str
    phone: str | None = None
    roles: list[str] = []
    is_active: bool = True
    is_verified: bool = False
    is_phone_verified: bool = False
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class SendEmailOtpRequest(BaseModel):
    email: EmailStr | None = None


class SendEmailOtpResponse(BaseModel):
    message: str
    email: str | None = None
    test_otp_hint: str | None = None


class VerifyEmailOtpRequest(BaseModel):
    otp: str = Field(min_length=4, max_length=10)
    email: EmailStr | None = None


class SendPhoneOtpRequest(BaseModel):
    phone: str = Field(min_length=8, max_length=20)


class VerifyPhoneOtpRequest(BaseModel):
    phone: str = Field(min_length=8, max_length=20)
    otp: str | None = Field(default=None, max_length=10)
    firebase_token: str | None = None


class VerificationStatusResponse(BaseModel):
    is_email_verified: bool
    is_phone_verified: bool
    email: str
    phone: str | None = None


class ForgotPasswordRequest(BaseModel):
    """Request password reset link."""

    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Reset password with token."""

    token: str
    new_password: str = Field(min_length=8, max_length=128)


class ChangePasswordRequest(BaseModel):
    """Change password while logged in."""

    current_password: str
    new_password: str = Field(min_length=8, max_length=128)
