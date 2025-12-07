import pandas as pd


def calculate_siniestralidad(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate loss ratio (siniestralidad)."""
    df = df.copy()

    if "siniestros_devengados" in df.columns and "primas_devengadas" in df.columns:
        df["siniestralidad"] = (
            df["siniestros_devengados"] / df["primas_devengadas"].replace(0, float("nan"))
        ) * 100
        df["siniestralidad"] = df["siniestralidad"].fillna(0).round(2)

    return df


def calculate_expense_ratio(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate expense ratio."""
    df = df.copy()

    if "gastos_devengados" in df.columns and "primas_devengadas" in df.columns:
        df["ratio_gastos"] = (
            df["gastos_devengados"] / df["primas_devengadas"].replace(0, float("nan"))
        ) * 100
        df["ratio_gastos"] = df["ratio_gastos"].fillna(0).round(2)

    return df


def calculate_combined_ratio(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate combined ratio (siniestralidad + gastos)."""
    df = calculate_siniestralidad(df)
    df = calculate_expense_ratio(df)

    if "siniestralidad" in df.columns and "ratio_gastos" in df.columns:
        df["combined_ratio"] = df["siniestralidad"] + df["ratio_gastos"]

    return df


def calculate_all_ratios(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate all standard insurance ratios."""
    return calculate_combined_ratio(df)
