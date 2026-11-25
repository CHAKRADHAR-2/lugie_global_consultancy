"""Application CRUD, document attachment, tasks, and timeline API."""

from __future__ import annotations

import uuid
from datetime import UTC, date, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import ApplicationStatus, TaskStatus
from app.core.database import get_db
from app.core.exceptions import (
    DuplicateError,
    NotFoundError,
    PermissionDeniedError,
)
from app.dependencies import get_current_active_user
from app.models.application import (
    Application,
    ApplicationDocument,
    ApplicationStatusHistory,
    ApplicationTask,
)
from app.models.student import StudentProfile
from app.models.university import Course, University
from app.models.user import User

router = APIRouter(prefix="/applications", tags=["Applications"])

ADMIN_ROLES = ["super_admin", "admin", "counsellor"]


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class ApplicationCreate(BaseModel):
    course_id: uuid.UUID
    intake_id: uuid.UUID | None = None
    notes: str | None = Field(default=None, max_length=2000)


class ApplicationResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    course_id: uuid.UUID
    intake_id: uuid.UUID | None = None
    assigned_counsellor_id: uuid.UUID | None = None
    status: str
    application_reference: str | None = None
    submission_date: date | None = None
    deadline: date | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime
    student_name: str | None = None
    student_email: str | None = None
    course_name: str | None = None
    university_name: str | None = None
    model_config = {"from_attributes": True}


class ApplicationUpdate(BaseModel):
    status: str | None = Field(default=None, max_length=50)
    notes: str | None = Field(default=None, max_length=2000)
    assigned_counsellor_id: uuid.UUID | None = None
    deadline: date | None = None
    application_reference: str | None = Field(default=None, max_length=100)


class ApplicationListResponse(BaseModel):
    items: list[ApplicationResponse]
    total: int
    page: int
    page_size: int


class AttachDocumentRequest(BaseModel):
    document_id: uuid.UUID
    notes: str | None = Field(default=None, max_length=255)


class ApplicationDocResponse(BaseModel):
    id: uuid.UUID
    application_id: uuid.UUID
    document_id: uuid.UUID
    attached_by: uuid.UUID | None = None
    notes: str | None = None
    attached_at: datetime
    model_config = {"from_attributes": True}


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    due_date: date | None = None
    priority: str = Field(default="medium", max_length=20)
    assigned_to: uuid.UUID | None = None


class TaskResponse(BaseModel):
    id: uuid.UUID
    application_id: uuid.UUID
    assigned_to: uuid.UUID | None = None
    title: str
    description: str | None = None
    due_date: date | None = None
    priority: str
    status: str
    completed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class TaskUpdate(BaseModel):
    status: str | None = Field(default=None, max_length=20)
    title: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    due_date: date | None = None
    priority: str | None = Field(default=None, max_length=20)
    assigned_to: uuid.UUID | None = None


class TimelineEntry(BaseModel):
    id: uuid.UUID
    from_status: str | None = None
    to_status: str
    notes: str | None = None
    changed_by: uuid.UUID | None = None
    created_at: datetime
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def _get_student_profile(db: AsyncSession, user_id: str) -> StudentProfile:
    result = await db.execute(
        select(StudentProfile).where(StudentProfile.user_id == uuid.UUID(user_id))
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise NotFoundError("Student profile")
    return profile


async def _get_application(db: AsyncSession, app_id: uuid.UUID) -> Application:
    result = await db.execute(select(Application).where(Application.id == app_id))
    app = result.scalar_one_or_none()
    if not app:
        raise NotFoundError("Application")
    return app


async def _enrich_application(app: Application, db: AsyncSession) -> ApplicationResponse:
    student_name = None
    student_email = None
    prof_res = await db.execute(
        select(StudentProfile, User)
        .join(User, StudentProfile.user_id == User.id)
        .where(StudentProfile.id == app.student_id)
    )
    row = prof_res.first()
    if row:
        _, u = row
        student_name = f"{u.first_name} {u.last_name}".strip() or u.email
        student_email = u.email

    course_name = None
    university_name = None
    if app.course_id:
        c_res = await db.execute(
            select(Course, University)
            .join(University, Course.university_id == University.id)
            .where(Course.id == app.course_id)
        )
        c_row = c_res.first()
        if c_row:
            c, univ = c_row
            course_name = c.programme_name
            university_name = univ.name

    return ApplicationResponse(
        id=app.id,
        student_id=app.student_id,
        course_id=app.course_id,
        intake_id=app.intake_id,
        assigned_counsellor_id=app.assigned_counsellor_id,
        status=app.status,
        application_reference=app.application_reference,
        submission_date=app.submission_date,
        deadline=app.deadline,
        notes=app.notes,
        created_at=app.created_at,
        updated_at=app.updated_at,
        student_name=student_name,
        student_email=student_email,
        course_name=course_name,
        university_name=university_name,
    )


def _require_admin(user: dict) -> None:
    if not any(r in ADMIN_ROLES for r in user.get("roles", [])):
        raise PermissionDeniedError()


def _can_view_application(
    user: dict, application: Application, profile_id: uuid.UUID | None
) -> None:
    if any(r in ADMIN_ROLES for r in user.get("roles", [])):
        return
    if profile_id and application.student_id == profile_id:
        return
    raise PermissionDeniedError("You can only view your own applications.")


# ---------------------------------------------------------------------------
# Create Application
# ---------------------------------------------------------------------------


@router.post("", response_model=ApplicationResponse, status_code=201)
async def create_application(
    data: ApplicationCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Student creates a new application."""
    profile = await _get_student_profile(db, current_user["id"])

    app = Application(
        id=uuid.uuid4(),
        student_id=profile.id,
        course_id=data.course_id,
        intake_id=data.intake_id,
        status=ApplicationStatus.DRAFT,
        notes=data.notes,
    )
    db.add(app)

    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()
        raise DuplicateError(
            "You already have an application for this course and intake."
        )

    history = ApplicationStatusHistory(
        id=uuid.uuid4(),
        application_id=app.id,
        from_status=None,
        to_status=ApplicationStatus.DRAFT,
        notes="Application created",
        changed_by=uuid.UUID(current_user["id"]),
    )
    db.add(history)
    await db.flush()
    await db.refresh(app)

    return await _enrich_application(app, db)


# ---------------------------------------------------------------------------
# Student — My Applications
# ---------------------------------------------------------------------------


@router.get("/me", response_model=list[ApplicationResponse])
async def list_my_applications(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Student's own applications."""
    profile = await _get_student_profile(db, current_user["id"])
    result = await db.execute(
        select(Application)
        .where(Application.student_id == profile.id)
        .order_by(Application.created_at.desc())
    )
    apps = list(result.scalars().all())
    return [await _enrich_application(a, db) for a in apps]


# ---------------------------------------------------------------------------
# Application Detail
# ---------------------------------------------------------------------------


@router.get("/{app_id}", response_model=ApplicationResponse)
async def get_application(
    app_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Get application detail. Student: own. Admin/counsellor: any."""
    application = await _get_application(db, app_id)
    profile_id = None
    if not any(r in ADMIN_ROLES for r in current_user.get("roles", [])):
        profile = await _get_student_profile(db, current_user["id"])
        profile_id = profile.id
    _can_view_application(current_user, application, profile_id)
    return await _enrich_application(application, db)


# ---------------------------------------------------------------------------
# Update Application (Admin / Counsellor)
# ---------------------------------------------------------------------------


@router.patch("/{app_id}", response_model=ApplicationResponse)
async def update_application(
    app_id: uuid.UUID,
    data: ApplicationUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Admin/counsellor: update application details or status."""
    _require_admin(current_user)
    application = await _get_application(db, app_id)

    update_data = data.model_dump(exclude_unset=True)

    if "status" in update_data and update_data["status"] != application.status:
        old_status = application.status
        new_status = update_data["status"]
        history = ApplicationStatusHistory(
            id=uuid.uuid4(),
            application_id=application.id,
            from_status=old_status,
            to_status=new_status,
            changed_by=uuid.UUID(current_user["id"]),
        )
        db.add(history)

    for field, value in update_data.items():
        setattr(application, field, value)

    await db.flush()
    await db.refresh(application)
    return await _enrich_application(application, db)


# ---------------------------------------------------------------------------
# Application Documents
# ---------------------------------------------------------------------------


@router.post(
    "/{app_id}/documents",
    response_model=ApplicationDocResponse,
    status_code=201,
)
async def attach_document(
    app_id: uuid.UUID,
    data: AttachDocumentRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Attach an existing document to an application."""
    application = await _get_application(db, app_id)

    profile_id = None
    if not any(r in ADMIN_ROLES for r in current_user.get("roles", [])):
        profile = await _get_student_profile(db, current_user["id"])
        profile_id = profile.id
    _can_view_application(current_user, application, profile_id)

    app_doc = ApplicationDocument(
        id=uuid.uuid4(),
        application_id=app_id,
        document_id=data.document_id,
        attached_by=uuid.UUID(current_user["id"]),
        notes=data.notes,
    )
    db.add(app_doc)

    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()
        raise DuplicateError(
            "This document is already attached to this application."
        )

    return app_doc


@router.delete("/{app_id}/documents/{doc_id}")
async def detach_document(
    app_id: uuid.UUID,
    doc_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Remove a document from an application."""
    application = await _get_application(db, app_id)

    profile_id = None
    if not any(r in ADMIN_ROLES for r in current_user.get("roles", [])):
        profile = await _get_student_profile(db, current_user["id"])
        profile_id = profile.id
    _can_view_application(current_user, application, profile_id)

    result = await db.execute(
        select(ApplicationDocument).where(
            ApplicationDocument.application_id == app_id,
            ApplicationDocument.document_id == doc_id,
        )
    )
    app_doc = result.scalar_one_or_none()
    if not app_doc:
        raise NotFoundError("Application document attachment")

    await db.delete(app_doc)
    await db.flush()
    return {"message": "Document detached."}


@router.get("/{app_id}/documents", response_model=list[ApplicationDocResponse])
async def list_application_documents(
    app_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """List documents attached to an application."""
    application = await _get_application(db, app_id)

    profile_id = None
    if not any(r in ADMIN_ROLES for r in current_user.get("roles", [])):
        profile = await _get_student_profile(db, current_user["id"])
        profile_id = profile.id
    _can_view_application(current_user, application, profile_id)

    result = await db.execute(
        select(ApplicationDocument)
        .where(ApplicationDocument.application_id == app_id)
        .order_by(ApplicationDocument.attached_at.desc())
    )
    return list(result.scalars().all())


# ---------------------------------------------------------------------------
# Tasks
# ---------------------------------------------------------------------------


@router.post("/{app_id}/tasks", response_model=TaskResponse, status_code=201)
async def create_task(
    app_id: uuid.UUID,
    data: TaskCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Admin/counsellor: create a task for an application."""
    _require_admin(current_user)
    await _get_application(db, app_id)

    task = ApplicationTask(
        id=uuid.uuid4(),
        application_id=app_id,
        assigned_to=data.assigned_to,
        title=data.title,
        description=data.description,
        due_date=data.due_date,
        priority=data.priority,
        status=TaskStatus.PENDING,
        created_by=uuid.UUID(current_user["id"]),
    )
    db.add(task)
    await db.flush()
    return task


@router.get("/{app_id}/tasks", response_model=list[TaskResponse])
async def list_tasks(
    app_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """List tasks for an application."""
    application = await _get_application(db, app_id)

    profile_id = None
    if not any(r in ADMIN_ROLES for r in current_user.get("roles", [])):
        profile = await _get_student_profile(db, current_user["id"])
        profile_id = profile.id
    _can_view_application(current_user, application, profile_id)

    result = await db.execute(
        select(ApplicationTask)
        .where(ApplicationTask.application_id == app_id)
        .order_by(ApplicationTask.created_at.desc())
    )
    return list(result.scalars().all())


@router.patch("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: uuid.UUID,
    data: TaskUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Update a task. Set completed_at when status = completed."""
    _require_admin(current_user)

    result = await db.execute(
        select(ApplicationTask).where(ApplicationTask.id == task_id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise NotFoundError("Task")

    update_data = data.model_dump(exclude_unset=True)

    if (
        update_data.get("status") == TaskStatus.COMPLETED
        and not task.completed_at
    ):
        update_data["completed_at"] = datetime.now(UTC)

    for field, value in update_data.items():
        setattr(task, field, value)

    await db.flush()
    return task


# ---------------------------------------------------------------------------
# Admin — List All Applications
# ---------------------------------------------------------------------------


@router.get("", response_model=ApplicationListResponse)
async def list_applications(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    status: str | None = Query(default=None),
    student_id: uuid.UUID | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    """Admin/counsellor: list all applications."""
    _require_admin(current_user)

    query = select(Application)
    if status:
        query = query.where(Application.status == status)
    if student_id:
        query = query.where(Application.student_id == student_id)

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(Application.created_at.desc())
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    result = await db.execute(query)
    apps = list(result.scalars().all())
    enriched_apps = [await _enrich_application(a, db) for a in apps]

    return ApplicationListResponse(
        items=enriched_apps, total=total, page=page, page_size=page_size
    )


# ---------------------------------------------------------------------------
# Timeline
# ---------------------------------------------------------------------------


@router.get("/{app_id}/timeline", response_model=list[TimelineEntry])
async def get_timeline(
    app_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Get status history (timeline) for an application."""
    application = await _get_application(db, app_id)

    profile_id = None
    if not any(r in ADMIN_ROLES for r in current_user.get("roles", [])):
        profile = await _get_student_profile(db, current_user["id"])
        profile_id = profile.id
    _can_view_application(current_user, application, profile_id)

    result = await db.execute(
        select(ApplicationStatusHistory)
        .where(ApplicationStatusHistory.application_id == app_id)
        .order_by(ApplicationStatusHistory.created_at.asc())
    )
    return list(result.scalars().all())
