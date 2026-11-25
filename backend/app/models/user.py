"""User, Role, Permission models and join tables."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDMixin

if TYPE_CHECKING:
    from app.models.student import StudentProfile


class User(UUIDMixin, Base):
    """Platform user (student, counsellor, admin, etc.)."""

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_phone_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    email_otp: Mapped[str | None] = mapped_column(String(10), nullable=True)
    email_otp_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    phone_otp: Mapped[str | None] = mapped_column(String(10), nullable=True)
    phone_otp_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user_roles: Mapped[list[UserRole]] = relationship(
        back_populates="user", lazy="raise", cascade="all, delete-orphan",
        foreign_keys="UserRole.user_id",
    )
    student_profile: Mapped[StudentProfile | None] = relationship(
        "StudentProfile", back_populates="user", lazy="raise", uselist=False
    )


class Role(UUIDMixin, Base):
    """System role (super_admin, admin, counsellor, student, etc.)."""

    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)

    role_permissions: Mapped[list[RolePermission]] = relationship(
        back_populates="role", lazy="raise", cascade="all, delete-orphan"
    )
    user_roles: Mapped[list[UserRole]] = relationship(
        back_populates="role", lazy="raise", cascade="all, delete-orphan"
    )


class Permission(UUIDMixin, Base):
    """Granular permission (resource:action)."""

    __tablename__ = "permissions"

    resource: Mapped[str] = mapped_column(String(100), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    __table_args__ = (
        UniqueConstraint("resource", "action", name="uq_permission_resource_action"),
    )

    role_permissions: Mapped[list[RolePermission]] = relationship(
        back_populates="permission", lazy="raise", cascade="all, delete-orphan"
    )


class UserRole(UUIDMixin, Base):
    """Join table: user ↔ role."""

    __tablename__ = "user_roles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), nullable=False
    )
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    assigned_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )

    __table_args__ = (
        UniqueConstraint("user_id", "role_id", name="uq_user_role"),
    )

    user: Mapped[User] = relationship(
        back_populates="user_roles", lazy="raise", foreign_keys=[user_id]
    )
    role: Mapped[Role] = relationship(back_populates="user_roles", lazy="raise")


class RolePermission(UUIDMixin, Base):
    """Join table: role ↔ permission."""

    __tablename__ = "role_permissions"

    role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), nullable=False
    )
    permission_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("permissions.id", ondelete="CASCADE"), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("role_id", "permission_id", name="uq_role_permission"),
    )

    role: Mapped[Role] = relationship(back_populates="role_permissions", lazy="raise")
    permission: Mapped[Permission] = relationship(
        back_populates="role_permissions", lazy="raise"
    )
