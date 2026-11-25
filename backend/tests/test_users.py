"""Tests for Staff Users and Audit Trail (Module 6)."""

import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from tests.conftest import create_test_user


@pytest.mark.asyncio
async def test_staff_management_and_audit(
    client: AsyncClient,
    db_session: AsyncSession,
    seed_roles: dict[str, uuid.UUID],
):
    admin = await create_test_user(
        db_session, seed_roles["admin"], email="admin_staff@example.com"
    )
    admin_token = create_access_token(str(admin.id), "admin")

    # 1. Admin creates a new counsellor staff
    new_counsellor = {
        "email": "priya.counsellor@example.com",
        "password": "SecurePassword123!",
        "first_name": "Priya",
        "last_name": "Nair",
        "phone": "+91 9988776655",
        "role": "counsellor",
    }
    res_create = await client.post(
        "/api/v1/users",
        json=new_counsellor,
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_create.status_code == 201
    staff_user = res_create.json()
    assert staff_user["email"] == "priya.counsellor@example.com"
    assert "counsellor" in staff_user["roles"]

    # 2. List counsellors
    res_list = await client.get(
        "/api/v1/users/counsellors",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_list.status_code == 200
    counsellors = res_list.json()
    assert any(c["email"] == "priya.counsellor@example.com" for c in counsellors)

    # 3. Toggle active status
    res_status = await client.patch(
        f"/api/v1/users/{staff_user['id']}/status",
        json={"is_active": False},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_status.status_code == 200
    assert res_status.json()["is_active"] is False

    # 4. Audit logs list
    res_audit = await client.get(
        "/api/v1/audit-logs",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_audit.status_code == 200
    assert isinstance(res_audit.json(), list)
