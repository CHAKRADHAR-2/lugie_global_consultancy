"""General helper utilities."""

import math


def calculate_pages(total: int, per_page: int) -> int:
    """Calculate total number of pages."""
    return math.ceil(total / per_page) if per_page > 0 else 0
