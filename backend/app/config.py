"""Application configuration via pydantic-settings."""

from typing import Literal

from pydantic import computed_field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # --- Database ---
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "lugie"
    POSTGRES_PASSWORD: str = "lugie_dev_password"
    POSTGRES_DB: str = "lugie"
    DATABASE_URL: str | None = None

    @model_validator(mode="after")
    def set_database_urls(self) -> "Settings":
        if not self.DATABASE_URL:
            self.DATABASE_URL = (
                f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
                f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
            )
        else:
            url = self.DATABASE_URL
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+asyncpg://", 1)
            elif url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            # asyncpg uses ssl=... instead of sslmode=...
            if "sslmode=" in url:
                url = url.replace("sslmode=", "ssl=")
            if "&channel_binding=" in url:
                parts = url.split("&channel_binding=")
                url = parts[0]
            self.DATABASE_URL = url
        return self

    @computed_field
    @property
    def SYNC_DATABASE_URL(self) -> str:
        """Synchronous URL for Alembic migrations."""
        if self.DATABASE_URL:
            url = self.DATABASE_URL
            if url.startswith("postgresql+asyncpg://"):
                return url.replace("postgresql+asyncpg://", "postgresql://", 1)
            return url
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # --- Security ---
    SECRET_KEY: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- Redis ---
    REDIS_URL: str = "redis://localhost:6379/0"

    # --- Object Storage ---
    STORAGE_BACKEND: str = "minio"
    S3_ENDPOINT_URL: str | None = "http://localhost:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET_NAME: str = "lugie-documents"
    S3_QUARANTINE_BUCKET: str = "lugie-quarantine"
    S3_REGION: str = "us-east-1"

    # --- ClamAV (optional) ---
    CLAMAV_HOST: str = ""
    CLAMAV_PORT: int = 3310

    @computed_field
    @property
    def CLAMAV_ENABLED(self) -> bool:
        return bool(self.CLAMAV_HOST)

    # --- Email & Brevo ---
    EMAIL_PROVIDER: str = "brevo"  # "brevo" or "console"
    EMAIL_API_KEY: str = ""
    EMAIL_FROM: str = "luckysomisetty17427@gmail.com"
    BREVO_API_KEY: str = ""
    BREVO_SMTP_KEY: str = ""
    BREVO_SMTP_USER: str = ""
    BREVO_FROM_EMAIL: str = "luckysomisetty17427@gmail.com"
    BREVO_FROM_NAME: str = "Lugie Global Consultancy"

    # --- Firebase Auth ---
    FIREBASE_PROJECT_ID: str = ""

    # --- AI ---
    AI_PROVIDER: str = ""
    AI_API_KEY: str = ""
    AI_MODEL: str = ""

    @computed_field
    @property
    def AI_ENABLED(self) -> bool:
        return bool(self.AI_PROVIDER and self.AI_API_KEY)

    # --- Payments (Razorpay & Stripe) ---
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""
    STRIPE_API_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    @computed_field
    @property
    def PAYMENTS_ENABLED(self) -> bool:
        return bool(self.RAZORPAY_KEY_ID and self.RAZORPAY_KEY_SECRET)

    # --- General ---
    ENVIRONMENT: Literal["development", "testing", "staging", "production"] = "development"
    FRONTEND_URL: str = "https://lugie-global-consultancy.web.app"
    ALLOWED_ORIGINS: str = "http://localhost:3000,https://lugie-global-consultancy.web.app,https://lugie-global-consultancy.firebaseapp.com"
    LOG_LEVEL: str = "INFO"

    @computed_field
    @property
    def CORS_ORIGINS(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()
