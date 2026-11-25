"""Country, University, Course, and Intake models."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.application import Application


class Country(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "countries"
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    code: Mapped[str | None] = mapped_column(String(3), unique=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    visa_info: Mapped[dict | None] = mapped_column(JSONB)
    universities: Mapped[list[University]] = relationship(back_populates="country", lazy="raise", cascade="all, delete-orphan")


class University(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "universities"
    country_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("countries.id", ondelete="RESTRICT"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str | None] = mapped_column(String(50))
    city: Mapped[str | None] = mapped_column(String(100))
    website: Mapped[str | None] = mapped_column(String(500))
    ranking: Mapped[int | None] = mapped_column(Integer)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    last_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    verified_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    is_sample_data: Mapped[bool] = mapped_column(Boolean, default=False)

    country: Mapped[Country] = relationship(back_populates="universities", lazy="raise")
    courses: Mapped[list[Course]] = relationship(back_populates="university", lazy="raise", cascade="all, delete-orphan")


class Course(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "courses"
    university_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("universities.id", ondelete="CASCADE"), nullable=False)
    programme_name: Mapped[str] = mapped_column(String(255), nullable=False)
    degree_level: Mapped[str | None] = mapped_column(String(50))
    teaching_language: Mapped[str] = mapped_column(String(50), default="English")
    duration_months: Mapped[int | None] = mapped_column(Integer)
    tuition_fee: Mapped[Decimal | None] = mapped_column(Numeric)
    tuition_currency: Mapped[str | None] = mapped_column(String(3))
    semester_fee: Mapped[Decimal | None] = mapped_column(Numeric)
    living_cost_estimate: Mapped[Decimal | None] = mapped_column(Numeric)
    academic_requirements: Mapped[dict | None] = mapped_column(JSONB)
    english_requirements: Mapped[dict | None] = mapped_column(JSONB)
    required_documents: Mapped[dict | None] = mapped_column(JSONB)
    application_method: Mapped[str | None] = mapped_column(String(100))
    official_url: Mapped[str | None] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_sample_data: Mapped[bool] = mapped_column(Boolean, default=False)
    last_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    verified_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))

    university: Mapped[University] = relationship(back_populates="courses", lazy="raise")
    intakes: Mapped[list[Intake]] = relationship(back_populates="course", lazy="raise", cascade="all, delete-orphan")
    applications: Mapped[list[Application]] = relationship(back_populates="course", lazy="raise")


class Intake(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "intakes"
    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    intake_name: Mapped[str] = mapped_column(String(50), nullable=False)
    application_deadline: Mapped[date | None] = mapped_column(Date)
    start_date: Mapped[date | None] = mapped_column(Date)
    is_open: Mapped[bool] = mapped_column(Boolean, default=True)

    course: Mapped[Course] = relationship(back_populates="intakes", lazy="raise")
    applications: Mapped[list[Application]] = relationship(back_populates="intake", lazy="raise")
