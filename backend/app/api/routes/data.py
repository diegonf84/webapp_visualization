from typing import Optional
from fastapi import APIRouter, Depends, Query

from app.api.dependencies import get_loader, FilterParams
from app.core.loader import DataLoader
from app.logic.aggregations import (
    filter_data,
    aggregate_by_company,
    aggregate_by_company_ramo,
    aggregate_by_company_subramo,
    aggregate_by_ramo,
    aggregate_by_subramo,
    get_totals,
)
from app.logic.rankings import get_top_n
from app.models.responses import (
    KPIResponse,
    CompanyRankingResponse,
    CompanyRankingItem,
    DistributionResponse,
    DistributionItem,
)

router = APIRouter()


@router.get("/kpis", response_model=KPIResponse)
async def get_kpis(
    filters: FilterParams = Depends(),
    loader: DataLoader = Depends(get_loader),
):
    """Get KPI totals based on filters."""
    df = loader.load_subramos()

    # Apply filters
    filtered_df = filter_data(
        df,
        year=filters.year,
        trimestre=filters.quarter,
        ramo=filters.ramo,
        companies=filters.companies,
    )

    # Calculate totals
    totals = get_totals(filtered_df, view_mode=filters.view_mode)

    return KPIResponse(
        primas_emitidas=totals["primas_emitidas"],
        primas_devengadas=totals["primas_devengadas"],
        siniestros_devengados=totals["siniestros_devengados"],
        gastos_devengados=totals["gastos_devengados"],
        entities_count=totals["entities_count"],
    )


@router.get("/companies/ranking", response_model=CompanyRankingResponse)
async def get_companies_ranking(
    filters: FilterParams = Depends(),
    top_n: int = Query(15, ge=1, le=100, description="Number of top companies to return"),
    loader: DataLoader = Depends(get_loader),
):
    """Get top N companies by primas_emitidas."""
    df = loader.load_subramos()

    # Apply filters
    filtered_df = filter_data(
        df,
        year=filters.year,
        trimestre=filters.quarter,
        ramo=filters.ramo,
        companies=filters.companies,
    )

    # Determine if we're viewing by ramo or subramo
    ramo_selected = filters.ramo is not None and filters.ramo != ""

    if ramo_selected:
        # When a ramo is selected: group by company and subramo
        bar_data = aggregate_by_company_subramo(filtered_df, view_mode=filters.view_mode)
    else:
        # Default: group by company and ramo
        bar_data = aggregate_by_company_ramo(filtered_df, view_mode=filters.view_mode)

    # Get company totals for TOP-N selection
    company_totals = aggregate_by_company(filtered_df, view_mode=filters.view_mode)
    top_companies = get_top_n(company_totals, n=top_n)
    top_company_names = top_companies["nombre_corto"].tolist()

    # Filter bar data to only include top N companies
    bar_data_filtered = bar_data[bar_data["nombre_corto"].isin(top_company_names)]

    # Convert to response model
    companies = [
        CompanyRankingItem(
            nombre_corto=row["nombre_corto"],
            ramo_nombre_corto=row.get("ramo_nombre_corto"),
            subramo_nombre_corto=row.get("subramo_nombre_corto"),
            primas_emitidas=row["primas_emitidas"],
        )
        for _, row in bar_data_filtered.iterrows()
    ]

    return CompanyRankingResponse(
        companies=companies,
        total=len(company_totals),
    )


@router.get("/distribution/ramos", response_model=DistributionResponse)
async def get_ramos_distribution(
    filters: FilterParams = Depends(),
    loader: DataLoader = Depends(get_loader),
):
    """Get distribution by ramos."""
    df = loader.load_subramos()

    # Apply filters
    filtered_df = filter_data(
        df,
        year=filters.year,
        trimestre=filters.quarter,
        ramo=filters.ramo,
        companies=filters.companies,
    )

    # Aggregate by ramo
    ramo_data = aggregate_by_ramo(filtered_df, view_mode=filters.view_mode)
    total = ramo_data["primas_emitidas"].sum()

    # Convert to response model
    items = [
        DistributionItem(
            name=row["ramo_nombre_corto"],
            value=row["primas_emitidas"],
            percentage=(row["primas_emitidas"] / total * 100) if total > 0 else 0,
        )
        for _, row in ramo_data.iterrows()
    ]

    return DistributionResponse(items=items, total=total)


@router.get("/distribution/subramos", response_model=DistributionResponse)
async def get_subramos_distribution(
    filters: FilterParams = Depends(),
    loader: DataLoader = Depends(get_loader),
):
    """Get distribution by subramos."""
    df = loader.load_subramos()

    # Apply filters
    filtered_df = filter_data(
        df,
        year=filters.year,
        trimestre=filters.quarter,
        ramo=filters.ramo,
        companies=filters.companies,
    )

    # Aggregate by subramo
    subramo_data = aggregate_by_subramo(filtered_df, view_mode=filters.view_mode)
    total = subramo_data["primas_emitidas"].sum()

    # Convert to response model
    items = [
        DistributionItem(
            name=row["subramo_nombre_corto"],
            value=row["primas_emitidas"],
            percentage=(row["primas_emitidas"] / total * 100) if total > 0 else 0,
        )
        for _, row in subramo_data.iterrows()
    ]

    return DistributionResponse(items=items, total=total)
