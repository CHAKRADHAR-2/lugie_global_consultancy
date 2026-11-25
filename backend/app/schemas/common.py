"""Common response schemas."""

from pydantic import BaseModel


class MessageResponse(BaseModel):
    """Simple message response."""

    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    """Error response."""

    detail: str
    success: bool = False


class PaginatedResponse[T](BaseModel):
    """Paginated list response."""

    items: list[T]
    total: int
    page: int
    per_page: int
    pages: int
