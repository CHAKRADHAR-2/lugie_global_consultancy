"""System and Lead Audit Logs API."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import PermissionDeniedError
from app.dependencies import get_current_active_user
from app.models.audit import AuditLog
from app.models.lead import LeadAuditLog

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])

ADMIN_ROLES = ["super_admin", "admin"]


class AuditLogResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID | None = None
    action: str
    resource_type: str | None = None
    resource_id: uuid.UUID | None = None
    details: dict | None = None
    ip_address: str | None = None
    user_agent: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class LeadAuditResponse(BaseModel):
    id: uuid.UUID
    lead_id: uuid.UUID
    changed_by_user_id: uuid.UUID | None = None
    field_name: str
    old_value: str | None = None
    new_value: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


def _require_admin(user: dict) -> None:
    if not any(r in ADMIN_ROLES for r in user.get("roles", [])):
        raise PermissionDeniedError("Admin permission required.")


@router.get("", response_model=list[AuditLogResponse])
async def list_system_audit_logs(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    action: str | None = Query(default=None),
    resource_type: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
):
    """Admin: View system audit trail logs."""
    _require_admin(current_user)

    stmt = select(AuditLog)
    if action:
        stmt = stmt.where(AuditLog.action.ilike(f"%{action}%"))
    if resource_type:
        stmt = stmt.where(AuditLog.resource_type == resource_type)

    stmt = stmt.order_by(AuditLog.created_at.desc()).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get("/leads", response_model=list[LeadAuditResponse])
async def list_lead_audit_logs(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    lead_id: uuid.UUID | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
):
    """Admin / Staff: View lead audit trail logs."""
    if not any(r in ["super_admin", "admin", "counsellor"] for r in current_user.get("roles", [])):
        raise PermissionDeniedError()

    stmt = select(LeadAuditLog)
    if lead_id:
        stmt = stmt.where(LeadAuditLog.lead_id == lead_id)

    stmt = stmt.order_by(LeadAuditLog.created_at.desc()).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())
