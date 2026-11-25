"""Lead/CRM service layer."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import LeadStatus
from app.core.exceptions import BadRequestError, DuplicateError, NotFoundError
from app.core.security import hash_password
from app.models.lead import Lead, LeadAuditLog, LeadFollowUp
from app.models.student import StudentProfile
from app.models.user import Role, User, UserRole
from app.schemas.lead import (
    FollowUpCreate,
    FollowUpUpdate,
    LeadAssignRequest,
    LeadConvertRequest,
    LeadCreatePublic,
    LeadUpdateAdmin,
)
from app.utils.sanitise import sanitise_email, sanitise_string

# ---------------------------------------------------------------------------
# Create Lead (public)
# ---------------------------------------------------------------------------


async def create_lead_from_form(
    db: AsyncSession, data: LeadCreatePublic, ip_address: str | None = None
) -> Lead:
    """Create a lead from a public form submission."""

    # Honeypot check
    if data.website:
        raise BadRequestError("Submission rejected.")

    # Consent required
    if not data.consent_given:
        raise BadRequestError("Consent is required to submit this form.")

    # Sanitise inputs
    email = sanitise_email(data.email)
    first_name = sanitise_string(data.first_name) or data.first_name

    # Duplicate detection: same email + same source within 24 hours
    cutoff = datetime.now(UTC).replace(hour=0, minute=0, second=0)
    existing = await db.execute(
        select(Lead).where(
            Lead.email == email,
            Lead.source == data.source,
            Lead.created_at >= cutoff,
        )
    )
    if existing.scalar_one_or_none():
        raise DuplicateError("You have already submitted an enquiry today. We will contact you soon.")

    lead = Lead(
        id=uuid.uuid4(),
        source=data.source,
        first_name=first_name,
        last_name=sanitise_string(data.last_name),
        email=email,
        phone=data.phone,
        message=sanitise_string(data.message),
        preferred_country=sanitise_string(data.preferred_country),
        preferred_course=sanitise_string(data.preferred_course),
        preferred_intake=data.preferred_intake,
        current_qualification=sanitise_string(data.current_qualification),
        status=LeadStatus.NEW,
        consent_given=True,
        consent_text=data.consent_text,
        consent_ip=ip_address,
        consent_at=datetime.now(UTC),
        utm_source=data.utm_source,
        utm_medium=data.utm_medium,
        utm_campaign=data.utm_campaign,
        ip_address=ip_address,
        honeypot_field=None,
    )
    db.add(lead)
    await db.flush()

    # Audit log
    db.add(LeadAuditLog(
        id=uuid.uuid4(), lead_id=lead.id, action="created",
        to_value=LeadStatus.NEW, ip_address=ip_address,
    ))
    await db.flush()

    # Dispatch real-time email notification to advisors and confirmation to applicant
    import asyncio

    from app.services.email_service import (
        send_lead_confirmation_email,
        send_lead_notification_to_advisors,
    )

    try:
        # Await real-time delivery to luckysomisetty17427@gmail.com and machanisiri180505@gmail.com
        await send_lead_notification_to_advisors(lead)
        if lead.email:
            asyncio.create_task(send_lead_confirmation_email(lead))
    except Exception as exc:
        import logging
        logging.getLogger("lugie.leads").error("Failed to dispatch lead notification emails: %s", exc)

    return lead


# ---------------------------------------------------------------------------
# List Leads (admin/counsellor)
# ---------------------------------------------------------------------------


async def list_leads(
    db: AsyncSession,
    *,
    status: str | None = None,
    assigned_counsellor_id: str | None = None,
    search: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[Lead], int]:
    """Return paginated leads with optional filters."""
    query = select(Lead).order_by(Lead.created_at.desc())

    if status:
        query = query.where(Lead.status == status)
    if assigned_counsellor_id:
        query = query.where(Lead.assigned_counsellor_id == assigned_counsellor_id)
    if search:
        pattern = f"%{search}%"
        query = query.where(
            (Lead.first_name.ilike(pattern))
            | (Lead.last_name.ilike(pattern))
            | (Lead.email.ilike(pattern))
            | (Lead.phone.ilike(pattern))
        )

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # Paginate
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    result = await db.execute(query)
    leads = list(result.scalars().all())

    return leads, total


# ---------------------------------------------------------------------------
# Get Lead Detail
# ---------------------------------------------------------------------------


async def get_lead(db: AsyncSession, lead_id: uuid.UUID) -> Lead:
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise NotFoundError("Lead")
    return lead


# ---------------------------------------------------------------------------
# Update Lead
# ---------------------------------------------------------------------------


async def update_lead(
    db: AsyncSession,
    lead_id: uuid.UUID,
    data: LeadUpdateAdmin,
    user_id: str | None = None,
    ip_address: str | None = None,
) -> Lead:
    lead = await get_lead(db, lead_id)

    update_data = data.model_dump(exclude_unset=True)

    # Track status change
    if "status" in update_data and update_data["status"] != lead.status:
        old_status = lead.status
        new_status = update_data["status"]
        db.add(LeadAuditLog(
            id=uuid.uuid4(), lead_id=lead.id,
            user_id=uuid.UUID(user_id) if user_id else None,
            action="status_changed", from_value=old_status, to_value=new_status,
            ip_address=ip_address,
        ))

    for field, value in update_data.items():
        setattr(lead, field, value)

    await db.flush()
    await db.refresh(lead)
    return lead


# ---------------------------------------------------------------------------
# Assign Lead
# ---------------------------------------------------------------------------


async def assign_lead(
    db: AsyncSession,
    lead_id: uuid.UUID,
    data: LeadAssignRequest,
    user_id: str | None = None,
    ip_address: str | None = None,
) -> Lead:
    lead = await get_lead(db, lead_id)
    old_counsellor = str(lead.assigned_counsellor_id) if lead.assigned_counsellor_id else None

    lead.assigned_counsellor_id = data.counsellor_id
    if lead.status == LeadStatus.NEW:
        lead.status = LeadStatus.CONTACTED

    db.add(LeadAuditLog(
        id=uuid.uuid4(), lead_id=lead.id,
        user_id=uuid.UUID(user_id) if user_id else None,
        action="assigned", from_value=old_counsellor,
        to_value=str(data.counsellor_id), ip_address=ip_address,
    ))
    await db.flush()
    await db.refresh(lead)
    return lead


# ---------------------------------------------------------------------------
# Convert Lead to Student
# ---------------------------------------------------------------------------


async def convert_lead(
    db: AsyncSession,
    lead_id: uuid.UUID,
    data: LeadConvertRequest,
    user_id: str | None = None,
    ip_address: str | None = None,
) -> Lead:
    lead = await get_lead(db, lead_id)

    if lead.converted_student_id:
        raise BadRequestError("This lead has already been converted.")

    if lead.status == LeadStatus.CONVERTED:
        raise BadRequestError("Lead is already marked as converted.")

    # Check for existing user with same email
    existing_user = await db.execute(select(User).where(User.email == lead.email))
    if existing_user.scalar_one_or_none():
        raise DuplicateError("A user with this email already exists.")

    # Create user
    new_user = User(
        id=uuid.uuid4(),
        email=lead.email,
        password_hash=hash_password(data.password),
        first_name=lead.first_name,
        last_name=lead.last_name or "",
        phone=lead.phone,
        is_active=True,
    )
    db.add(new_user)
    await db.flush()

    # Assign student role
    role_result = await db.execute(select(Role).where(Role.name == "student"))
    student_role = role_result.scalar_one_or_none()
    if student_role:
        db.add(UserRole(id=uuid.uuid4(), user_id=new_user.id, role_id=student_role.id))

    # Create student profile
    profile = StudentProfile(
        id=uuid.uuid4(),
        user_id=new_user.id,
        preferred_countries={"countries": [lead.preferred_country]} if lead.preferred_country else None,
        preferred_courses={"courses": [lead.preferred_course]} if lead.preferred_course else None,
        preferred_intake=lead.preferred_intake,
    )
    db.add(profile)
    await db.flush()

    # Update lead
    lead.converted_student_id = profile.id
    lead.conversion_date = datetime.now(UTC)
    lead.status = LeadStatus.CONVERTED

    db.add(LeadAuditLog(
        id=uuid.uuid4(), lead_id=lead.id,
        user_id=uuid.UUID(user_id) if user_id else None,
        action="converted", to_value=str(profile.id), ip_address=ip_address,
    ))
    await db.flush()
    await db.refresh(lead)
    return lead


# ---------------------------------------------------------------------------
# Follow-Ups
# ---------------------------------------------------------------------------


async def create_follow_up(
    db: AsyncSession, lead_id: uuid.UUID, data: FollowUpCreate, user_id: str | None = None
) -> LeadFollowUp:
    # Verify lead exists
    await get_lead(db, lead_id)

    follow_up = LeadFollowUp(
        id=uuid.uuid4(),
        lead_id=lead_id,
        follow_up_by=uuid.UUID(user_id) if user_id else None,
        follow_up_date=data.follow_up_date,
        follow_up_type=data.follow_up_type,
        notes=sanitise_string(data.notes),
        next_follow_up_date=data.next_follow_up_date,
    )
    db.add(follow_up)
    await db.flush()
    return follow_up


async def list_follow_ups(db: AsyncSession, lead_id: uuid.UUID) -> list[LeadFollowUp]:
    await get_lead(db, lead_id)
    result = await db.execute(
        select(LeadFollowUp)
        .where(LeadFollowUp.lead_id == lead_id)
        .order_by(LeadFollowUp.follow_up_date.desc())
    )
    return list(result.scalars().all())


async def update_follow_up(
    db: AsyncSession, follow_up_id: uuid.UUID, data: FollowUpUpdate
) -> LeadFollowUp:
    result = await db.execute(select(LeadFollowUp).where(LeadFollowUp.id == follow_up_id))
    follow_up = result.scalar_one_or_none()
    if not follow_up:
        raise NotFoundError("Follow-up")

    update_data = data.model_dump(exclude_unset=True)
    if update_data.get("is_completed") and not follow_up.completed_at:
        update_data["completed_at"] = datetime.now(UTC)

    for field, value in update_data.items():
        setattr(follow_up, field, value)

    await db.flush()
    await db.refresh(follow_up)
    return follow_up


# ---------------------------------------------------------------------------
# Lead Stats (Dashboard)
# ---------------------------------------------------------------------------


async def get_lead_stats(db: AsyncSession) -> dict:
    """Return lead counts by status for the admin dashboard."""
    result = await db.execute(
        select(Lead.status, func.count(Lead.id)).group_by(Lead.status)
    )
    status_counts = {row[0]: row[1] for row in result.all()}

    total = sum(status_counts.values())
    new_leads = status_counts.get(LeadStatus.NEW, 0)
    converted = status_counts.get(LeadStatus.CONVERTED, 0)

    return {
        "total": total,
        "new": new_leads,
        "converted": converted,
        "conversion_rate": round((converted / total * 100) if total > 0 else 0, 1),
        "by_status": status_counts,
    }
