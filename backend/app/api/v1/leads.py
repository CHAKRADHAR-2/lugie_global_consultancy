"""Lead/CRM API endpoints."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rate_limit import limiter
from app.dependencies import get_current_active_user
from app.schemas.lead import (
    FollowUpCreate,
    FollowUpResponse,
    FollowUpUpdate,
    LeadAssignRequest,
    LeadConvertRequest,
    LeadCreatePublic,
    LeadListResponse,
    LeadResponse,
    LeadUpdateAdmin,
)
from app.services import lead_service

router = APIRouter(prefix="/leads", tags=["Leads / CRM"])

# Roles that can manage leads
LEAD_MANAGERS = ["super_admin", "admin", "counsellor"]


# ---------------------------------------------------------------------------
# Public — Contact / Consultation Form
# ---------------------------------------------------------------------------


@router.post("/public", response_model=LeadResponse, status_code=201)
@limiter.limit("5/minute")
async def create_lead_public(
    data: LeadCreatePublic,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Public endpoint: create a lead from contact/consultation form."""
    ip = request.client.host if request.client else None
    lead = await lead_service.create_lead_from_form(db, data, ip_address=ip)
    return lead


# ---------------------------------------------------------------------------
# Admin / Counsellor — List, Detail, Update, Assign, Convert
# ---------------------------------------------------------------------------


@router.get("", response_model=LeadListResponse)
async def list_leads(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    status: str | None = Query(default=None),
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    """List leads (admin sees all, counsellor sees assigned only)."""
    _check_lead_access(current_user)

    assigned_id = None
    if "counsellor" in current_user["roles"] and "admin" not in current_user["roles"] and "super_admin" not in current_user["roles"]:
        assigned_id = current_user["id"]

    leads, total = await lead_service.list_leads(
        db, status=status, assigned_counsellor_id=assigned_id,
        search=search, page=page, page_size=page_size,
    )
    return LeadListResponse(items=leads, total=total, page=page, page_size=page_size)


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Get lead detail."""
    _check_lead_access(current_user)
    lead = await lead_service.get_lead(db, lead_id)
    _check_counsellor_owns_lead(current_user, lead)
    return lead


@router.patch("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: uuid.UUID,
    data: LeadUpdateAdmin,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Update lead details or status."""
    _check_lead_access(current_user)
    ip = request.client.host if request.client else None
    lead = await lead_service.update_lead(
        db, lead_id, data, user_id=current_user["id"], ip_address=ip
    )
    return lead


@router.post("/{lead_id}/assign", response_model=LeadResponse)
async def assign_lead(
    lead_id: uuid.UUID,
    data: LeadAssignRequest,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Assign a lead to a counsellor (admin only)."""
    _check_admin_access(current_user)
    ip = request.client.host if request.client else None
    lead = await lead_service.assign_lead(
        db, lead_id, data, user_id=current_user["id"], ip_address=ip
    )
    return lead


@router.post("/{lead_id}/convert", response_model=LeadResponse)
async def convert_lead(
    lead_id: uuid.UUID,
    data: LeadConvertRequest,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Convert a lead into a registered student."""
    _check_admin_access(current_user)
    ip = request.client.host if request.client else None
    lead = await lead_service.convert_lead(
        db, lead_id, data, user_id=current_user["id"], ip_address=ip
    )
    return lead


# ---------------------------------------------------------------------------
# Follow-Ups
# ---------------------------------------------------------------------------


@router.get("/{lead_id}/follow-ups", response_model=list[FollowUpResponse])
async def list_follow_ups(
    lead_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """List follow-ups for a lead."""
    _check_lead_access(current_user)
    return await lead_service.list_follow_ups(db, lead_id)


@router.post("/{lead_id}/follow-ups", response_model=FollowUpResponse, status_code=201)
async def create_follow_up(
    lead_id: uuid.UUID,
    data: FollowUpCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Create a follow-up for a lead."""
    _check_lead_access(current_user)
    return await lead_service.create_follow_up(db, lead_id, data, user_id=current_user["id"])


@router.patch("/follow-ups/{follow_up_id}", response_model=FollowUpResponse)
async def update_follow_up(
    follow_up_id: uuid.UUID,
    data: FollowUpUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Update a follow-up."""
    _check_lead_access(current_user)
    return await lead_service.update_follow_up(db, follow_up_id, data)


# ---------------------------------------------------------------------------
# Lead Stats
# ---------------------------------------------------------------------------


@router.get("/stats/overview")
async def lead_stats(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Get lead statistics for the dashboard."""
    _check_lead_access(current_user)
    return await lead_service.get_lead_stats(db)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _check_lead_access(user: dict) -> None:
    roles = user.get("roles", [])
    if not any(r in LEAD_MANAGERS for r in roles):
        from app.core.exceptions import PermissionDeniedError
        raise PermissionDeniedError()


def _check_admin_access(user: dict) -> None:
    roles = user.get("roles", [])
    if not any(r in ["super_admin", "admin"] for r in roles):
        from app.core.exceptions import PermissionDeniedError
        raise PermissionDeniedError()


def _check_counsellor_owns_lead(user: dict, lead) -> None:
    """Counsellors can only view leads assigned to them."""
    roles = user.get("roles", [])
    if "super_admin" in roles or "admin" in roles:
        return
    if "counsellor" in roles and str(lead.assigned_counsellor_id) != user["id"]:
        from app.core.exceptions import PermissionDeniedError
        raise PermissionDeniedError("You can only view leads assigned to you.")
