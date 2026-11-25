"""RBAC permissions and role-checking dependencies."""

from enum import StrEnum
from typing import Annotated

from fastapi import Depends, HTTPException, status

from app.dependencies import get_current_active_user


class Permission(StrEnum):
    """Permission identifiers in the format 'resource:action'."""

    # Students
    STUDENTS_READ = "students:read"
    STUDENTS_CREATE = "students:create"
    STUDENTS_UPDATE = "students:update"
    STUDENTS_DELETE = "students:delete"
    STUDENTS_READ_OWN = "students:read_own"
    STUDENTS_UPDATE_OWN = "students:update_own"

    # Applications
    APPLICATIONS_READ = "applications:read"
    APPLICATIONS_CREATE = "applications:create"
    APPLICATIONS_UPDATE = "applications:update"
    APPLICATIONS_READ_OWN = "applications:read_own"
    APPLICATIONS_ASSIGN = "applications:assign"

    # Documents
    DOCUMENTS_READ = "documents:read"
    DOCUMENTS_CREATE = "documents:create"
    DOCUMENTS_DELETE = "documents:delete"
    DOCUMENTS_READ_OWN = "documents:read_own"
    DOCUMENTS_VERIFY = "documents:verify"

    # Universities
    UNIVERSITIES_READ = "universities:read"
    UNIVERSITIES_CREATE = "universities:create"
    UNIVERSITIES_UPDATE = "universities:update"
    UNIVERSITIES_DELETE = "universities:delete"

    # Courses
    COURSES_CREATE = "courses:create"
    COURSES_UPDATE = "courses:update"
    COURSES_DELETE = "courses:delete"

    # Packages
    PACKAGES_READ = "packages:read"
    PACKAGES_CREATE = "packages:create"
    PACKAGES_UPDATE = "packages:update"

    # Leads
    LEADS_READ = "leads:read"
    LEADS_CREATE = "leads:create"
    LEADS_UPDATE = "leads:update"
    LEADS_ASSIGN = "leads:assign"
    LEADS_CONVERT = "leads:convert"

    # Assessments
    ASSESSMENTS_READ = "assessments:read"
    ASSESSMENTS_CREATE = "assessments:create"
    ASSESSMENTS_UPDATE = "assessments:update"
    ASSESSMENTS_REVIEW = "assessments:review"

    # Users (staff management)
    USERS_READ = "users:read"
    USERS_CREATE = "users:create"
    USERS_UPDATE = "users:update"

    # Audit
    AUDIT_LOGS_READ = "audit_logs:read"

    # Settings
    SETTINGS_READ = "settings:read"
    SETTINGS_UPDATE = "settings:update"


class RoleChecker:
    """FastAPI dependency that checks if the current user has one of the allowed roles."""

    def __init__(self, allowed_roles: list[str]) -> None:
        self.allowed_roles = allowed_roles

    async def __call__(self, current_user: Annotated[dict, Depends(get_current_active_user)]):
        user_roles = current_user.get("roles", [])
        if not any(role in self.allowed_roles for role in user_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )
        return current_user


# Pre-configured role checker dependencies
require_admin = RoleChecker(["super_admin", "admin"])
require_counsellor_or_admin = RoleChecker(["super_admin", "admin", "counsellor"])
require_staff = RoleChecker([
    "super_admin", "admin", "counsellor",
    "application_executive", "documentation_executive",
    "finance_executive", "visa_executive", "accommodation_executive",
])
require_super_admin = RoleChecker(["super_admin"])
