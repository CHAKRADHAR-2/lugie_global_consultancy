"""Counsellor Tasks & Admissions Action Items API endpoints."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.dependencies import get_current_active_user
from app.models.student import StudentProfile
from app.models.task import CounsellorTask
from app.models.user import User

router = APIRouter(prefix="/tasks", tags=["Counsellor Tasks"])

STAFF_ROLES = ["super_admin", "admin", "counsellor"]


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class CounsellorTaskResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    counsellor_id: uuid.UUID | None = None
    student_name: str
    student_email: str
    student_phone: str | None = None
    student_intake: str | None = None
    title: str
    description: str | None = None
    category: str
    priority: str
    status: str
    due_date: datetime | None = None
    completed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class TaskCreateRequest(BaseModel):
    student_id: uuid.UUID
    title: str = Field(min_length=2, max_length=255)
    description: str | None = None
    category: str = Field(default="profile_evaluation")
    priority: str = Field(default="medium")  # urgent, high, medium, low
    due_days: int = Field(default=3, ge=1, le=90)


class TaskUpdateRequest(BaseModel):
    status: str | None = Field(default=None)  # pending, in_progress, completed
    priority: str | None = None
    description: str | None = None


# ---------------------------------------------------------------------------
# Automated Task Seeder Helper
# ---------------------------------------------------------------------------


async def ensure_onboarding_tasks_for_student(
    db: AsyncSession, student_profile_id: uuid.UUID, counsellor_id: uuid.UUID | None = None
) -> list[CounsellorTask]:
    """Auto-generate 5 structured admissions tasks for newly registered or converted students."""
    # Check if student already has tasks
    existing = await db.execute(
        select(func.count(CounsellorTask.id)).where(CounsellorTask.student_id == student_profile_id)
    )
    count = existing.scalar() or 0
    if count > 0:
        res = await db.execute(
            select(CounsellorTask)
            .where(CounsellorTask.student_id == student_profile_id)
            .order_by(CounsellorTask.due_date.asc())
        )
        return list(res.scalars().all())

    now = datetime.now(UTC)
    template_tasks = [
        (
            "Initial Profile Assessment & Gap Analysis",
            "Evaluate candidate's undergraduate CGPA, backlogs, and target study destinations. Identify academic strengths and remediation needs.",
            "profile_evaluation",
            "high",
            now + timedelta(days=2),
        ),
        (
            "Review Academic Transcripts & Marksheet Uploads",
            "Audit uploaded Class X, Class XII, and semester consolidated marksheets via security verification desk.",
            "document_review",
            "high",
            now + timedelta(days=3),
        ),
        (
            "Formulate Curated University Strategy (Dream/Target/Safe)",
            "Calibrate realistic institutional admissions tiers matching student GPA and GRE/IELTS proficiency.",
            "shortlisting",
            "medium",
            now + timedelta(days=5),
        ),
        (
            "Evaluate Statement of Purpose (SOP) & LOR Readiness",
            "Review student's draft SOP against faculty research modules and verify 3 academic recommendation letters.",
            "sop_review",
            "medium",
            now + timedelta(days=7),
        ),
        (
            "Visa Eligibility & Financial Solvency Pre-Screening",
            "Check liquid fund availability (₹25L–35L), sponsor documentation, and schedule 1-on-1 mock visa interview.",
            "visa_guidance",
            "low",
            now + timedelta(days=10),
        ),
    ]

    created_tasks = []
    for title, desc_text, cat, prio, due in template_tasks:
        task = CounsellorTask(
            id=uuid.uuid4(),
            student_id=student_profile_id,
            counsellor_id=counsellor_id,
            title=title,
            description=desc_text,
            category=cat,
            priority=prio,
            status="pending",
            due_date=due,
        )
        db.add(task)
        created_tasks.append(task)

    await db.flush()
    return created_tasks


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.get("", response_model=list[CounsellorTaskResponse])
async def list_counsellor_tasks(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    status: str | None = Query(default=None),
    priority: str | None = Query(default=None),
    student_id: uuid.UUID | None = Query(default=None),
):
    """Counsellor / Admin: list tasks with full student names, emails, and intake info."""
    roles = current_user.get("roles", [])
    if not any(r in STAFF_ROLES for r in roles):
        raise PermissionDeniedError("Staff privileges required.")

    # Auto-seed onboarding tasks for any registered student who doesn't have tasks yet
    students_res = await db.execute(select(StudentProfile))
    all_students = students_res.scalars().all()
    counsellor_uuid = uuid.UUID(current_user["id"])
    for s in all_students:
        await ensure_onboarding_tasks_for_student(db, s.id, counsellor_uuid)
    await db.flush()

    # Query tasks joined with StudentProfile and User
    query = (
        select(CounsellorTask, StudentProfile, User)
        .join(StudentProfile, CounsellorTask.student_id == StudentProfile.id)
        .join(User, StudentProfile.user_id == User.id)
    )

    if status and status != "all":
        query = query.where(CounsellorTask.status == status)
    if priority and priority != "all":
        query = query.where(CounsellorTask.priority == priority)
    if student_id:
        query = query.where(CounsellorTask.student_id == student_id)

    query = query.order_by(
        desc(CounsellorTask.priority == "urgent"),
        desc(CounsellorTask.priority == "high"),
        CounsellorTask.status.asc(),
        CounsellorTask.due_date.asc(),
    )

    results = await db.execute(query)
    rows = results.all()

    response_items = []
    for task, profile, user in rows:
        name = f"{user.first_name} {user.last_name}".strip() or "Student"
        response_items.append(
            CounsellorTaskResponse(
                id=task.id,
                student_id=task.student_id,
                counsellor_id=task.counsellor_id,
                student_name=name,
                student_email=user.email,
                student_phone=user.phone,
                student_intake=profile.preferred_intake or "Upcoming Intake",
                title=task.title,
                description=task.description,
                category=task.category,
                priority=task.priority,
                status=task.status,
                due_date=task.due_date,
                completed_at=task.completed_at,
                created_at=task.created_at,
                updated_at=task.updated_at,
            )
        )

    return response_items


@router.post("", response_model=CounsellorTaskResponse, status_code=201)
async def create_counsellor_task(
    body: TaskCreateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Counsellor/Admin manually assigns a task for a student."""
    roles = current_user.get("roles", [])
    if not any(r in STAFF_ROLES for r in roles):
        raise PermissionDeniedError("Staff privileges required.")

    # Get student profile + user
    p_res = await db.execute(
        select(StudentProfile, User)
        .join(User, StudentProfile.user_id == User.id)
        .where(StudentProfile.id == body.student_id)
    )
    row = p_res.first()
    if not row:
        raise NotFoundError("Student profile")
    profile, user = row

    due_date = datetime.now(UTC) + timedelta(days=body.due_days)

    task = CounsellorTask(
        id=uuid.uuid4(),
        student_id=profile.id,
        counsellor_id=uuid.UUID(current_user["id"]),
        title=body.title,
        description=body.description,
        category=body.category,
        priority=body.priority,
        status="pending",
        due_date=due_date,
    )
    db.add(task)
    await db.flush()
    await db.refresh(task)

    name = f"{user.first_name} {user.last_name}".strip() or "Student"
    return CounsellorTaskResponse(
        id=task.id,
        student_id=task.student_id,
        counsellor_id=task.counsellor_id,
        student_name=name,
        student_email=user.email,
        student_phone=user.phone,
        student_intake=profile.preferred_intake,
        title=task.title,
        description=task.description,
        category=task.category,
        priority=task.priority,
        status=task.status,
        due_date=task.due_date,
        completed_at=task.completed_at,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


@router.patch("/{task_id}", response_model=CounsellorTaskResponse)
async def update_counsellor_task(
    task_id: uuid.UUID,
    body: TaskUpdateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Update task status (pending -> in_progress -> completed) or details."""
    roles = current_user.get("roles", [])
    if not any(r in STAFF_ROLES for r in roles):
        raise PermissionDeniedError("Staff privileges required.")

    result = await db.execute(select(CounsellorTask).where(CounsellorTask.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise NotFoundError("Task")

    if body.status:
        task.status = body.status
        if body.status == "completed":
            task.completed_at = datetime.now(UTC)
        else:
            task.completed_at = None

    if body.priority:
        task.priority = body.priority
    if body.description is not None:
        task.description = body.description

    await db.flush()
    await db.refresh(task)

    # Re-fetch with user details
    p_res = await db.execute(
        select(StudentProfile, User)
        .join(User, StudentProfile.user_id == User.id)
        .where(StudentProfile.id == task.student_id)
    )
    profile, user = p_res.first()
    name = f"{user.first_name} {user.last_name}".strip() or "Student"

    return CounsellorTaskResponse(
        id=task.id,
        student_id=task.student_id,
        counsellor_id=task.counsellor_id,
        student_name=name,
        student_email=user.email,
        student_phone=user.phone,
        student_intake=profile.preferred_intake,
        title=task.title,
        description=task.description,
        category=task.category,
        priority=task.priority,
        status=task.status,
        due_date=task.due_date,
        completed_at=task.completed_at,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


@router.delete("/{task_id}")
async def delete_counsellor_task(
    task_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Delete a task."""
    roles = current_user.get("roles", [])
    if not any(r in STAFF_ROLES for r in roles):
        raise PermissionDeniedError("Staff privileges required.")

    result = await db.execute(select(CounsellorTask).where(CounsellorTask.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise NotFoundError("Task")

    await db.delete(task)
    await db.commit()
    return {"message": "Task removed successfully."}
