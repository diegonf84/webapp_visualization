from typing import Optional
from fastapi import Query
from app.core.loader import get_data_loader


def get_loader():
    """Dependency to get the data loader instance."""
    return get_data_loader()


# Common query parameters
class FilterParams:
    """Common filter query parameters."""

    def __init__(
        self,
        year: Optional[str] = Query(None, description="Fiscal year (YYYY)"),
        quarter: Optional[str] = Query(None, description="Quarter (01, 02, 03, 04)"),
        ramo: Optional[str] = Query(None, description="Ramo filter"),
        companies: Optional[str] = Query(None, description="Comma-separated company names"),
        view_mode: str = Query("accumulated", description="Data view mode: 'accumulated' or 'current'"),
    ):
        # Convert year to int for filtering (data has int year column)
        self.year = int(year) if year else None
        self.quarter = quarter
        self.ramo = ramo
        self.companies = companies.split(",") if companies else None
        self.view_mode = view_mode
