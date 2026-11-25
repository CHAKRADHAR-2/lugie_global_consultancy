"""Profile assessment model."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.student import StudentProfile


class ProfileAssessment(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "profile_assessments"
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    assessed_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    assessment_type: Mapped[str] = mapped_column(String(20), default="manual")
    strengths: Mapped[dict | None] = mapped_column(JSONB)
    weaknesses: Mapped[dict | None] = mapped_column(JSONB)
    missing_requirements: Mapped[dict | None] = mapped_column(JSONB)
    recommended_countries: Mapped[dict | None] = mapped_column(JSONB)
    recommended_courses: Mapped[dict | None] = mapped_column(JSONB)
    eligibility_notes: Mapped[str | None] = mapped_column(Text)
    improvement_suggestions: Mapped[dict | None] = mapped_column(JSONB)
    status: Mapped[str] = mapped_column(String(20), default="draft")
    is_reviewed: Mapped[bool] = mapped_column(Boolean, default=False)
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    student: Mapped[StudentProfile] = relationship(back_populates="assessments", lazy="raise")
