import pandas as pd
from typing import List, Optional, Union, Literal

ViewMode = Literal["accumulated", "current"]


def get_metric_columns(view_mode: ViewMode = "accumulated") -> List[str]:
    """Get the appropriate metric column names based on view mode."""
    base_cols = ["primas_emitidas", "primas_devengadas",
                 "siniestros_devengados", "gastos_devengados"]

    if view_mode == "current":
        return [f"{col}_current" for col in base_cols]
    return base_cols


def filter_data(
    df: pd.DataFrame,
    year: Optional[int] = None,
    trimestre: Optional[str] = None,  # 01, 02, 03, 04
    ramo: Optional[str] = None,  # Single value now
    companies: Optional[List[str]] = None,
) -> pd.DataFrame:
    """Apply filters to the dataframe."""
    filtered = df.copy()

    if year is not None:
        filtered = filtered[filtered["year"] == year]

    if trimestre is not None:
        filtered = filtered[filtered["trimestre"] == trimestre]

    if ramo:
        filtered = filtered[filtered["ramo_nombre_corto"] == ramo]

    if companies and len(companies) > 0:
        filtered = filtered[filtered["nombre_corto"].isin(companies)]

    return filtered


def aggregate_by(
    df: pd.DataFrame,
    group_cols: List[str],
    sum_cols: Optional[List[str]] = None,
    view_mode: ViewMode = "accumulated",
) -> pd.DataFrame:
    """Aggregate data by specified columns."""
    if sum_cols is None:
        sum_cols = get_metric_columns(view_mode)

    # Only include columns that exist
    sum_cols = [c for c in sum_cols if c in df.columns]
    group_cols = [c for c in group_cols if c in df.columns]

    if not group_cols or not sum_cols:
        return df

    aggregated = df.groupby(group_cols, as_index=False)[sum_cols].sum()

    # Rename columns back to standard names for consistent usage downstream
    if view_mode == "current":
        rename_map = {f"{col}_current": col for col in
                     ["primas_emitidas", "primas_devengadas",
                      "siniestros_devengados", "gastos_devengados"]}
        aggregated = aggregated.rename(columns=rename_map)

    return aggregated


def aggregate_by_company(df: pd.DataFrame, view_mode: ViewMode = "accumulated") -> pd.DataFrame:
    """Aggregate data by company, summing key metrics."""
    return aggregate_by(df, ["cod_cia", "nombre_corto"], view_mode=view_mode)


def aggregate_by_company_ramo(df: pd.DataFrame, view_mode: ViewMode = "accumulated") -> pd.DataFrame:
    """Aggregate data by company and ramo (for stacked charts)."""
    return aggregate_by(df, ["cod_cia", "nombre_corto", "ramo_nombre_corto"], view_mode=view_mode)


def aggregate_by_company_subramo(df: pd.DataFrame, view_mode: ViewMode = "accumulated") -> pd.DataFrame:
    """Aggregate data by company and subramo (for stacked charts when ramo selected)."""
    return aggregate_by(df, ["cod_cia", "nombre_corto", "subramo_nombre_corto"], view_mode=view_mode)


def aggregate_by_ramo(df: pd.DataFrame, view_mode: ViewMode = "accumulated") -> pd.DataFrame:
    """Aggregate data by ramo only."""
    return aggregate_by(df, ["ramo_nombre_corto"], view_mode=view_mode)


def aggregate_by_subramo(df: pd.DataFrame, view_mode: ViewMode = "accumulated") -> pd.DataFrame:
    """Aggregate data by subramo only."""
    return aggregate_by(df, ["subramo_nombre_corto"], view_mode=view_mode)


def get_totals(df: pd.DataFrame, view_mode: ViewMode = "accumulated") -> dict:
    """Calculate total market metrics from filtered data."""
    suffix = "_current" if view_mode == "current" else ""

    return {
        "total_primas_emitidas": df[f"primas_emitidas{suffix}"].sum() if f"primas_emitidas{suffix}" in df.columns else 0,
        "total_primas_devengadas": df[f"primas_devengadas{suffix}"].sum() if f"primas_devengadas{suffix}" in df.columns else 0,
        "total_siniestros": df[f"siniestros_devengados{suffix}"].sum() if f"siniestros_devengados{suffix}" in df.columns else 0,
        "entities_count": df["cod_cia"].nunique() if "cod_cia" in df.columns else 0,
    }


def format_currency(value: float, in_millions: bool = True) -> str:
    """Format number as Argentine currency (rounded, no decimals)."""
    if in_millions:
        value = value / 1_000_000

    # Round and format with Argentine style (. for thousands)
    formatted = f"{value:,.0f}".replace(",", ".")

    return f"$ {formatted} M" if in_millions else f"$ {formatted}"


def format_number(value: float) -> str:
    """Format number with Argentine style thousands separator."""
    return f"{value:,.0f}".replace(",", ".")
