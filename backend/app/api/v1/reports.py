"""Reports & Business Intelligence API endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import PermissionDeniedError
from app.dependencies import get_current_active_user
from app.models.application import Application
from app.models.lead import Lead
from app.models.package import Package
from app.models.payment import Order, Payment
from app.models.student import StudentProfile

router = APIRouter(prefix="/reports", tags=["Reports & BI"])

ADMIN_ROLES = ["super_admin", "admin"]


class StatusCount(BaseModel):
    status: str
    count: int


class CategoryCount(BaseModel):
    name: str
    count: int


class ReportsOverviewResponse(BaseModel):
    total_leads: int
    converted_leads: int
    conversion_rate: float
    total_students: int
    total_applications: int
    total_revenue: float
    leads_funnel: list[StatusCount]
    applications_by_stage: list[StatusCount]
    top_destinations: list[CategoryCount]
    revenue_by_package: list[CategoryCount]


def _require_admin(user: dict) -> None:
    if not any(r in ADMIN_ROLES for r in user.get("roles", [])):
        raise PermissionDeniedError()


@router.get("/overview", response_model=ReportsOverviewResponse)
async def get_reports_overview(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Admin: Aggregated executive analytics, funnel conversion, and revenue breakdown."""
    _require_admin(current_user)

    # 1. Leads totals and funnel
    lead_rows = (await db.execute(select(Lead.status, func.count(Lead.id)).group_by(Lead.status))).all()
    leads_funnel = [StatusCount(status=s, count=c) for s, c in lead_rows]
    total_leads = sum(c for _, c in lead_rows)
    converted_leads = sum(c for s, c in lead_rows if s == "converted")
    conversion_rate = round((converted_leads / total_leads * 100), 1) if total_leads > 0 else 0.0

    # 2. Total students
    total_students = (await db.execute(select(func.count(StudentProfile.id)))).scalar() or 0

    # 3. Applications by stage
    app_rows = (await db.execute(select(Application.status, func.count(Application.id)).group_by(Application.status))).all()
    applications_by_stage = [StatusCount(status=s, count=c) for s, c in app_rows]
    total_apps = sum(c for _, c in app_rows)

    # 4. Top destinations from Leads
    dest_rows = (
        await db.execute(
            select(Lead.preferred_country, func.count(Lead.id))
            .where(Lead.preferred_country != None)
            .group_by(Lead.preferred_country)
            .order_by(func.count(Lead.id).desc())
            .limit(6)
        )
    ).all()
    top_destinations = [CategoryCount(name=c or "Other", count=cnt) for c, cnt in dest_rows]
    if not top_destinations:
        top_destinations = [
            CategoryCount(name="United Kingdom", count=0),
            CategoryCount(name="United States", count=0),
            CategoryCount(name="Canada", count=0),
            CategoryCount(name="Germany", count=0),
            CategoryCount(name="Australia", count=0),
            CategoryCount(name="Ireland", count=0),
        ]

    # 5. Revenue metrics
    rev_result = (
        await db.execute(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(Payment.status == "paid")
        )
    ).scalar() or 0
    total_revenue = float(rev_result)

    # Revenue by package tier
    pkg_rev_stmt = (
        select(Package.name, func.coalesce(func.sum(Payment.amount), 0))
        .join(Order, Package.id == Order.package_id)
        .join(Payment, Order.id == Payment.order_id)
        .where(Payment.status == "paid")
        .group_by(Package.name)
    )
    pkg_rev_rows = (await db.execute(pkg_rev_stmt)).all()
    revenue_by_package = [CategoryCount(name=name, count=int(rev)) for name, rev in pkg_rev_rows]
    if not revenue_by_package:
        revenue_by_package = [
            CategoryCount(name="Basic Package", count=0),
            CategoryCount(name="Standard Package", count=0),
            CategoryCount(name="Premium Package", count=0),
        ]

    return ReportsOverviewResponse(
        total_leads=total_leads,
        converted_leads=converted_leads,
        conversion_rate=conversion_rate,
        total_students=total_students,
        total_applications=total_apps,
        total_revenue=total_revenue,
        leads_funnel=leads_funnel,
        applications_by_stage=applications_by_stage,
        top_destinations=top_destinations,
        revenue_by_package=revenue_by_package,
    )
