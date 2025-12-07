import os
import pandas as pd
from functools import lru_cache

import config


class DataLoader:
    """Handles loading data from local files or S3."""

    def __init__(self):
        self.data_source = config.DATA_SOURCE
        self._subramos_df = None
        self._otros_conceptos_df = None

    def _get_local_path(self, filename: str) -> str:
        """Get full path for local file, checking parquet then csv."""
        base_name = filename.replace(".parquet", "").replace(".csv", "")

        # Try parquet first
        parquet_path = os.path.join(config.LOCAL_DATA_DIR, f"{base_name}.parquet")
        if os.path.exists(parquet_path):
            return parquet_path

        # Fall back to CSV
        csv_path = os.path.join(config.LOCAL_DATA_DIR, f"{base_name}.csv")
        if os.path.exists(csv_path):
            return csv_path

        # Try with _sample suffix for development
        sample_csv = os.path.join(config.LOCAL_DATA_DIR, f"{base_name}_sample.csv")
        if os.path.exists(sample_csv):
            return sample_csv

        raise FileNotFoundError(f"No data file found for {filename}")

    def _load_file(self, filepath: str) -> pd.DataFrame:
        """Load a single file (parquet or csv)."""
        if filepath.endswith(".parquet"):
            return pd.read_parquet(filepath)
        else:
            return pd.read_csv(filepath)

    def _load_from_s3(self, filename: str) -> pd.DataFrame:
        """Load file from S3 bucket."""
        import s3fs

        s3_path = f"s3://{config.S3_BUCKET}/{config.S3_PREFIX}/{filename}"

        if filename.endswith(".parquet"):
            return pd.read_parquet(s3_path)
        else:
            return pd.read_csv(s3_path)

    def load_subramos(self, force_reload: bool = False) -> pd.DataFrame:
        """Load subramos historico dataset."""
        if self._subramos_df is None or force_reload:
            if self.data_source == "s3":
                self._subramos_df = self._load_from_s3(config.SUBRAMOS_FILE)
            else:
                filepath = self._get_local_path(config.SUBRAMOS_FILE)
                self._subramos_df = self._load_file(filepath)

            # Ensure proper types
            self._subramos_df = self._prepare_subramos(self._subramos_df)

        return self._subramos_df

    def load_otros_conceptos(self, force_reload: bool = False) -> pd.DataFrame:
        """Load otros conceptos historico dataset."""
        if self._otros_conceptos_df is None or force_reload:
            if self.data_source == "s3":
                self._otros_conceptos_df = self._load_from_s3(config.OTROS_CONCEPTOS_FILE)
            else:
                filepath = self._get_local_path(config.OTROS_CONCEPTOS_FILE)
                self._otros_conceptos_df = self._load_file(filepath)

        return self._otros_conceptos_df

    def _prepare_subramos(self, df: pd.DataFrame) -> pd.DataFrame:
        """Prepare subramos dataframe with proper types and derived columns."""
        df = df.copy()

        # Extract year and trimestre from periodo (format: YYYYTT where TT is 01, 02, 03, 04)
        periodo_str = df["periodo"].astype(str)
        df["year"] = periodo_str.str[:4].astype(int)
        df["trimestre"] = periodo_str.str[-2:]  # Last 2 digits: 01, 02, 03, 04

        # Ensure numeric columns
        numeric_cols = [
            "primas_emitidas", "primas_devengadas",
            "siniestros_devengados", "gastos_devengados"
        ]
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

        # Fill missing company names
        if "nombre_corto" in df.columns:
            df["nombre_corto"] = df["nombre_corto"].fillna("Sin nombre")

        return df

    def get_filter_options(self) -> dict:
        """Get unique values for all filter dropdowns."""
        df = self.load_subramos()

        return {
            "years": sorted(df["year"].unique(), reverse=True),
            "trimestres": sorted(df["trimestre"].unique()),  # 01, 02, 03, 04
            "ramos": sorted(df["ramo_nombre_corto"].dropna().unique()),
            "subramos": sorted(df["subramo_nombre_corto"].dropna().unique()),
            "companies": sorted(df["nombre_corto"].dropna().unique()),
        }

    def get_subramos_for_ramos(self, ramos: list) -> list:
        """Get subramos filtered by selected ramos (for cascading filter)."""
        df = self.load_subramos()

        if not ramos:
            return sorted(df["subramo_nombre_corto"].dropna().unique())

        filtered = df[df["ramo_nombre_corto"].isin(ramos)]
        return sorted(filtered["subramo_nombre_corto"].dropna().unique())


# Singleton instance
_data_loader = None

def get_data_loader() -> DataLoader:
    """Get or create singleton DataLoader instance."""
    global _data_loader
    if _data_loader is None:
        _data_loader = DataLoader()
    return _data_loader
