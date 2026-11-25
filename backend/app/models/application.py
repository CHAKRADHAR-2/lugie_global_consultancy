"""Application, status history, application documents, and tasks."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.document import Document
    from app.models.student import StudentProfile
    from app.models.university import Course, Intake


class Application(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "applications"
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="RESTRICT"), nullable=False)
    intake_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("intakes.id", ondelete="SET NULL"))
    assigned_counsellor_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    status: Mapped[str] = mapped_column(String(50), nullable=False, index=True, default="draft")
    application_reference: Mapped[str | None] = mapped_column(String(100))
    submission_date: Mapped[date | None] = mapped_column(Date)
    deadline: Mapped[date | None] = mapped_column(Date)
    notes: Mapped[str | None] = mapped_column(Text)

    __table_args__ = (
        UniqueConstraint("student_id", "course_id", "intake_id", name="uq_application_student_course_intake"),
    )

    student: Mapped[StudentProfile] = relationship(back_populates="applications", lazy="raise")
    course: Mapped[Course] = relationship(back_populates="applications", lazy="raise")
    intake: Mapped[Intake | None] = relationship(back_populates="applications", lazy="raise")
    status_history: Mapped[list[ApplicationStatusHistory]] = relationship(back_populates="application", lazy="raise", cascade="all, delete-orphan")
    application_documents: Mapped[list[ApplicationDocument]] = relationship(back_populates="application", lazy="raise", cascade="all, delete-orphan")
    tasks: Mapped[list[ApplicationTask]] = relationship(back_populates="application", lazy="raise", cascade="all, delete-orphan")


class ApplicationStatusHistory(UUIDMixin, Base):
    __tablename__ = "application_status_history"
    application_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    from_status: Mapped[str | None] = mapped_column(String(50))
    to_status: Mapped[str] = mapped_column(String(50), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
    changed_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    application: Mapped[Application] = relationship(back_populates="status_history", lazy="raise")


class ApplicationDocument(UUIDMixin, Base):
    __tablename__ = "application_documents"
    application_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    document_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    attached_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    notes: Mapped[str | None] = mapped_column(String(255))
    attached_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (UniqueConstraint("application_id", "document_id", name="uq_application_document"),)

    application: Mapped[Application] = relationship(back_populates="application_documents", lazy="raise")
    document: Mapped[Document] = relationship(lazy="raise")


class ApplicationTask(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "application_tasks"
    application_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    due_date: Mapped[date | None] = mapped_column(Date)
    priority: Mapped[str] = mapped_column(String(20), default="medium")
    status: Mapped[str] = mapped_column(String(20), default="pending")
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    application: Mapped[Application] = relationship(back_populates="tasks", lazy="raise")
