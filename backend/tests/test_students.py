"""Tests for student profile, academics, and language test endpoints."""

import pytest

from app.core.security import create_access_token
from tests.conftest import create_test_user


async def _make_student(db_session, seed_roles, email="student_test@example.com"):
    user = await create_test_user(
        db_session, seed_roles["student"], email=email
    )
    token = create_access_token(str(user.id), "student")
    return user, {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_get_my_profile_success(client, db_session, seed_roles):
    """Student can retrieve their own profile."""
    user, headers = await _make_student(db_session, seed_roles)

    resp = await client.get("/api/v1/students/me/profile", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["user_id"] == str(user.id)
    assert "profile_completion" in data


@pytest.mark.asyncio
async def test_get_my_profile_unauthorized(client, db_session, seed_roles):
    """Unauthenticated request is rejected."""
    resp = await client.get("/api/v1/students/me/profile")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_update_my_profile(client, db_session, seed_roles):
    """Student can update their profile information and completion increases."""
    user, headers = await _make_student(db_session, seed_roles, email="update_prof@test.com")

    update_payload = {
        "nationality": "Indian",
        "current_city": "Bangalore",
        "current_country": "India",
        "passport_number": "Z1234567",
        "preferred_intake": "Fall 2026",
        "budget_min": 1500000,
        "budget_max": 2500000,
        "funding_preference": "Self-funded + Loan",
    }

    resp = await client.patch(
        "/api/v1/students/me/profile",
        headers=headers,
        json=update_payload,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["nationality"] == "Indian"
    assert data["current_city"] == "Bangalore"
    assert data["passport_number"] == "Z1234567"
    assert data["profile_completion"] > 0


@pytest.mark.asyncio
async def test_create_and_list_academics(client, db_session, seed_roles):
    """Student can add academic records and list them."""
    user, headers = await _make_student(db_session, seed_roles, email="academics@test.com")

    academic_payload = {
        "qualification": "Bachelor of Technology",
        "institution": "National Institute of Technology",
        "degree": "B.Tech",
        "specialisation": "Computer Science and Engineering",
        "cgpa": 8.45,
        "percentage": 84.5,
        "scale": 10.0,
        "backlogs": 0,
        "is_current": False,
    }

    create_resp = await client.post(
        "/api/v1/students/me/academics",
        headers=headers,
        json=academic_payload,
    )
    assert create_resp.status_code == 201
    created = create_resp.json()
    assert created["qualification"] == "Bachelor of Technology"
    assert created["cgpa"] == 8.45

    # List academics
    list_resp = await client.get("/api/v1/students/me/academics", headers=headers)
    assert list_resp.status_code == 200
    items = list_resp.json()
    assert len(items) == 1
    assert items[0]["institution"] == "National Institute of Technology"


@pytest.mark.asyncio
async def test_create_and_list_language_tests(client, db_session, seed_roles):
    """Student can add language tests and retrieve them."""
    user, headers = await _make_student(db_session, seed_roles, email="lang_test@test.com")

    lang_payload = {
        "test_type": "IELTS",
        "overall_score": 7.5,
        "listening": 8.0,
        "reading": 7.5,
        "writing": 7.0,
        "speaking": 7.5,
        "test_date": "2026-05-15",
    }

    create_resp = await client.post(
        "/api/v1/students/me/language-tests",
        headers=headers,
        json=lang_payload,
    )
    assert create_resp.status_code == 201
    created = create_resp.json()
    assert created["test_type"] == "IELTS"
    assert created["overall_score"] == 7.5

    # List
    list_resp = await client.get("/api/v1/students/me/language-tests", headers=headers)
    assert list_resp.status_code == 200
    items = list_resp.json()
    assert len(items) == 1
    assert items[0]["test_type"] == "IELTS"


@pytest.mark.asyncio
async def test_admin_create_and_delete_student(client, db_session, seed_roles):
    """Admin can create and remove student accounts; counsellors and students cannot."""
    from sqlalchemy import select
    from app.models.package import Package
    from app.models.payment import Order, Payment
    from app.models.student import StudentProfile
    from app.models.user import User

    admin = await create_test_user(
        db_session, seed_roles["admin"], email="admin_students@test.com"
    )
    counsellor = await create_test_user(
        db_session, seed_roles["counsellor"], email="counsellor_students@test.com"
    )
    admin_headers = {"Authorization": f"Bearer {create_access_token(str(admin.id), 'admin')}"}
    counsellor_headers = {
        "Authorization": f"Bearer {create_access_token(str(counsellor.id), 'counsellor')}"
    }

    payload = {
        "first_name": "Aarav",
        "last_name": "Mehta",
        "email": "aarav.student@test.com",
        "phone": "+91 9876543210",
        "password": "StudentPass123!",
        "current_city": "Pune",
        "current_country": "India",
        "preferred_intake": "Fall 2026",
    }

    # Counsellor cannot create a student directly
    forbidden_create = await client.post(
        "/api/v1/students", json=payload, headers=counsellor_headers
    )
    assert forbidden_create.status_code == 403

    # Admin creates student
    create_resp = await client.post("/api/v1/students", json=payload, headers=admin_headers)
    assert create_resp.status_code == 201
    created = create_resp.json()
    assert created["email"] == "aarav.student@test.com"
    assert created["student_name"] == "Aarav Mehta"
    assert created["is_active"] is True

    # Duplicate email is rejected
    dup_resp = await client.post("/api/v1/students", json=payload, headers=admin_headers)
    assert dup_resp.status_code == 409

    # Attach an Order + Payment (ON DELETE RESTRICT foreign keys) to verify safe cleanup
    pkg = Package(name="Basic", slug="basic", price=7999, currency="INR", is_active=True)
    db_session.add(pkg)
    await db_session.flush()

    order = Order(
        student_id=created["id"],
        package_id=pkg.id,
        amount=7999,
        currency="INR",
        status="paid",
    )
    db_session.add(order)
    await db_session.flush()

    payment = Payment(
        order_id=order.id,
        provider="razorpay",
        amount=7999,
        currency="INR",
        status="captured",
    )
    db_session.add(payment)
    await db_session.commit()

    # Counsellor cannot remove a student
    forbidden_del = await client.delete(
        f"/api/v1/students/{created['id']}", headers=counsellor_headers
    )
    assert forbidden_del.status_code == 403

    # Admin deletes student permanently
    del_resp = await client.delete(
        f"/api/v1/students/{created['id']}", headers=admin_headers
    )
    assert del_resp.status_code == 200
    assert del_resp.json()["deleted_student_id"] == created["id"]

    # Confirm DB records are gone
    prof_check = await db_session.execute(
        select(StudentProfile).where(StudentProfile.id == created["id"])
    )
    assert prof_check.scalar_one_or_none() is None
    user_check = await db_session.execute(
        select(User).where(User.email == "aarav.student@test.com")
    )
    assert user_check.scalar_one_or_none() is None
