"""Package, package inclusions, and additional services."""

from __future__ import annotations

import uuid
from decimal import Decimal

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class Package(UUIDMixin, TimestampMixin, Base):
    """Service package (Basic, Standard, Premium)."""

    __tablename__ = "packages"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    is_recommended: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int | None] = mapped_column(Integer)

    inclusions: Mapped[list[PackageInclusion]] = relationship(
        back_populates="package", lazy="raise", cascade="all, delete-orphan"
    )


class PackageInclusion(UUIDMixin, Base):
    """Individual inclusion within a package."""

    __tablename__ = "package_inclusions"

    package_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("packages.id", ondelete="CASCADE"), nullable=False
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str | None] = mapped_column(String(50))
    limit_value: Mapped[str | None] = mapped_column(String(50))
    sort_order: Mapped[int | None] = mapped_column(Integer)

    package: Mapped[Package] = relationship(back_populates="inclusions", lazy="raise")


class AdditionalService(UUIDMixin, TimestampMixin, Base):
    """Additional paid services outside packages."""

    __tablename__ = "additional_services"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True)
    price_min: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    price_max: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    description: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int | None] = mapped_column(Integer)
