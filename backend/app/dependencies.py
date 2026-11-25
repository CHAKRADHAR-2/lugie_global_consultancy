"""FastAPI dependencies for auth and database access."""

import json
from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.exceptions import UnauthorizedError
from app.core.security import verify_token
from app.models.user import User, UserRole


def _extract_access_token(request: Request) -> str | None:
    """Extract access token from Bearer header, access_token cookie, or Firebase __session cookie."""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1]
    if "access_token" in request.cookies:
        return request.cookies.get("access_token")
    session_raw = request.cookies.get("__session")
    if session_raw:
        try:
            session_data = json.loads(session_raw)
            if isinstance(session_data, dict):
                return session_data.get("a")
        except (ValueError, TypeError):
            pass
    return None


async def get_current_user(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Extract and validate the Bearer token or cookie, return user info with roles."""
    token = _extract_access_token(request)

    if not token:
        raise UnauthorizedError()

    payload = verify_token(token, expected_type="access")
    if payload is None:
        raise UnauthorizedError()

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedError()

    result = await db.execute(
        select(User)
        .options(selectinload(User.user_roles).selectinload(UserRole.role))
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise UnauthorizedError()

    roles = [ur.role.name for ur in user.user_roles]

    return {
        "id": str(user.id),
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
        "is_active": user.is_active,
        "is_verified": user.is_verified,
        "roles": roles,
    }


async def get_current_active_user(
    current_user: Annotated[dict, Depends(get_current_user)],
) -> dict:
    """Ensure the current user is active."""
    if not current_user.get("is_active"):
        raise UnauthorizedError(detail="Account is deactivated.")
    return current_user


async def get_optional_user(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict | None:
    """Return user info if authenticated, None otherwise. No error raised."""
    token = _extract_access_token(request)

    if not token:
        return None
    payload = verify_token(token, expected_type="access")
    if payload is None:
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    result = await db.execute(
        select(User)
        .options(selectinload(User.user_roles).selectinload(UserRole.role))
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if user is None:
        return None

    roles = [ur.role.name for ur in user.user_roles]
    return {
        "id": str(user.id),
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "roles": roles,
        "is_active": user.is_active,
    }
