"""Tests for Document Security, Upload, Verification & Quarantine (Module 8)."""

import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from tests.conftest import create_test_user


@pytest.mark.asyncio
async def test_document_lifecycle(
    client: AsyncClient,
    db_session: AsyncSession,
    seed_roles: dict[str, uuid.UUID],
):
    admin = await create_test_user(
        db_session, seed_roles["admin"], email="admin_doc@example.com"
    )
    student = await create_test_user(
        db_session, seed_roles["student"], email="student_doc@example.com"
    )

    admin_token = create_access_token(str(admin.id), "admin")
    student_token = create_access_token(str(student.id), "student")

    # 1. Reject file with invalid magic bytes / mime type
    fake_content = b"Not a real PDF file"
    res_bad = await client.post(
        "/api/v1/documents/upload",
        data={"document_type": "passport"},
        files={"file": ("passport.pdf", fake_content, "application/pdf")},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert res_bad.status_code == 400
    assert "File content does not match" in res_bad.json()["detail"]

    # 2. Upload valid PDF (starts with %PDF)
    valid_pdf = b"%PDF-1.4\n%Lugie Test Document Content\n%%EOF"
    res_upload = await client.post(
        "/api/v1/documents/upload",
        data={"document_type": "passport"},
        files={"file": ("passport.pdf", valid_pdf, "application/pdf")},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert res_upload.status_code == 201
    doc_data = res_upload.json()
    doc_id = doc_data["id"]
    assert doc_data["document_type"] == "passport"
    assert doc_data["status"] == "uploaded"

    # 3. Student views own documents
    res_my_docs = await client.get(
        "/api/v1/documents/me",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert res_my_docs.status_code == 200
    my_docs = res_my_docs.json()
    assert len(my_docs) == 1
    assert my_docs[0]["id"] == doc_id

    # 4. Admin lists all documents
    res_list = await client.get(
        "/api/v1/documents",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_list.status_code == 200
    items = res_list.json()["items"]
    assert any(d["id"] == doc_id for d in items)

    # 5. Admin verifies document
    res_verify = await client.post(
        f"/api/v1/documents/{doc_id}/verify",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_verify.status_code == 200
    assert res_verify.json()["status"] == "verified"

    # 6. Admin quarantines document
    res_quarantine = await client.post(
        f"/api/v1/documents/{doc_id}/quarantine",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_quarantine.status_code == 200
    assert res_quarantine.json()["scan_status"] == "quarantined"

    # 7. Student download quarantined document is forbidden
    res_dl = await client.get(
        f"/api/v1/documents/{doc_id}/download",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert res_dl.status_code == 403

    # 8. Test 2-step presigned upload and confirmation flow (frontend documents page)
    res_presign = await client.post(
        "/api/v1/documents/presigned-upload",
        json={
            "filename": "academic_transcript.pdf",
            "document_type": "Consolidated Academic Transcripts",
            "mime_type": "application/pdf",
            "file_size_bytes": 1048576,
        },
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert res_presign.status_code == 201
    presign_data = res_presign.json()
    assert "document_id" in presign_data
    assert "upload_url" in presign_data
    assert "s3_key" in presign_data

    # Confirm upload
    res_confirm = await client.post(
        "/api/v1/documents/confirm-upload",
        json={"document_id": presign_data["document_id"]},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert res_confirm.status_code == 200
    confirm_data = res_confirm.json()
    assert confirm_data["id"] == presign_data["document_id"]
    assert confirm_data["original_filename"] == "academic_transcript.pdf"
    assert confirm_data["file_size_bytes"] == 1048576
    assert confirm_data["status"] == "uploaded"

    # 9. Test downloading / streaming the confirmed document
    res_dl_confirmed = await client.get(
        f"/api/v1/documents/{confirm_data['id']}/download",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert res_dl_confirmed.status_code == 200
    assert "/file" in res_dl_confirmed.json()["download_url"]

    res_file = await client.get(
        f"/api/v1/documents/{confirm_data['id']}/file",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert res_file.status_code == 200
    assert res_file.headers["content-type"] == "application/pdf"
    assert res_file.content.startswith(b"%PDF")

    # 10. Security scanner tests: EICAR malware test string is blocked
    import base64
    eicar_bad = base64.b64encode(b"%PDF-1.4\nX5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*\n%%EOF").decode()
    res_malware = await client.post(
        "/api/v1/documents/presigned-upload",
        json={
            "filename": "infected.pdf",
            "document_type": "Other",
            "mime_type": "application/pdf",
            "file_size_bytes": 100,
            "file_base64": eicar_bad,
        },
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert res_malware.status_code == 400
    assert "Threat detected" in res_malware.json()["detail"]

    # 11. Security scanner tests: Disguised binary / magic byte mismatch is blocked
    fake_pdf = base64.b64encode(b"This is just plain text disguised as a PDF").decode()
    res_disguised = await client.post(
        "/api/v1/documents/presigned-upload",
        json={
            "filename": "fake.pdf",
            "document_type": "Other",
            "mime_type": "application/pdf",
            "file_size_bytes": 50,
            "file_base64": fake_pdf,
        },
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert res_disguised.status_code == 400
    assert "magic bytes check failed" in res_disguised.json()["detail"]

    # 12. Counsellor & admin can inspect metadata and file binary even if ephemeral disk cache cleared
    counsellor = await create_test_user(
        db_session, seed_roles["counsellor"], email="counsellor_doc@example.com"
    )
    counsellor_token = create_access_token(str(counsellor.id), "counsellor")

    real_pdf = b"%PDF-1.4\n%Authentic Student Marksheet\n%%EOF"
    res_up_b64 = await client.post(
        "/api/v1/documents/presigned-upload",
        json={
            "filename": "marksheet_2026.pdf",
            "document_type": "Class XII (12th / Intermediate) Marksheet",
            "mime_type": "application/pdf",
            "file_size_bytes": len(real_pdf),
            "file_base64": base64.b64encode(real_pdf).decode(),
        },
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert res_up_b64.status_code == 201
    doc_b64_id = res_up_b64.json()["document_id"]

    res_meta = await client.get(
        f"/api/v1/documents/{doc_b64_id}",
        headers={"Authorization": f"Bearer {counsellor_token}"},
    )
    assert res_meta.status_code == 200
    assert res_meta.json()["file_name"] == "marksheet_2026.pdf"

    res_counsellor_file = await client.get(
        f"/api/v1/documents/{doc_b64_id}/file",
        headers={"Authorization": f"Bearer {counsellor_token}"},
    )
    assert res_counsellor_file.status_code == 200
    assert res_counsellor_file.content == real_pdf

    res_admin_file = await client.get(
        f"/api/v1/documents/{doc_b64_id}/file",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_admin_file.status_code == 200
    assert res_admin_file.content == real_pdf
