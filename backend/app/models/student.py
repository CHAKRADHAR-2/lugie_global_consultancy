"""Student profile, academic records, and language tests."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.application import Application
    from app.models.assessment import ProfileAssessment
    from app.models.audit import ConsentRecord
    from app.models.document import Document
    from app.models.experience import Certification, Project, WorkExperience
    from app.models.user import User


class StudentProfile(UUIDMixin, TimestampMixin, Base):
    """Extended student information linked 1:1 to a User."""

    __tablename__ = "student_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    date_of_birth: Mapped[date | None] = mapped_column(Date)
    nationality: Mapped[str | None] = mapped_column(String(100))
    current_city: Mapped[str | None] = mapped_column(String(100))
    current_country: Mapped[str | None] = mapped_column(String(100))
    passport_number: Mapped[str | None] = mapped_column(String(50))
    passport_expiry: Mapped[date | None] = mapped_column(Date)
    preferred_countries: Mapped[dict | None] = mapped_column(JSONB)
    preferred_courses: Mapped[dict | None] = mapped_column(JSONB)
    budget_min: Mapped[Decimal | None] = mapped_column(Numeric)
    budget_max: Mapped[Decimal | None] = mapped_column(Numeric)
    budget_currency: Mapped[str] = mapped_column(String(3), default="INR")
    preferred_intake: Mapped[str | None] = mapped_column(String(20))
    funding_preference: Mapped[str | None] = mapped_column(String(50))
    profile_completion: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    user: Mapped[User] = relationship(back_populates="student_profile", lazy="raise")
    academic_records: Mapped[list[AcademicRecord]] = relationship(
        back_populates="student", lazy="raise", cascade="all, delete-orphan"
    )
    language_tests: Mapped[list[LanguageTest]] = relationship(
        back_populates="student", lazy="raise", cascade="all, delete-orphan"
    )
    work_experiences: Mapped[list[WorkExperience]] = relationship(
        back_populates="student", lazy="raise", cascade="all, delete-orphan"
    )
    projects: Mapped[list[Project]] = relationship(
        back_populates="student", lazy="raise", cascade="all, delete-orphan"
    )
    certifications: Mapped[list[Certification]] = relationship(
        back_populates="student", lazy="raise", cascade="all, delete-orphan"
    )
    documents: Mapped[list[Document]] = relationship(
        back_populates="student", lazy="raise", cascade="all, delete-orphan"
    )
    applications: Mapped[list[Application]] = relationship(
        back_populates="student", lazy="raise", cascade="all, delete-orphan"
    )
    consent_records: Mapped[list[ConsentRecord]] = relationship(
        back_populates="student", lazy="raise", cascade="all, delete-orphan"
    )
    assessments: Mapped[list[ProfileAssessment]] = relationship(
        back_populates="student", lazy="raise", cascade="all, delete-orphan"
    )


class AcademicRecord(UUIDMixin, Base):
    """Student academic qualifications."""

    __tablename__ = "academic_records"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False
    )
    qualification: Mapped[str] = mapped_column(String(100), nullable=False)
    institution: Mapped[str] = mapped_column(String(255), nullable=False)
    degree: Mapped[str | None] = mapped_column(String(100))
    specialisation: Mapped[str | None] = mapped_column(String(200))
    start_date: Mapped[date | None] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date)
    cgpa: Mapped[Decimal | None] = mapped_column(Numeric(4, 2))
    percentage: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    scale: Mapped[Decimal | None] = mapped_column(Numeric(4, 2))
    backlogs: Mapped[int] = mapped_column(Integer, default=0)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    student: Mapped[StudentProfile] = relationship(
        back_populates="academic_records", lazy="raise"
    )


class LanguageTest(UUIDMixin, Base):
    """Language test scores (IELTS, TOEFL, PTE, etc.)."""

    __tablename__ = "language_tests"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False
    )
    test_type: Mapped[str] = mapped_column(String(20), nullable=False)
    overall_score: Mapped[Decimal | None] = mapped_column(Numeric(4, 1))
    listening: Mapped[Decimal | None] = mapped_column(Numeric(4, 1))
    reading: Mapped[Decimal | None] = mapped_column(Numeric(4, 1))
    writing: Mapped[Decimal | None] = mapped_column(Numeric(4, 1))
    speaking: Mapped[Decimal | None] = mapped_column(Numeric(4, 1))
    test_date: Mapped[date | None] = mapped_column(Date)
    expiry_date: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    student: Mapped[StudentProfile] = relationship(
        back_populates="language_tests", lazy="raise"
    )
