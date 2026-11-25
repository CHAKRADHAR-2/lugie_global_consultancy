"""Seed universities, courses, and future intakes into database."""

import asyncio
import uuid
from decimal import Decimal

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.university import Country, Course, Intake, University

UNIVERSITIES_DATA = [
    # Germany
    {
        "country": "Germany",
        "name": "Technical University of Munich (TUM)",
        "city": "Munich",
        "type": "Public Research University",
        "ranking": 28,
        "website": "https://www.tum.de",
        "courses": [
            {
                "programme_name": "M.Sc. Informatics / Computer Science",
                "degree_level": "Master of Science",
                "duration_months": 24,
                "tuition_fee": Decimal("0.00"),
                "tuition_currency": "EUR",
                "semester_fee": Decimal("150.00"),
                "living_cost_estimate": Decimal("950.00"),
            },
            {
                "programme_name": "M.Sc. Data Engineering and Analytics",
                "degree_level": "Master of Science",
                "duration_months": 24,
                "tuition_fee": Decimal("0.00"),
                "tuition_currency": "EUR",
                "semester_fee": Decimal("150.00"),
                "living_cost_estimate": Decimal("950.00"),
            },
            {
                "programme_name": "M.Sc. Management and Technology (TUM-BWL)",
                "degree_level": "Master of Science",
                "duration_months": 24,
                "tuition_fee": Decimal("0.00"),
                "tuition_currency": "EUR",
                "semester_fee": Decimal("150.00"),
                "living_cost_estimate": Decimal("950.00"),
            },
        ],
    },
    {
        "country": "Germany",
        "name": "RWTH Aachen University",
        "city": "Aachen",
        "type": "Public Technical University",
        "ranking": 99,
        "website": "https://www.rwth-aachen.de",
        "courses": [
            {
                "programme_name": "M.Sc. Automotive Engineering",
                "degree_level": "Master of Science",
                "duration_months": 24,
                "tuition_fee": Decimal("0.00"),
                "tuition_currency": "EUR",
                "semester_fee": Decimal("320.00"),
                "living_cost_estimate": Decimal("850.00"),
            },
            {
                "programme_name": "M.Sc. Software Systems Engineering",
                "degree_level": "Master of Science",
                "duration_months": 24,
                "tuition_fee": Decimal("0.00"),
                "tuition_currency": "EUR",
                "semester_fee": Decimal("320.00"),
                "living_cost_estimate": Decimal("850.00"),
            },
        ],
    },
    {
        "country": "Germany",
        "name": "Heidelberg University",
        "city": "Heidelberg",
        "type": "Public Research University",
        "ranking": 64,
        "website": "https://www.uni-heidelberg.de",
        "courses": [
            {
                "programme_name": "M.Sc. Scientific Computing",
                "degree_level": "Master of Science",
                "duration_months": 24,
                "tuition_fee": Decimal("1500.00"),
                "tuition_currency": "EUR",
                "semester_fee": Decimal("175.00"),
                "living_cost_estimate": Decimal("880.00"),
            },
        ],
    },
    # United Kingdom
    {
        "country": "United Kingdom",
        "name": "University of Oxford",
        "city": "Oxford",
        "type": "Collegiate Research University",
        "ranking": 1,
        "website": "https://www.ox.ac.uk",
        "courses": [
            {
                "programme_name": "M.Sc. Advanced Computer Science",
                "degree_level": "Master of Science",
                "duration_months": 12,
                "tuition_fee": Decimal("36000.00"),
                "tuition_currency": "GBP",
                "semester_fee": Decimal("0.00"),
                "living_cost_estimate": Decimal("1400.00"),
            },
            {
                "programme_name": "Master of Business Administration (MBA)",
                "degree_level": "MBA",
                "duration_months": 12,
                "tuition_fee": Decimal("71000.00"),
                "tuition_currency": "GBP",
                "semester_fee": Decimal("0.00"),
                "living_cost_estimate": Decimal("1600.00"),
            },
        ],
    },
    {
        "country": "United Kingdom",
        "name": "Imperial College London",
        "city": "London",
        "type": "Public Research University",
        "ranking": 6,
        "website": "https://www.imperial.ac.uk",
        "courses": [
            {
                "programme_name": "M.Sc. Computing (Artificial Intelligence and Machine Learning)",
                "degree_level": "Master of Science",
                "duration_months": 12,
                "tuition_fee": Decimal("39500.00"),
                "tuition_currency": "GBP",
                "semester_fee": Decimal("0.00"),
                "living_cost_estimate": Decimal("1600.00"),
            },
        ],
    },
    {
        "country": "United Kingdom",
        "name": "University of Manchester",
        "city": "Manchester",
        "type": "Public Research University",
        "ranking": 32,
        "website": "https://www.manchester.ac.uk",
        "courses": [
            {
                "programme_name": "M.Sc. Data Science (Computer Science Data Analytics)",
                "degree_level": "Master of Science",
                "duration_months": 12,
                "tuition_fee": Decimal("31000.00"),
                "tuition_currency": "GBP",
                "semester_fee": Decimal("0.00"),
                "living_cost_estimate": Decimal("1100.00"),
            },
        ],
    },
    # United States
    {
        "country": "United States",
        "name": "Northeastern University",
        "city": "Boston",
        "type": "Private Research University",
        "ranking": 53,
        "website": "https://www.northeastern.edu",
        "courses": [
            {
                "programme_name": "M.S. in Computer Science (Khoury)",
                "degree_level": "Master of Science",
                "duration_months": 24,
                "tuition_fee": Decimal("54000.00"),
                "tuition_currency": "USD",
                "semester_fee": Decimal("250.00"),
                "living_cost_estimate": Decimal("1800.00"),
            },
            {
                "programme_name": "M.S. in Information Systems",
                "degree_level": "Master of Science",
                "duration_months": 24,
                "tuition_fee": Decimal("52000.00"),
                "tuition_currency": "USD",
                "semester_fee": Decimal("250.00"),
                "living_cost_estimate": Decimal("1800.00"),
            },
        ],
    },
    {
        "country": "United States",
        "name": "Stanford University",
        "city": "Stanford",
        "type": "Private Research University",
        "ranking": 3,
        "website": "https://www.stanford.edu",
        "courses": [
            {
                "programme_name": "M.S. in Computer Science (AI Track)",
                "degree_level": "Master of Science",
                "duration_months": 24,
                "tuition_fee": Decimal("58000.00"),
                "tuition_currency": "USD",
                "semester_fee": Decimal("300.00"),
                "living_cost_estimate": Decimal("2200.00"),
            },
        ],
    },
    # Canada
    {
        "country": "Canada",
        "name": "University of Toronto",
        "city": "Toronto",
        "type": "Public Research University",
        "ranking": 21,
        "website": "https://www.utoronto.ca",
        "courses": [
            {
                "programme_name": "Master of Science in Applied Computing (MScAC)",
                "degree_level": "Master of Science",
                "duration_months": 16,
                "tuition_fee": Decimal("48000.00"),
                "tuition_currency": "CAD",
                "semester_fee": Decimal("400.00"),
                "living_cost_estimate": Decimal("1500.00"),
            },
        ],
    },
    {
        "country": "Canada",
        "name": "University of British Columbia (UBC)",
        "city": "Vancouver",
        "type": "Public Research University",
        "ranking": 34,
        "website": "https://www.ubc.ca",
        "courses": [
            {
                "programme_name": "Master of Data Science (MDS)",
                "degree_level": "Master of Data Science",
                "duration_months": 10,
                "tuition_fee": Decimal("47000.00"),
                "tuition_currency": "CAD",
                "semester_fee": Decimal("350.00"),
                "living_cost_estimate": Decimal("1600.00"),
            },
        ],
    },
    # Australia
    {
        "country": "Australia",
        "name": "University of Melbourne",
        "city": "Melbourne",
        "type": "Public Research University",
        "ranking": 14,
        "website": "https://www.unimelb.edu.au",
        "courses": [
            {
                "programme_name": "Master of Information Technology (Computing)",
                "degree_level": "Master",
                "duration_months": 24,
                "tuition_fee": Decimal("49500.00"),
                "tuition_currency": "AUD",
                "semester_fee": Decimal("200.00"),
                "living_cost_estimate": Decimal("1800.00"),
            },
        ],
    },
    # Ireland
    {
        "country": "Ireland",
        "name": "Trinity College Dublin",
        "city": "Dublin",
        "type": "Public Collegiate University",
        "ranking": 81,
        "website": "https://www.tcd.ie",
        "courses": [
            {
                "programme_name": "M.Sc. Computer Science (Data Science)",
                "degree_level": "Master of Science",
                "duration_months": 12,
                "tuition_fee": Decimal("25000.00"),
                "tuition_currency": "EUR",
                "semester_fee": Decimal("150.00"),
                "living_cost_estimate": Decimal("1300.00"),
            },
        ],
    },
]

INTAKES_TO_SEED = ["Spring 2027", "Fall 2027", "Spring 2028", "Fall 2028"]


async def seed():
    async with AsyncSessionLocal() as session:
        # Get countries
        countries_res = await session.execute(select(Country))
        country_map = {c.name: c.id for c in countries_res.scalars().all()}

        total_unis = 0
        total_courses = 0
        total_intakes = 0

        for udata in UNIVERSITIES_DATA:
            cid = country_map.get(udata["country"])
            if not cid:
                new_country = Country(id=uuid.uuid4(), name=udata["country"], is_active=True)
                session.add(new_country)
                await session.flush()
                cid = new_country.id
                country_map[udata["country"]] = cid

            uni = University(
                id=uuid.uuid4(),
                country_id=cid,
                name=udata["name"],
                city=udata["city"],
                type=udata["type"],
                ranking=udata["ranking"],
                website=udata["website"],
                is_active=True,
                is_verified=True,
            )
            session.add(uni)
            await session.flush()
            total_unis += 1

            for cdata in udata["courses"]:
                course = Course(
                    id=uuid.uuid4(),
                    university_id=uni.id,
                    programme_name=cdata["programme_name"],
                    degree_level=cdata["degree_level"],
                    teaching_language="English",
                    duration_months=cdata["duration_months"],
                    tuition_fee=cdata["tuition_fee"],
                    tuition_currency=cdata["tuition_currency"],
                    semester_fee=cdata["semester_fee"],
                    living_cost_estimate=cdata["living_cost_estimate"],
                    is_active=True,
                )
                session.add(course)
                await session.flush()
                total_courses += 1

                for iname in INTAKES_TO_SEED:
                    intake = Intake(
                        id=uuid.uuid4(),
                        course_id=course.id,
                        intake_name=iname,
                        is_open=True,
                    )
                    session.add(intake)
                    total_intakes += 1

        await session.commit()
        print(f"✓ Seeded {total_unis} universities, {total_courses} courses, and {total_intakes} intakes.")


if __name__ == "__main__":
    asyncio.run(seed())
