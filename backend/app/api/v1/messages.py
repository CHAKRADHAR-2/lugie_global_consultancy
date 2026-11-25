"""Real-time Chat and Messaging API endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import BadRequestError, NotFoundError, PermissionDeniedError
from app.dependencies import get_current_active_user
from app.models.chat import ChatMessage
from app.models.student import StudentProfile
from app.models.user import Role, User, UserRole

router = APIRouter(prefix="/messages", tags=["Messages & Real-Time Chat"])

ADMIN_ROLES = ["super_admin", "admin"]
STAFF_ROLES = ["super_admin", "admin", "counsellor"]


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class ChatMessageResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    counsellor_id: uuid.UUID | None = None
    sender_id: uuid.UUID
    sender_name: str
    sender_role: str
    message: str
    attachment_url: str | None = None
    attachment_name: str | None = None
    attachment_type: str | None = None
    is_read: bool = False
    created_at: datetime
    model_config = {"from_attributes": True}


class SendMessageRequest(BaseModel):
    message: str = Field(min_length=1)
    student_id: uuid.UUID | None = None
    attachment_url: str | None = None
    attachment_name: str | None = None
    attachment_type: str | None = None


class StudentChatInboxItem(BaseModel):
    student_id: uuid.UUID
    student_name: str
    student_email: str
    counsellor_name: str | None = None
    last_message: str
    last_message_at: datetime
    unread_count: int = 0
    total_messages: int = 0


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def _get_student_profile(db: AsyncSession, user_id: str) -> StudentProfile:
    result = await db.execute(
        select(StudentProfile).where(StudentProfile.user_id == uuid.UUID(user_id))
    )
    profile = result.scalar_one_or_none()
    if not profile:
        u_res = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
        user = u_res.scalar_one_or_none()
        if user:
            profile = StudentProfile(id=uuid.uuid4(), user_id=user.id)
            db.add(profile)
            await db.flush()
            return profile
        raise NotFoundError("Student profile")
    return profile


async def _get_default_counsellor(db: AsyncSession) -> User | None:
    """Resolve an active staff counsellor for assigned chats."""
    res = await db.execute(
        select(User)
        .join(UserRole, User.id == UserRole.user_id)
        .join(Role, UserRole.role_id == Role.id)
        .where(Role.name.in_(["counsellor", "admin"]), User.is_active == True)
        .order_by(User.created_at.asc())
    )
    return res.scalars().first()


# ---------------------------------------------------------------------------
# Student Chat Endpoints
# ---------------------------------------------------------------------------


@router.get("/chat/thread", response_model=list[ChatMessageResponse])
async def get_student_chat_thread(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Retrieve full conversation thread for the logged-in student."""
    profile = await _get_student_profile(db, current_user["id"])
    counsellor = await _get_default_counsellor(db)

    # Fetch messages
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.student_id == profile.id)
        .order_by(ChatMessage.created_at.asc())
    )
    messages = list(result.scalars().all())

    # If new conversation, seed an initial welcome message from counsellor
    if not messages and counsellor:
        seed_msg = ChatMessage(
            id=uuid.uuid4(),
            student_id=profile.id,
            counsellor_id=counsellor.id,
            sender_id=counsellor.id,
            sender_role="counsellor",
            message=(
                f"Hello {current_user.get('first_name', 'there')}! Welcome to Lugie Global Consultancy. "
                "I am your assigned study abroad advisor. Feel free to ask me anything about your university "
                "shortlist, standardized test preparation, or upload your academic documents for review!"
            ),
            is_read=True,
        )
        db.add(seed_msg)
        await db.flush()
        messages = [seed_msg]

    # Mark all counsellor messages as read for student
    for m in messages:
        if m.sender_role in ("counsellor", "admin") and not m.is_read:
            m.is_read = True
    await db.flush()

    # Preload sender names
    user_ids = {m.sender_id for m in messages}
    users_res = await db.execute(select(User).where(User.id.in_(user_ids)))
    user_map = {u.id: f"{u.first_name} {u.last_name}".strip() for u in users_res.scalars().all()}

    return [
        ChatMessageResponse(
            id=m.id,
            student_id=m.student_id,
            counsellor_id=m.counsellor_id,
            sender_id=m.sender_id,
            sender_name=user_map.get(m.sender_id, "Admissions Team"),
            sender_role=m.sender_role,
            message=m.message,
            attachment_url=m.attachment_url,
            attachment_name=m.attachment_name,
            attachment_type=m.attachment_type,
            is_read=m.is_read,
            created_at=m.created_at,
        )
        for m in messages
    ]


@router.post("/chat/send", response_model=ChatMessageResponse, status_code=201)
async def send_chat_message(
    body: SendMessageRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Send a message or document attachment in the chat thread."""
    roles = current_user.get("roles", [])
    is_staff = any(r in STAFF_ROLES for r in roles)

    sender_id = uuid.UUID(current_user["id"])
    sender_name = f"{current_user.get('first_name', '')} {current_user.get('last_name', '')}".strip() or "User"

    if is_staff:
        if not body.student_id:
            raise BadRequestError("student_id is required when staff sends a message.")
        student_id = body.student_id
        sender_role = "counsellor" if "counsellor" in roles else "admin"
        counsellor_id = sender_id
    else:
        profile = await _get_student_profile(db, current_user["id"])
        student_id = profile.id
        sender_role = "student"
        counsellor = await _get_default_counsellor(db)
        counsellor_id = counsellor.id if counsellor else None

    msg = ChatMessage(
        id=uuid.uuid4(),
        student_id=student_id,
        counsellor_id=counsellor_id,
        sender_id=sender_id,
        sender_role=sender_role,
        message=body.message,
        attachment_url=body.attachment_url,
        attachment_name=body.attachment_name,
        attachment_type=body.attachment_type,
        is_read=False,
    )
    db.add(msg)
    await db.flush()

    return ChatMessageResponse(
        id=msg.id,
        student_id=msg.student_id,
        counsellor_id=msg.counsellor_id,
        sender_id=msg.sender_id,
        sender_name=sender_name,
        sender_role=msg.sender_role,
        message=msg.message,
        attachment_url=msg.attachment_url,
        attachment_name=msg.attachment_name,
        attachment_type=msg.attachment_type,
        is_read=msg.is_read,
        created_at=msg.created_at,
    )


# ---------------------------------------------------------------------------
# Staff / Counsellor & Admin Supervision Endpoints
# ---------------------------------------------------------------------------


@router.get("/chat/counsellor/inbox", response_model=list[StudentChatInboxItem])
async def get_counsellor_chat_inbox(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Counsellor view: list student threads with last message & unread badge."""
    roles = current_user.get("roles", [])
    if not any(r in STAFF_ROLES for r in roles):
        raise PermissionDeniedError("Staff privileges required.")

    # Get all active student profiles so counsellors can chat with any student
    p_res = await db.execute(
        select(StudentProfile, User)
        .join(User, StudentProfile.user_id == User.id)
        .where(User.is_active == True)
        .order_by(StudentProfile.created_at.desc())
    )
    students = p_res.all()

    inbox_items = []
    for profile, user in students:
        s_id = profile.id
        # Last message
        last_m = (
            await db.execute(
                select(ChatMessage)
                .where(ChatMessage.student_id == s_id)
                .order_by(ChatMessage.created_at.desc())
            )
        ).scalars().first()

        # Unread count
        unread_cnt = (
            await db.execute(
                select(func.count(ChatMessage.id)).where(
                    ChatMessage.student_id == s_id,
                    ChatMessage.sender_role == "student",
                    ChatMessage.is_read == False,
                )
            )
        ).scalar() or 0

        # Total messages
        total_cnt = (
            await db.execute(
                select(func.count(ChatMessage.id)).where(
                    ChatMessage.student_id == s_id
                )
            )
        ).scalar() or 0

        inbox_items.append(
            StudentChatInboxItem(
                student_id=s_id,
                student_name=f"{user.first_name} {user.last_name}".strip() or user.email,
                student_email=user.email,
                counsellor_name="Admissions Advisory",
                last_message=last_m.message if last_m else "No messages yet — click to chat",
                last_message_at=last_m.created_at if last_m else profile.created_at,
                unread_count=unread_cnt,
                total_messages=total_cnt,
            )
        )

    inbox_items.sort(key=lambda x: (x.unread_count > 0, x.total_messages > 0, x.last_message_at), reverse=True)
    return inbox_items


@router.get("/chat/counsellor/student/{student_id}", response_model=list[ChatMessageResponse])
async def get_counsellor_student_chat(
    student_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Counsellor view: view thread for a student and mark student messages as read."""
    roles = current_user.get("roles", [])
    if not any(r in STAFF_ROLES for r in roles):
        raise PermissionDeniedError("Staff privileges required.")

    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.student_id == student_id)
        .order_by(ChatMessage.created_at.asc())
    )
    messages = list(result.scalars().all())

    # Mark student messages as read
    for m in messages:
        if m.sender_role == "student" and not m.is_read:
            m.is_read = True
    await db.flush()

    user_ids = {m.sender_id for m in messages}
    users_res = await db.execute(select(User).where(User.id.in_(user_ids)))
    user_map = {u.id: f"{u.first_name} {u.last_name}".strip() for u in users_res.scalars().all()}

    return [
        ChatMessageResponse(
            id=m.id,
            student_id=m.student_id,
            counsellor_id=m.counsellor_id,
            sender_id=m.sender_id,
            sender_name=user_map.get(m.sender_id, "User"),
            sender_role=m.sender_role,
            message=m.message,
            attachment_url=m.attachment_url,
            attachment_name=m.attachment_name,
            attachment_type=m.attachment_type,
            is_read=m.is_read,
            created_at=m.created_at,
        )
        for m in messages
    ]
