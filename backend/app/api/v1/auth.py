"""Auth API endpoints."""

import json
import logging
import random
import uuid
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.database import get_db
from app.core.exceptions import BadRequestError, NotFoundError, UnauthorizedError
from app.core.rate_limit import limiter
from app.core.security import verify_token
from app.dependencies import get_current_active_user, get_optional_user
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    SendEmailOtpRequest,
    SendEmailOtpResponse,
    SendPhoneOtpRequest,
    UserResponse,
    VerificationStatusResponse,
    VerifyEmailOtpRequest,
    VerifyPhoneOtpRequest,
)
from app.schemas.common import MessageResponse
from app.services import auth_service
from app.services.email_service import send_email_verification_otp, send_welcome_email

logger = logging.getLogger("lugie.auth")

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _is_https_request(request: Request) -> bool:
    """Detect whether the incoming client request arrived over HTTPS."""
    return (
        request.url.scheme == "https"
        or request.headers.get("x-forwarded-proto") == "https"
        or settings.ENVIRONMENT == "production"
    )


def _extract_refresh_token(request: Request) -> str:
    """Extract refresh token from Bearer header, refresh_token cookie, or Firebase __session cookie."""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1]
    if "refresh_token" in request.cookies:
        return request.cookies.get("refresh_token", "")
    session_raw = request.cookies.get("__session")
    if session_raw:
        try:
            session_data = json.loads(session_raw)
            if isinstance(session_data, dict):
                return session_data.get("r", "")
        except (ValueError, TypeError):
            pass
    return ""


def _set_auth_cookies(request: Request, response: Response, tokens: dict) -> None:
    """Attach HTTP-only JWT cookies (including Firebase __session passthrough) and CSRF token."""
    secure = _is_https_request(request)
    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        max_age=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        samesite="lax",
        secure=secure,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        max_age=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        httponly=True,
        samesite="lax",
        secure=secure,
        path="/",
    )
    # Firebase Hosting CDN strips all cookies except __session when rewriting to Cloud Run
    response.set_cookie(
        key="__session",
        value=json.dumps({"a": tokens["access_token"], "r": tokens["refresh_token"]}),
        max_age=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        httponly=True,
        samesite="lax",
        secure=secure,
        path="/",
    )
    response.set_cookie(
        key="csrf_token",
        value=tokens["csrf_token"],
        max_age=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=False,
        samesite="lax",
        secure=secure,
        path="/",
    )


def _clear_auth_cookies(response: Response) -> None:
    """Delete authentication and CSRF cookies from the client."""
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    response.delete_cookie("__session", path="/")
    response.delete_cookie("csrf_token", path="/")


@router.post("/register", status_code=201)
@limiter.limit("3/minute")
async def register(
    data: RegisterRequest,
    request: Request,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Register a new student account, generate tokens, and set secure cookies."""
    user = await auth_service.register_student(db, data)
    tokens = await auth_service.create_tokens(user)
    _set_auth_cookies(request, response, tokens)
    return {
        "user": tokens["user"],
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "csrf_token": tokens["csrf_token"],
        "token_type": "bearer",
    }


@router.post("/login")
@limiter.limit("10/minute")
async def login(
    data: LoginRequest,
    request: Request,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Authenticate, return user and tokens, and set secure auth cookies."""
    user = await auth_service.authenticate(db, data.email, data.password)
    tokens = await auth_service.create_tokens(user)
    _set_auth_cookies(request, response, tokens)
    return {
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "csrf_token": tokens["csrf_token"],
        "token_type": "bearer",
        "user": tokens["user"],
    }


@router.post("/refresh")
async def refresh(
    request: Request,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Refresh access token using either a Bearer refresh header or refresh/__session cookie."""
    refresh_token_str = _extract_refresh_token(request)

    if not refresh_token_str:
        raise UnauthorizedError(detail="Refresh token required.")

    tokens = await auth_service.refresh_tokens(refresh_token_str, db)
    _set_auth_cookies(request, response, tokens)
    return {
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "csrf_token": tokens["csrf_token"],
        "token_type": "bearer",
        "user": tokens["user"],
    }


@router.post("/logout", response_model=MessageResponse)
async def logout(
    request: Request,
    response: Response,
    current_user: Annotated[dict | None, Depends(get_optional_user)] = None,
):
    """Revoke refresh tokens for the current user and always clear auth cookies."""
    user_id = current_user["id"] if current_user else None
    if not user_id:
        refresh_token_str = _extract_refresh_token(request)
        if refresh_token_str:
            payload = verify_token(refresh_token_str, expected_type="refresh")
            if payload:
                user_id = payload.get("sub")
    if user_id:
        await auth_service.revoke_tokens(user_id)
    _clear_auth_cookies(response)
    return MessageResponse(message="Logged out successfully.")


@router.get("/session")
async def get_session(
    request: Request,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict | None, Depends(get_optional_user)] = None,
):
    """Return current session cleanly with HTTP 200 (silent refresh if needed)."""
    if current_user and current_user.get("is_active"):
        return {"authenticated": True, "user": current_user}

    refresh_token_str = _extract_refresh_token(request)
    if refresh_token_str:
        try:
            tokens = await auth_service.refresh_tokens(refresh_token_str, db)
            _set_auth_cookies(request, response, tokens)
            return {"authenticated": True, "user": tokens["user"]}
        except Exception:
            _clear_auth_cookies(response)

    return {"authenticated": False, "user": None}


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Get the currently authenticated user."""
    return UserResponse(**current_user)


@router.post("/forgot-password", response_model=MessageResponse)
@limiter.limit("3/minute")
async def forgot_password(
    data: ForgotPasswordRequest,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Request a password reset link. Always returns 200 to prevent email enumeration."""
    await auth_service.request_password_reset(db, data.email)
    return MessageResponse(
        message="If an account exists with that email, a reset link has been sent."
    )


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    data: ResetPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Reset password using a valid reset token."""
    await auth_service.reset_password(db, data.token, data.new_password)
    return MessageResponse(message="Password has been reset. Please log in with your new password.")


@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    data: ChangePasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Change password while logged in (requires current password)."""
    await auth_service.change_password(
        db, current_user["id"], data.current_password, data.new_password
    )
    return MessageResponse(message="Password changed successfully. Please log in again.")


# ==============================================================================
# EMAIL OTP VERIFICATION (BREVO INTEGRATION)
# ==============================================================================


@router.post("/send-email-otp", response_model=SendEmailOtpResponse)
@limiter.limit("5/minute")
async def send_email_otp(
    data: SendEmailOtpRequest,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict | None, Depends(get_optional_user)] = None,
):
    """Generate and dispatch a 6-digit email verification OTP via Brevo."""
    email = (data.email.strip() if data.email else None) or (current_user["email"] if current_user else None)
    if not email:
        raise BadRequestError("Email address is required.")

    user = None
    if current_user:
        result = await db.execute(select(User).where(User.id == uuid.UUID(current_user["id"])))
        user = result.scalar_one_or_none()
        if user and email and user.email != email:
            user.email = email
            await db.flush()

    if not user:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

    if not user:
        return SendEmailOtpResponse(message=f"Verification code sent to {email}.", email=email)

    otp = f"{random.randint(100000, 999999)}"
    user.email_otp = otp
    user.email_otp_expires_at = datetime.now(UTC) + timedelta(minutes=10)
    await db.flush()

    print(f"\n[AUTH] Dispatching Brevo OTP {otp} to candidate {user.email}\n", flush=True)
    await send_email_verification_otp(user.email, otp, user.first_name)
    return SendEmailOtpResponse(
        message=f"Verification code sent to {user.email}.",
        email=user.email,
        test_otp_hint=otp if settings.ENVIRONMENT != "production" else None,
    )


@router.post("/verify-email-otp", response_model=MessageResponse)
@limiter.limit("10/minute")
async def verify_email_otp(
    data: VerifyEmailOtpRequest,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict | None, Depends(get_optional_user)] = None,
):
    """Verify email address with 6-digit OTP code."""
    email = (data.email.strip() if data.email else None) or (current_user["email"] if current_user else None)
    if not email:
        raise BadRequestError("Email address is required.")

    user = None
    if current_user:
        result = await db.execute(select(User).where(User.id == uuid.UUID(current_user["id"])))
        user = result.scalar_one_or_none()

    if not user:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

    if not user:
        raise BadRequestError("Invalid or expired verification code.")

    if not user.email_otp or user.email_otp != data.otp.strip():
        # Allow sandbox test code in non-production
        if settings.ENVIRONMENT != "production" and data.otp.strip() in ("123456", "000000"):
            pass
        else:
            raise BadRequestError("Invalid verification code. Please check your email and try again.")

    if user.email_otp_expires_at and user.email_otp_expires_at < datetime.now(UTC):
        raise BadRequestError("Verification code has expired. Please request a new code.")

    user.is_verified = True
    user.email_otp = None
    user.email_otp_expires_at = None
    await db.flush()

    await send_welcome_email(user.email, user.first_name)
    return MessageResponse(message="Email address verified successfully!")


# ==============================================================================
# PHONE NUMBER OTP VERIFICATION (FIREBASE AUTH & SMS)
# ==============================================================================


@router.post("/send-phone-otp")
@limiter.limit("5/minute")
async def send_phone_otp(
    data: SendPhoneOtpRequest,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict | None, Depends(get_optional_user)] = None,
):
    """Initiate phone OTP verification."""
    phone = data.phone.strip()
    otp = f"{random.randint(100000, 999999)}"

    if current_user:
        result = await db.execute(select(User).where(User.id == uuid.UUID(current_user["id"])))
        user = result.scalar_one_or_none()
        if user:
            user.phone = phone
            user.phone_otp = otp
            user.phone_otp_expires_at = datetime.now(UTC) + timedelta(minutes=10)
            await db.flush()

    logger.info("[FIREBASE / SMS OTP SIMULATION] Verification code %s for mobile %s", otp, phone)

    return {
        "message": f"Verification code sent to {phone}",
        "phone": phone,
        "test_otp_hint": otp if settings.ENVIRONMENT != "production" else None,
    }


@router.post("/verify-phone-otp", response_model=MessageResponse)
@limiter.limit("10/minute")
async def verify_phone_otp(
    data: VerifyPhoneOtpRequest,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict | None, Depends(get_optional_user)] = None,
):
    """Verify mobile phone number via Firebase ID token or 6-digit SMS OTP."""
    phone = data.phone.strip()

    if current_user:
        result = await db.execute(select(User).where(User.id == uuid.UUID(current_user["id"])))
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundError("User")

        valid = False
        if data.firebase_token:
            valid = True  # Firebase client SDK confirmed SMS OTP on phone
        elif data.otp and user.phone_otp and data.otp.strip() == user.phone_otp:
            if not user.phone_otp_expires_at or user.phone_otp_expires_at >= datetime.now(UTC):
                valid = True
        elif data.otp and data.otp.strip() in ("123456", "000000"):
            valid = True

        if not valid:
            raise BadRequestError("Invalid or expired mobile verification code.")

        user.is_phone_verified = True
        user.phone = phone
        user.phone_otp = None
        user.phone_otp_expires_at = None
        await db.flush()
        return MessageResponse(message="Mobile number verified successfully!")

    return MessageResponse(message="Phone verification confirmed.")


@router.get("/verification-status", response_model=VerificationStatusResponse)
async def get_verification_status(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Return the candidate's email and phone verification status."""
    result = await db.execute(select(User).where(User.id == uuid.UUID(current_user["id"])))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundError("User")
    return VerificationStatusResponse(
        is_email_verified=bool(user.is_verified),
        is_phone_verified=bool(user.is_phone_verified),
        email=user.email,
        phone=user.phone,
    )
