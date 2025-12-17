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
    CompanyListResponse,
    CompanyListItem,
    CompanyProfileResponse,
    RamoBreakdownItem,
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


@router.get("/companies", response_model=CompanyListResponse)
async def get_companies_list(
    tipo_cia: Optional[str] = Query(None, description="Filter by company type"),
    search: Optional[str] = Query(None, description="Search by company name"),
    loader: DataLoader = Depends(get_loader),
):
    """Get list of all companies for selection page."""
    df = loader.load_subramos()

    # Get the most recent period
    latest_period = df["periodo"].max()
    latest_df = df[df["periodo"] == latest_period]

    # Group by company to get totals
    company_data = (
        latest_df.groupby(["cod_cia", "nombre_corto", "tipo_cia"])
        .agg({
            "primas_emitidas": "sum",
            "ramo_nombre_corto": "nunique",
        })
        .reset_index()
        .rename(columns={"ramo_nombre_corto": "ramos_count"})
    )

    # Apply filters
    if tipo_cia:
        company_data = company_data[company_data["tipo_cia"] == tipo_cia]

    if search:
        search_lower = search.lower()
        company_data = company_data[
            company_data["nombre_corto"].str.lower().str.contains(search_lower, na=False)
        ]

    # Sort by primas descending
    company_data = company_data.sort_values("primas_emitidas", ascending=False)

    # Convert to response model
    companies = [
        CompanyListItem(
            cod_cia=str(row["cod_cia"]),
            nombre_corto=row["nombre_corto"],
            tipo_cia=row["tipo_cia"],
            primas_emitidas=row["primas_emitidas"],
            ramos_count=int(row["ramos_count"]),
        )
        for _, row in company_data.iterrows()
    ]

    return CompanyListResponse(
        companies=companies,
        total=len(companies),
    )


def calculate_yoy(current: float, previous: float) -> Optional[float]:
    """
    Calculate Year-over-Year variation percentage.
    Returns None if:
    - Previous value is 0 (zero division)
    - Previous value is None (no data)
    - Variation exceeds ±1000% (likely anomaly)
    """
    if previous is None or previous == 0:
        return None
    variation = ((current - previous) / abs(previous)) * 100
    if abs(variation) > 1000:
        return None
    return round(variation, 1)


def get_previous_year_period(periodo: str) -> str:
    """Get same quarter from previous year. E.g., 202503 -> 202403"""
    year = int(str(periodo)[:4])
    quarter = str(periodo)[4:]
    return f"{year - 1}{quarter}"


@router.get("/companies/{cod_cia}", response_model=CompanyProfileResponse)
async def get_company_profile(
    cod_cia: str,
    loader: DataLoader = Depends(get_loader),
):
    """Get single company profile with KPIs from latest period."""
    df = loader.load_subramos()

    # Filter by company
    company_df = df[df["cod_cia"] == cod_cia]

    if company_df.empty:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Company {cod_cia} not found")

    # Get the most recent period for this company
    latest_period = company_df["periodo"].max()
    latest_df = company_df[company_df["periodo"] == latest_period]

    # Get company info
    first_row = latest_df.iloc[0]
    nombre_corto = first_row["nombre_corto"]
    tipo_cia = first_row["tipo_cia"]

    # Calculate ranking position (all companies in the same period)
    all_latest = df[df["periodo"] == latest_period]
    company_ranking = (
        all_latest.groupby("cod_cia")["primas_emitidas"]
        .sum()
        .sort_values(ascending=False)
        .reset_index()
    )
    company_ranking["ranking"] = range(1, len(company_ranking) + 1)
    ranking_row = company_ranking[company_ranking["cod_cia"] == cod_cia]
    ranking_position = int(ranking_row["ranking"].iloc[0]) if not ranking_row.empty else 0
    total_companies = len(company_ranking)

    # Aggregate KPIs (accumulated)
    ramos_count = latest_df["ramo_nombre_corto"].nunique()
    primas_emitidas = latest_df["primas_emitidas"].sum()
    primas_devengadas = latest_df["primas_devengadas"].sum()
    siniestros_devengados = latest_df["siniestros_devengados"].sum()
    gastos_devengados = latest_df["gastos_devengados"].sum()

    # Aggregate KPIs (current quarter - for monthly averages)
    primas_emitidas_current = latest_df["primas_emitidas_current"].sum()
    primas_devengadas_current = latest_df["primas_devengadas_current"].sum()
    siniestros_devengados_current = latest_df["siniestros_devengados_current"].sum()
    gastos_devengados_current = latest_df["gastos_devengados_current"].sum()

    # Load otros_conceptos for resultado_tecnico and resultado_financiero
    otros_df = loader.load_otros_conceptos()
    otros_company = otros_df[otros_df["cod_cia"] == cod_cia]

    # Get current period data from otros_conceptos
    otros_current = otros_company[otros_company["periodo"] == latest_period]
    if not otros_current.empty:
        resultado_tecnico = float(otros_current["resultado_tecnico"].iloc[0] or 0)
        resultado_financiero = float(otros_current["resultado_financiero"].iloc[0] or 0)
    else:
        resultado_tecnico = 0.0
        resultado_financiero = 0.0

    resultado_final = resultado_tecnico + resultado_financiero

    # Calculate YoY variations (same quarter previous year)
    previous_period = get_previous_year_period(latest_period)

    # Previous year primas from subramos
    prev_subramos = company_df[company_df["periodo"] == int(previous_period)]
    prev_primas = prev_subramos["primas_emitidas"].sum() if not prev_subramos.empty else None

    # Previous year resultados from otros_conceptos
    otros_prev = otros_company[otros_company["periodo"] == int(previous_period)]
    if not otros_prev.empty:
        prev_resultado_tecnico = float(otros_prev["resultado_tecnico"].iloc[0] or 0)
        prev_resultado_financiero = float(otros_prev["resultado_financiero"].iloc[0] or 0)
        prev_resultado_final = prev_resultado_tecnico + prev_resultado_financiero
    else:
        prev_resultado_tecnico = None
        prev_resultado_financiero = None
        prev_resultado_final = None

    # Calculate YoY with edge case handling
    yoy_primas_emitidas = calculate_yoy(primas_emitidas, prev_primas)
    yoy_resultado_tecnico = calculate_yoy(resultado_tecnico, prev_resultado_tecnico)
    yoy_resultado_financiero = calculate_yoy(resultado_financiero, prev_resultado_financiero)
    yoy_resultado_final = calculate_yoy(resultado_final, prev_resultado_final)

    # Top 5 ramos by primas
    ramo_totals = (
        latest_df.groupby("ramo_nombre_corto")["primas_emitidas"]
        .sum()
        .sort_values(ascending=False)
    )
    total_primas = ramo_totals.sum()
    top_ramos = [
        RamoBreakdownItem(
            ramo=ramo,
            primas=float(primas),
            percentage=float(primas / total_primas * 100) if total_primas > 0 else 0,
        )
        for ramo, primas in ramo_totals.head(5).items()
    ]

    return CompanyProfileResponse(
        cod_cia=str(cod_cia),
        nombre_corto=nombre_corto,
        tipo_cia=tipo_cia,
        periodo=str(latest_period),
        ramos_count=int(ramos_count),
        ranking_position=ranking_position,
        total_companies=total_companies,
        primas_emitidas=float(primas_emitidas),
        primas_devengadas=float(primas_devengadas),
        siniestros_devengados=float(siniestros_devengados),
        gastos_devengados=float(gastos_devengados),
        resultado_tecnico=resultado_tecnico,
        resultado_financiero=resultado_financiero,
        resultado_final=resultado_final,
        yoy_primas_emitidas=yoy_primas_emitidas,
        yoy_resultado_tecnico=yoy_resultado_tecnico,
        yoy_resultado_financiero=yoy_resultado_financiero,
        yoy_resultado_final=yoy_resultado_final,
        primas_emitidas_current=float(primas_emitidas_current),
        primas_devengadas_current=float(primas_devengadas_current),
        siniestros_devengados_current=float(siniestros_devengados_current),
        gastos_devengados_current=float(gastos_devengados_current),
        top_ramos=top_ramos,
    )
