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
from app.logic.comparisons import (
    compare_by_total_percentile,
    compare_by_main_ramo_percentile,
    compare_by_ramo_similarity,
)
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
    CompanyOperationsResponse,
    PeriodDataPoint,
    RamoOption,
    CompanyComparisonResponse,
    ComparisonCompanyItem,
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

    # All ramos with full metrics for treemap
    ramo_totals = (
        latest_df.groupby("ramo_nombre_corto")
        .agg({
            "primas_emitidas": "sum",
            "primas_devengadas": "sum",
            "siniestros_devengados": "sum",
            "gastos_devengados": "sum",
        })
        .reset_index()
        .sort_values("primas_emitidas", ascending=False)
    )
    total_primas = ramo_totals["primas_emitidas"].sum()

    top_ramos = []
    for _, row in ramo_totals.iterrows():
        pd_ramo = row["primas_devengadas"]
        sd_ramo = row["siniestros_devengados"]
        gd_ramo = row["gastos_devengados"]

        # Calculate ratios (allow negative, only protect against division by zero)
        siniestralidad_ramo = (sd_ramo / pd_ramo * 100) if pd_ramo != 0 else 0
        gastos_pct_ramo = (gd_ramo / pd_ramo * 100) if pd_ramo != 0 else 0
        combined_ramo = siniestralidad_ramo + gastos_pct_ramo

        top_ramos.append(
            RamoBreakdownItem(
                ramo=row["ramo_nombre_corto"],
                primas=float(row["primas_emitidas"]),
                percentage=float(row["primas_emitidas"] / total_primas * 100) if total_primas > 0 else 0,
                primas_devengadas=float(pd_ramo),
                siniestros_devengados=float(sd_ramo),
                gastos_devengados=float(gd_ramo),
                siniestralidad=float(siniestralidad_ramo),
                gastos_percent=float(gastos_pct_ramo),
                combined_ratio=float(combined_ramo),
            )
        )

    # Calculate market ratios (same tipo_cia) - aggregate then divide
    market_df = all_latest[all_latest["tipo_cia"] == tipo_cia]
    market_companies_count = market_df["cod_cia"].nunique()

    # Aggregate totals across all companies in the market
    market_totals = market_df.agg({
        "primas_devengadas": "sum",
        "siniestros_devengados": "sum",
        "gastos_devengados": "sum",
    })

    # Calculate ratios from aggregated totals (not average of individual ratios)
    market_primas = market_totals["primas_devengadas"]
    if market_primas > 0:
        market_siniestralidad = float(market_totals["siniestros_devengados"] / market_primas * 100)
        market_gastos_percent = float(market_totals["gastos_devengados"] / market_primas * 100)
        market_combined_ratio = market_siniestralidad + market_gastos_percent
    else:
        market_siniestralidad = 0.0
        market_gastos_percent = 0.0
        market_combined_ratio = 0.0

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
        market_siniestralidad=market_siniestralidad,
        market_gastos_percent=market_gastos_percent,
        market_combined_ratio=market_combined_ratio,
        market_companies_count=market_companies_count,
    )


def format_periodo_label(periodo: str) -> str:
    """Format period from YYYYQQ to human readable label."""
    periodo_str = str(periodo)
    if len(periodo_str) != 6:
        return periodo_str
    year = periodo_str[:4]
    quarter = periodo_str[4:]
    quarter_names = {
        "01": "Mar",
        "02": "Jun",
        "03": "Sep",
        "04": "Dic",
    }
    return f"{quarter_names.get(quarter, quarter)} {year}"


@router.get("/companies/{cod_cia}/operations", response_model=CompanyOperationsResponse)
async def get_company_operations(
    cod_cia: str,
    ramo: Optional[str] = Query(None, description="Filter by ramo (null = all ramos)"),
    loader: DataLoader = Depends(get_loader),
):
    """Get company operations time series data across all available periods."""
    df = loader.load_subramos()

    # Filter by company
    company_df = df[df["cod_cia"] == cod_cia]

    if company_df.empty:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Company {cod_cia} not found")

    # Get company info
    nombre_corto = company_df.iloc[0]["nombre_corto"]
    tipo_cia = company_df.iloc[0]["tipo_cia"]

    # Get available ramos for this company (before filtering)
    available_ramos_list = sorted(company_df["ramo_nombre_corto"].dropna().unique())
    available_ramos = [RamoOption(value="all", label="Todos los Ramos")]
    available_ramos.extend([
        RamoOption(value=r, label=r) for r in available_ramos_list
    ])

    # Filter by ramo if specified
    if ramo and ramo != "all":
        company_df = company_df[company_df["ramo_nombre_corto"] == ramo]

    # Calculate market ratio per period (aggregate all companies of same tipo_cia)
    # If a ramo is selected, filter market by that ramo too
    market_df = df[df["tipo_cia"] == tipo_cia]
    if ramo and ramo != "all":
        market_df = market_df[market_df["ramo_nombre_corto"] == ramo]

    market_by_period = (
        market_df.groupby("periodo")
        .agg({
            "primas_devengadas": "sum",
            "siniestros_devengados": "sum",
            "gastos_devengados": "sum",
        })
        .reset_index()
    )
    # Calculate ratio from aggregated totals (not average of individual ratios)
    market_by_period["combined_ratio"] = market_by_period.apply(
        lambda r: ((r["siniestros_devengados"] + r["gastos_devengados"]) / r["primas_devengadas"] * 100)
        if r["primas_devengadas"] > 0 else 0,
        axis=1
    )
    market_ratio_by_period = market_by_period.set_index("periodo")["combined_ratio"].to_dict()

    # Group by period (both accumulated and current quarter values)
    period_data = (
        company_df.groupby("periodo")
        .agg({
            "primas_emitidas": "sum",
            "primas_devengadas": "sum",
            "siniestros_devengados": "sum",
            "gastos_devengados": "sum",
            "primas_devengadas_current": "sum",
            "siniestros_devengados_current": "sum",
            "gastos_devengados_current": "sum",
        })
        .reset_index()
        .sort_values("periodo")
    )

    # Build response periods
    periods = []
    for _, row in period_data.iterrows():
        periodo = str(int(row["periodo"]))
        # Accumulated values
        primas_devengadas = float(row["primas_devengadas"])
        siniestros_devengados = float(row["siniestros_devengados"])
        gastos_devengados = float(row["gastos_devengados"])
        # Current quarter values
        primas_devengadas_current = float(row["primas_devengadas_current"])
        siniestros_devengados_current = float(row["siniestros_devengados_current"])
        gastos_devengados_current = float(row["gastos_devengados_current"])

        # Calculate ratios from accumulated values (protect against division by zero)
        if primas_devengadas != 0:
            ratio_siniestralidad = (siniestros_devengados / primas_devengadas) * 100
            ratio_gastos = (gastos_devengados / primas_devengadas) * 100
        else:
            ratio_siniestralidad = 0
            ratio_gastos = 0

        ratio_combinado = ratio_siniestralidad + ratio_gastos

        # Always calculate resultado_tecnico from subramos data
        resultado_tecnico = primas_devengadas - siniestros_devengados - gastos_devengados
        resultado_tecnico_current = primas_devengadas_current - siniestros_devengados_current - gastos_devengados_current

        # Get market ratio for this period
        market_ratio = market_ratio_by_period.get(int(periodo), 0.0)

        periods.append(
            PeriodDataPoint(
                periodo=periodo,
                periodo_label=format_periodo_label(periodo),
                primas_emitidas=float(row["primas_emitidas"]),
                primas_devengadas=primas_devengadas,
                siniestros_devengados=siniestros_devengados,
                gastos_devengados=gastos_devengados,
                resultado_tecnico=resultado_tecnico,
                primas_devengadas_current=primas_devengadas_current,
                siniestros_devengados_current=siniestros_devengados_current,
                gastos_devengados_current=gastos_devengados_current,
                resultado_tecnico_current=resultado_tecnico_current,
                ratio_combinado=round(ratio_combinado, 1),
                ratio_siniestralidad=round(ratio_siniestralidad, 1),
                ratio_gastos=round(ratio_gastos, 1),
                market_ratio_combinado=round(market_ratio, 1),
            )
        )

    return CompanyOperationsResponse(
        cod_cia=cod_cia,
        nombre_corto=nombre_corto,
        selected_ramo=ramo if ramo and ramo != "all" else None,
        periods=periods,
        available_ramos=available_ramos,
    )


@router.get("/companies/{cod_cia}/compare", response_model=CompanyComparisonResponse)
async def compare_company(
    cod_cia: str,
    method: str = Query(
        ...,
        description="Comparison method: total_percentile, main_ramo_percentile, or ramo_similarity",
        pattern="^(total_percentile|main_ramo_percentile|ramo_similarity)$"
    ),
    loader: DataLoader = Depends(get_loader),
):
    """
    Compare a company with similar companies using one of three methods.

    - **total_percentile**: Rank by total primas, select 5 above and 5 below
    - **main_ramo_percentile**: Rank by primas in main ramo, select 5 above and 5 below
    - **ramo_similarity**: Find 10 companies with most similar ramo distribution
    """
    from fastapi import HTTPException

    df = loader.load_subramos()

    # Get the latest period
    latest_period = df["periodo"].max()
    latest_df = df[df["periodo"] == latest_period]

    # Get selected company info
    company_df = latest_df[latest_df["cod_cia"] == cod_cia]

    if company_df.empty:
        raise HTTPException(status_code=404, detail=f"Company {cod_cia} not found")

    tipo_cia = company_df.iloc[0]["tipo_cia"]

    # Execute comparison based on method
    try:
        if method == "total_percentile":
            result = compare_by_total_percentile(latest_df, cod_cia, tipo_cia)

            return CompanyComparisonResponse(
                selected_company=ComparisonCompanyItem(
                    cod_cia=str(result["selected"]["cod_cia"]),
                    nombre_corto=result["selected"]["nombre_corto"],
                    tipo_cia=result["selected"]["tipo_cia"],
                    primas_emitidas=float(result["selected"]["primas_emitidas"]),
                    ranking_position=int(result["selected"]["ranking"]),
                    relative_position=0,
                ),
                method=method,
                companies_above=[
                    ComparisonCompanyItem(
                        cod_cia=str(c["cod_cia"]),
                        nombre_corto=c["nombre_corto"],
                        tipo_cia=c["tipo_cia"],
                        primas_emitidas=float(c["primas_emitidas"]),
                        ranking_position=int(c["ranking"]),
                        relative_position=int(c["relative_position"]),
                    )
                    for c in result["above"]
                ],
                companies_below=[
                    ComparisonCompanyItem(
                        cod_cia=str(c["cod_cia"]),
                        nombre_corto=c["nombre_corto"],
                        tipo_cia=c["tipo_cia"],
                        primas_emitidas=float(c["primas_emitidas"]),
                        ranking_position=int(c["ranking"]),
                        relative_position=int(c["relative_position"]),
                    )
                    for c in result["below"]
                ],
                periodo=str(latest_period),
                total_companies_in_tipo=result["total_in_tipo"],
            )

        elif method == "main_ramo_percentile":
            result = compare_by_main_ramo_percentile(latest_df, cod_cia, tipo_cia)

            return CompanyComparisonResponse(
                selected_company=ComparisonCompanyItem(
                    cod_cia=str(result["selected"]["cod_cia"]),
                    nombre_corto=result["selected"]["nombre_corto"],
                    tipo_cia=result["selected"]["tipo_cia"],
                    primas_emitidas=float(result["selected"]["primas_emitidas"]),
                    ranking_position=int(result["selected"]["ranking"]),
                    relative_position=0,
                    main_ramo_primas=float(result["selected"]["main_ramo_primas"]),
                ),
                method=method,
                main_ramo=result["main_ramo"],
                main_ramo_percentage=result["main_ramo_percentage"],
                companies_above=[
                    ComparisonCompanyItem(
                        cod_cia=str(c["cod_cia"]),
                        nombre_corto=c["nombre_corto"],
                        tipo_cia=c["tipo_cia"],
                        primas_emitidas=float(c["primas_emitidas"]),
                        ranking_position=int(c["ranking"]),
                        relative_position=int(c["relative_position"]),
                        main_ramo_primas=float(c["main_ramo_primas"]),
                    )
                    for c in result["above"]
                ],
                companies_below=[
                    ComparisonCompanyItem(
                        cod_cia=str(c["cod_cia"]),
                        nombre_corto=c["nombre_corto"],
                        tipo_cia=c["tipo_cia"],
                        primas_emitidas=float(c["primas_emitidas"]),
                        ranking_position=int(c["ranking"]),
                        relative_position=int(c["relative_position"]),
                        main_ramo_primas=float(c["main_ramo_primas"]),
                    )
                    for c in result["below"]
                ],
                periodo=str(latest_period),
                total_companies_in_tipo=result["total_in_tipo"],
                total_companies_with_ramo=result["total_companies_with_ramo"],
            )

        else:  # ramo_similarity
            result = compare_by_ramo_similarity(latest_df, cod_cia, tipo_cia)

            return CompanyComparisonResponse(
                selected_company=ComparisonCompanyItem(
                    cod_cia=str(result["selected"]["cod_cia"]),
                    nombre_corto=result["selected"]["nombre_corto"],
                    tipo_cia=result["selected"]["tipo_cia"],
                    primas_emitidas=float(result["selected"]["primas_emitidas"]),
                    ranking_position=0,  # Not applicable for similarity
                ),
                method=method,
                similar_companies=[
                    ComparisonCompanyItem(
                        cod_cia=str(c["cod_cia"]),
                        nombre_corto=c["nombre_corto"],
                        tipo_cia=c["tipo_cia"],
                        primas_emitidas=float(c["primas_emitidas"]),
                        ranking_position=c["ranking_position"],  # Similarity rank
                        similarity_distance=c["similarity_distance"],
                    )
                    for c in result["similar_companies"]
                ],
                periodo=str(latest_period),
                total_companies_in_tipo=result["total_in_tipo"],
            )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
