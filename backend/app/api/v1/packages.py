"""Package and additional services API endpoints."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.dependencies import get_current_active_user
from app.models.package import AdditionalService, Package

router = APIRouter(prefix="/packages", tags=["Packages"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class PackageInclusionResponse(BaseModel):
    id: uuid.UUID
    description: str
    category: str | None = None
    limit_value: str | None = None
    sort_order: int | None = None
    model_config = {"from_attributes": True}


class PackageResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    price: float
    currency: str = "INR"
    is_recommended: bool = False
    is_active: bool = True
    sort_order: int | None = None
    inclusions: list[PackageInclusionResponse] = []
    model_config = {"from_attributes": True}


class PackageUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=100)
    price: float | None = None
    is_recommended: bool | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class AdditionalServiceResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    price_min: float
    price_max: float
    currency: str = "INR"
    description: str | None = None
    is_active: bool = True
    sort_order: int | None = None
    model_config = {"from_attributes": True}


class AdditionalServiceUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=200)
    price_min: float | None = None
    price_max: float | None = None
    description: str | None = None
    is_active: bool | None = None
    sort_order: int | None = None


# ---------------------------------------------------------------------------
# Public Endpoints
# ---------------------------------------------------------------------------

@router.get("", response_model=list[PackageResponse])
async def list_packages(db: Annotated[AsyncSession, Depends(get_db)]):
    """Public: list active packages with inclusions."""
    result = await db.execute(
        select(Package)
        .options(selectinload(Package.inclusions))
        .where(Package.is_active == True)
        .order_by(Package.sort_order)
    )
    return list(result.scalars().unique().all())


@router.get("/services", response_model=list[AdditionalServiceResponse])
async def list_additional_services(db: Annotated[AsyncSession, Depends(get_db)]):
    """Public: list active additional services."""
    result = await db.execute(
        select(AdditionalService)
        .where(AdditionalService.is_active == True)
        .order_by(AdditionalService.sort_order)
    )
    return list(result.scalars().all())


# ---------------------------------------------------------------------------
# Admin Endpoints
# ---------------------------------------------------------------------------

@router.patch("/{package_id}", response_model=PackageResponse)
async def update_package(
    package_id: uuid.UUID,
    data: PackageUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Admin: update package details/price."""
    if not any(r in ["super_admin", "admin"] for r in current_user.get("roles", [])):
        raise PermissionDeniedError()

    result = await db.execute(
        select(Package).options(selectinload(Package.inclusions)).where(Package.id == package_id)
    )
    pkg = result.scalar_one_or_none()
    if not pkg:
        raise NotFoundError("Package")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(pkg, field, value)
    await db.flush()
    return pkg


@router.patch("/services/{service_id}", response_model=AdditionalServiceResponse)
async def update_additional_service(
    service_id: uuid.UUID,
    data: AdditionalServiceUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Admin: update additional service details/price."""
    if not any(r in ["super_admin", "admin"] for r in current_user.get("roles", [])):
        raise PermissionDeniedError()

    result = await db.execute(
        select(AdditionalService).where(AdditionalService.id == service_id)
    )
    svc = result.scalar_one_or_none()
    if not svc:
        raise NotFoundError("Additional service")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(svc, field, value)
    await db.flush()
    return svc
