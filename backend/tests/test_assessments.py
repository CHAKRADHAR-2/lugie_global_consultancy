"""Tests for Profile Assessment workflow (Module 7)."""

import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.models.student import StudentProfile
from tests.conftest import create_test_user


@pytest.mark.asyncio
async def test_assessment_full_lifecycle(
    client: AsyncClient,
    db_session: AsyncSession,
    seed_roles: dict[str, uuid.UUID],
):
    # 1. Setup Admin, Counsellor, Student
    admin = await create_test_user(
        db_session, seed_roles["admin"], email="admin_eval@example.com"
    )
    counsellor = await create_test_user(
        db_session, seed_roles["counsellor"], email="counsellor_eval@example.com"
    )
    student_user = await create_test_user(
        db_session, seed_roles["student"], email="student_eval@example.com"
    )
    # Fetch auto-created student profile
    from sqlalchemy import select
    res_prof = await db_session.execute(
        select(StudentProfile).where(StudentProfile.user_id == student_user.id)
    )
    profile = res_prof.scalar_one()

    admin_token = create_access_token(str(admin.id), "admin")
    counsellor_token = create_access_token(str(counsellor.id), "counsellor")
    student_token = create_access_token(str(student_user.id), "student")

    # 2. Student cannot create assessment
    res_student_create = await client.post(
        "/api/v1/assessments",
        json={"student_id": str(profile.id), "eligibility_notes": "Attempt"},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert res_student_create.status_code == 403

    # 3. Counsellor creates draft assessment
    create_payload = {
        "student_id": str(profile.id),
        "assessment_type": "manual",
        "strengths": {"academic": "Strong B.Tech GPA (8.8/10)"},
        "weaknesses": {"language": "IELTS 6.0 needs improvement to 6.5+"},
        "recommended_countries": ["Germany", "Ireland"],
        "recommended_courses": ["M.Sc Data Engineering"],
        "eligibility_notes": "Candidate qualifies for German public universities if IELTS reaches 6.5.",
    }
    res_create = await client.post(
        "/api/v1/assessments",
        json=create_payload,
        headers={"Authorization": f"Bearer {counsellor_token}"},
    )
    assert res_create.status_code == 201
    assessment_data = res_create.json()
    assessment_id = assessment_data["id"]
    assert assessment_data["status"] == "draft"

    # 4. Counsellor updates draft assessment
    res_update = await client.patch(
        f"/api/v1/assessments/{assessment_id}",
        json={"eligibility_notes": "Updated: Candidate is also eligible for Trinity College Dublin."},
        headers={"Authorization": f"Bearer {counsellor_token}"},
    )
    assert res_update.status_code == 200
    assert "Trinity College Dublin" in res_update.json()["eligibility_notes"]

    # 5. Counsellor submits assessment for admin review
    res_submit = await client.post(
        f"/api/v1/assessments/{assessment_id}/submit",
        headers={"Authorization": f"Bearer {counsellor_token}"},
    )
    assert res_submit.status_code == 200
    assert res_submit.json()["status"] == "submitted"

    # 6. Admin approves assessment
    res_review = await client.post(
        f"/api/v1/assessments/{assessment_id}/review",
        json={"decision": "approved", "notes": "Approved for dispatch to student."},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_review.status_code == 200
    assert res_review.json()["status"] == "approved"
    assert res_review.json()["is_reviewed"] is True

    # 7. Student can view their approved assessment
    res_student_view = await client.get(
        "/api/v1/assessments/me",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert res_student_view.status_code == 200
    my_assessments = res_student_view.json()
    assert len(my_assessments) == 1
    assert my_assessments[0]["id"] == assessment_id
