"""Lead/CRM request and response schemas."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

# ---------------------------------------------------------------------------
# Lead Schemas
# ---------------------------------------------------------------------------


class LeadCreatePublic(BaseModel):
    """Public contact/consultation form submission."""

    source: str = Field(max_length=50)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=20)
    message: str | None = Field(default=None, max_length=2000)
    preferred_country: str | None = Field(default=None, max_length=100)
    preferred_course: str | None = Field(default=None, max_length=200)
    preferred_intake: str | None = Field(default=None, max_length=50)
    current_qualification: str | None = Field(default=None, max_length=100)
    consent_given: bool = False
    consent_text: str | None = None
    # Honeypot — must be empty
    website: str | None = Field(default=None, max_length=255)
    # UTM tracking
    utm_source: str | None = Field(default=None, max_length=100)
    utm_medium: str | None = Field(default=None, max_length=100)
    utm_campaign: str | None = Field(default=None, max_length=100)


class LeadUpdateAdmin(BaseModel):
    """Admin/counsellor lead update."""

    status: str | None = Field(default=None, max_length=30)
    assigned_counsellor_id: UUID | None = None
    first_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    phone: str | None = Field(default=None, max_length=20)
    preferred_country: str | None = Field(default=None, max_length=100)
    preferred_course: str | None = Field(default=None, max_length=200)
    preferred_intake: str | None = Field(default=None, max_length=50)
    current_qualification: str | None = Field(default=None, max_length=100)


class LeadAssignRequest(BaseModel):
    """Assign a lead to a counsellor."""

    counsellor_id: UUID


class LeadConvertRequest(BaseModel):
    """Convert a lead into a registered student."""

    password: str = Field(min_length=8, max_length=128)


class LeadResponse(BaseModel):
    """Lead detail response."""

    id: UUID
    source: str
    first_name: str
    last_name: str | None = None
    email: str
    phone: str | None = None
    message: str | None = None
    preferred_country: str | None = None
    preferred_course: str | None = None
    preferred_intake: str | None = None
    current_qualification: str | None = None
    status: str
    assigned_counsellor_id: UUID | None = None
    converted_student_id: UUID | None = None
    conversion_date: datetime | None = None
    consent_given: bool = False
    utm_source: str | None = None
    utm_medium: str | None = None
    utm_campaign: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LeadListResponse(BaseModel):
    """Paginated lead list."""

    items: list[LeadResponse]
    total: int
    page: int
    page_size: int


# ---------------------------------------------------------------------------
# Follow-Up Schemas
# ---------------------------------------------------------------------------


class FollowUpCreate(BaseModel):
    follow_up_date: datetime
    follow_up_type: str | None = Field(default=None, max_length=30)
    notes: str | None = Field(default=None, max_length=2000)
    next_follow_up_date: datetime | None = None


class FollowUpUpdate(BaseModel):
    outcome: str | None = Field(default=None, max_length=50)
    notes: str | None = Field(default=None, max_length=2000)
    is_completed: bool | None = None
    next_follow_up_date: datetime | None = None


class FollowUpResponse(BaseModel):
    id: UUID
    lead_id: UUID
    follow_up_by: UUID | None = None
    follow_up_date: datetime
    follow_up_type: str | None = None
    notes: str | None = None
    outcome: str | None = None
    is_completed: bool = False
    completed_at: datetime | None = None
    next_follow_up_date: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
