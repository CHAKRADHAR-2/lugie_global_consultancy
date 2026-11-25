"""Redis client for token storage and caching."""

import redis.asyncio as aioredis

from app.config import settings

redis_client: aioredis.Redis | None = None


async def init_redis() -> None:
    """Initialise the global Redis connection."""
    global redis_client
    redis_client = aioredis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True,
    )


async def close_redis() -> None:
    """Close the global Redis connection."""
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None


def get_redis() -> aioredis.Redis:
    """Get the Redis client. Raises if not initialised."""
    if redis_client is None:
        raise RuntimeError("Redis not initialised. Call init_redis() first.")
    return redis_client


# --- Refresh Token JTI Management ---

REFRESH_PREFIX = "refresh_jti:"
REFRESH_USER_PREFIX = "refresh_user:"


async def store_refresh_jti(user_id: str, jti: str, expire_seconds: int) -> None:
    """Store a refresh token JTI in Redis."""
    r = get_redis()
    # Store JTI → user_id mapping
    await r.setex(f"{REFRESH_PREFIX}{jti}", expire_seconds, user_id)
    # Add JTI to user's set of active JTIs
    await r.sadd(f"{REFRESH_USER_PREFIX}{user_id}", jti)
    await r.expire(f"{REFRESH_USER_PREFIX}{user_id}", expire_seconds)


async def validate_refresh_jti(jti: str) -> str | None:
    """Validate a refresh JTI. Returns user_id if valid, None if revoked."""
    r = get_redis()
    return await r.get(f"{REFRESH_PREFIX}{jti}")


async def revoke_refresh_jti(user_id: str, jti: str) -> None:
    """Revoke a specific refresh JTI."""
    r = get_redis()
    await r.delete(f"{REFRESH_PREFIX}{jti}")
    await r.srem(f"{REFRESH_USER_PREFIX}{user_id}", jti)


async def revoke_all_user_jtis(user_id: str) -> None:
    """Revoke all refresh JTIs for a user (logout from all devices)."""
    r = get_redis()
    jtis = await r.smembers(f"{REFRESH_USER_PREFIX}{user_id}")
    if jtis:
        keys = [f"{REFRESH_PREFIX}{jti}" for jti in jtis]
        await r.delete(*keys)
    await r.delete(f"{REFRESH_USER_PREFIX}{user_id}")
