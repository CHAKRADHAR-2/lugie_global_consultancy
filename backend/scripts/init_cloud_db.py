"""
Initialize and seed a fresh LUGIE database (local or cloud).

This script:
1. Creates all tables from SQLAlchemy models (Base.metadata.create_all)
2. Seeds system roles & permissions
3. Seeds standard packages (Basic, Standard, Premium) and inclusions
4. Seeds 12 global universities, 17 flagship courses, 68 intakes (2027-2028)
5. Seeds clean Super Admin account (set ADMIN_EMAIL / LUGIE_ADMIN_PASSWORD env vars)

Usage:
    cd backend
    python -m scripts.init_cloud_db
"""

import asyncio
import os
import uuid
from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy import select

from app.config import settings
from app.core.database import AsyncSessionLocal, engine
from app.core.security import hash_password
from app.models import Base
from app.models.package import Package, PackageInclusion
from app.models.university import Course, University, UniversityIntake
from app.models.user import Permission, Role, User, UserRole

ADMIN_EMAIL = os.environ.get("LUGIE_ADMIN_EMAIL", "admin@lugie.com")
ADMIN_PASSWORD = os.environ.get("LUGIE_ADMIN_PASSWORD", "")
ADMIN_FIRST_NAME = "Super"
ADMIN_LAST_NAME = "Admin"
ADMIN_PHONE = "+91 9392734699"

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

PACKAGES = [
    {
        "name": "Basic Package",
        "slug": "basic",
        "description": "Essential guidance for independent students applying to up to 3 universities.",
        "price_inr": Decimal("7999.00"),
        "max_universities": 3,
        "is_active": True,
        "features": [
            "University Shortlisting (up to 3)",
            "Application Review (up to 3 universities)",
            "Document Checklist & Template Access",
            "Email Support (48h response)",
            "Pre-departure Orientation",
        ],
    },
    {
        "name": "Standard Package",
        "slug": "standard",
        "description": "Comprehensive end-to-end guidance for students applying to up to 5 universities.",
        "price_inr": Decimal("13999.00"),
        "max_universities": 5,
        "is_active": True,
        "features": [
            "Everything in Basic, plus:",
            "University Shortlisting (up to 5)",
            "SOP & LOR Editing & Review",
            "Scholarship Guidance",
            "Visa Application Assistance & Mock Interview",
            "Dedicated Counsellor (24h response)",
            "Financial Documentation Guidance",
        ],
    },
    {
        "name": "Premium Package",
        "slug": "premium",
        "description": "White-glove admission service with unlimited applications, priority support, and accommodation guarantee.",
        "price_inr": Decimal("24999.00"),
        "max_universities": 8,
        "is_active": True,
        "features": [
            "Everything in Standard, plus:",
            "University Shortlisting (up to 8)",
            "Unlimited SOP & Essay Revisions",
            "Direct 1-on-1 Calls with Senior Counsellor",
            "Guaranteed Visa Interview Coaching (3 rounds)",
            "Accommodation Search & Booking Support",
            "Post-landing Assistance (SIM, Bank Account, Airport Pickup)",
            "Forex & Flight Booking Advisory",
        ],
    },
]

UNIVERSITIES_DATA = [
    {
        "name": "Massachusetts Institute of Technology",
        "country": "United States",
        "city": "Cambridge",
        "ranking": 1,
        "website": "https://www.mit.edu",
        "courses": [
            {"name": "M.S. in Computer Science and Engineering", "degree_level": "Master", "duration": "2 Years", "tuition": 59750, "currency": "USD"},
            {"name": "M.S. in Data, Economics, and Development Policy", "degree_level": "Master", "duration": "1 Year", "tuition": 55000, "currency": "USD"}
        ]
    },
    {
        "name": "Stanford University",
        "country": "United States",
        "city": "Stanford",
        "ranking": 3,
        "website": "https://www.stanford.edu",
        "courses": [
            {"name": "M.S. in Computer Science (AI Track)", "degree_level": "Master", "duration": "2 Years", "tuition": 62000, "currency": "USD"},
            {"name": "M.S. in Management Science and Engineering", "degree_level": "Master", "duration": "2 Years", "tuition": 60500, "currency": "USD"}
        ]
    },
    {
        "name": "University of Oxford",
        "country": "United Kingdom",
        "city": "Oxford",
        "ranking": 4,
        "website": "https://www.ox.ac.uk",
        "courses": [
            {"name": "M.Sc. in Advanced Computer Science", "degree_level": "Master", "duration": "1 Year", "tuition": 37500, "currency": "GBP"},
            {"name": "Master of Business Administration (MBA)", "degree_level": "Master", "duration": "1 Year", "tuition": 71400, "currency": "GBP"}
        ]
    },
    {
        "name": "University of Cambridge",
        "country": "United Kingdom",
        "city": "Cambridge",
        "ranking": 2,
        "website": "https://www.cam.ac.uk",
        "courses": [
            {"name": "M.Phil. in Machine Learning and Machine Intelligence", "degree_level": "Master", "duration": "1 Year", "tuition": 39000, "currency": "GBP"},
            {"name": "M.Phil. in Engineering", "degree_level": "Master", "duration": "1 Year", "tuition": 36000, "currency": "GBP"}
        ]
    },
    {
        "name": "University of Toronto",
        "country": "Canada",
        "city": "Toronto",
        "ranking": 21,
        "website": "https://www.utoronto.ca",
        "courses": [
            {"name": "M.Sc. in Applied Computing (MScAC)", "degree_level": "Master", "duration": "16 Months", "tuition": 45000, "currency": "CAD"},
            {"name": "Master of Engineering (Aerospace / Mechanical)", "degree_level": "Master", "duration": "1 Year", "tuition": 42000, "currency": "CAD"}
        ]
    },
    {
        "name": "University of Melbourne",
        "country": "Australia",
        "city": "Melbourne",
        "ranking": 14,
        "website": "https://www.unimelb.edu.au",
        "courses": [
            {"name": "Master of Information Technology", "degree_level": "Master", "duration": "2 Years", "tuition": 49000, "currency": "AUD"},
            {"name": "Master of Finance", "degree_level": "Master", "duration": "2 Years", "tuition": 51000, "currency": "AUD"}
        ]
    },
    {
        "name": "Technical University of Munich (TUM)",
        "country": "Germany",
        "city": "Munich",
        "ranking": 37,
        "website": "https://www.tum.de",
        "courses": [
            {"name": "M.Sc. in Informatics (Computer Science)", "degree_level": "Master", "duration": "2 Years", "tuition": 6000, "currency": "EUR"},
            {"name": "M.Sc. in Data Engineering and Analytics", "degree_level": "Master", "duration": "2 Years", "tuition": 6000, "currency": "EUR"}
        ]
    },
    {
        "name": "National University of Singapore (NUS)",
        "country": "Singapore",
        "city": "Singapore",
        "ranking": 8,
        "website": "https://www.nus.edu.sg",
        "courses": [
            {"name": "Master of Computing (Infocomm Security / AI)", "degree_level": "Master", "duration": "1.5 Years", "tuition": 54000, "currency": "SGD"},
            {"name": "M.Sc. in Business Analytics", "degree_level": "Master", "duration": "1 Year", "tuition": 58000, "currency": "SGD"}
        ]
    },
    {
        "name": "ETH Zurich",
        "country": "Switzerland",
        "city": "Zurich",
        "ranking": 7,
        "website": "https://ethz.ch",
        "courses": [
            {"name": "M.Sc. in Computer Science", "degree_level": "Master", "duration": "2 Years", "tuition": 1500, "currency": "CHF"}
        ]
    },
    {
        "name": "Trinity College Dublin",
        "country": "Ireland",
        "city": "Dublin",
        "ranking": 81,
        "website": "https://www.tcd.ie",
        "courses": [
            {"name": "M.Sc. in Computer Science (Data Science)", "degree_level": "Master", "duration": "1 Year", "tuition": 25800, "currency": "EUR"}
        ]
    },
    {
        "name": "Delft University of Technology (TU Delft)",
        "country": "Netherlands",
        "city": "Delft",
        "ranking": 47,
        "website": "https://www.tudelft.nl",
        "courses": [
            {"name": "M.Sc. in Aerospace Engineering", "degree_level": "Master", "duration": "2 Years", "tuition": 21500, "currency": "EUR"}
        ]
    },
    {
        "name": "University of Auckland",
        "country": "New Zealand",
        "city": "Auckland",
        "ranking": 68,
        "website": "https://www.auckland.ac.nz",
        "courses": [
            {"name": "Master of Engineering Studies in Software Engineering", "degree_level": "Master", "duration": "1 Year", "tuition": 48500, "currency": "NZD"}
        ]
    }
]

INTAKE_SEASONS = [
    ("Spring 2027 (Jan/Feb)", "2027-01-15", "2026-10-31"),
    ("Fall 2027 (Aug/Sep)", "2027-08-20", "2027-04-15"),
    ("Spring 2028 (Jan/Feb)", "2028-01-15", "2027-10-31"),
    ("Fall 2028 (Aug/Sep)", "2028-08-20", "2028-04-15"),
]


async def init_database():
    print(f"Connecting to database: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else '...'}")

    # 1. Create all schema tables
    print("Creating schema tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✓ Schema tables initialized.")

    async with AsyncSessionLocal() as session:
        # 2. Seed Roles & Permissions
        print("Checking roles and permissions...")
        role_map = {}
        for role_name, desc, is_sys in SYSTEM_ROLES:
            stmt = select(Role).where(Role.name == role_name)
            res = await session.execute(stmt)
            role = res.scalar_one_or_none()
            if not role:
                role = Role(id=uuid.uuid4(), name=role_name, description=desc, is_system=is_sys)
                session.add(role)
                await session.flush()
            role_map[role_name] = role

        for resource, action in PERMISSIONS:
            stmt = select(Permission).where(Permission.resource == resource, Permission.action == action)
            res = await session.execute(stmt)
            perm = res.scalar_one_or_none()
            if not perm:
                perm = Permission(id=uuid.uuid4(), resource=resource, action=action, description=f"{action} on {resource}")
                session.add(perm)

        await session.commit()
        print("✓ System roles & permissions seeded.")

        # 3. Seed Packages
        print("Checking packages...")
        for pkg_data in PACKAGES:
            stmt = select(Package).where(Package.slug == pkg_data["slug"])
            res = await session.execute(stmt)
            pkg = res.scalar_one_or_none()
            if not pkg:
                features = pkg_data.pop("features")
                pkg = Package(id=uuid.uuid4(), **pkg_data)
                session.add(pkg)
                await session.flush()
                for i, feat in enumerate(features, 1):
                    inc = PackageInclusion(
                        id=uuid.uuid4(),
                        package_id=pkg.id,
                        title=feat,
                        description=feat,
                        sort_order=i,
                        is_included=True
                    )
                    session.add(inc)

        await session.commit()
        print("✓ Advisory packages seeded.")

        # 4. Seed Universities, Courses & 2027-2028 Intakes
        print("Checking universities catalog...")
        for u_data in UNIVERSITIES_DATA:
            stmt = select(University).where(University.name == u_data["name"])
            res = await session.execute(stmt)
            uni = res.scalar_one_or_none()
            if not uni:
                uni = University(
                    id=uuid.uuid4(),
                    name=u_data["name"],
                    country=u_data["country"],
                    city=u_data["city"],
                    ranking=u_data["ranking"],
                    website=u_data["website"],
                    is_active=True
                )
                session.add(uni)
                await session.flush()

                for c_data in u_data["courses"]:
                    course = Course(
                        id=uuid.uuid4(),
                        university_id=uni.id,
                        name=c_data["name"],
                        degree_level=c_data["degree_level"],
                        duration=c_data["duration"],
                        tuition_fee=c_data["tuition"],
                        currency=c_data["currency"],
                        is_active=True
                    )
                    session.add(course)
                    await session.flush()

                for season, start_d, dead_d in INTAKE_SEASONS:
                    intake = UniversityIntake(
                        id=uuid.uuid4(),
                        university_id=uni.id,
                        season=season,
                        year=int(season.split()[1]),
                        application_deadline=datetime.strptime(dead_d, "%Y-%m-%d").date(),
                        term_start_date=datetime.strptime(start_d, "%Y-%m-%d").date(),
                        is_active=True
                    )
                    session.add(intake)

        await session.commit()
        print("✓ Global universities, courses, and 2027-2028 intakes seeded.")

        # 5. Seed Super Admin
        print("Checking Super Admin account...")
        stmt = select(User).where(User.email == ADMIN_EMAIL)
        res = await session.execute(stmt)
        admin_user = res.scalar_one_or_none()
        if not admin_user:
            if not ADMIN_PASSWORD:
                raise RuntimeError("Set LUGIE_ADMIN_PASSWORD environment variable before seeding admin.")
            admin_user = User(
                id=uuid.uuid4(),
                email=ADMIN_EMAIL,
                hashed_password=hash_password(ADMIN_PASSWORD),
                first_name=ADMIN_FIRST_NAME,
                last_name=ADMIN_LAST_NAME,
                phone=ADMIN_PHONE,
                is_active=True,
                is_verified=True,
                created_at=datetime.now(UTC),
                updated_at=datetime.now(UTC),
            )
            session.add(admin_user)
            await session.flush()

            # Assign roles
            for r_name in ["super_admin", "admin"]:
                if r_name in role_map:
                    session.add(UserRole(user_id=admin_user.id, role_id=role_map[r_name].id))

            await session.commit()
            print(f"✓ Super Admin seeded: {ADMIN_EMAIL}")
        else:
            print(f"✓ Super Admin already exists: {ADMIN_EMAIL}")

    print("\n==========================================")
    print("Database initialization complete! Ready for live operations.")
    print("==========================================")


if __name__ == "__main__":
    asyncio.run(init_database())
