"""Tests for Payments, Reports, and Settings endpoints."""

import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.models.package import Package
from tests.conftest import create_test_user


@pytest.mark.asyncio
async def test_payments_and_orders_workflow(
    client: AsyncClient,
    db_session: AsyncSession,
    seed_roles: dict[str, uuid.UUID],
):
    # 1. Create admin and student
    admin = await create_test_user(
        db_session, seed_roles["admin"], email="admin_pay@example.com"
    )
    student = await create_test_user(
        db_session, seed_roles["student"], email="student_pay@example.com"
    )

    admin_token = create_access_token(str(admin.id), "admin")
    student_token = create_access_token(str(student.id), "student")

    # 2. Get available package
    pkg_res = await db_session.execute(select(Package).where(Package.slug == "standard"))
    pkg = pkg_res.scalar_one_or_none()
    if not pkg:
        pkg = Package(
            id=uuid.uuid4(),
            name="Standard",
            slug="standard",
            price=13999.00,
            currency="INR",
            is_recommended=True,
        )
        db_session.add(pkg)
        await db_session.commit()

    # 3. Student checkouts package (simulation)
    checkout_res = await client.post(
        "/api/v1/payments/checkout",
        json={"package_slug": "standard", "payment_method": "upi", "simulate_success": True},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert checkout_res.status_code == 201
    data = checkout_res.json()
    assert data["order"]["status"] == "paid"
    assert data["order"]["total_amount"] == 13999.00
    assert data["payment"]["status"] == "paid"
    assert data["receipt_number"].startswith("LUGIE-PAY-")

    # 4. Student views personal order history
    my_orders_res = await client.get(
        "/api/v1/payments/me",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert my_orders_res.status_code == 200
    my_orders = my_orders_res.json()
    assert len(my_orders) >= 1
    assert my_orders[0]["package_slug"] == "standard"

    # 5. Admin views financial ledger
    ledger_res = await client.get(
        "/api/v1/payments/admin",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert ledger_res.status_code == 200
    ledger = ledger_res.json()
    assert ledger["total_revenue"] >= 13999.00
    assert ledger["total_transactions"] >= 1
    assert len(ledger["transactions"]) >= 1


@pytest.mark.asyncio
async def test_reports_and_agency_settings(
    client: AsyncClient,
    db_session: AsyncSession,
    seed_roles: dict[str, uuid.UUID],
):
    admin = await create_test_user(
        db_session, seed_roles["admin"], email="admin_bi@example.com"
    )
    student = await create_test_user(
        db_session, seed_roles["student"], email="student_bi@example.com"
    )

    admin_token = create_access_token(str(admin.id), "admin")
    student_token = create_access_token(str(student.id), "student")

    # Student cannot view reports
    res_student_reports = await client.get(
        "/api/v1/reports/overview",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert res_student_reports.status_code == 403

    # Admin views reports
    res_admin_reports = await client.get(
        "/api/v1/reports/overview",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_admin_reports.status_code == 200
    rep = res_admin_reports.json()
    assert "total_leads" in rep
    assert "conversion_rate" in rep
    assert "top_destinations" in rep
    assert "leads_funnel" in rep

    # Public views agency settings
    res_settings_pub = await client.get("/api/v1/settings")
    assert res_settings_pub.status_code == 200
    assert res_settings_pub.json()["agency_name"] == "Lugie Global Consultancy"

    # Admin updates agency settings
    res_update_settings = await client.patch(
        "/api/v1/settings",
        json={"emergency_whatsapp": "+91 99999 88888"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_update_settings.status_code == 200
    assert res_update_settings.json()["emergency_whatsapp"] == "+91 99999 88888"
