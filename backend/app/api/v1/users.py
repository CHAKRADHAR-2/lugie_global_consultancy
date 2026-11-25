"""Users and staff management API."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.exceptions import (
    DuplicateError,
    NotFoundError,
    PermissionDeniedError,
)
from app.core.security import hash_password
from app.dependencies import get_current_active_user
from app.models.assignment import StaffAssignment
from app.models.user import Role, User, UserRole

router = APIRouter(prefix="/users", tags=["Users"])

ADMIN_ROLES = ["super_admin", "admin"]
STAFF_ROLES = ["super_admin", "admin", "counsellor"]


class UserStaffCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    phone: str | None = Field(default=None, max_length=20)
    role: str = Field(default="counsellor", pattern="^(admin|counsellor)$")


class UserStaffResponse(BaseModel):
    id: uuid.UUID
    email: str
    first_name: str
    last_name: str
    phone: str | None = None
    roles: list[str] = []
    is_active: bool = True
    created_at: datetime
    assigned_leads_count: int = 0
    assigned_students_count: int = 0

    model_config = {"from_attributes": True}


class UserStatusUpdate(BaseModel):
    is_active: bool


class StudentAssignRequest(BaseModel):
    staff_id: uuid.UUID
    role_type: str = Field(default="counsellor", max_length=50)


def _require_admin(user: dict) -> None:
    if not any(r in ADMIN_ROLES for r in user.get("roles", [])):
        raise PermissionDeniedError("Admin permission required.")


def _require_staff(user: dict) -> None:
    if not any(r in STAFF_ROLES for r in user.get("roles", [])):
        raise PermissionDeniedError("Staff permission required.")


@router.get("/counsellors", response_model=list[UserStaffResponse])
async def list_counsellors(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Staff/Admin: List all counsellors for assignments and management."""
    _require_staff(current_user)

    stmt = (
        select(User)
        .join(UserRole, UserRole.user_id == User.id)
        .join(Role, Role.id == UserRole.role_id)
        .where(Role.name.in_(["counsellor", "admin"]))
        .options(selectinload(User.user_roles).selectinload(UserRole.role))
        .distinct()
    )
    result = await db.execute(stmt)
    users = result.scalars().all()

    # Query counts for leads and students assigned to each counsellor
    from app.models.lead import Lead

    res = []
    for u in users:
        role_names = [ur.role.name for ur in u.user_roles]
        lead_count_stmt = select(Lead).where(Lead.assigned_counsellor_id == u.id)
        lead_res = await db.execute(lead_count_stmt)
        assigned_leads = len(lead_res.scalars().all())

        student_count_stmt = select(StaffAssignment).where(
            StaffAssignment.staff_id == u.id, StaffAssignment.is_active.is_(True)
        )
        student_res = await db.execute(student_count_stmt)
        assigned_students = len(student_res.scalars().all())

        res.append(
            UserStaffResponse(
                id=u.id,
                email=u.email,
                first_name=u.first_name,
                last_name=u.last_name,
                phone=u.phone,
                roles=role_names,
                is_active=u.is_active,
                created_at=u.created_at,
                assigned_leads_count=assigned_leads,
                assigned_students_count=assigned_students,
            )
        )
    return res


@router.get("", response_model=list[UserStaffResponse])
async def list_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    role: str | None = Query(default=None),
):
    """Admin: List system users with optional role filter."""
    _require_admin(current_user)

    stmt = select(User).options(selectinload(User.user_roles).selectinload(UserRole.role))
    if role:
        stmt = (
            stmt.join(UserRole, UserRole.user_id == User.id)
            .join(Role, Role.id == UserRole.role_id)
            .where(Role.name == role)
        )
    stmt = stmt.order_by(User.created_at.desc())

    result = await db.execute(stmt)
    users = result.scalars().all()

    res = []
    for u in users:
        role_names = [ur.role.name for ur in u.user_roles]
        res.append(
            UserStaffResponse(
                id=u.id,
                email=u.email,
                first_name=u.first_name,
                last_name=u.last_name,
                phone=u.phone,
                roles=role_names,
                is_active=u.is_active,
                created_at=u.created_at,
                assigned_leads_count=0,
                assigned_students_count=0,
            )
        )
    return res


@router.post("", response_model=UserStaffResponse, status_code=201)
async def create_staff_user(
    data: UserStaffCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Admin: Create a new staff account (counsellor or admin)."""
    _require_admin(current_user)

    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise DuplicateError("A user with this email already exists.")

    role_res = await db.execute(select(Role).where(Role.name == data.role))
    role_obj = role_res.scalar_one_or_none()
    if not role_obj:
        raise NotFoundError(f"Role '{data.role}'")

    user = User(
        id=uuid.uuid4(),
        email=data.email,
        password_hash=hash_password(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone,
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    await db.flush()

    user_role = UserRole(
        id=uuid.uuid4(),
        user_id=user.id,
        role_id=role_obj.id,
        assigned_by=uuid.UUID(current_user["id"]),
    )
    db.add(user_role)
    await db.flush()
    await db.refresh(user)

    return UserStaffResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        phone=user.phone,
        roles=[data.role],
        is_active=user.is_active,
        created_at=user.created_at,
        assigned_leads_count=0,
        assigned_students_count=0,
    )


@router.patch("/{user_id}/status", response_model=UserStaffResponse)
async def toggle_user_status(
    user_id: uuid.UUID,
    data: UserStatusUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Admin: Activate or deactivate a user account."""
    _require_admin(current_user)

    result = await db.execute(
        select(User)
        .options(selectinload(User.user_roles).selectinload(UserRole.role))
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundError("User")

    user.is_active = data.is_active
    await db.flush()
    await db.refresh(user)

    roles = [ur.role.name for ur in user.user_roles]
    return UserStaffResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        phone=user.phone,
        roles=roles,
        is_active=user.is_active,
        created_at=user.created_at,
        assigned_leads_count=0,
        assigned_students_count=0,
    )
