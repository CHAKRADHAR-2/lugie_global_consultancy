"""Tests for Lead/CRM API endpoints."""


import pytest

from app.core.security import create_access_token
from tests.conftest import create_test_user

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def _make_admin(db_session, seed_roles):
    user = await create_test_user(
        db_session, seed_roles["admin"], email="admin@test.com"
    )
    token = create_access_token(str(user.id), "admin")
    return user, {"Authorization": f"Bearer {token}"}


async def _make_student(db_session, seed_roles):
    user = await create_test_user(
        db_session, seed_roles["student"], email="student@test.com"
    )
    token = create_access_token(str(user.id), "student")
    return user, {"Authorization": f"Bearer {token}"}


async def _make_counsellor(db_session, seed_roles):
    user = await create_test_user(
        db_session, seed_roles["counsellor"], email="counsellor@test.com"
    )
    token = create_access_token(str(user.id), "counsellor")
    return user, {"Authorization": f"Bearer {token}"}


def _lead_payload(**overrides):
    data = {
        "source": "website_contact",
        "first_name": "Test",
        "last_name": "Lead",
        "email": "lead@example.com",
        "phone": "+919876543210",
        "message": "I want to study abroad",
        "preferred_country": "United Kingdom",
        "preferred_course": "Computer Science",
        "consent_given": True,
        "consent_text": "I agree to the privacy policy.",
    }
    data.update(overrides)
    return data


# ---------------------------------------------------------------------------
# Public Lead Creation
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_create_lead_public_success(client, db_session, seed_roles):
    """Public form creates a lead successfully."""
    resp = await client.post("/api/v1/leads/public", json=_lead_payload())
    assert resp.status_code == 201
    data = resp.json()
    assert data["first_name"] == "Test"
    assert data["email"] == "lead@example.com"
    assert data["status"] == "new"


@pytest.mark.asyncio
async def test_create_lead_honeypot_rejected(client, db_session, seed_roles):
    """Honeypot field filled → rejected."""
    resp = await client.post(
        "/api/v1/leads/public",
        json=_lead_payload(website="http://spam.com"),
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_create_lead_no_consent(client, db_session, seed_roles):
    """Missing consent → rejected."""
    resp = await client.post(
        "/api/v1/leads/public",
        json=_lead_payload(consent_given=False),
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_create_lead_duplicate(client, db_session, seed_roles):
    """Same email + source within 24h → duplicate error."""
    payload = _lead_payload()
    resp1 = await client.post("/api/v1/leads/public", json=payload)
    assert resp1.status_code == 201

    resp2 = await client.post("/api/v1/leads/public", json=payload)
    assert resp2.status_code == 409


@pytest.mark.asyncio
async def test_create_lead_missing_fields(client, db_session, seed_roles):
    """Missing required fields → validation error."""
    resp = await client.post(
        "/api/v1/leads/public",
        json={"source": "website_contact", "consent_given": True},
    )
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Lead Listing
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_leads_admin(client, db_session, seed_roles):
    """Admin can list leads."""
    # Create a lead first
    await client.post("/api/v1/leads/public", json=_lead_payload())

    _, admin_headers = await _make_admin(db_session, seed_roles)
    resp = await client.get("/api/v1/leads", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1


@pytest.mark.asyncio
async def test_list_leads_student_denied(client, db_session, seed_roles):
    """Student cannot list leads → 403."""
    _, student_headers = await _make_student(db_session, seed_roles)
    resp = await client.get("/api/v1/leads", headers=student_headers)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_list_leads_search(client, db_session, seed_roles):
    """Search filter works."""
    await client.post(
        "/api/v1/leads/public",
        json=_lead_payload(first_name="Unique", email="unique@example.com"),
    )
    _, admin_headers = await _make_admin(db_session, seed_roles)
    resp = await client.get(
        "/api/v1/leads", headers=admin_headers, params={"search": "Unique"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert any("Unique" in item["first_name"] for item in data["items"])


# ---------------------------------------------------------------------------
# Lead Detail
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_lead_admin(client, db_session, seed_roles):
    """Admin can get a specific lead."""
    create_resp = await client.post(
        "/api/v1/leads/public", json=_lead_payload()
    )
    lead_id = create_resp.json()["id"]

    _, admin_headers = await _make_admin(db_session, seed_roles)
    resp = await client.get(f"/api/v1/leads/{lead_id}", headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["id"] == lead_id


# ---------------------------------------------------------------------------
# Lead Update
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_update_lead_status(client, db_session, seed_roles):
    """Admin can update lead status."""
    create_resp = await client.post(
        "/api/v1/leads/public", json=_lead_payload()
    )
    lead_id = create_resp.json()["id"]

    _, admin_headers = await _make_admin(db_session, seed_roles)
    resp = await client.patch(
        f"/api/v1/leads/{lead_id}",
        headers=admin_headers,
        json={"status": "contacted"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "contacted"


@pytest.mark.asyncio
async def test_update_lead_student_denied(client, db_session, seed_roles):
    """Student cannot update leads → 403."""
    create_resp = await client.post(
        "/api/v1/leads/public", json=_lead_payload()
    )
    lead_id = create_resp.json()["id"]

    _, student_headers = await _make_student(db_session, seed_roles)
    resp = await client.patch(
        f"/api/v1/leads/{lead_id}",
        headers=student_headers,
        json={"status": "contacted"},
    )
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# Lead Assignment
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_assign_lead(client, db_session, seed_roles):
    """Admin can assign a lead to a counsellor."""
    create_resp = await client.post(
        "/api/v1/leads/public", json=_lead_payload()
    )
    lead_id = create_resp.json()["id"]

    counsellor, _ = await _make_counsellor(db_session, seed_roles)
    _, admin_headers = await _make_admin(db_session, seed_roles)

    resp = await client.post(
        f"/api/v1/leads/{lead_id}/assign",
        headers=admin_headers,
        json={"counsellor_id": str(counsellor.id)},
    )
    assert resp.status_code == 200
    assert resp.json()["assigned_counsellor_id"] == str(counsellor.id)


@pytest.mark.asyncio
async def test_assign_lead_counsellor_denied(client, db_session, seed_roles):
    """Counsellor cannot assign leads → 403."""
    create_resp = await client.post(
        "/api/v1/leads/public", json=_lead_payload()
    )
    lead_id = create_resp.json()["id"]

    counsellor, counsellor_headers = await _make_counsellor(
        db_session, seed_roles
    )
    resp = await client.post(
        f"/api/v1/leads/{lead_id}/assign",
        headers=counsellor_headers,
        json={"counsellor_id": str(counsellor.id)},
    )
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# Lead Conversion
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_convert_lead(client, db_session, seed_roles):
    """Admin converts a lead into a student."""
    create_resp = await client.post(
        "/api/v1/leads/public",
        json=_lead_payload(email="convert@example.com"),
    )
    lead_id = create_resp.json()["id"]

    _, admin_headers = await _make_admin(db_session, seed_roles)
    resp = await client.post(
        f"/api/v1/leads/{lead_id}/convert",
        headers=admin_headers,
        json={"password": "SecurePass123!"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "converted"
    assert data["converted_student_id"] is not None


@pytest.mark.asyncio
async def test_convert_lead_already_converted(client, db_session, seed_roles):
    """Double conversion → 400."""
    create_resp = await client.post(
        "/api/v1/leads/public",
        json=_lead_payload(email="convert2@example.com"),
    )
    lead_id = create_resp.json()["id"]

    _, admin_headers = await _make_admin(db_session, seed_roles)
    resp1 = await client.post(
        f"/api/v1/leads/{lead_id}/convert",
        headers=admin_headers,
        json={"password": "SecurePass123!"},
    )
    assert resp1.status_code == 200

    resp2 = await client.post(
        f"/api/v1/leads/{lead_id}/convert",
        headers=admin_headers,
        json={"password": "SecurePass123!"},
    )
    assert resp2.status_code == 400


# ---------------------------------------------------------------------------
# Follow-Ups
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_create_follow_up(client, db_session, seed_roles):
    """Admin creates a follow-up."""
    create_resp = await client.post(
        "/api/v1/leads/public", json=_lead_payload(email="fu@example.com")
    )
    lead_id = create_resp.json()["id"]

    _, admin_headers = await _make_admin(db_session, seed_roles)
    resp = await client.post(
        f"/api/v1/leads/{lead_id}/follow-ups",
        headers=admin_headers,
        json={
            "follow_up_date": "2026-12-01T10:00:00",
            "follow_up_type": "call",
            "notes": "Initial follow-up call",
        },
    )
    assert resp.status_code == 201
    assert resp.json()["notes"] == "Initial follow-up call"


@pytest.mark.asyncio
async def test_list_follow_ups(client, db_session, seed_roles):
    """List follow-ups for a lead."""
    create_resp = await client.post(
        "/api/v1/leads/public", json=_lead_payload(email="lfu@example.com")
    )
    lead_id = create_resp.json()["id"]

    _, admin_headers = await _make_admin(db_session, seed_roles)
    # Create one
    await client.post(
        f"/api/v1/leads/{lead_id}/follow-ups",
        headers=admin_headers,
        json={
            "follow_up_date": "2026-12-01T10:00:00",
            "follow_up_type": "email",
            "notes": "Email sent",
        },
    )
    # List
    resp = await client.get(
        f"/api/v1/leads/{lead_id}/follow-ups", headers=admin_headers
    )
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


# ---------------------------------------------------------------------------
# Lead Stats
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_lead_stats(client, db_session, seed_roles):
    """Stats endpoint returns counts."""
    await client.post(
        "/api/v1/leads/public", json=_lead_payload(email="stat@example.com")
    )
    _, admin_headers = await _make_admin(db_session, seed_roles)
    resp = await client.get(
        "/api/v1/leads/stats/overview", headers=admin_headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "total" in data
    assert "new" in data
    assert data["total"] >= 1
