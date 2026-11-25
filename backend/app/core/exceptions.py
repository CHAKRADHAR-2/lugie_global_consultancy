"""Custom exceptions and FastAPI exception handlers."""

from fastapi import HTTPException, status


class NotFoundError(HTTPException):
    """Resource not found."""

    def __init__(self, resource: str = "Resource", detail: str | None = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail or f"{resource} not found.",
        )


class PermissionDeniedError(HTTPException):
    """User lacks permission."""

    def __init__(self, detail: str = "You do not have permission to perform this action."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
        )


class DuplicateError(HTTPException):
    """Duplicate resource."""

    def __init__(self, detail: str = "Resource already exists."):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
        )


class BadRequestError(HTTPException):
    """Invalid request."""

    def __init__(self, detail: str = "Invalid request."):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
        )


class UnauthorizedError(HTTPException):
    """Authentication failure."""

    def __init__(self, detail: str = "Could not validate credentials."):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )
