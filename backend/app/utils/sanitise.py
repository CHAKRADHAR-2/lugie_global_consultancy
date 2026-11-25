"""Input sanitisation utilities."""

import re

import bleach


def sanitise_string(value: str | None) -> str | None:
    """Strip HTML tags, normalise whitespace, and trim input."""
    if value is None:
        return None
    cleaned = bleach.clean(value, tags=[], strip=True)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned if cleaned else None


def sanitise_email(email: str) -> str:
    """Lowercase and strip whitespace from an email."""
    return email.strip().lower()
