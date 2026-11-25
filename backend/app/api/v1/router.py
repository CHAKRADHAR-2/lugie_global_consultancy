"""V1 API router aggregator."""

from fastapi import APIRouter

from app.api.v1.applications import router as applications_router
from app.api.v1.assessments import router as assessments_router
from app.api.v1.audit_logs import router as audit_logs_router
from app.api.v1.auth import router as auth_router
from app.api.v1.documents import router as documents_router
from app.api.v1.leads import router as leads_router
from app.api.v1.messages import router as messages_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.packages import router as packages_router
from app.api.v1.payments import router as payments_router
from app.api.v1.reports import router as reports_router
from app.api.v1.settings import router as settings_router
from app.api.v1.shortlists import router as shortlists_router
from app.api.v1.students import router as students_router
from app.api.v1.tasks import router as tasks_router
from app.api.v1.universities import router as universities_router
from app.api.v1.users import router as users_router

v1_router = APIRouter(prefix="/api/v1")

# Auth
v1_router.include_router(auth_router)

# CRM / Leads
v1_router.include_router(leads_router)

# Student profiles, academics, language tests
v1_router.include_router(students_router)
v1_router.include_router(shortlists_router)
v1_router.include_router(tasks_router)

# Countries, universities, courses, intakes
v1_router.include_router(universities_router)

# Packages and additional services
v1_router.include_router(packages_router)

# Payments and purchase orders
v1_router.include_router(payments_router)

# Documents (upload, download, verify, quarantine)
v1_router.include_router(documents_router)

# Applications (CRUD, documents, tasks, timeline)
v1_router.include_router(applications_router)

# Profile assessments
v1_router.include_router(assessments_router)

# In-app notifications & Real-time chat
v1_router.include_router(notifications_router)
v1_router.include_router(messages_router)

# Users & Staff management
v1_router.include_router(users_router)

# Executive Reports & BI
v1_router.include_router(reports_router)

# Platform Settings
v1_router.include_router(settings_router)

# Audit logs
v1_router.include_router(audit_logs_router)
