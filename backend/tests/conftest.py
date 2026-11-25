"""Pytest configuration and shared fixtures."""

import uuid
from collections.abc import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import settings
from app.core.database import get_db
from app.core.security import hash_password
from app.main import app
from app.models import Base
from app.models.student import StudentProfile
from app.models.user import Role, User, UserRole

# Disable rate limiting for tests
app.state.limiter.enabled = False

# Use a separate test database — replace only the DB name at the end of the URL
_base_url = settings.DATABASE_URL
TEST_DATABASE_URL = _base_url.rsplit("/", 1)[0] + "/lugie_test"


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create all tables, provide a session, then drop tables.

    Every test gets a completely fresh database to avoid cross-test pollution.
    """
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    factory = async_sessionmaker(bind=engine, expire_on_commit=False, autoflush=False)
    async with factory() as session:
        yield session
        await session.rollback()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Provide an async HTTP client with DB session override."""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def seed_roles(db_session: AsyncSession) -> dict[str, uuid.UUID]:
    """Seed the basic roles needed for tests."""
    role_map = {}
    for name in ["super_admin", "admin", "counsellor", "student"]:
        role = Role(id=uuid.uuid4(), name=name, is_system=True)
        db_session.add(role)
        role_map[name] = role.id
    await db_session.commit()
    return role_map


async def create_test_user(
    db: AsyncSession,
    role_id: uuid.UUID,
    email: str = "test@example.com",
    password: str = "TestPass123!",
    first_name: str = "Test",
    last_name: str = "User",
    is_active: bool = True,
) -> User:
    """Helper to create a user with a specific role."""
    user = User(
        id=uuid.uuid4(),
        email=email,
        password_hash=hash_password(password),
        first_name=first_name,
        last_name=last_name,
        is_active=is_active,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    user_role = UserRole(id=uuid.uuid4(), user_id=user.id, role_id=role_id)
    db.add(user_role)

    from sqlalchemy import select
    role_res = await db.execute(select(Role).where(Role.id == role_id))
    role_obj = role_res.scalar_one_or_none()
    if role_obj and role_obj.name == "student":
        profile = StudentProfile(id=uuid.uuid4(), user_id=user.id)
        db.add(profile)

    await db.commit()

    return user
