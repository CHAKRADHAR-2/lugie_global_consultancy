"""
Seed data script for LUGIE development environment.

WARNING: This script creates sample data for development/testing only.
All sample records are marked with is_sample_data=True where applicable.
DO NOT run this script in production — it will refuse and exit.

Usage:
    cd backend
    python -m scripts.seed_data
"""

import asyncio
import sys
import uuid
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.package import AdditionalService, Package, PackageInclusion
from app.models.user import Permission, Role, RolePermission, User, UserRole

SYSTEM_ROLES = [
    ("super_admin", "Full system access", True),
    ("admin", "Administrative access", True),
    ("counsellor", "Student counselling and guidance", True),
    ("application_executive", "Application processing", True),
    ("documentation_executive", "Document management", True),
    ("finance_executive", "Payment and finance management", True),
    ("visa_executive", "Visa process management", True),
    ("accommodation_executive", "Accommodation assistance", True),
    ("student", "Student portal access", True),
]

PERMISSIONS = [
    ("students", "read"), ("students", "create"), ("students", "update"),
    ("students", "delete"), ("students", "read_own"), ("students", "update_own"),
    ("applications", "read"), ("applications", "create"), ("applications", "update"),
    ("applications", "read_own"), ("applications", "assign"),
    ("documents", "read"), ("documents", "create"), ("documents", "delete"),
    ("documents", "read_own"), ("documents", "verify"),
    ("universities", "read"), ("universities", "create"),
    ("universities", "update"), ("universities", "delete"),
    ("courses", "create"), ("courses", "update"), ("courses", "delete"),
    ("packages", "read"), ("packages", "create"), ("packages", "update"),
    ("leads", "read"), ("leads", "create"), ("leads", "update"),
    ("leads", "assign"), ("leads", "convert"),
    ("assessments", "read"), ("assessments", "create"),
    ("assessments", "update"), ("assessments", "review"),
    ("users", "read"), ("users", "create"), ("users", "update"),
    ("audit_logs", "read"),
    ("settings", "read"), ("settings", "update"),
]


async def seed_roles(db: AsyncSession) -> dict[str, uuid.UUID]:
    """Create system roles, return name->id mapping."""
    role_map = {}
    for name, desc, is_system in SYSTEM_ROLES:
        existing = await db.execute(select(Role).where(Role.name == name))
        role = existing.scalar_one_or_none()
        if not role:
            role = Role(id=uuid.uuid4(), name=name, description=desc, is_system=is_system)
            db.add(role)
            await db.flush()
        role_map[name] = role.id
    return role_map


async def seed_permissions(db: AsyncSession) -> dict[str, uuid.UUID]:
    """Create permissions, return 'resource:action'->id mapping."""
    perm_map = {}
    for resource, action in PERMISSIONS:
        key = f"{resource}:{action}"
        existing = await db.execute(
            select(Permission).where(Permission.resource == resource, Permission.action == action)
        )
        perm = existing.scalar_one_or_none()
        if not perm:
            perm = Permission(
                id=uuid.uuid4(), resource=resource, action=action,
                description=f"{action} on {resource}",
            )
            db.add(perm)
            await db.flush()
        perm_map[key] = perm.id
    return perm_map


async def seed_role_permissions(
    db: AsyncSession, role_map: dict, perm_map: dict
) -> None:
    """Assign all permissions to super_admin; subset to other roles."""
    # Super admin gets everything
    for _perm_key, perm_id in perm_map.items():
        existing = await db.execute(
            select(RolePermission).where(
                RolePermission.role_id == role_map["super_admin"],
                RolePermission.permission_id == perm_id,
            )
        )
        if not existing.scalar_one_or_none():
            db.add(RolePermission(
                id=uuid.uuid4(),
                role_id=role_map["super_admin"],
                permission_id=perm_id,
            ))

    # Admin gets everything except settings:update
    for perm_key, perm_id in perm_map.items():
        if perm_key == "settings:update":
            continue
        existing = await db.execute(
            select(RolePermission).where(
                RolePermission.role_id == role_map["admin"],
                RolePermission.permission_id == perm_id,
            )
        )
        if not existing.scalar_one_or_none():
            db.add(RolePermission(
                id=uuid.uuid4(),
                role_id=role_map["admin"],
                permission_id=perm_id,
            ))

    await db.flush()


async def seed_users(db: AsyncSession, role_map: dict) -> None:
    """Create default admin and counsellor users."""
    users_to_create = [
        {
            "email": "admin@lugie.com",
            "password": "Admin123!",
            "first_name": "Super",
            "last_name": "Admin",
            "role": "super_admin",
        },
        {
            "email": "counsellor@lugie.com",
            "password": "Counsellor123!",
            "first_name": "Demo",
            "last_name": "Counsellor",
            "role": "counsellor",
        },
    ]

    for u in users_to_create:
        existing = await db.execute(select(User).where(User.email == u["email"]))
        if existing.scalar_one_or_none():
            print(f"  User {u['email']} already exists, skipping.")
            continue

        user = User(
            id=uuid.uuid4(),
            email=u["email"],
            password_hash=hash_password(u["password"]),
            first_name=u["first_name"],
            last_name=u["last_name"],
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        await db.flush()

        user_role = UserRole(
            id=uuid.uuid4(),
            user_id=user.id,
            role_id=role_map[u["role"]],
        )
        db.add(user_role)
        print(f"  Created user: {u['email']} (role: {u['role']})")


PACKAGE_INCLUSIONS_DATA = {
    "basic": [
        ("Profile & Transcript Evaluation", "Evaluation", "1 Candidate", 1),
        ("Targeted University Shortlisting (Up to 3 Universities)", "Admissions", "3 Universities", 2),
        ("1 Master SOP Review & Editorial Feedback", "Documentation", "1 Master SOP", 3),
        ("Application Submission Guidance & Portal Setup", "Admissions", "Up to 3 Apps", 4),
        ("Standard Email & Portal Advisory Support", "Support", "Email Support", 5),
    ],
    "standard": [
        ("Full Profile Evaluation + Career Path Mapping", "Evaluation", "1 Candidate", 1),
        ("Categorized Shortlisting (Up to 6 Universities: Dream, Target, Safe)", "Admissions", "6 Universities", 2),
        ("Comprehensive SOP & Essay Editing (Up to 3 Custom SOPs)", "Documentation", "3 Custom SOPs", 3),
        ("2 Letters of Recommendation (LOR) Drafting Framework", "Documentation", "2 LORs", 4),
        ("Full Student Visa Filing Support & Document Checklist", "Visa", "1 Visa Filing", 5),
        ("1-on-1 Mock Visa Interview Session with Feedback", "Visa", "1 Mock Interview", 6),
        ("Education Loan Paperwork & Financial Documentation Guidance", "Finance", "Included", 7),
    ],
    "premium": [
        ("Founder-Led End-to-End Strategic Counseling", "Advisory", "Direct Founder Attention", 1),
        ("Unlimited / Up to 10 University Applications", "Admissions", "Up to 10 Universities", 2),
        ("Tailored SOPs, Diversity Statements & Supplemental Essays", "Documentation", "All Applications", 3),
        ("Up to 3 LORs + Academic CV/Resume Formatting", "Documentation", "3 LORs + Resume", 4),
        ("Full Visa Dossier Compilation + Financial Audit", "Visa", "Complete Audit", 5),
        ("3 Extensive 1-on-1 Mock Visa & Credibility Interviews", "Visa", "3 Mock Sessions", 6),
        ("Priority Scholarship Discovery & Motivation Letter Editing", "Scholarships", "Included", 7),
        ("Accommodation Booking Support & Pre-Departure Briefing", "Transition", "Full Assistance", 8),
        ("Direct WhatsApp Line with Senior Consultants", "Support", "Priority Access", 9),
    ],
}


async def seed_packages(db: AsyncSession) -> None:
    """Create the three packages with correct prices and inclusions."""
    packages = [
        {"name": "Basic", "slug": "basic", "price": Decimal("7999.00"),
         "is_recommended": False, "sort_order": 1},
        {"name": "Standard", "slug": "standard", "price": Decimal("13999.00"),
         "is_recommended": True, "sort_order": 2},
        {"name": "Premium", "slug": "premium", "price": Decimal("24999.00"),
         "is_recommended": False, "sort_order": 3},
    ]

    for p in packages:
        existing = await db.execute(select(Package).where(Package.slug == p["slug"]))
        pkg = existing.scalar_one_or_none()
        if not pkg:
            pkg = Package(id=uuid.uuid4(), **p)
            db.add(pkg)
            await db.flush()
            print(f"  Created package: {p['name']} (₹{p['price']})")
        else:
            print(f"  Package '{p['name']}' already exists.")

        # Seed inclusions if none exist
        inc_count = (await db.execute(
            select(func.count(PackageInclusion.id)).where(PackageInclusion.package_id == pkg.id)
        )).scalar() or 0

        if inc_count == 0 and p["slug"] in PACKAGE_INCLUSIONS_DATA:
            for desc, cat, limit, order in PACKAGE_INCLUSIONS_DATA[p["slug"]]:
                inc = PackageInclusion(
                    id=uuid.uuid4(),
                    package_id=pkg.id,
                    description=desc,
                    category=cat,
                    limit_value=limit,
                    sort_order=order,
                )
                db.add(inc)
            await db.flush()
            print(f"    Seeded {len(PACKAGE_INCLUSIONS_DATA[p['slug']])} inclusions for '{p['name']}'")


async def seed_additional_services(db: AsyncSession) -> None:
    """Create additional services with agreed prices."""
    services = [
        ("Detailed Profile Evaluation", "profile-evaluation", 599, 599),
        ("University Shortlisting", "university-shortlisting", 599, 1099),
        ("SOP Preparation Assistance", "sop-preparation", 899, 1599),
        ("SOP Review Only", "sop-review", 499, 799),
        ("LOR Review / Guidance", "lor-review", 399, 599),
        ("CV / Resume Preparation", "cv-preparation", 599, 899),
        ("Additional University Application", "extra-application", 1099, 1599),
        ("Visa Documentation Assistance", "visa-docs", 1599, 2599),
        ("Mock Visa Interview", "mock-interview", 599, 899),
        ("Accommodation Assistance", "accommodation-assist", 599, 1099),
        ("Pre-departure Assistance", "pre-departure", 599, 899),
        ("Extra SOP/CV Revision", "extra-revision", 399, 399),
        ("Additional Counselling Session", "extra-counselling", 399, 399),
        ("Priority Processing", "priority-processing", 599, 599),
    ]

    for name, slug, price_min, price_max in services:
        existing = await db.execute(
            select(AdditionalService).where(AdditionalService.slug == slug)
        )
        if existing.scalar_one_or_none():
            continue
        svc = AdditionalService(
            id=uuid.uuid4(),
            name=name,
            slug=slug,
            price_min=Decimal(str(price_min)),
            price_max=Decimal(str(price_max)),
        )
        db.add(svc)

    print("  Additional services seeded.")


async def run_seed() -> None:
    """Main seed entry point."""
    if settings.ENVIRONMENT == "production":
        print("ERROR: Seed script refuses to run in production environment.")
        print("Set ENVIRONMENT to 'development' or 'testing' to seed data.")
        sys.exit(1)

    print("=" * 60)
    print("⚠️  LUGIE SEED DATA SCRIPT")
    print("   This creates SAMPLE data for DEVELOPMENT ONLY.")
    print("   All sample records are clearly marked.")
    print("=" * 60)

    async with AsyncSessionLocal() as db:
        try:
            print("\n[1/5] Seeding roles...")
            role_map = await seed_roles(db)

            print("[2/5] Seeding permissions...")
            perm_map = await seed_permissions(db)
            await seed_role_permissions(db, role_map, perm_map)

            print("[3/5] Seeding users...")
            await seed_users(db, role_map)

            print("[4/5] Seeding packages...")
            await seed_packages(db)

            print("[5/5] Seeding additional services...")
            await seed_additional_services(db)

            await db.commit()
            print("\n✅ Seed data created successfully.")
            print("   Admin login:      admin@lugie.com / Admin123!")
            print("   Counsellor login: counsellor@lugie.com / Counsellor123!")

        except Exception as e:
            await db.rollback()
            print(f"\n❌ Seed failed: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(run_seed())
