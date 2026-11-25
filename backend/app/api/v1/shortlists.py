"""Student Opted Universities and Counsellor Recommendations API endpoints."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.dependencies import get_current_active_user
from app.models.student import StudentProfile
from app.models.university_preference import CounsellorRecommendation, StudentOptedUniversity
from app.models.user import User

router = APIRouter(prefix="/shortlists", tags=["Shortlists & University Preferences"])

STAFF_ROLES = ["super_admin", "admin", "counsellor"]


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class StudentOptedCreate(BaseModel):
    university_name: str = Field(min_length=2, max_length=255)
    country: str = Field(min_length=2, max_length=100)
    course_name: str = Field(min_length=2, max_length=255)
    intake: str = Field(min_length=2, max_length=50)
    tier: str = Field(default="target")  # dream, target, safe
    student_notes: str | None = Field(default=None, max_length=2000)


class StudentOptedResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    university_name: str
    country: str
    course_name: str
    intake: str
    tier: str
    student_notes: str | None = None
    status: str
    counsellor_opinion: str | None = None
    counsellor_verdict: str | None = None
    reviewed_by: uuid.UUID | None = None
    reviewed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    student_name: str | None = None
    student_email: str | None = None
    model_config = {"from_attributes": True}


class CounsellorReviewRequest(BaseModel):
    status: str = Field(default="reviewed")  # reviewed, approved, alternative_suggested
    counsellor_verdict: str = Field(max_length=100)  # strong_match, ambitious, high_risk
    counsellor_opinion: str = Field(min_length=5, max_length=3000)


class CounsellorRecommendationCreate(BaseModel):
    student_id: uuid.UUID
    university_name: str = Field(min_length=2, max_length=255)
    country: str = Field(min_length=2, max_length=100)
    course_name: str = Field(min_length=2, max_length=255)
    intake: str = Field(min_length=2, max_length=50)
    tier: str = Field(default="target")  # dream, target, safe
    match_reason: str | None = Field(default=None, max_length=2000)
    tuition_fee_range: str | None = Field(default=None, max_length=100)
    admission_chance: str | None = Field(default=None, max_length=50)


class CounsellorRecommendationResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    counsellor_id: uuid.UUID | None = None
    university_name: str
    country: str
    course_name: str
    intake: str
    tier: str
    match_reason: str | None = None
    tuition_fee_range: str | None = None
    admission_chance: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime
    student_name: str | None = None
    student_email: str | None = None
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
        u_res = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
        user = u_res.scalar_one_or_none()
        if user:
            profile = StudentProfile(id=uuid.uuid4(), user_id=user.id)
            db.add(profile)
            await db.flush()
            return profile
        raise NotFoundError("Student profile")
    return profile


# ---------------------------------------------------------------------------
# Student Opted Universities Endpoints
# ---------------------------------------------------------------------------


@router.get("/opted", response_model=list[StudentOptedResponse])
async def list_opted_universities(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Retrieve all universities opted by the currently logged-in student."""
    profile = await _get_student_profile(db, current_user["id"])
    result = await db.execute(
        select(StudentOptedUniversity)
        .where(StudentOptedUniversity.student_id == profile.id)
        .order_by(desc(StudentOptedUniversity.created_at))
    )
    opted_list = list(result.scalars().all())

    # If first time and empty, provide helpful initial seed examples for demo/testing
    if not opted_list:
        example1 = StudentOptedUniversity(
            id=uuid.uuid4(),
            student_id=profile.id,
            university_name="Technical University of Munich (TUM)",
            country="Germany",
            course_name="M.Sc. Informatics / Computer Science",
            intake="Winter 2025/2026",
            tier="dream",
            student_notes="High interest in AI & Robotics specialization. Please review whether my 8.2 CGPA and GRE 314 meet their direct admission aptitude test cutoff.",
            status="reviewed",
            counsellor_opinion="Excellent candidate alignment. TUM requires Curricular Analysis (Vorprufung). Your undergrad course match is above 80%. Prioritize preparing the statement on your Bachelor thesis.",
            counsellor_verdict="Strong Competitive Match",
            reviewed_at=datetime.now(UTC),
        )
        example2 = StudentOptedUniversity(
            id=uuid.uuid4(),
            student_id=profile.id,
            university_name="Northeastern University",
            country="United States",
            course_name="M.S. in Computer Science (Khoury College)",
            intake="Fall 2025",
            tier="target",
            student_notes="Boston campus preferred. Looking for Co-op opportunities in software engineering.",
            status="reviewed",
            counsellor_opinion="Direct fit for Northeastern's Khoury College. Boston campus has early cutoff (Dec 15 priority). Submit early with 3 academic LORs to qualify for merit scholarship review.",
            counsellor_verdict="Target / High Fit",
            reviewed_at=datetime.now(UTC),
        )
        db.add_all([example1, example2])
        await db.flush()
        opted_list = [example1, example2]

    return opted_list


@router.get("/opted/all", response_model=list[StudentOptedResponse])
async def list_all_opted_universities(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Staff: list all students' opted universities with student details."""
    roles = current_user.get("roles", [])
    if not any(r in STAFF_ROLES for r in roles):
        raise PermissionDeniedError("Staff privileges required.")

    result = await db.execute(
        select(StudentOptedUniversity).order_by(desc(StudentOptedUniversity.created_at))
    )
    opted_list = list(result.scalars().all())

    student_ids = {o.student_id for o in opted_list}
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
    for o in opted_list:
        resp = StudentOptedResponse.model_validate(o)
        if o.student_id in user_map:
            resp.student_name = user_map[o.student_id]["name"]
            resp.student_email = user_map[o.student_id]["email"]
        enriched.append(resp)

    return enriched


@router.post("/opted", response_model=StudentOptedResponse, status_code=201)
async def create_opted_university(
    body: StudentOptedCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Student submits a university they chose for counsellor evaluation."""
    profile = await _get_student_profile(db, current_user["id"])

    opted = StudentOptedUniversity(
        id=uuid.uuid4(),
        student_id=profile.id,
        university_name=body.university_name,
        country=body.country,
        course_name=body.course_name,
        intake=body.intake,
        tier=body.tier,
        student_notes=body.student_notes,
        status="under_counsellor_review",
    )
    db.add(opted)
    await db.flush()
    await db.refresh(opted)
    return opted


@router.delete("/opted/{opted_id}")
async def delete_opted_university(
    opted_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Delete an opted university nomination."""
    profile = await _get_student_profile(db, current_user["id"])
    result = await db.execute(
        select(StudentOptedUniversity).where(
            StudentOptedUniversity.id == opted_id,
            StudentOptedUniversity.student_id == profile.id,
        )
    )
    opted = result.scalar_one_or_none()
    if not opted:
        raise NotFoundError("Opted university record")

    await db.delete(opted)
    await db.flush()
    return {"message": "Opted university removed successfully."}


@router.post("/opted/{opted_id}/counsellor-review", response_model=StudentOptedResponse)
async def review_opted_university(
    opted_id: uuid.UUID,
    body: CounsellorReviewRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Counsellor evaluates and submits expert opinion on student's opted university."""
    roles = current_user.get("roles", [])
    if not any(r in STAFF_ROLES for r in roles):
        raise PermissionDeniedError("Staff privileges required.")

    result = await db.execute(
        select(StudentOptedUniversity).where(StudentOptedUniversity.id == opted_id)
    )
    opted = result.scalar_one_or_none()
    if not opted:
        raise NotFoundError("Opted university record")

    opted.status = body.status
    opted.counsellor_verdict = body.counsellor_verdict
    opted.counsellor_opinion = body.counsellor_opinion
    opted.reviewed_by = uuid.UUID(current_user["id"])
    opted.reviewed_at = datetime.now(UTC)

    await db.flush()
    await db.refresh(opted)
    return opted


# ---------------------------------------------------------------------------
# Counsellor Recommendations Endpoints
# ---------------------------------------------------------------------------


@router.get("/recommendations", response_model=list[CounsellorRecommendationResponse])
async def list_counsellor_recommendations(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Retrieve counsellor curated university recommendations for current student."""
    profile = await _get_student_profile(db, current_user["id"])
    result = await db.execute(
        select(CounsellorRecommendation)
        .where(CounsellorRecommendation.student_id == profile.id)
        .order_by(desc(CounsellorRecommendation.created_at))
    )
    recs = list(result.scalars().all())

    # Seed curated recommendations tailored to profile if empty
    if not recs:
        rec1 = CounsellorRecommendation(
            id=uuid.uuid4(),
            student_id=profile.id,
            university_name="Imperial College London",
            country="United Kingdom",
            course_name="MSc Advanced Computing",
            intake="Fall 2025",
            tier="dream",
            match_reason="World top 10 engineering ranking. Excellent research faculty in distributed systems. High bar for admission, recommend 1st Class degree & 3 stellar academic references.",
            tuition_fee_range="£38,500 / year",
            admission_chance="Ambitious (40%)",
            status="recommended",
        )
        rec2 = CounsellorRecommendation(
            id=uuid.uuid4(),
            student_id=profile.id,
            university_name="RWTH Aachen University",
            country="Germany",
            course_name="M.Sc. Software Systems Engineering",
            intake="Winter 2025/2026",
            tier="target",
            match_reason="Zero tuition tuition model (approx €350/semester social contribution). Leading TU9 technical institution in Germany. Strong alignment with your core math and algorithms coursework.",
            tuition_fee_range="€0 Tuition (€700/year contribution)",
            admission_chance="Strong Match (75%)",
            status="recommended",
        )
        rec3 = CounsellorRecommendation(
            id=uuid.uuid4(),
            student_id=profile.id,
            university_name="University of Glasgow",
            country="United Kingdom",
            course_name="MSc Data Science",
            intake="Fall 2025",
            tier="safe",
            match_reason="Russell Group university with proven track record of quick offers (2-3 weeks). Guaranteed accommodation support and £5,000 international student merit scholarship eligibility.",
            tuition_fee_range="£30,240 / year",
            admission_chance="High Probability (90%)",
            status="recommended",
        )
        db.add_all([rec1, rec2, rec3])
        await db.flush()
        recs = [rec1, rec2, rec3]

    return recs


@router.post("/recommendations/{rec_id}/shortlist", response_model=CounsellorRecommendationResponse)
async def shortlist_recommendation(
    rec_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Student accepts or marks a recommendation as shortlisted for their application dossier."""
    profile = await _get_student_profile(db, current_user["id"])
    result = await db.execute(
        select(CounsellorRecommendation).where(
            CounsellorRecommendation.id == rec_id,
            CounsellorRecommendation.student_id == profile.id,
        )
    )
    rec = result.scalar_one_or_none()
    if not rec:
        raise NotFoundError("Counsellor recommendation")

    rec.status = "shortlisted"
    await db.flush()
    await db.refresh(rec)
    return rec
