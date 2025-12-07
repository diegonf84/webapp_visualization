from typing import List
from fastapi import APIRouter, Depends

from app.api.dependencies import get_loader
from app.core.loader import DataLoader
from app.models.responses import FiltersResponse

router = APIRouter()


@router.get("/years", response_model=List[str])
async def get_years(loader: DataLoader = Depends(get_loader)):
    """Get available years from the data."""
    df = loader.load_subramos()
    years = sorted(df["year"].dropna().unique().astype(str).tolist(), reverse=True)
    return years


@router.get("/quarters", response_model=List[str])
async def get_quarters():
    """Get available quarters (fiscal quarters 01, 02, 03, 04)."""
    return ["01", "02", "03", "04"]


@router.get("/ramos", response_model=List[str])
async def get_ramos(loader: DataLoader = Depends(get_loader)):
    """Get available ramos from the data."""
    df = loader.load_subramos()
    ramos = sorted(df["ramo_nombre_corto"].dropna().unique().tolist())
    return ramos


@router.get("/companies", response_model=List[str])
async def get_companies(loader: DataLoader = Depends(get_loader)):
    """Get available company names from the data."""
    df = loader.load_subramos()
    companies = sorted(df["nombre_corto"].dropna().unique().tolist())
    return companies


@router.get("", response_model=FiltersResponse)
async def get_all_filters(loader: DataLoader = Depends(get_loader)):
    """Get all available filter options in a single response."""
    df = loader.load_subramos()

    years = sorted(df["year"].dropna().unique().astype(str).tolist(), reverse=True)
    quarters = ["01", "02", "03", "04"]
    ramos = sorted(df["ramo_nombre_corto"].dropna().unique().tolist())
    companies = sorted(df["nombre_corto"].dropna().unique().tolist())

    return FiltersResponse(
        years=years,
        quarters=quarters,
        ramos=ramos,
        companies=companies,
    )
