"""Student profile and related data API endpoints."""

from __future__ import annotations

import uuid
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.dependencies import get_current_active_user
from app.models.assessment import ProfileAssessment
from app.models.document import Document
from app.models.experience import Project, WorkExperience
from app.models.package import Package
from app.models.payment import Order
from app.models.student import AcademicRecord, LanguageTest, StudentProfile
from app.models.university_preference import CounsellorRecommendation, StudentOptedUniversity
from app.models.user import User

router = APIRouter(prefix="/students", tags=["Students"])

ADMIN_ROLES = ["super_admin", "admin", "counsellor"]


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class StudentProfileResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    date_of_birth: date | None = None
    nationality: str | None = None
    current_city: str | None = None
    current_country: str | None = None
    passport_number: str | None = None
    passport_expiry: date | None = None
    preferred_countries: dict | None = None
    preferred_courses: dict | None = None
    budget_min: float | None = None
    budget_max: float | None = None
    budget_currency: str = "INR"
    preferred_intake: str | None = None
    funding_preference: str | None = None
    profile_completion: int = 0
    # Enriched candidate fields
    first_name: str | None = None
    last_name: str | None = None
    student_name: str | None = None
    email: str | None = None
    phone: str | None = None
    active_package: str | None = None
    model_config = {"from_attributes": True}


class StudentProfileUpdate(BaseModel):
    date_of_birth: date | None = None
    nationality: str | None = Field(default=None, max_length=100)
    current_city: str | None = Field(default=None, max_length=100)
    current_country: str | None = Field(default=None, max_length=100)
    passport_number: str | None = Field(default=None, max_length=50)
    passport_expiry: date | None = None
    preferred_countries: dict | None = None
    preferred_courses: dict | None = None
    budget_min: float | None = None
    budget_max: float | None = None
    budget_currency: str = "INR"
    preferred_intake: str | None = Field(default=None, max_length=20)
    funding_preference: str | None = Field(default=None, max_length=50)


class AcademicRecordCreate(BaseModel):
    qualification: str = Field(min_length=1, max_length=100)
    institution: str = Field(min_length=1, max_length=255)
    degree: str | None = Field(default=None, max_length=100)
    specialisation: str | None = Field(default=None, max_length=200)
    start_date: date | None = None
    end_date: date | None = None
    cgpa: float | None = None
    percentage: float | None = None
    scale: float | None = None
    backlogs: int = 0
    is_current: bool = False


class AcademicRecordResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    qualification: str
    institution: str
    degree: str | None = None
    specialisation: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    cgpa: float | None = None
    percentage: float | None = None
    backlogs: int = 0
    is_current: bool = False
    model_config = {"from_attributes": True}


class LanguageTestCreate(BaseModel):
    test_type: str = Field(min_length=1, max_length=20)
    overall_score: float | None = None
    listening: float | None = None
    reading: float | None = None
    writing: float | None = None
    speaking: float | None = None
    test_date: date | None = None
    expiry_date: date | None = None


class LanguageTestResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    test_type: str
    overall_score: float | None = None
    listening: float | None = None
    reading: float | None = None
    writing: float | None = None
    speaking: float | None = None
    test_date: date | None = None
    expiry_date: date | None = None
    model_config = {"from_attributes": True}


class WorkExperienceCreate(BaseModel):
    company: str = Field(min_length=1, max_length=255)
    designation: str = Field(min_length=1, max_length=200)
    employment_type: str | None = Field(default="Full-time", max_length=50)
    start_date: date
    end_date: date | None = None
    is_current: bool = False
    description: str | None = None


class WorkExperienceResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    company: str
    designation: str
    employment_type: str | None = "Full-time"
    start_date: date
    end_date: date | None = None
    is_current: bool = False
    description: str | None = None
    model_config = {"from_attributes": True}


class ProjectCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    technologies: dict | None = None
    url: str | None = Field(default=None, max_length=500)
    start_date: date | None = None
    end_date: date | None = None


class ProjectResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    title: str
    description: str | None = None
    technologies: dict | None = None
    url: str | None = None
    start_date: date | None = None
    end_date: date | None = None
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


def _can_view_student(current_user: dict, profile_user_id: uuid.UUID) -> None:
    """Check if user can view this student's data."""
    if any(r in ADMIN_ROLES for r in current_user.get("roles", [])):
        return
    if str(profile_user_id) != current_user["id"]:
        raise PermissionDeniedError("You can only view your own profile.")


# ---------------------------------------------------------------------------
# Profile Endpoints
# ---------------------------------------------------------------------------

@router.get("/me/profile", response_model=StudentProfileResponse)
async def get_my_profile(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Get the current student's profile."""
    profile = await _get_student_profile(db, current_user["id"])
    return await _enrich_profile(profile, db)


@router.patch("/me/profile", response_model=StudentProfileResponse)
async def update_my_profile(
    data: StudentProfileUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Update the current student's profile."""
    profile = await _get_student_profile(db, current_user["id"])
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    # Recalculate completion
    profile.profile_completion = _calculate_completion(profile)
    await db.flush()
    return await _enrich_profile(profile, db)


# ---------------------------------------------------------------------------
# Academic Records
# ---------------------------------------------------------------------------

@router.get("/me/academics", response_model=list[AcademicRecordResponse])
async def list_my_academics(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    profile = await _get_student_profile(db, current_user["id"])
    result = await db.execute(
        select(AcademicRecord).where(AcademicRecord.student_id == profile.id)
    )
    return list(result.scalars().all())


@router.post("/me/academics", response_model=AcademicRecordResponse, status_code=201)
async def create_academic_record(
    data: AcademicRecordCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    profile = await _get_student_profile(db, current_user["id"])
    record = AcademicRecord(id=uuid.uuid4(), student_id=profile.id, **data.model_dump())
    db.add(record)
    await db.flush()
    return record


@router.delete("/me/academics/{record_id}")
async def delete_academic_record(
    record_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    profile = await _get_student_profile(db, current_user["id"])
    result = await db.execute(
        select(AcademicRecord).where(
            AcademicRecord.id == record_id, AcademicRecord.student_id == profile.id
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise NotFoundError("Academic record")
    await db.delete(record)
    await db.flush()
    return {"message": "Deleted"}


# ---------------------------------------------------------------------------
# Language Tests
# ---------------------------------------------------------------------------

@router.get("/me/language-tests", response_model=list[LanguageTestResponse])
async def list_my_language_tests(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    profile = await _get_student_profile(db, current_user["id"])
    result = await db.execute(
        select(LanguageTest).where(LanguageTest.student_id == profile.id)
    )
    return list(result.scalars().all())


@router.post("/me/language-tests", response_model=LanguageTestResponse, status_code=201)
async def create_language_test(
    data: LanguageTestCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    profile = await _get_student_profile(db, current_user["id"])
    test = LanguageTest(id=uuid.uuid4(), student_id=profile.id, **data.model_dump())
    db.add(test)
    await db.flush()
    return test


@router.delete("/me/language-tests/{test_id}")
async def delete_language_test(
    test_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    profile = await _get_student_profile(db, current_user["id"])
    res = await db.execute(
        select(LanguageTest).where(LanguageTest.id == test_id, LanguageTest.student_id == profile.id)
    )
    test = res.scalar_one_or_none()
    if not test:
        raise NotFoundError("Test score record")
    await db.delete(test)
    await db.flush()
    return {"message": "Test score deleted"}


# ---------------------------------------------------------------------------
# Work Experiences
# ---------------------------------------------------------------------------


@router.get("/me/experiences", response_model=list[WorkExperienceResponse])
async def list_my_experiences(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    profile = await _get_student_profile(db, current_user["id"])
    result = await db.execute(
        select(WorkExperience).where(WorkExperience.student_id == profile.id).order_by(desc(WorkExperience.start_date))
    )
    return list(result.scalars().all())


@router.post("/me/experiences", response_model=WorkExperienceResponse, status_code=201)
async def create_work_experience(
    data: WorkExperienceCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    profile = await _get_student_profile(db, current_user["id"])
    exp = WorkExperience(id=uuid.uuid4(), student_id=profile.id, **data.model_dump())
    db.add(exp)
    await db.flush()
    return exp


@router.delete("/me/experiences/{exp_id}")
async def delete_work_experience(
    exp_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    profile = await _get_student_profile(db, current_user["id"])
    res = await db.execute(
        select(WorkExperience).where(WorkExperience.id == exp_id, WorkExperience.student_id == profile.id)
    )
    exp = res.scalar_one_or_none()
    if not exp:
        raise NotFoundError("Work experience record")
    await db.delete(exp)
    await db.flush()
    return {"message": "Work experience deleted"}


# ---------------------------------------------------------------------------
# Projects
# ---------------------------------------------------------------------------


@router.get("/me/projects", response_model=list[ProjectResponse])
async def list_my_projects(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    profile = await _get_student_profile(db, current_user["id"])
    result = await db.execute(
        select(Project).where(Project.student_id == profile.id).order_by(desc(Project.created_at))
    )
    return list(result.scalars().all())


@router.post("/me/projects", response_model=ProjectResponse, status_code=201)
async def create_project(
    data: ProjectCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    profile = await _get_student_profile(db, current_user["id"])
    proj = Project(id=uuid.uuid4(), student_id=profile.id, **data.model_dump())
    db.add(proj)
    await db.flush()
    return proj


@router.delete("/me/projects/{project_id}")
async def delete_project(
    project_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    profile = await _get_student_profile(db, current_user["id"])
    res = await db.execute(
        select(Project).where(Project.id == project_id, Project.student_id == profile.id)
    )
    proj = res.scalar_one_or_none()
    if not proj:
        raise NotFoundError("Project record")
    await db.delete(proj)
    await db.flush()
    return {"message": "Project deleted"}


async def _enrich_profile(profile: StudentProfile, db: AsyncSession) -> StudentProfileResponse:
    user_res = await db.execute(select(User).where(User.id == profile.user_id))
    user = user_res.scalar_one_or_none()
    first_name = user.first_name if user else ""
    last_name = user.last_name if user else ""
    full_name = f"{first_name} {last_name}".strip() or (user.email if user else "Student")
    email = user.email if user else None
    phone = user.phone if user else None

    pkg_name = "Free Tier"
    order_res = await db.execute(
        select(Order, Package.name)
        .outerjoin(Package, Order.package_id == Package.id)
        .where(Order.student_id == profile.id)
        .order_by(Order.created_at.desc())
        .limit(1)
    )
    row = order_res.first()
    if row and row[1]:
        pkg_name = row[1]

    return StudentProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        date_of_birth=profile.date_of_birth,
        nationality=profile.nationality,
        current_city=profile.current_city,
        current_country=profile.current_country,
        passport_number=profile.passport_number,
        passport_expiry=profile.passport_expiry,
        preferred_countries=profile.preferred_countries,
        preferred_courses=profile.preferred_courses,
        budget_min=float(profile.budget_min) if profile.budget_min else None,
        budget_max=float(profile.budget_max) if profile.budget_max else None,
        budget_currency=profile.budget_currency,
        preferred_intake=profile.preferred_intake,
        funding_preference=profile.funding_preference,
        profile_completion=profile.profile_completion,
        first_name=first_name,
        last_name=last_name,
        student_name=full_name,
        email=email,
        phone=phone,
        active_package=pkg_name,
    )


class StudentFullDossierResponse(BaseModel):
    profile: StudentProfileResponse
    academics: list[dict]
    language_tests: list[dict]
    work_experiences: list[dict]
    projects: list[dict]
    documents: list[dict]
    opted_universities: list[dict]
    recommendations: list[dict]
    assessment: dict | None = None


# ---------------------------------------------------------------------------
# Admin: List all students
# ---------------------------------------------------------------------------

@router.get("", response_model=list[StudentProfileResponse])
async def list_students(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Admin/counsellor: list all student profiles with full candidate info."""
    if not any(r in ADMIN_ROLES for r in current_user.get("roles", [])):
        raise PermissionDeniedError()
    result = await db.execute(select(StudentProfile).order_by(StudentProfile.created_at.desc()))
    profiles = list(result.scalars().all())
    return [await _enrich_profile(p, db) for p in profiles]


@router.get("/{student_id}", response_model=StudentProfileResponse)
async def get_student_by_id(
    student_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Admin/counsellor: get student by profile ID."""
    if not any(r in ADMIN_ROLES for r in current_user.get("roles", [])):
        raise PermissionDeniedError()
    result = await db.execute(select(StudentProfile).where(StudentProfile.id == student_id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise NotFoundError("Student")
    return await _enrich_profile(profile, db)


@router.get("/{student_id}/full-dossier", response_model=StudentFullDossierResponse)
async def get_student_full_dossier(
    student_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Admin/counsellor: retrieve complete student dossier across all tabs."""
    if not any(r in ADMIN_ROLES for r in current_user.get("roles", [])):
        raise PermissionDeniedError()

    # Find profile by profile ID or user ID
    result = await db.execute(
        select(StudentProfile).where(
            (StudentProfile.id == student_id) | (StudentProfile.user_id == student_id)
        )
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise NotFoundError("Student profile")

    enriched = await _enrich_profile(profile, db)

    # 1. Academics
    acad_res = await db.execute(
        select(AcademicRecord).where(AcademicRecord.student_id == profile.id).order_by(AcademicRecord.start_date.desc())
    )
    academics = [
        {
            "id": str(r.id),
            "qualification": r.qualification,
            "institution": r.institution,
            "degree": r.degree,
            "specialisation": r.specialisation,
            "cgpa": float(r.cgpa) if r.cgpa else None,
            "percentage": float(r.percentage) if r.percentage else None,
            "backlogs": r.backlogs,
            "start_date": str(r.start_date) if r.start_date else None,
            "end_date": str(r.end_date) if r.end_date else None,
            "is_current": r.is_current,
        }
        for r in acad_res.scalars().all()
    ]

    # 2. Language tests
    test_res = await db.execute(
        select(LanguageTest).where(LanguageTest.student_id == profile.id).order_by(LanguageTest.test_date.desc())
    )
    tests = [
        {
            "id": str(t.id),
            "test_type": t.test_type,
            "overall_score": float(t.overall_score) if t.overall_score else None,
            "listening": float(t.listening) if t.listening else None,
            "reading": float(t.reading) if t.reading else None,
            "writing": float(t.writing) if t.writing else None,
            "speaking": float(t.speaking) if t.speaking else None,
            "test_date": str(t.test_date) if t.test_date else None,
        }
        for t in test_res.scalars().all()
    ]

    # 3. Work experience
    exp_res = await db.execute(
        select(WorkExperience).where(WorkExperience.student_id == profile.id).order_by(WorkExperience.start_date.desc())
    )
    experiences = [
        {
            "id": str(e.id),
            "company_name": e.company_name,
            "job_title": e.job_title,
            "employment_type": e.employment_type,
            "location": e.location,
            "description": e.description,
            "start_date": str(e.start_date) if e.start_date else None,
            "end_date": str(e.end_date) if e.end_date else None,
            "is_current": e.is_current,
        }
        for e in exp_res.scalars().all()
    ]

    # 4. Projects
    proj_res = await db.execute(
        select(Project).where(Project.student_id == profile.id).order_by(Project.start_date.desc())
    )
    projects = [
        {
            "id": str(p.id),
            "title": p.title,
            "description": p.description,
            "technologies": p.technologies,
            "url": p.url,
            "start_date": str(p.start_date) if p.start_date else None,
            "end_date": str(p.end_date) if p.end_date else None,
        }
        for p in proj_res.scalars().all()
    ]

    # 5. Documents
    doc_res = await db.execute(
        select(Document).where(Document.student_id == profile.id, Document.is_deleted == False).order_by(Document.uploaded_at.desc())
    )
    documents = [
        {
            "id": str(d.id),
            "file_name": d.file_name,
            "document_type": d.document_type,
            "file_size": d.file_size,
            "mime_type": d.mime_type,
            "status": d.status,
            "scan_status": d.scan_status,
            "uploaded_at": d.uploaded_at.isoformat() if d.uploaded_at else None,
        }
        for d in doc_res.scalars().all()
    ]

    # 6. Opted Universities
    opted_res = await db.execute(
        select(StudentOptedUniversity).where(StudentOptedUniversity.student_id == profile.id).order_by(StudentOptedUniversity.created_at.desc())
    )
    opted_unis = [
        {
            "id": str(o.id),
            "university_name": o.university_name,
            "country": o.country,
            "course_name": o.course_name,
            "intake": o.intake,
            "tier": o.tier,
            "student_notes": o.student_notes,
            "status": o.status,
            "counsellor_opinion": o.counsellor_opinion,
            "counsellor_verdict": o.counsellor_verdict,
        }
        for o in opted_res.scalars().all()
    ]

    # 7. Counsellor recommendations
    rec_res = await db.execute(
        select(CounsellorRecommendation).where(CounsellorRecommendation.student_id == profile.id).order_by(CounsellorRecommendation.created_at.desc())
    )
    recs = [
        {
            "id": str(r.id),
            "university_name": r.university_name,
            "country": r.country,
            "course_name": r.course_name,
            "intake": r.intake,
            "tier": r.tier,
            "match_reason": r.match_reason,
            "tuition_fee_range": r.tuition_fee_range,
            "admission_chance": r.admission_chance,
        }
        for r in rec_res.scalars().all()
    ]

    # 8. Latest assessment
    ass_res = await db.execute(
        select(ProfileAssessment).where(ProfileAssessment.student_id == profile.id).order_by(ProfileAssessment.created_at.desc()).limit(1)
    )
    latest_ass = ass_res.scalar_one_or_none()
    ass_dict = None
    if latest_ass:
        ass_dict = {
            "id": str(latest_ass.id),
            "assessment_type": latest_ass.assessment_type,
            "strengths": latest_ass.strengths,
            "weaknesses": latest_ass.weaknesses,
            "missing_requirements": latest_ass.missing_requirements,
            "recommended_countries": latest_ass.recommended_countries,
            "recommended_courses": latest_ass.recommended_courses,
            "eligibility_notes": latest_ass.eligibility_notes,
            "improvement_suggestions": latest_ass.improvement_suggestions,
            "status": latest_ass.status,
        }

    return StudentFullDossierResponse(
        profile=enriched,
        academics=academics,
        language_tests=tests,
        work_experiences=experiences,
        projects=projects,
        documents=documents,
        opted_universities=opted_unis,
        recommendations=recs,
        assessment=ass_dict,
    )


# ---------------------------------------------------------------------------
# Profile Completion Calculator
# ---------------------------------------------------------------------------

def _calculate_completion(profile: StudentProfile) -> int:
    """Calculate profile completion percentage."""
    fields_and_weights = [
        (profile.date_of_birth, 10),
        (profile.nationality, 10),
        (profile.current_city, 5),
        (profile.current_country, 5),
        (profile.passport_number, 10),
        (profile.preferred_countries, 10),
        (profile.preferred_courses, 10),
        (profile.budget_min or profile.budget_max, 10),
        (profile.preferred_intake, 10),
        (profile.funding_preference, 10),
    ]
    total_weight = sum(w for _, w in fields_and_weights)
    earned = sum(w for val, w in fields_and_weights if val)
    return min(100, int(earned / total_weight * 100)) if total_weight > 0 else 0
