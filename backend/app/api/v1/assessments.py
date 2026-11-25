"""Profile assessment creation, review, and approval API."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import AssessmentStatus
from app.core.database import get_db
from app.core.exceptions import BadRequestError, NotFoundError, PermissionDeniedError
from app.dependencies import get_current_active_user
from app.models.assessment import ProfileAssessment
from app.models.student import StudentProfile
from app.models.user import User

router = APIRouter(prefix="/assessments", tags=["Assessments"])

ADMIN_ROLES = ["super_admin", "admin"]
STAFF_ROLES = ["super_admin", "admin", "counsellor"]


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class AssessmentCreate(BaseModel):
    student_id: uuid.UUID
    assessment_type: str = Field(default="manual", max_length=20)
    strengths: dict | list | None = None
    weaknesses: dict | list | None = None
    missing_requirements: dict | list | None = None
    recommended_countries: list | dict | None = None
    recommended_courses: list | dict | None = None
    eligibility_notes: str | None = Field(default=None, max_length=5000)
    improvement_suggestions: dict | list | None = None


class AssessmentResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    assessed_by: uuid.UUID | None = None
    assessment_type: str
    strengths: dict | list | None = None
    weaknesses: dict | list | None = None
    missing_requirements: dict | list | None = None
    recommended_countries: list | dict | None = None
    recommended_courses: list | dict | None = None
    eligibility_notes: str | None = None
    improvement_suggestions: dict | list | None = None
    status: str
    is_reviewed: bool = False
    reviewed_by: uuid.UUID | None = None
    reviewed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    student_name: str | None = None
    student_email: str | None = None
    model_config = {"from_attributes": True}


class AssessmentUpdate(BaseModel):
    strengths: dict | list | None = None
    weaknesses: dict | list | None = None
    missing_requirements: dict | list | None = None
    recommended_countries: list | dict | None = None
    recommended_courses: list | dict | None = None
    eligibility_notes: str | None = Field(default=None, max_length=5000)
    improvement_suggestions: dict | list | None = None


class ReviewDecision(BaseModel):
    decision: str = Field(pattern="^(approved|rejected)$")
    notes: str | None = Field(default=None, max_length=2000)


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


async def _get_assessment(
    db: AsyncSession, assessment_id: uuid.UUID
) -> ProfileAssessment:
    result = await db.execute(
        select(ProfileAssessment).where(ProfileAssessment.id == assessment_id)
    )
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise NotFoundError("Assessment")
    return assessment


def _require_staff(user: dict) -> None:
    if not any(r in STAFF_ROLES for r in user.get("roles", [])):
        raise PermissionDeniedError()


def _require_admin(user: dict) -> None:
    if not any(r in ADMIN_ROLES for r in user.get("roles", [])):
        raise PermissionDeniedError()


# ---------------------------------------------------------------------------
# Create Assessment
# ---------------------------------------------------------------------------


@router.post("", response_model=AssessmentResponse, status_code=201)
async def create_assessment(
    data: AssessmentCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Counsellor/admin: create a profile assessment for a student."""
    _require_staff(current_user)

    # Verify student exists
    result = await db.execute(
        select(StudentProfile).where(StudentProfile.id == data.student_id)
    )
    if not result.scalar_one_or_none():
        raise NotFoundError("Student profile")

    assessment = ProfileAssessment(
        id=uuid.uuid4(),
        student_id=data.student_id,
        assessed_by=uuid.UUID(current_user["id"]),
        assessment_type=data.assessment_type,
        strengths=data.strengths,
        weaknesses=data.weaknesses,
        missing_requirements=data.missing_requirements,
        recommended_countries=data.recommended_countries,
        recommended_courses=data.recommended_courses,
        eligibility_notes=data.eligibility_notes,
        improvement_suggestions=data.improvement_suggestions,
        status=AssessmentStatus.DRAFT,
    )
    db.add(assessment)
    await db.flush()
    await db.refresh(assessment)
    return assessment


# ---------------------------------------------------------------------------
# List Assessments (Staff)
# ---------------------------------------------------------------------------


@router.get("", response_model=list[AssessmentResponse])
async def list_assessments(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
    student_id: uuid.UUID | None = Query(default=None),
    status: str | None = Query(default=None),
):
    """Staff: list assessments, optionally filtered by student or status."""
    _require_staff(current_user)

    query = select(ProfileAssessment)
    if student_id:
        query = query.where(ProfileAssessment.student_id == student_id)
    if status:
        query = query.where(ProfileAssessment.status == status)
    query = query.order_by(ProfileAssessment.created_at.desc())

    result = await db.execute(query)
    assessments = list(result.scalars().all())

    # Preload student names and emails
    student_ids = {a.student_id for a in assessments}
    user_map = {}
    if student_ids:
        rows = await db.execute(
            select(StudentProfile.id, User.first_name, User.last_name, User.email)
            .join(User, StudentProfile.user_id == User.id)
            .where(StudentProfile.id.in_(student_ids))
        )
        for s_id, fn, ln, em in rows.all():
            user_map[s_id] = {
                "name": f"{fn} {ln}".strip() or em,
                "email": em,
            }

    enriched = []
    for a in assessments:
        resp = AssessmentResponse.model_validate(a)
        if a.student_id in user_map:
            resp.student_name = user_map[a.student_id]["name"]
            resp.student_email = user_map[a.student_id]["email"]
        enriched.append(resp)

    return enriched


# ---------------------------------------------------------------------------
# Student — My Assessments
# ---------------------------------------------------------------------------


@router.get("/me", response_model=list[AssessmentResponse])
async def list_my_assessments(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Student: view own assessments that are submitted or approved."""
    profile = await _get_student_profile(db, current_user["id"])

    result = await db.execute(
        select(ProfileAssessment)
        .where(
            ProfileAssessment.student_id == profile.id,
            ProfileAssessment.status.in_([
                AssessmentStatus.SUBMITTED,
                AssessmentStatus.APPROVED,
            ]),
        )
        .order_by(ProfileAssessment.created_at.desc())
    )
    return list(result.scalars().all())


# ---------------------------------------------------------------------------
# Assessment Detail
# ---------------------------------------------------------------------------


@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment(
    assessment_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Get assessment detail. Student: own only. Staff: any."""
    assessment = await _get_assessment(db, assessment_id)

    if any(r in STAFF_ROLES for r in current_user.get("roles", [])):
        return assessment

    # Student — verify ownership
    profile = await _get_student_profile(db, current_user["id"])
    if assessment.student_id != profile.id:
        raise PermissionDeniedError("You can only view your own assessments.")

    return assessment


# ---------------------------------------------------------------------------
# Update Assessment
# ---------------------------------------------------------------------------


@router.patch("/{assessment_id}", response_model=AssessmentResponse)
async def update_assessment(
    assessment_id: uuid.UUID,
    data: AssessmentUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Staff: update assessment fields (only while draft or under_review)."""
    _require_staff(current_user)
    assessment = await _get_assessment(db, assessment_id)

    if assessment.status not in (
        AssessmentStatus.DRAFT,
        AssessmentStatus.UNDER_REVIEW,
    ):
        raise BadRequestError(
            f"Cannot edit an assessment with status '{assessment.status}'."
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(assessment, field, value)

    await db.flush()
    await db.refresh(assessment)
    return assessment


# ---------------------------------------------------------------------------
# Submit Assessment
# ---------------------------------------------------------------------------


@router.post("/{assessment_id}/submit", response_model=AssessmentResponse)
async def submit_assessment(
    assessment_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Counsellor/staff: submit a draft assessment for review."""
    _require_staff(current_user)
    assessment = await _get_assessment(db, assessment_id)

    if assessment.status != AssessmentStatus.DRAFT:
        raise BadRequestError("Only draft assessments can be submitted.")

    assessment.status = AssessmentStatus.SUBMITTED
    await db.flush()
    await db.refresh(assessment)
    return assessment


# ---------------------------------------------------------------------------
# Review Assessment
# ---------------------------------------------------------------------------


@router.post("/{assessment_id}/review", response_model=AssessmentResponse)
async def review_assessment(
    assessment_id: uuid.UUID,
    data: ReviewDecision,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Admin: approve or reject a submitted assessment."""
    _require_admin(current_user)
    assessment = await _get_assessment(db, assessment_id)

    if assessment.status not in (
        AssessmentStatus.SUBMITTED,
        AssessmentStatus.UNDER_REVIEW,
    ):
        raise BadRequestError(
            "Only submitted or under-review assessments can be reviewed."
        )

    assessment.status = data.decision
    assessment.is_reviewed = True
    assessment.reviewed_by = uuid.UUID(current_user["id"])
    assessment.reviewed_at = datetime.now(UTC)
    await db.flush()
    await db.refresh(assessment)
    return assessment
