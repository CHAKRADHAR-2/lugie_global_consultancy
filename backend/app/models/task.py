"""Counsellor Task model for student onboarding and admissions action items."""

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


class CounsellorTask(UUIDMixin, TimestampMixin, Base):
    """Tasks assigned to counsellors for student dossier onboarding and advising."""

    __tablename__ = "counsellor_tasks"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False
    )
    counsellor_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str] = mapped_column(
        String(50), default="profile_evaluation"
    )  # profile_evaluation, document_review, shortlisting, sop_review, visa_guidance, call_followup
    priority: Mapped[str] = mapped_column(
        String(20), default="medium"
    )  # urgent, high, medium, low
    status: Mapped[str] = mapped_column(
        String(20), default="pending"
    )  # pending, in_progress, completed
    due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
