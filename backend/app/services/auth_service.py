"""Authentication service layer."""

import random
import uuid
from datetime import UTC, datetime, timedelta

from jose import jwt as jose_jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.core.exceptions import BadRequestError, DuplicateError, UnauthorizedError
from app.core.redis import (
    revoke_all_user_jtis,
    revoke_refresh_jti,
    store_refresh_jti,
    validate_refresh_jti,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    generate_csrf_token,
    hash_password,
    verify_password,
    verify_token,
)
from app.models.student import StudentProfile
from app.models.user import Role, User, UserRole
from app.schemas.auth import RegisterRequest, UserResponse
from app.services.email_service import send_email_verification_otp

jwt_encode = jose_jwt.encode


async def register_student(db: AsyncSession, data: RegisterRequest) -> User:
    """Register a new student user with profile and role."""
    # Check for duplicate email
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise DuplicateError("A user with this email already exists.")

    # Generate initial 6-digit Email Verification OTP
    email_otp = f"{random.randint(100000, 999999)}"
    otp_expiry = datetime.now(UTC) + timedelta(minutes=10)

    # Create user
    user = User(
        id=uuid.uuid4(),
        email=data.email,
        password_hash=hash_password(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone,
        is_verified=False,
        is_phone_verified=False,
        email_otp=email_otp,
        email_otp_expires_at=otp_expiry,
    )
    db.add(user)
    await db.flush()

    # Trigger Brevo verification email (async, non-blocking)
    try:
        await send_email_verification_otp(user.email, email_otp, user.first_name)
    except Exception as exc:
        print(f"Warning: Failed to send verification email on register: {exc}")

    # Create student profile
    profile = StudentProfile(id=uuid.uuid4(), user_id=user.id)
    db.add(profile)

    # Assign student role
    role_result = await db.execute(select(Role).where(Role.name == "student"))
    student_role = role_result.scalar_one_or_none()
    if student_role:
        user_role = UserRole(id=uuid.uuid4(), user_id=user.id, role_id=student_role.id)
        db.add(user_role)

    await db.flush()

    # Automatically assign onboarding tasks for newly registered student
    try:
        from app.api.v1.tasks import ensure_onboarding_tasks_for_student

        await ensure_onboarding_tasks_for_student(db, profile.id)
        await db.flush()
    except Exception as exc:
        print(f"Warning: Auto-assigning onboarding tasks on register failed: {exc}")

    # Reload user with eager-loaded roles so token creation never triggers lazy='raise'
    reloaded = await db.execute(
        select(User)
        .options(selectinload(User.user_roles).selectinload(UserRole.role))
        .where(User.id == user.id)
    )
    return reloaded.scalar_one()


async def authenticate(db: AsyncSession, email: str, password: str) -> User:
    """Verify credentials and return the user."""
    result = await db.execute(
        select(User)
        .options(selectinload(User.user_roles).selectinload(UserRole.role))
        .where(User.email == email)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(password, user.password_hash):
        raise UnauthorizedError(detail="Invalid email or password.")

    if not user.is_active:
        raise UnauthorizedError(detail="Account is deactivated.")

    # Update last login
    user.last_login_at = datetime.now(UTC)
    await db.flush()

    return user


async def create_tokens(user: User) -> dict:
    """Create access, refresh, and CSRF tokens for the user."""
    roles = [ur.role.name for ur in user.user_roles]
    primary_role = roles[0] if roles else "student"

    access_token = create_access_token(str(user.id), primary_role)
    refresh_token, jti = create_refresh_token(str(user.id), primary_role)
    csrf_token = generate_csrf_token()

    # Store refresh JTI in Redis
    expire_seconds = settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 86400
    await store_refresh_jti(str(user.id), jti, expire_seconds)

    user_response = UserResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        phone=user.phone,
        roles=roles,
        is_active=user.is_active,
        created_at=user.created_at,
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "csrf_token": csrf_token,
        "user": user_response,
    }


async def refresh_tokens(refresh_token_str: str, db: AsyncSession) -> dict:
    """Validate refresh token, rotate JTI, return new tokens."""
    payload = verify_token(refresh_token_str, expected_type="refresh")
    if not payload:
        raise UnauthorizedError(detail="Invalid refresh token.")

    jti = payload.get("jti")
    user_id = payload.get("sub")
    if not jti or not user_id:
        raise UnauthorizedError(detail="Invalid refresh token.")

    # Validate JTI exists in Redis
    stored_user_id = await validate_refresh_jti(jti)
    if stored_user_id is None:
        # Possible replay attack — revoke all tokens for this user
        await revoke_all_user_jtis(user_id)
        raise UnauthorizedError(detail="Refresh token has been revoked. Please login again.")

    if stored_user_id != user_id:
        raise UnauthorizedError(detail="Token mismatch.")

    # Revoke old JTI
    await revoke_refresh_jti(user_id, jti)

    # Fetch user with roles
    result = await db.execute(
        select(User)
        .options(selectinload(User.user_roles).selectinload(UserRole.role))
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise UnauthorizedError(detail="User not found or deactivated.")

    return await create_tokens(user)


async def revoke_tokens(user_id: str, jti: str | None = None) -> None:
    """Revoke a specific refresh token or all tokens for a user."""
    if jti:
        await revoke_refresh_jti(user_id, jti)
    else:
        await revoke_all_user_jtis(user_id)


# ---------------------------------------------------------------------------
# Password Reset
# ---------------------------------------------------------------------------

def create_password_reset_token(user_id: str) -> str:
    """Create a short-lived token for password reset (1 hour)."""
    from datetime import timedelta

    expire = datetime.now(UTC) + timedelta(hours=1)
    payload = {
        "sub": user_id,
        "type": "password_reset",
        "exp": expire,
        "iat": datetime.now(UTC),
        "jti": str(uuid.uuid4()),
    }
    return jwt_encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


async def request_password_reset(db: AsyncSession, email: str) -> None:
    """Generate a reset token and send via email. Always returns success to prevent enumeration."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        # Don't reveal whether the email exists
        return

    token = create_password_reset_token(str(user.id))

    from app.services.email_service import send_password_reset_email
    await send_password_reset_email(user.email, token)


async def reset_password(db: AsyncSession, token: str, new_password: str) -> None:
    """Validate the reset token and update the user's password."""
    payload = verify_token(token, expected_type="password_reset")
    if not payload:
        raise BadRequestError("Invalid or expired reset token.")

    user_id = payload.get("sub")
    if not user_id:
        raise BadRequestError("Invalid reset token.")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise BadRequestError("Invalid reset token.")

    user.password_hash = hash_password(new_password)
    await db.flush()

    # Revoke all existing refresh tokens
    await revoke_all_user_jtis(str(user.id))


async def change_password(
    db: AsyncSession, user_id: str, current_password: str, new_password: str
) -> None:
    """Change password for logged-in user (requires current password)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise UnauthorizedError("User not found.")

    if not verify_password(current_password, user.password_hash):
        raise BadRequestError("Current password is incorrect.")

    user.password_hash = hash_password(new_password)
    await db.flush()

    # Revoke all refresh tokens (force re-login)
    await revoke_all_user_jtis(str(user.id))
