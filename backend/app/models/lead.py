"""CRM lead, follow-up, and lead audit log models."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class Lead(UUIDMixin, TimestampMixin, Base):
    """CRM lead / enquiry from website or other channels."""

    __tablename__ = "leads"

    source: Mapped[str] = mapped_column(String(50), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str | None] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str | None] = mapped_column(String(20))
    message: Mapped[str | None] = mapped_column(Text)
    preferred_country: Mapped[str | None] = mapped_column(String(100))
    preferred_course: Mapped[str | None] = mapped_column(String(200))
    preferred_intake: Mapped[str | None] = mapped_column(String(50))
    current_qualification: Mapped[str | None] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="new", index=True)
    assigned_counsellor_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    converted_student_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("student_profiles.id", ondelete="SET NULL"),
        unique=True,
    )
    conversion_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Consent fields
    consent_given: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    consent_text: Mapped[str | None] = mapped_column(Text)
    consent_ip: Mapped[str | None] = mapped_column(String(45))
    consent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Tracking
    utm_source: Mapped[str | None] = mapped_column(String(100))
    utm_medium: Mapped[str | None] = mapped_column(String(100))
    utm_campaign: Mapped[str | None] = mapped_column(String(100))
    ip_address: Mapped[str | None] = mapped_column(String(45))
    honeypot_field: Mapped[str | None] = mapped_column(String(255))

    # Relationships
    follow_ups: Mapped[list[LeadFollowUp]] = relationship(
        back_populates="lead", lazy="raise", cascade="all, delete-orphan"
    )
    audit_logs: Mapped[list[LeadAuditLog]] = relationship(
        back_populates="lead", lazy="raise", cascade="all, delete-orphan"
    )


class LeadFollowUp(UUIDMixin, Base):
    """Follow-up interactions with a lead."""

    __tablename__ = "lead_follow_ups"

    lead_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False
    )
    follow_up_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    follow_up_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    follow_up_type: Mapped[str | None] = mapped_column(String(30))
    notes: Mapped[str | None] = mapped_column(Text)
    outcome: Mapped[str | None] = mapped_column(String(50))
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    next_follow_up_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    lead: Mapped[Lead] = relationship(back_populates="follow_ups", lazy="raise")


class LeadAuditLog(UUIDMixin, Base):
    """Audit trail for lead lifecycle events."""

    __tablename__ = "lead_audit_logs"

    lead_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    from_value: Mapped[str | None] = mapped_column(String(100))
    to_value: Mapped[str | None] = mapped_column(String(100))
    notes: Mapped[str | None] = mapped_column(Text)
    ip_address: Mapped[str | None] = mapped_column(String(45))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )

    lead: Mapped[Lead] = relationship(back_populates="audit_logs", lazy="raise")
