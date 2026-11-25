"""Tests for authentication and authorization endpoints."""

import uuid
from unittest.mock import AsyncMock, patch

import pytest

from app.core.security import create_access_token, verify_token
from tests.conftest import create_test_user

# ---------------------------------------------------------------------------
# Registration Tests
# ---------------------------------------------------------------------------


class TestRegistration:
    """Registration endpoint tests."""

    @pytest.mark.asyncio
    @patch("app.services.auth_service.store_refresh_jti", new_callable=AsyncMock)
    async def test_register_success(self, mock_store, client, db_session, seed_roles):
        resp = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "new@example.com",
                "password": "StrongPass123!",
                "first_name": "New",
                "last_name": "Student",
            },
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["email"] == "new@example.com"
        assert data["first_name"] == "New"
        assert "password" not in data
        assert "password_hash" not in data

    @pytest.mark.asyncio
    @patch("app.services.auth_service.store_refresh_jti", new_callable=AsyncMock)
    async def test_register_duplicate_email(
        self, mock_store, client, db_session, seed_roles
    ):
        await create_test_user(
            db_session, seed_roles["student"], email="dup@example.com"
        )
        resp = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "dup@example.com",
                "password": "StrongPass123!",
                "first_name": "Dup",
                "last_name": "User",
            },
        )
        assert resp.status_code == 409

    @pytest.mark.asyncio
    async def test_register_invalid_email(self, client, db_session, seed_roles):
        resp = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "not-an-email",
                "password": "StrongPass123!",
                "first_name": "Bad",
                "last_name": "Email",
            },
        )
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_register_missing_fields(self, client, db_session, seed_roles):
        resp = await client.post(
            "/api/v1/auth/register",
            json={"email": "test@test.com"},
        )
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Login Tests
# ---------------------------------------------------------------------------


class TestLogin:
    """Login endpoint tests."""

    @pytest.mark.asyncio
    @patch("app.services.auth_service.store_refresh_jti", new_callable=AsyncMock)
    async def test_login_success(self, mock_store, client, db_session, seed_roles):
        await create_test_user(
            db_session,
            seed_roles["student"],
            email="login@example.com",
            password="TestPass123!",
        )
        resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "login@example.com", "password": "TestPass123!"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert "csrf_token" in data
        assert data["user"]["email"] == "login@example.com"
        assert "student" in data["user"]["roles"]

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client, db_session, seed_roles):
        await create_test_user(
            db_session,
            seed_roles["student"],
            email="wrong@example.com",
            password="TestPass123!",
        )
        resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "wrong@example.com", "password": "WrongPass!"},
        )
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, client, db_session, seed_roles):
        resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "ghost@example.com", "password": "NoUser1!"},
        )
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_login_inactive_user(self, client, db_session, seed_roles):
        await create_test_user(
            db_session,
            seed_roles["student"],
            email="inactive@example.com",
            password="TestPass123!",
            is_active=False,
        )
        resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "inactive@example.com", "password": "TestPass123!"},
        )
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Me / Protected Endpoint Tests
# ---------------------------------------------------------------------------


class TestMe:
    """GET /me tests — verifying access token authorization."""

    @pytest.mark.asyncio
    async def test_me_with_valid_token(self, client, db_session, seed_roles):
        user = await create_test_user(
            db_session, seed_roles["student"], email="me@example.com"
        )
        token = create_access_token(str(user.id), "student")
        resp = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "me@example.com"

    @pytest.mark.asyncio
    async def test_me_without_token(self, client, db_session, seed_roles):
        resp = await client.get("/api/v1/auth/me")
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_me_with_invalid_token(self, client, db_session, seed_roles):
        resp = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid.token.here"},
        )
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_me_with_expired_token(self, client, db_session, seed_roles):
        user = await create_test_user(
            db_session, seed_roles["student"], email="expired@example.com"
        )
        from datetime import UTC, datetime, timedelta

        from jose import jwt

        payload = {
            "sub": str(user.id),
            "role": "student",
            "type": "access",
            "exp": datetime.now(UTC) - timedelta(minutes=1),
            "iat": datetime.now(UTC) - timedelta(minutes=16),
            "jti": str(uuid.uuid4()),
        }
        from app.config import settings

        expired_token = jwt.encode(
            payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM
        )
        resp = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {expired_token}"},
        )
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Logout Tests
# ---------------------------------------------------------------------------


class TestLogout:
    """Logout endpoint tests."""

    @pytest.mark.asyncio
    @patch("app.services.auth_service.revoke_all_user_jtis", new_callable=AsyncMock)
    async def test_logout_success(self, mock_revoke, client, db_session, seed_roles):
        user = await create_test_user(
            db_session, seed_roles["student"], email="logout@example.com"
        )
        token = create_access_token(str(user.id), "student")
        resp = await client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["message"] == "Logged out successfully."
        mock_revoke.assert_called_once_with(str(user.id))

    @pytest.mark.asyncio
    async def test_logout_without_token(self, client, db_session, seed_roles):
        resp = await client.post("/api/v1/auth/logout")
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# RBAC Tests
# ---------------------------------------------------------------------------


class TestRBAC:
    """Role-based access control tests."""

    @pytest.mark.asyncio
    async def test_student_cannot_access_admin_endpoints(
        self, client, db_session, seed_roles
    ):
        user = await create_test_user(
            db_session, seed_roles["student"], email="student_rbac@example.com"
        )
        token = create_access_token(str(user.id), "student")
        resp = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "student" in data["roles"]
        assert "admin" not in data["roles"]

    @pytest.mark.asyncio
    async def test_admin_has_admin_role(self, client, db_session, seed_roles):
        user = await create_test_user(
            db_session, seed_roles["admin"], email="admin_rbac@example.com"
        )
        token = create_access_token(str(user.id), "admin")
        resp = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "admin" in data["roles"]

    @pytest.mark.asyncio
    async def test_counsellor_has_counsellor_role(
        self, client, db_session, seed_roles
    ):
        user = await create_test_user(
            db_session, seed_roles["counsellor"], email="counsellor_rbac@example.com"
        )
        token = create_access_token(str(user.id), "counsellor")
        resp = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "counsellor" in data["roles"]


# ---------------------------------------------------------------------------
# Data Isolation Tests
# ---------------------------------------------------------------------------


class TestDataIsolation:
    """Ensure tokens carry correct user IDs."""

    @pytest.mark.asyncio
    async def test_tokens_carry_correct_user_id(self, db_session, seed_roles):
        user_a = await create_test_user(
            db_session, seed_roles["student"], email="a@example.com"
        )
        user_b = await create_test_user(
            db_session, seed_roles["student"], email="b@example.com"
        )

        token_a = create_access_token(str(user_a.id), "student")
        token_b = create_access_token(str(user_b.id), "student")

        payload_a = verify_token(token_a, "access")
        payload_b = verify_token(token_b, "access")

        assert payload_a["sub"] == str(user_a.id)
        assert payload_b["sub"] == str(user_b.id)
        assert payload_a["sub"] != payload_b["sub"]


# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------


class TestHealthCheck:
    @pytest.mark.asyncio
    async def test_healthz(self, client, db_session, seed_roles):
        resp = await client.get("/healthz")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert data["service"] == "lugie-api"
