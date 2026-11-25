"""Tests for application CRUD, timeline, and task endpoints."""

import uuid

import pytest

from app.core.security import create_access_token
from app.models.university import Country, Course, Intake, University
from tests.conftest import create_test_user


async def _make_student(db_session, seed_roles, email="app_student@example.com"):
    user = await create_test_user(
        db_session, seed_roles["student"], email=email
    )
    token = create_access_token(str(user.id), "student")
    return user, {"Authorization": f"Bearer {token}"}


async def _make_admin(db_session, seed_roles, email="app_admin@example.com"):
    user = await create_test_user(
        db_session, seed_roles["admin"], email=email
    )
    token = create_access_token(str(user.id), "admin")
    return user, {"Authorization": f"Bearer {token}"}


async def _seed_course(db_session):
    country = Country(id=uuid.uuid4(), name="United Kingdom", code="GBR")
    db_session.add(country)
    await db_session.flush()

    uni = University(
        id=uuid.uuid4(),
        name="University of Edinburgh",
        country_id=country.id,
        city="Edinburgh",
    )
    db_session.add(uni)
    await db_session.flush()

    course = Course(
        id=uuid.uuid4(),
        university_id=uni.id,
        programme_name="MSc Advanced Computer Science",
        degree_level="Master's",
    )
    db_session.add(course)
    await db_session.flush()

    intake = Intake(
        id=uuid.uuid4(),
        course_id=course.id,
        intake_name="September 2026",
    )
    db_session.add(intake)
    await db_session.commit()

    return course, intake


@pytest.mark.asyncio
async def test_create_application_success(client, db_session, seed_roles):
    """Student can create an application for a course."""
    user, headers = await _make_student(db_session, seed_roles)
    course, intake = await _seed_course(db_session)

    resp = await client.post(
        "/api/v1/applications",
        headers=headers,
        json={
            "course_id": str(course.id),
            "intake_id": str(intake.id),
            "notes": "First choice program",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["course_id"] == str(course.id)
    assert data["status"] == "draft"


@pytest.mark.asyncio
async def test_create_application_duplicate_rejected(client, db_session, seed_roles):
    """Applying twice to the same course and intake is rejected with 409 Conflict."""
    user, headers = await _make_student(db_session, seed_roles, email="dup_app@test.com")
    course, intake = await _seed_course(db_session)

    payload = {
        "course_id": str(course.id),
        "intake_id": str(intake.id),
    }

    resp1 = await client.post("/api/v1/applications", headers=headers, json=payload)
    assert resp1.status_code == 201

    resp2 = await client.post("/api/v1/applications", headers=headers, json=payload)
    assert resp2.status_code == 409


@pytest.mark.asyncio
async def test_list_my_applications(client, db_session, seed_roles):
    """Student can list their own applications."""
    user, headers = await _make_student(db_session, seed_roles, email="list_app@test.com")
    course, intake = await _seed_course(db_session)

    await client.post(
        "/api/v1/applications",
        headers=headers,
        json={"course_id": str(course.id), "intake_id": str(intake.id)},
    )

    resp = await client.get("/api/v1/applications/me", headers=headers)
    assert resp.status_code == 200
    apps = resp.json()
    assert len(apps) == 1
    assert apps[0]["course_id"] == str(course.id)


@pytest.mark.asyncio
async def test_admin_update_application_status(client, db_session, seed_roles):
    """Admin can update application status and it records history."""
    user, student_headers = await _make_student(db_session, seed_roles, email="status_app@test.com")
    _, admin_headers = await _make_admin(db_session, seed_roles)
    course, intake = await _seed_course(db_session)

    create_resp = await client.post(
        "/api/v1/applications",
        headers=student_headers,
        json={"course_id": str(course.id), "intake_id": str(intake.id)},
    )
    app_id = create_resp.json()["id"]

    patch_resp = await client.patch(
        f"/api/v1/applications/{app_id}",
        headers=admin_headers,
        json={"status": "submitted", "application_reference": "EDIN-2026-9988"},
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "submitted"
    assert patch_resp.json()["application_reference"] == "EDIN-2026-9988"

    # Verify timeline / status history
    timeline_resp = await client.get(
        f"/api/v1/applications/{app_id}/timeline",
        headers=student_headers,
    )
    assert timeline_resp.status_code == 200
    history = timeline_resp.json()
    assert len(history) >= 2
    assert any(h["to_status"] == "submitted" for h in history)
