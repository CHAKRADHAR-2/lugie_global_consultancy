"""Tests for Shortlists (Opted & Recommendations) and Chat Messages."""

import pytest

from app.core.security import create_access_token
from tests.conftest import create_test_user


async def _make_student(db_session, seed_roles, email="shortlist_student@example.com"):
    user = await create_test_user(
        db_session, seed_roles["student"], email=email
    )
    token = create_access_token(str(user.id), "student")
    return user, {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_shortlists_opted_and_recommendations(
    client, db_session, seed_roles
):
    _, headers = await _make_student(db_session, seed_roles)

    # 1. List opted universities (seeds initial examples if empty)
    res = await client.get("/api/v1/shortlists/opted", headers=headers)
    assert res.status_code == 200
    opted_list = res.json()
    assert len(opted_list) >= 1

    # 2. Student creates a new opted university
    new_opted = {
        "university_name": "University of Oxford",
        "country": "United Kingdom",
        "course_name": "MSc in Advanced Computer Science",
        "intake": "Fall 2025",
        "tier": "dream",
        "student_notes": "First class honours candidate. Applying with 3 LORs.",
    }
    create_res = await client.post(
        "/api/v1/shortlists/opted", json=new_opted, headers=headers
    )
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert created_data["university_name"] == "University of Oxford"
    assert created_data["status"] == "under_counsellor_review"
    opted_id = created_data["id"]

    # 3. List recommendations
    rec_res = await client.get("/api/v1/shortlists/recommendations", headers=headers)
    assert rec_res.status_code == 200
    recs = rec_res.json()
    assert len(recs) >= 1

    # 4. Shortlist a recommendation
    rec_id = recs[0]["id"]
    shortlist_res = await client.post(
        f"/api/v1/shortlists/recommendations/{rec_id}/shortlist", headers=headers
    )
    assert shortlist_res.status_code == 200
    assert shortlist_res.json()["status"] == "shortlisted"

    # 5. Delete the created opted university
    del_res = await client.delete(
        f"/api/v1/shortlists/opted/{opted_id}", headers=headers
    )
    assert del_res.status_code == 200


@pytest.mark.asyncio
async def test_chat_messages_flow(client, db_session, seed_roles):
    _, headers = await _make_student(db_session, seed_roles, email="chat_student@test.com")

    # 1. Fetch thread
    thread_res = await client.get("/api/v1/messages/chat/thread", headers=headers)
    assert thread_res.status_code == 200
    messages = thread_res.json()
    assert isinstance(messages, list)

    # 2. Send message
    send_res = await client.post(
        "/api/v1/messages/chat/send",
        json={
            "message": "Hello counsellor! Could you please review my Statement of Purpose?",
            "attachment_name": "SOP_Draft.pdf",
            "attachment_type": "application/pdf",
        },
        headers=headers,
    )
    assert send_res.status_code == 201
    sent_msg = send_res.json()
    assert "Statement of Purpose" in sent_msg["message"]
    assert sent_msg["sender_role"] == "student"


@pytest.mark.asyncio
async def test_counsellor_tasks_and_dossier_flow(client, db_session, seed_roles):
    # Create counsellor user
    counsellor = await create_test_user(
        db_session, seed_roles["counsellor"], email="test_counsellor_desk@lugie.com"
    )
    c_token = create_access_token(str(counsellor.id), "counsellor")
    c_headers = {"Authorization": f"Bearer {c_token}"}

    # Create student user (create_test_user automatically attaches a student profile)
    student = await create_test_user(
        db_session, seed_roles["student"], email="test_student_dossier@lugie.com"
    )

    # 1. Counsellor lists tasks (auto-seeds 5 onboarding tasks)
    tasks_res = await client.get("/api/v1/tasks", headers=c_headers)
    assert tasks_res.status_code == 200
    tasks = tasks_res.json()
    assert len(tasks) >= 5
    task_id = tasks[0]["id"]

    # 2. Update task status to in_progress then completed
    patch_res = await client.patch(
        f"/api/v1/tasks/{task_id}",
        json={"status": "completed"},
        headers=c_headers,
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "completed"

    # 3. Retrieve student full dossier
    dossier_res = await client.get(
        f"/api/v1/students/{student.id}/full-dossier", headers=c_headers
    )
    assert dossier_res.status_code == 200
    dossier = dossier_res.json()
    assert "profile" in dossier
    assert "academics" in dossier
    assert "documents" in dossier

    # 4. Counsellor views chat inbox
    inbox_res = await client.get("/api/v1/messages/chat/counsellor/inbox", headers=c_headers)
    assert inbox_res.status_code == 200
    assert isinstance(inbox_res.json(), list)
