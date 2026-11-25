"""Import all models so Alembic can discover them for migrations."""

from app.models.application import (  # noqa: F401
    Application,
    ApplicationDocument,
    ApplicationStatusHistory,
    ApplicationTask,
)
from app.models.assessment import ProfileAssessment  # noqa: F401
from app.models.assignment import StaffAssignment  # noqa: F401
from app.models.audit import AuditLog, ConsentRecord  # noqa: F401
from app.models.base import Base  # noqa: F401
from app.models.chat import ChatMessage  # noqa: F401
from app.models.document import Document, DocumentAccessLog  # noqa: F401
from app.models.experience import Certification, Project, WorkExperience  # noqa: F401
from app.models.lead import Lead, LeadAuditLog, LeadFollowUp  # noqa: F401
from app.models.notification import Notification  # noqa: F401
from app.models.package import AdditionalService, Package, PackageInclusion  # noqa: F401
from app.models.payment import Order, Payment  # noqa: F401
from app.models.student import AcademicRecord, LanguageTest, StudentProfile  # noqa: F401
from app.models.task import CounsellorTask  # noqa: F401
from app.models.university import Country, Course, Intake, University  # noqa: F401
from app.models.university_preference import (  # noqa: F401
    CounsellorRecommendation,
    StudentOptedUniversity,
)
from app.models.user import Permission, Role, RolePermission, User, UserRole  # noqa: F401

