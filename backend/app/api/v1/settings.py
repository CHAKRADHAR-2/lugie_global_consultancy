"""Platform & Agency Settings API endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.exceptions import PermissionDeniedError
from app.dependencies import get_current_active_user

router = APIRouter(prefix="/settings", tags=["Platform Settings"])

ADMIN_ROLES = ["super_admin", "admin"]


class AgencySettings(BaseModel):
    agency_name: str = "Lugie Global Consultancy"
    tagline: str = "Dream Beyond Borders"
    support_email: str = "luckysomisetty17427@gmail.com"
    admissions_email: str = "machanisiri180505@gmail.com"
    phone: str = "+91 9392734699"
    emergency_whatsapp: str = "+91 8610506587"
    headquarters_address: str = "Bangalore & Hyderabad, India (Virtual counseling pan-India & globally)"
    consultation_fee: float = 0.0
    enable_public_registrations: bool = True
    enable_email_notifications: bool = True
    honest_pricing_policy: str = "Strict zero-negotiation policy published on all marketing assets."


class AgencySettingsUpdate(BaseModel):
    agency_name: str | None = None
    tagline: str | None = None
    support_email: str | None = None
    admissions_email: str | None = None
    phone: str | None = None
    emergency_whatsapp: str | None = None
    headquarters_address: str | None = None
    consultation_fee: float | None = None
    enable_public_registrations: bool | None = None
    enable_email_notifications: bool | None = None
    honest_pricing_policy: str | None = None


# Global in-memory / cache storage for operational settings
_SETTINGS = AgencySettings()


def _require_admin(user: dict) -> None:
    if not any(r in ADMIN_ROLES for r in user.get("roles", [])):
        raise PermissionDeniedError()


@router.get("", response_model=AgencySettings)
async def get_agency_settings():
    """Public / Authenticated: View agency information and public policies."""
    return _SETTINGS


@router.patch("", response_model=AgencySettings)
async def update_agency_settings(
    data: AgencySettingsUpdate,
    current_user: Annotated[dict, Depends(get_current_active_user)],
):
    """Admin: Update global agency settings and operational toggles."""
    _require_admin(current_user)

    global _SETTINGS
    update_data = data.model_dump(exclude_unset=True)
    _SETTINGS = _SETTINGS.model_copy(update=update_data)
    return _SETTINGS
