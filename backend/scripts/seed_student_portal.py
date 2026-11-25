import asyncio
import sys
import uuid
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.package import Package
from app.models.payment import Order, Payment
from app.models.student import StudentProfile
from app.models.user import Role, User, UserRole


async def seed_student():
    async with AsyncSessionLocal() as db:
        # Check student role
        role_res = await db.execute(select(Role).where(Role.name == "student"))
        student_role = role_res.scalar_one_or_none()
        if not student_role:
            student_role = Role(id=uuid.uuid4(), name="student", is_system=True)
            db.add(student_role)
            await db.flush()

        # Check or create student user
        u_res = await db.execute(select(User).where(User.email == "student@lugie.com"))
        user = u_res.scalar_one_or_none()
        if not user:
            user = User(
                id=uuid.uuid4(),
                email="student@lugie.com",
                password_hash=hash_password("Student123!"),
                first_name="Lucky",
                last_name="Somisetty",
                is_active=True,
                is_verified=True,
                is_phone_verified=True,
            )
            db.add(user)
            await db.flush()

            ur = UserRole(id=uuid.uuid4(), user_id=user.id, role_id=student_role.id)
            db.add(ur)
            print("Created student user: student@lugie.com")
        else:
            user.password_hash = hash_password("Student123!")
            user.is_verified = True
            user.is_phone_verified = True
            print("Updated student user: student@lugie.com")

        # Check or create student profile
        p_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
        profile = p_res.scalar_one_or_none()
        if not profile:
            profile = StudentProfile(
                id=uuid.uuid4(),
                user_id=user.id,
                nationality="Indian",
                current_city="Hyderabad",
                current_country="India",
                passport_number="Z9876543",
                preferred_intake="Fall 2025",
                budget_min=Decimal("2000000"),
                budget_max=Decimal("3500000"),
                funding_preference="Self-funded + Education Loan",
                profile_completion=88,
            )
            db.add(profile)
            await db.flush()
            print("Created student profile")
        else:
            profile.profile_completion = 88
            profile.preferred_intake = "Fall 2025"

        # Check basic package
        pkg_res = await db.execute(select(Package).where(Package.slug == "basic"))
        basic_pkg = pkg_res.scalar_one_or_none()

        # Check or create existing Basic Package paid order (₹7,999) to verify differential upgrade
        ord_res = await db.execute(
            select(Order).where(Order.student_id == profile.id, Order.status == "paid")
        )
        existing_order = ord_res.scalar_one_or_none()
        if not existing_order and basic_pkg:
            order = Order(
                id=uuid.uuid4(),
                student_id=profile.id,
                package_id=basic_pkg.id,
                total_amount=Decimal("7999.00"),
                discount_amount=Decimal("0.00"),
                status="paid",
            )
            db.add(order)
            await db.flush()

            payment = Payment(
                id=uuid.uuid4(),
                order_id=order.id,
                amount=Decimal("7999.00"),
                currency="INR",
                payment_method="upi",
                gateway_reference="LUGIE-PAY-RZP-INIT7999",
                status="confirmed",
            )
            db.add(payment)
            print("Enrolled student into Basic Package (₹7,999) for upgrade verification!")

        await db.commit()
        print("Student portal seed completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_student())
