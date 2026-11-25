"""End-to-End full platform workflow test (Module 9)."""

import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.models.student import StudentProfile
from app.models.university import Country, Course, Intake, University
from tests.conftest import create_test_user


@pytest.mark.asyncio
async def test_complete_student_consultancy_lifecycle(
    client: AsyncClient,
    db_session: AsyncSession,
    seed_roles: dict[str, uuid.UUID],
):
    # 0. Seed Staff & Target University Course
    admin = await create_test_user(
        db_session, seed_roles["admin"], email="e2e_admin@lugie.com"
    )
    counsellor = await create_test_user(
        db_session, seed_roles["counsellor"], email="e2e_counsellor@lugie.com"
    )

    admin_token = create_access_token(str(admin.id), "admin")
    counsellor_token = create_access_token(str(counsellor.id), "counsellor")

    country = Country(id=uuid.uuid4(), name="Germany", code="DE", is_active=True)
    db_session.add(country)
    await db_session.flush()

    univ = University(
        id=uuid.uuid4(),
        country_id=country.id,
        name="Technical University of Munich",
        city="Munich",
        is_verified=True,
    )
    db_session.add(univ)
    await db_session.flush()

    course = Course(
        id=uuid.uuid4(),
        university_id=univ.id,
        programme_name="M.Sc Informatics",
        degree_level="masters",
        duration_months=24,
    )
    db_session.add(course)
    await db_session.flush()

    intake = Intake(
        id=uuid.uuid4(),
        course_id=course.id,
        intake_name="Winter 2027",
    )
    db_session.add(intake)
    await db_session.commit()

    # Step 1: Public Lead Form Intake
    lead_payload = {
        "source": "website_contact",
        "first_name": "Rohan",
        "last_name": "Verma",
        "email": "rohan.verma@example.com",
        "phone": "+91 9123456789",
        "message": "Interested in German public university masters",
        "preferred_country": "Germany",
        "preferred_course": "Computer Science",
        "consent_given": True,
        "consent_text": "I agree to the privacy policy.",
    }
    res_lead = await client.post("/api/v1/leads/public", json=lead_payload)
    assert res_lead.status_code == 201
    lead_id = res_lead.json()["id"]

    # Step 2: Admin views CRM lead and assigns to Counsellor
    res_assign = await client.post(
        f"/api/v1/leads/{lead_id}/assign",
        json={"counsellor_id": str(counsellor.id)},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_assign.status_code == 200
    assert res_assign.json()["assigned_counsellor_id"] == str(counsellor.id)

    # Step 3: Counsellor logs follow-up note and qualifies lead
    res_followup = await client.post(
        f"/api/v1/leads/{lead_id}/follow-ups",
        json={
            "follow_up_date": "2026-12-01T10:00:00",
            "follow_up_type": "call",
            "notes": "Rohan has 8.5 CGPA from NIT Warangal. Highly qualified for TUM.",
        },
        headers={"Authorization": f"Bearer {counsellor_token}"},
    )
    assert res_followup.status_code == 201

    res_qualify = await client.patch(
        f"/api/v1/leads/{lead_id}",
        json={"status": "qualified"},
        headers={"Authorization": f"Bearer {counsellor_token}"},
    )
    assert res_qualify.status_code == 200
    assert res_qualify.json()["status"] == "qualified"

    # Step 4: Admin converts qualified lead to Student
    res_convert = await client.post(
        f"/api/v1/leads/{lead_id}/convert",
        json={"password": "SecurePass123!"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_convert.status_code == 200
    student_id = res_convert.json()["converted_student_id"]

    # Fetch newly created student user to simulate student actions
    prof_res = await db_session.execute(
        select(StudentProfile).where(StudentProfile.id == uuid.UUID(student_id))
    )
    student_profile = prof_res.scalar_one()
    student_token = create_access_token(str(student_profile.user_id), "student")

    # Step 5: Student uploads Academic Records
    res_academic = await client.post(
        "/api/v1/students/me/academics",
        json={
            "qualification": "B.Tech Computer Science",
            "institution": "National Institute of Technology Warangal",
            "degree": "Bachelor of Technology",
            "cgpa": 8.50,
            "scale": 10.00,
        },
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert res_academic.status_code == 201

    # Step 6: Counsellor drafts Assessment, Admin Approves
    res_eval = await client.post(
        "/api/v1/assessments",
        json={
            "student_id": student_id,
            "assessment_type": "manual",
            "recommended_countries": ["Germany"],
            "recommended_courses": ["M.Sc Informatics"],
            "eligibility_notes": "Profile exceeds Munich minimum cutoff of 8.0 CGPA.",
        },
        headers={"Authorization": f"Bearer {counsellor_token}"},
    )
    assert res_eval.status_code == 201
    eval_id = res_eval.json()["id"]

    # Submit & Approve
    await client.post(
        f"/api/v1/assessments/{eval_id}/submit",
        headers={"Authorization": f"Bearer {counsellor_token}"},
    )
    res_appr = await client.post(
        f"/api/v1/assessments/{eval_id}/review",
        json={"decision": "approved", "notes": "Approved for application preparation."},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_appr.status_code == 200
    assert res_appr.json()["status"] == "approved"

    # Step 7: Document Upload & Verification
    pdf_bytes = b"%PDF-1.4\n%Academic Transcript for Rohan Verma\n%%EOF"
    res_doc = await client.post(
        "/api/v1/documents/upload",
        data={"document_type": "academic_transcript"},
        files={"file": ("transcript.pdf", pdf_bytes, "application/pdf")},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert res_doc.status_code == 201
    doc_id = res_doc.json()["id"]

    # Counsellor verifies document
    res_vdoc = await client.post(
        f"/api/v1/documents/{doc_id}/verify",
        headers={"Authorization": f"Bearer {counsellor_token}"},
    )
    assert res_vdoc.status_code == 200
    assert res_vdoc.json()["status"] == "verified"

    # Step 8: Create University Application
    res_app = await client.post(
        "/api/v1/applications",
        json={
            "course_id": str(course.id),
            "intake_id": str(intake.id),
        },
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert res_app.status_code == 201
    application_id = res_app.json()["id"]

    # Admin issues status update to offer letter
    res_offer = await client.patch(
        f"/api/v1/applications/{application_id}",
        json={"status": "conditional_offer", "application_reference": "TUM-2027-W-8891"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_offer.status_code == 200
    assert res_offer.json()["status"] == "conditional_offer"
    assert res_offer.json()["application_reference"] == "TUM-2027-W-8891"
