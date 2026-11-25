"""In-app notification endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.dependencies import get_current_active_user
from app.models.notification import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class NotificationResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    type: str | None = None
    title: str | None = None
    message: str | None = None
    is_read: bool = False
    action_url: str | None = None
    created_at: datetime
    model_config = {"from_attributes": True}


class NotificationListResponse(BaseModel):
    items: list[NotificationResponse]
    total: int
    page: int
    page_size: int
    unread_count: int


class NotificationCreate(BaseModel):
    user_id: uuid.UUID
    type: str | None = Field(default=None, max_length=50)
    title: str = Field(min_length=1, max_length=255)
    message: str | None = Field(default=None, max_length=2000)
    action_url: str | None = Field(default=None, max_length=500)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def _get_notification(
    db: AsyncSession, notification_id: uuid.UUID, user_id: str
) -> Notification:
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == uuid.UUID(user_id),
        )
    )
    notif = result.scalar_one_or_none()
    if not notif:
        raise NotFoundError("Notification")
    return notif


# ---------------------------------------------------------------------------
# Unread Count (before /{notification_id} to avoid path conflict)
# ---------------------------------------------------------------------------


@router.get("/unread-count")
async def unread_count(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Return the number of unread notifications for the current user."""
    result = await db.execute(
        select(func.count(Notification.id)).where(
            Notification.user_id == uuid.UUID(current_user["id"]),
            Notification.is_read == False,
        )
    )
    count = result.scalar() or 0
    return {"count": count}


# ---------------------------------------------------------------------------
# Mark All Read (before /{notification_id} routes)
# ---------------------------------------------------------------------------


@router.post("/read-all")
async def mark_all_read(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Mark all unread notifications as read for the current user."""
    await db.execute(
        update(Notification)
        .where(
            Notification.user_id == uuid.UUID(current_user["id"]),
            Notification.is_read == False,
        )
        .values(is_read=True)
    )
    await db.flush()
    return {"message": "All notifications marked as read."}


# ---------------------------------------------------------------------------
# List Notifications
# ---------------------------------------------------------------------------


@router.get("", response_model=NotificationListResponse)
async def list_notifications(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    unread_only: bool = Query(default=False),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    """List the current user's notifications."""
    uid = uuid.UUID(current_user["id"])

    query = select(Notification).where(Notification.user_id == uid)
    if unread_only:
        query = query.where(Notification.is_read == False)

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    unread_q = select(func.count(Notification.id)).where(
        Notification.user_id == uid,
        Notification.is_read == False,
    )
    unread_count = (await db.execute(unread_q)).scalar() or 0

    query = query.order_by(Notification.created_at.desc())
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    result = await db.execute(query)
    items = list(result.scalars().all())

    return NotificationListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        unread_count=unread_count,
    )


# ---------------------------------------------------------------------------
# Flat List (convenience for /me frontend client)
# ---------------------------------------------------------------------------


@router.get("/me", response_model=list[NotificationResponse])
async def list_my_notifications(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """List current user's recent notifications."""
    uid = uuid.UUID(current_user["id"])
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == uid)
        .order_by(Notification.created_at.desc())
        .limit(50)
    )
    return list(result.scalars().all())


# ---------------------------------------------------------------------------
# Get Single Notification
# ---------------------------------------------------------------------------


@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Get a single notification (own only)."""
    return await _get_notification(db, notification_id, current_user["id"])


# ---------------------------------------------------------------------------
# Mark as Read
# ---------------------------------------------------------------------------


@router.post("/{notification_id}/read")
async def mark_read(
    notification_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Mark a notification as read."""
    notif = await _get_notification(db, notification_id, current_user["id"])
    notif.is_read = True
    await db.flush()
    return {"message": "Notification marked as read."}


# ---------------------------------------------------------------------------
# Delete Notification
# ---------------------------------------------------------------------------


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Delete a notification (own only)."""
    notif = await _get_notification(db, notification_id, current_user["id"])
    await db.delete(notif)
    await db.flush()
    return {"message": "Notification deleted."}


# ---------------------------------------------------------------------------
# Admin — Create Notification
# ---------------------------------------------------------------------------


@router.post("", response_model=NotificationResponse, status_code=201)
async def create_notification(
    data: NotificationCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Admin only: create a notification for a specific user."""
    if not any(
        r in ["super_admin", "admin"] for r in current_user.get("roles", [])
    ):
        raise PermissionDeniedError()

    notif = Notification(
        id=uuid.uuid4(),
        user_id=data.user_id,
        type=data.type,
        title=data.title,
        message=data.message,
        action_url=data.action_url,
    )
    db.add(notif)
    await db.flush()
    return notif
