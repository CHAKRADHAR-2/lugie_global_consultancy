"""FastAPI application factory."""

import logging
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.v1.applications import router as applications_router
from app.api.v1.assessments import router as assessments_router
from app.api.v1.audit_logs import router as audit_logs_router
from app.api.v1.auth import router as direct_auth_router
from app.api.v1.documents import router as documents_router
from app.api.v1.leads import router as leads_router
from app.api.v1.messages import router as messages_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.packages import router as packages_router
from app.api.v1.payments import router as payments_router
from app.api.v1.reports import router as reports_router
from app.api.v1.router import v1_router
from app.api.v1.settings import router as settings_router
from app.api.v1.shortlists import router as shortlists_router
from app.api.v1.students import router as students_router
from app.api.v1.tasks import router as tasks_router
from app.api.v1.universities import router as universities_router
from app.api.v1.users import router as users_router
from app.config import settings
from app.core.middleware import RequestLoggingMiddleware
from app.core.rate_limit import limiter
from app.core.redis import close_redis, init_redis
from app.utils.logging import setup_logging

logger = logging.getLogger("lugie.app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialise and tear down resources."""
    setup_logging()
    logger.info("Starting Lugie API (%s)", settings.ENVIRONMENT)
    await init_redis()
    logger.info("Redis connected")
    yield
    await close_redis()
    logger.info("Lugie API shut down")


app = FastAPI(
    title="Lugie API",
    description="Lugie Global Consultancy – Dream Beyond Borders – Backend API",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging
app.add_middleware(RequestLoggingMiddleware)

# Include primary API routes (/api/v1/*)
app.include_router(v1_router)

# Direct auth routes (/api/auth/*) for static CDN / Firebase Hosting rewrites
app.include_router(direct_auth_router, prefix="/api", tags=["Direct Auth"])

# Proxy routes (/api/proxy/*) matching frontend BFF client calls
proxy_router = APIRouter(prefix="/api/proxy")
proxy_router.include_router(direct_auth_router)
proxy_router.include_router(leads_router)
proxy_router.include_router(students_router)
proxy_router.include_router(shortlists_router)
proxy_router.include_router(tasks_router)
proxy_router.include_router(universities_router)
proxy_router.include_router(packages_router)
proxy_router.include_router(payments_router)
proxy_router.include_router(documents_router)
proxy_router.include_router(applications_router)
proxy_router.include_router(assessments_router)
proxy_router.include_router(notifications_router)
proxy_router.include_router(messages_router)
proxy_router.include_router(users_router)
proxy_router.include_router(reports_router)
proxy_router.include_router(settings_router)
proxy_router.include_router(audit_logs_router)

app.include_router(proxy_router)


@app.get("/healthz", tags=["Health"])
async def healthz():
    """Health check endpoint."""
    return {"status": "ok", "service": "lugie-api", "environment": settings.ENVIRONMENT}
