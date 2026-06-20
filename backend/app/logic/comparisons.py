"""
Comparison logic for company benchmarking.

Three comparison methods:
1. Total Percentile: Compare by total primas_emitidas ranking
2. Main Ramo Percentile: Compare by primas in company's main ramo
3. Ramo Similarity: Compare by similarity in ramo distribution
"""

import pandas as pd
from typing import Dict, List, Tuple, Optional


def get_company_ramo_distribution(
    df: pd.DataFrame,
    cod_cia: str
) -> Tuple[pd.DataFrame, float]:
    """
    Calculate the percentage distribution of ramos for a company.

    Args:
        df: DataFrame filtered by period (and optionally tipo_cia)
        cod_cia: Company code

    Returns:
        Tuple of (distribution DataFrame with columns: ramo, primas_emitidas, percentage), total_primas
    """
    company_df = df[df["cod_cia"] == cod_cia]

    if company_df.empty:
        return pd.DataFrame(columns=["ramo_nombre_corto", "primas_emitidas", "percentage"]), 0.0

    ramo_totals = (
        company_df.groupby("ramo_nombre_corto")["primas_emitidas"]
        .sum()
        .reset_index()
    )

    total_primas = ramo_totals["primas_emitidas"].sum()

    if total_primas > 0:
        ramo_totals["percentage"] = (
            ramo_totals["primas_emitidas"] / total_primas * 100
        )
    else:
        ramo_totals["percentage"] = 0.0

    return ramo_totals.sort_values("percentage", ascending=False), total_primas


def get_main_ramo(ramo_distribution: pd.DataFrame) -> Tuple[Optional[str], float]:
    """
    Get the main ramo (highest percentage) from distribution.

    Args:
        ramo_distribution: DataFrame with ramo distribution

    Returns:
        Tuple of (ramo_name, percentage). Returns (None, 0.0) if empty.
    """
    if ramo_distribution.empty:
        return None, 0.0

    top_row = ramo_distribution.iloc[0]
    return top_row["ramo_nombre_corto"], top_row["percentage"]


def compare_by_total_percentile(
    df: pd.DataFrame,
    cod_cia: str,
    tipo_cia: str,
    n_above: int = 5,
    n_below: int = 5
) -> Dict:
    """
    Method 1: Compare by total production percentile.

    Rank all companies of same tipo by total primas_emitidas,
    select n companies above and n below the selected company.

    Args:
        df: DataFrame filtered to latest period
        cod_cia: Selected company code
        tipo_cia: Company type filter
        n_above: Number of companies above to return
        n_below: Number of companies below to return

    Returns:
        Dict with 'selected', 'above', 'below', 'total_in_tipo'
    """
    # Filter by tipo_cia
    tipo_df = df[df["tipo_cia"] == tipo_cia]

    # Aggregate by company - sum primas_emitidas across all ramos
    company_totals = (
        tipo_df.groupby(["cod_cia", "nombre_corto", "tipo_cia"])["primas_emitidas"]
        .sum()
        .reset_index()
        .sort_values("primas_emitidas", ascending=False)
        .reset_index(drop=True)
    )

    # Add ranking (1-based)
    company_totals["ranking"] = range(1, len(company_totals) + 1)

    # Find selected company position
    selected_mask = company_totals["cod_cia"] == cod_cia
    selected_idx = company_totals[selected_mask].index

    if len(selected_idx) == 0:
        raise ValueError(f"Company {cod_cia} not found in tipo {tipo_cia}")

    selected_pos = selected_idx[0]
    selected_ranking = company_totals.loc[selected_pos, "ranking"]

    # Get companies above (better ranked = lower index)
    start_above = max(0, selected_pos - n_above)
    above_df = company_totals.iloc[start_above:selected_pos].copy()
    above_df["relative_position"] = above_df["ranking"] - selected_ranking

    # Get companies below (worse ranked = higher index)
    end_below = min(len(company_totals), selected_pos + 1 + n_below)
    below_df = company_totals.iloc[selected_pos + 1:end_below].copy()
    below_df["relative_position"] = below_df["ranking"] - selected_ranking

    # Get selected company data
    selected_row = company_totals.iloc[selected_pos].to_dict()
    selected_row["relative_position"] = 0

    return {
        "selected": selected_row,
        "above": above_df.to_dict("records"),
        "below": below_df.to_dict("records"),
        "total_in_tipo": len(company_totals),
    }


def compare_by_main_ramo_percentile(
    df: pd.DataFrame,
    cod_cia: str,
    tipo_cia: str,
    n_above: int = 5,
    n_below: int = 5
) -> Dict:
    """
    Method 2: Compare by main ramo percentile.

    1. Calculate ramo distribution for selected company
    2. Identify main ramo (highest percentage)
    3. Filter companies operating in that ramo
    4. Rank by primas in that specific ramo
    5. Select n above and n below

    Args:
        df: DataFrame filtered to latest period
        cod_cia: Selected company code
        tipo_cia: Company type filter
        n_above: Number of companies above
        n_below: Number of companies below

    Returns:
        Dict with comparison data including main_ramo info
    """
    # Filter by tipo_cia
    tipo_df = df[df["tipo_cia"] == tipo_cia]

    # Get selected company's ramo distribution
    ramo_dist, total_primas = get_company_ramo_distribution(tipo_df, cod_cia)

    if ramo_dist.empty:
        raise ValueError(f"Company {cod_cia} has no ramo data")

    # Get main ramo
    main_ramo, main_ramo_pct = get_main_ramo(ramo_dist)

    if main_ramo is None:
        raise ValueError(f"Could not determine main ramo for company {cod_cia}")

    # Filter data to only main ramo
    ramo_df = tipo_df[tipo_df["ramo_nombre_corto"] == main_ramo]

    # Aggregate by company within this ramo
    company_ramo_totals = (
        ramo_df.groupby(["cod_cia", "nombre_corto", "tipo_cia"])
        .agg({"primas_emitidas": "sum"})
        .reset_index()
        .rename(columns={"primas_emitidas": "main_ramo_primas"})
        .sort_values("main_ramo_primas", ascending=False)
        .reset_index(drop=True)
    )

    # Add total primas for each company (across all ramos)
    total_by_company = (
        tipo_df.groupby("cod_cia")["primas_emitidas"]
        .sum()
        .reset_index()
        .rename(columns={"primas_emitidas": "primas_emitidas_total"})
    )
    company_ramo_totals = company_ramo_totals.merge(total_by_company, on="cod_cia", how="left")
    company_ramo_totals["primas_emitidas"] = company_ramo_totals["primas_emitidas_total"]

    # Add ranking (1-based)
    company_ramo_totals["ranking"] = range(1, len(company_ramo_totals) + 1)

    # Find selected company position
    selected_mask = company_ramo_totals["cod_cia"] == cod_cia
    selected_idx = company_ramo_totals[selected_mask].index

    if len(selected_idx) == 0:
        raise ValueError(f"Company {cod_cia} not found in ramo {main_ramo}")

    selected_pos = selected_idx[0]
    selected_ranking = company_ramo_totals.loc[selected_pos, "ranking"]

    # Get companies above and below
    start_above = max(0, selected_pos - n_above)
    above_df = company_ramo_totals.iloc[start_above:selected_pos].copy()
    above_df["relative_position"] = above_df["ranking"] - selected_ranking

    end_below = min(len(company_ramo_totals), selected_pos + 1 + n_below)
    below_df = company_ramo_totals.iloc[selected_pos + 1:end_below].copy()
    below_df["relative_position"] = below_df["ranking"] - selected_ranking

    # Get selected company data
    selected_row = company_ramo_totals.iloc[selected_pos].to_dict()
    selected_row["relative_position"] = 0

    return {
        "selected": selected_row,
        "above": above_df.to_dict("records"),
        "below": below_df.to_dict("records"),
        "main_ramo": main_ramo,
        "main_ramo_percentage": round(main_ramo_pct, 2),
        "total_companies_with_ramo": len(company_ramo_totals),
        "total_in_tipo": tipo_df["cod_cia"].nunique(),
    }


def compare_by_ramo_similarity(
    df: pd.DataFrame,
    cod_cia: str,
    tipo_cia: str,
    n_similar: int = 10
) -> Dict:
    """
    Method 3: Compare by ramo distribution similarity.

    1. Calculate percentage distribution of ramos for selected company
    2. For each other company, calculate same distribution
    3. Sum absolute differences ramo by ramo
    4. Return n companies with smallest total distance

    Args:
        df: DataFrame filtered to latest period
        cod_cia: Selected company code
        tipo_cia: Company type filter
        n_similar: Number of similar companies to return

    Returns:
        Dict with selected company and similar companies with distances
    """
    # Filter by tipo_cia
    tipo_df = df[df["tipo_cia"] == tipo_cia]

    # Get all unique companies
    all_companies = tipo_df["cod_cia"].unique()

    # Get selected company's ramo distribution
    selected_dist, selected_total = get_company_ramo_distribution(tipo_df, cod_cia)

    if selected_dist.empty:
        raise ValueError(f"Company {cod_cia} has no ramo data")

    # Convert to dict for easy lookup: {ramo: percentage}
    selected_pct_dict = dict(
        zip(selected_dist["ramo_nombre_corto"], selected_dist["percentage"])
    )

    # Get all unique ramos in the market (for this tipo)
    all_ramos = tipo_df["ramo_nombre_corto"].unique()

    # Calculate distance for each company
    distances = []

    for company in all_companies:
        if company == cod_cia:
            continue

        # Get this company's distribution
        comp_dist, comp_total = get_company_ramo_distribution(tipo_df, company)

        if comp_dist.empty or comp_total == 0:
            continue

        comp_pct_dict = dict(
            zip(comp_dist["ramo_nombre_corto"], comp_dist["percentage"])
        )

        # Calculate total absolute difference across all ramos
        total_distance = 0.0
        for ramo in all_ramos:
            selected_pct = selected_pct_dict.get(ramo, 0.0)
            comp_pct = comp_pct_dict.get(ramo, 0.0)
            total_distance += abs(selected_pct - comp_pct)

        # Get company info
        company_rows = tipo_df[tipo_df["cod_cia"] == company]
        company_info = company_rows.iloc[0]

        distances.append({
            "cod_cia": company,
            "nombre_corto": company_info["nombre_corto"],
            "tipo_cia": company_info["tipo_cia"],
            "primas_emitidas": comp_total,
            "similarity_distance": round(total_distance, 2),
        })

    # Sort by distance (ascending - lower = more similar)
    distances.sort(key=lambda x: x["similarity_distance"])

    # Take top n similar
    similar_companies = distances[:n_similar]

    # Add ranking position (similarity rank)
    for idx, company in enumerate(similar_companies):
        company["ranking_position"] = idx + 1

    # Get selected company info
    selected_rows = tipo_df[tipo_df["cod_cia"] == cod_cia]
    selected_info = selected_rows.iloc[0]

    return {
        "selected": {
            "cod_cia": cod_cia,
            "nombre_corto": selected_info["nombre_corto"],
            "tipo_cia": selected_info["tipo_cia"],
            "primas_emitidas": selected_total,
            "ranking_position": 0,  # Selected company is reference point
        },
        "similar_companies": similar_companies,
        "total_in_tipo": len(all_companies),
    }
