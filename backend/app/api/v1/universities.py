"""University, Course, Country, and Intake API endpoints."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.dependencies import get_current_active_user
from app.models.university import Country, Course, Intake, University

router = APIRouter(tags=["Universities"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class CountryResponse(BaseModel):
    id: uuid.UUID
    name: str
    code: str | None = None
    is_active: bool = True
    model_config = {"from_attributes": True}


class UniversityResponse(BaseModel):
    id: uuid.UUID
    name: str
    country_id: uuid.UUID
    type: str | None = None
    city: str | None = None
    website: str | None = None
    ranking: int | None = None
    is_active: bool = True
    is_verified: bool = False
    is_sample_data: bool = False
    model_config = {"from_attributes": True}


class CourseResponse(BaseModel):
    id: uuid.UUID
    university_id: uuid.UUID
    programme_name: str
    degree_level: str | None = None
    teaching_language: str = "English"
    duration_months: int | None = None
    tuition_fee: float | None = None
    tuition_currency: str | None = None
    official_url: str | None = None
    is_active: bool = True
    is_sample_data: bool = False
    model_config = {"from_attributes": True}


class IntakeResponse(BaseModel):
    id: uuid.UUID
    course_id: uuid.UUID
    intake_name: str
    application_deadline: str | None = None
    start_date: str | None = None
    is_open: bool = True
    model_config = {"from_attributes": True}


class UniversityCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    country_id: uuid.UUID
    type: str | None = Field(default=None, max_length=50)
    city: str | None = Field(default=None, max_length=100)
    website: str | None = Field(default=None, max_length=500)
    ranking: int | None = None
    is_sample_data: bool = False


class CourseCreate(BaseModel):
    university_id: uuid.UUID
    programme_name: str = Field(min_length=1, max_length=255)
    degree_level: str | None = Field(default=None, max_length=50)
    teaching_language: str = "English"
    duration_months: int | None = None
    tuition_fee: float | None = None
    tuition_currency: str | None = None
    official_url: str | None = Field(default=None, max_length=500)
    is_sample_data: bool = False


class IntakeCreate(BaseModel):
    course_id: uuid.UUID
    intake_name: str = Field(min_length=1, max_length=50)
    application_deadline: str | None = None
    start_date: str | None = None
    is_open: bool = True


class CountryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    code: str | None = Field(default=None, max_length=3)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

ADMIN_ROLES = ["super_admin", "admin"]


def _require_admin(user: dict) -> None:
    if not any(r in ADMIN_ROLES for r in user.get("roles", [])):
        raise PermissionDeniedError()


# ---------------------------------------------------------------------------
# Countries
# ---------------------------------------------------------------------------

@router.get("/countries", response_model=list[CountryResponse])
async def list_countries(db: Annotated[AsyncSession, Depends(get_db)]):
    """Public: list active countries."""
    result = await db.execute(
        select(Country).where(Country.is_active == True).order_by(Country.name)
    )
    return list(result.scalars().all())


@router.post("/countries", response_model=CountryResponse, status_code=201)
async def create_country(
    data: CountryCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Admin: create a country."""
    _require_admin(current_user)
    country = Country(id=uuid.uuid4(), name=data.name, code=data.code)
    db.add(country)
    await db.flush()
    return country


# ---------------------------------------------------------------------------
# Universities
# ---------------------------------------------------------------------------

@router.get("/universities", response_model=list[UniversityResponse])
async def list_universities(
    db: Annotated[AsyncSession, Depends(get_db)],
    country_id: uuid.UUID | None = Query(default=None),
    search: str | None = Query(default=None),
    include_sample: bool = Query(default=False),
):
    """Public: list universities with optional filters."""
    query = select(University).where(University.is_active == True)
    if not include_sample:
        query = query.where(University.is_sample_data == False)
    if country_id:
        query = query.where(University.country_id == country_id)
    if search:
        query = query.where(University.name.ilike(f"%{search}%"))
    query = query.order_by(University.name)
    result = await db.execute(query)
    return list(result.scalars().all())


@router.get("/universities/{university_id}", response_model=UniversityResponse)
async def get_university(
    university_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(University).where(University.id == university_id))
    uni = result.scalar_one_or_none()
    if not uni:
        raise NotFoundError("University")
    return uni


@router.post("/universities", response_model=UniversityResponse, status_code=201)
async def create_university(
    data: UniversityCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    _require_admin(current_user)
    uni = University(id=uuid.uuid4(), **data.model_dump())
    db.add(uni)
    await db.flush()
    return uni


@router.patch("/universities/{university_id}", response_model=UniversityResponse)
async def update_university(
    university_id: uuid.UUID,
    data: UniversityCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    _require_admin(current_user)
    result = await db.execute(select(University).where(University.id == university_id))
    uni = result.scalar_one_or_none()
    if not uni:
        raise NotFoundError("University")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(uni, field, value)
    await db.flush()
    return uni


# ---------------------------------------------------------------------------
# Courses
# ---------------------------------------------------------------------------

@router.get("/courses", response_model=list[CourseResponse])
async def list_courses(
    db: Annotated[AsyncSession, Depends(get_db)],
    university_id: uuid.UUID | None = Query(default=None),
    degree_level: str | None = Query(default=None),
    search: str | None = Query(default=None),
    include_sample: bool = Query(default=False),
):
    query = select(Course).where(Course.is_active == True)
    if not include_sample:
        query = query.where(Course.is_sample_data == False)
    if university_id:
        query = query.where(Course.university_id == university_id)
    if degree_level:
        query = query.where(Course.degree_level == degree_level)
    if search:
        query = query.where(Course.programme_name.ilike(f"%{search}%"))
    query = query.order_by(Course.programme_name)
    result = await db.execute(query)
    return list(result.scalars().all())


@router.post("/courses", response_model=CourseResponse, status_code=201)
async def create_course(
    data: CourseCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    _require_admin(current_user)
    course = Course(id=uuid.uuid4(), **data.model_dump())
    db.add(course)
    await db.flush()
    return course


@router.get("/courses/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise NotFoundError("Course")
    return course


# ---------------------------------------------------------------------------
# Intakes
# ---------------------------------------------------------------------------

@router.get("/intakes", response_model=list[IntakeResponse])
async def list_intakes(
    db: Annotated[AsyncSession, Depends(get_db)],
    course_id: uuid.UUID | None = Query(default=None),
):
    query = select(Intake).where(Intake.is_open == True)
    if course_id:
        query = query.where(Intake.course_id == course_id)
    query = query.order_by(Intake.intake_name)
    result = await db.execute(query)
    return list(result.scalars().all())


@router.post("/intakes", response_model=IntakeResponse, status_code=201)
async def create_intake(
    data: IntakeCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    _require_admin(current_user)
    intake = Intake(id=uuid.uuid4(), **data.model_dump())
    db.add(intake)
    await db.flush()
    return intake
