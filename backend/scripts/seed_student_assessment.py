import asyncio
import sys
import uuid
from datetime import UTC, datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.assessment import ProfileAssessment
from app.models.student import StudentProfile
from app.models.user import User


async def seed_assessment():
    async with AsyncSessionLocal() as db:
        u_res = await db.execute(select(User).where(User.email == "student@lugie.com"))
        user = u_res.scalar_one_or_none()
        if not user:
            print("Student user not found")
            return

        p_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
        profile = p_res.scalar_one_or_none()
        if not profile:
            print("Student profile not found")
            return

        # Check existing assessment
        a_res = await db.execute(select(ProfileAssessment).where(ProfileAssessment.student_id == profile.id))
        assessment = a_res.scalar_one_or_none()
        if not assessment:
            assessment = ProfileAssessment(
                id=uuid.uuid4(),
                student_id=profile.id,
                assessment_type="comprehensive",
                status="approved",
                is_reviewed=True,
                reviewed_at=datetime.now(UTC),
                eligibility_notes=(
                    "Official Counsellor Assessment (Approved):\n"
                    "Candidate shows high competitive capacity for European (Germany/UK) and US STEM admissions. "
                    "Current 8.4 CGPA in Computer Science with 314 GRE (166 Quant) satisfies direct university cutoff criteria. "
                    "Recommended Strategy: Target 5 university applications (2 Dream, 2 Target, 1 Safe) with priority SOP customization."
                ),
                strengths={
                    "points": [
                        "Consistent 8.4 CGPA across undergraduate coursework with zero active backlogs.",
                        "GRE 314 with 166 Quant clears top STEM eligibility across German TU9 and US universities.",
                        "IELTS 7.5 exempts candidate from pre-sessional English courses at Russell Group institutions.",
                        "Direct hands-on project experience in distributed databases and cloud engineering."
                    ]
                },
                weaknesses={
                    "points": [
                        "SOP draft requires research alignment with German university laboratory curriculum.",
                        "Target priority submission before Dec 15 to secure departmental fellowship consideration.",
                        "Ensure all 3 letters of recommendation are on institutional letterheads."
                    ]
                },
                recommended_countries=["Germany", "United Kingdom", "United States"],
                recommended_courses=["M.Sc. Informatics", "M.Sc. Data Science", "MS in Computer Science"],
            )
            db.add(assessment)
            await db.commit()
            print("Approved counsellor assessment seeded for student!")
        else:
            print("Assessment already exists")

if __name__ == "__main__":
    asyncio.run(seed_assessment())
