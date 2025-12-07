import pandas as pd
from typing import Optional


def get_top_n(
    df: pd.DataFrame,
    n: Optional[int] = None,
    metric: str = "primas_emitidas",
    group_col: str = "nombre_corto",
) -> pd.DataFrame:
    """
    Get top N records by metric.

    Important: This should be called AFTER filtering and aggregation.
    Flow: filter -> aggregate -> get_top_n

    Args:
        df: Pre-aggregated dataframe
        n: Number of top records (None = all)
        metric: Column to sort by
        group_col: Column used for grouping/identification

    Returns:
        DataFrame with top N records sorted by metric descending
    """
    if metric not in df.columns:
        return df

    # Sort by metric descending
    sorted_df = df.sort_values(metric, ascending=False)

    # Apply top-N limit if specified
    if n is not None and n > 0:
        sorted_df = sorted_df.head(n)

    return sorted_df


def get_top_n_with_others(
    df: pd.DataFrame,
    n: int,
    metric: str = "primas_emitidas",
    group_col: str = "nombre_corto",
) -> pd.DataFrame:
    """
    Get top N records and aggregate the rest as 'Otros'.

    Useful for charts where you want to show top N + an "Others" category.
    """
    if metric not in df.columns or n <= 0:
        return df

    sorted_df = df.sort_values(metric, ascending=False)

    top_n = sorted_df.head(n).copy()

    if len(sorted_df) > n:
        others = sorted_df.tail(len(sorted_df) - n)
        others_row = {
            group_col: "Otros",
            metric: others[metric].sum()
        }
        # Add other numeric columns if they exist
        for col in df.select_dtypes(include=["number"]).columns:
            if col != metric and col in others.columns:
                others_row[col] = others[col].sum()

        others_df = pd.DataFrame([others_row])
        top_n = pd.concat([top_n, others_df], ignore_index=True)

    return top_n


def calculate_ranking(
    df: pd.DataFrame,
    metric: str = "primas_emitidas",
) -> pd.DataFrame:
    """Add ranking column based on metric."""
    df = df.copy()
    df["ranking"] = df[metric].rank(ascending=False, method="min").astype(int)
    return df.sort_values("ranking")


def calculate_market_share(
    df: pd.DataFrame,
    metric: str = "primas_emitidas",
) -> pd.DataFrame:
    """Add market share percentage column."""
    df = df.copy()
    total = df[metric].sum()

    if total > 0:
        df["market_share"] = (df[metric] / total * 100).round(2)
    else:
        df["market_share"] = 0.0

    return df
