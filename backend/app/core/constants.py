"""Application constants and enumerations."""

from enum import StrEnum


class ApplicationStatus(StrEnum):
    """Application lifecycle stages."""

    DRAFT = "draft"
    PROFILE_REVIEW = "profile_review"
    DOCUMENTS_PENDING = "documents_pending"
    DOCUMENTS_SUBMITTED = "documents_submitted"
    DOCUMENTS_VERIFIED = "documents_verified"
    UNIVERSITY_SHORTLISTED = "university_shortlisted"
    APPLICATION_PREPARING = "application_preparing"
    APPLICATION_SUBMITTED = "application_submitted"
    APPLICATION_UNDER_REVIEW = "application_under_review"
    CONDITIONAL_OFFER = "conditional_offer"
    UNCONDITIONAL_OFFER = "unconditional_offer"
    OFFER_ACCEPTED = "offer_accepted"
    OFFER_DECLINED = "offer_declined"
    DEPOSIT_PAID = "deposit_paid"
    CAS_REQUESTED = "cas_requested"
    CAS_RECEIVED = "cas_received"
    VISA_APPLIED = "visa_applied"
    VISA_APPROVED = "visa_approved"
    VISA_REJECTED = "visa_rejected"
    ENROLLED = "enrolled"
    WITHDRAWN = "withdrawn"
    DEFERRED = "deferred"


class LeadStatus(StrEnum):
    """CRM lead lifecycle stages."""

    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    CONSULTATION_SCHEDULED = "consultation_scheduled"
    CONSULTATION_COMPLETED = "consultation_completed"
    PROPOSAL_SENT = "proposal_sent"
    CONVERTED = "converted"
    LOST = "lost"
    DEFERRED = "deferred"


class LeadSource(StrEnum):
    """Lead origin channels."""

    WEBSITE_CONTACT = "website_contact"
    WEBSITE_CONSULTATION = "website_consultation"
    PHONE = "phone"
    EMAIL = "email"
    REFERRAL = "referral"
    WALK_IN = "walk_in"
    SOCIAL_MEDIA = "social_media"


class DocumentStatus(StrEnum):
    """Document review status."""

    UPLOADED = "uploaded"
    VERIFIED = "verified"
    REJECTED = "rejected"


class ScanStatus(StrEnum):
    """Malware scan status."""

    PENDING = "pending"
    SCANNING = "scanning"
    CLEAN = "clean"
    QUARANTINED = "quarantined"
    SCAN_DISABLED = "scan_disabled"


class AssessmentStatus(StrEnum):
    """Profile assessment workflow stages."""

    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"


class TaskStatus(StrEnum):
    """Application task states."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    OVERDUE = "overdue"


class TaskPriority(StrEnum):
    """Task priority levels."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class FollowUpType(StrEnum):
    """Lead follow-up communication types."""

    CALL = "call"
    EMAIL_TYPE = "email"
    WHATSAPP = "whatsapp"
    MEETING = "meeting"


class EmploymentType(StrEnum):
    """Work experience employment types."""

    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    INTERNSHIP = "internship"
    FREELANCE = "freelance"


class StaffRoleType(StrEnum):
    """Staff assignment role types."""

    PRIMARY_COUNSELLOR = "primary_counsellor"
    DOCUMENTATION = "documentation"
    VISA = "visa"
    ACCOMMODATION = "accommodation"


# --- System Roles ---
SYSTEM_ROLES = [
    "super_admin",
    "admin",
    "counsellor",
    "application_executive",
    "documentation_executive",
    "finance_executive",
    "visa_executive",
    "accommodation_executive",
    "student",
]

# --- Document Upload ---
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".docx"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

# File magic bytes for content validation
MAGIC_BYTES = {
    "application/pdf": b"%PDF",
    "image/jpeg": b"\xff\xd8\xff",
    "image/png": b"\x89PNG",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": b"PK",
}
