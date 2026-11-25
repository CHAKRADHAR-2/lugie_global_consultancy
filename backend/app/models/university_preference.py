"""Student opted universities and counsellor recommendation models."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    pass


class StudentOptedUniversity(UUIDMixin, TimestampMixin, Base):
    """Universities nominated and opted directly by the student for counsellor review."""

    __tablename__ = "student_opted_universities"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False
    )
    university_name: Mapped[str] = mapped_column(String(255), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    course_name: Mapped[str] = mapped_column(String(255), nullable=False)
    intake: Mapped[str] = mapped_column(String(50), nullable=False)
    tier: Mapped[str] = mapped_column(String(20), default="target")  # dream, target, safe
    student_notes: Mapped[str | None] = mapped_column(Text)

    status: Mapped[str] = mapped_column(
        String(50), default="under_counsellor_review"
    )  # under_counsellor_review, reviewed, approved, alternative_suggested

    counsellor_opinion: Mapped[str | None] = mapped_column(Text)
    counsellor_verdict: Mapped[str | None] = mapped_column(String(100))  # strong_match, ambitious, high_risk
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class CounsellorRecommendation(UUIDMixin, TimestampMixin, Base):
    """Universities strategically recommended by the counsellor tailored to student's profile."""

    __tablename__ = "counsellor_recommendations"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False
    )
    counsellor_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    university_name: Mapped[str] = mapped_column(String(255), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    course_name: Mapped[str] = mapped_column(String(255), nullable=False)
    intake: Mapped[str] = mapped_column(String(50), nullable=False)
    tier: Mapped[str] = mapped_column(String(20), default="target")  # dream, target, safe
    match_reason: Mapped[str | None] = mapped_column(Text)
    tuition_fee_range: Mapped[str | None] = mapped_column(String(100))
    admission_chance: Mapped[str | None] = mapped_column(String(50))  # e.g. "85% High", "65% Moderate"
    status: Mapped[str] = mapped_column(
        String(50), default="recommended"
    )  # recommended, shortlisted, applied, declined
