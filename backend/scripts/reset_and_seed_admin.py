"""Reset database user data and seed a clean new Super Admin account."""

import asyncio
import os
import uuid
from datetime import UTC, datetime

from sqlalchemy import select, text

from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.user import Role, User, UserRole

ADMIN_EMAIL = os.environ.get("LUGIE_ADMIN_EMAIL", "admin@lugie.com")
ADMIN_PASSWORD = os.environ.get("LUGIE_ADMIN_PASSWORD", "")
ADMIN_FIRST_NAME = "Super"
ADMIN_LAST_NAME = "Admin"
ADMIN_PHONE = "+91 9392734699"

TABLES_TO_EMPTY = [
    "chat_messages",
    "counsellor_tasks",
    "counsellor_recommendations",
    "student_opted_universities",
    "profile_assessments",
    "staff_assignments",
    "notifications",
    "audit_logs",
    "consent_records",
    "payments",
    "orders",
    "application_tasks",
    "application_status_history",
    "application_documents",
    "applications",
    "document_access_logs",
    "documents",
    "certifications",
    "projects",
    "work_experiences",
    "academic_records",
    "language_tests",
    "student_profiles",
    "lead_follow_ups",
    "lead_audit_logs",
    "leads",
    "user_roles",
    "users",
]


async def reset_database():
    print("Connecting to database...")
    async with AsyncSessionLocal() as session:
        # 1. Truncate user and activity tables
        print(f"Emptying {len(TABLES_TO_EMPTY)} tables...")
        truncate_sql = f"TRUNCATE TABLE {', '.join(TABLES_TO_EMPTY)} RESTART IDENTITY CASCADE;"
        await session.execute(text(truncate_sql))
        await session.commit()
        print("✓ All student, counsellor, and admin details emptied successfully.")

        # 2. Get super_admin and admin roles
        res_super = await session.execute(select(Role).where(Role.name == "super_admin"))
        super_admin_role = res_super.scalar_one_or_none()
        if not super_admin_role:
            raise RuntimeError("super_admin role not found!")

        res_admin = await session.execute(select(Role).where(Role.name == "admin"))
        admin_role = res_admin.scalar_one_or_none()

        # 3. Create fresh admin user
        if not ADMIN_PASSWORD:
            raise RuntimeError("Set LUGIE_ADMIN_PASSWORD environment variable before resetting admin.")
        admin_user = User(
            id=uuid.uuid4(),
            email=ADMIN_EMAIL,
            password_hash=hash_password(ADMIN_PASSWORD),
            first_name=ADMIN_FIRST_NAME,
            last_name=ADMIN_LAST_NAME,
            phone=ADMIN_PHONE,
            is_active=True,
            is_verified=True,
            is_phone_verified=True,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        )
        session.add(admin_user)
        await session.flush()

        # 4. Attach super_admin and admin roles
        session.add(
            UserRole(
                id=uuid.uuid4(),
                user_id=admin_user.id,
                role_id=super_admin_role.id,
            )
        )
        if admin_role:
            session.add(
                UserRole(
                    id=uuid.uuid4(),
                    user_id=admin_user.id,
                    role_id=admin_role.id,
                )
            )

        await session.commit()
        print(f"✓ Created new Super Admin user: {ADMIN_EMAIL} (ID: {admin_user.id})")

        # 5. Verify database state
        print("\n--- Current Database Counts ---")
        for tbl in ["users", "user_roles", "student_profiles", "counsellor_tasks", "chat_messages", "documents", "applications", "orders"]:
            count = (await session.execute(text(f"SELECT COUNT(*) FROM {tbl}"))).scalar()
            print(f"  {tbl}: {count}")

        # Also verify catalog tables are intact
        print("\n--- Core Catalog Tables (Preserved) ---")
        for tbl in ["roles", "permissions", "packages", "universities", "countries", "courses"]:
            count = (await session.execute(text(f"SELECT COUNT(*) FROM {tbl}"))).scalar()
            print(f"  {tbl}: {count}")

    # Optional: flush Redis cache/tokens
    try:
        import redis.asyncio as aioredis

        from app.config import settings
        r = aioredis.from_url(settings.REDIS_URL)
        await r.flushdb()
        await r.aclose()
        print("\n✓ Redis cache and session store flushed cleanly.")
    except Exception as e:
        print(f"Redis flush notice: {e}")

    print("\n==============================================")
    print("FRESH ADMIN CREDENTIALS:")
    print("  Portal URL: http://localhost:3000/login")
    print(f"  Email:      {ADMIN_EMAIL}")
    print("  Password:   <from LUGIE_ADMIN_PASSWORD env var>")
    print("  Role:       Super Admin / Admin")
    print("==============================================")


if __name__ == "__main__":
    asyncio.run(reset_database())
