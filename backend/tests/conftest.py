"""Shared fixtures for backend tests."""

import pandas as pd
import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import get_loader
from app.main import app


class MockDataLoader:
    """In-memory DataLoader returning a small DataFrame for tests."""

    def __init__(self, df: pd.DataFrame):
        self._df = df

    def load_subramos(self) -> pd.DataFrame:
        return self._df

    def load_otros_conceptos(self) -> pd.DataFrame:
        return pd.DataFrame()


def _build_sample_df() -> pd.DataFrame:
    """Build a minimal subramos DataFrame for comparison tests.

    Three companies of the same tipo_cia, two ramos, one period.
    """
    rows = [
        # Company A — large, diversified
        {"periodo": "202404", "cod_cia": "A001", "nombre_corto": "Company A", "tipo_cia": "Generales",
         "ramo_nombre_corto": "Automotor", "primas_emitidas": 500_000_000},
        {"periodo": "202404", "cod_cia": "A001", "nombre_corto": "Company A", "tipo_cia": "Generales",
         "ramo_nombre_corto": "Hogar", "primas_emitidas": 300_000_000},
        # Company B — mid-sized, focused on Automotor
        {"periodo": "202404", "cod_cia": "B002", "nombre_corto": "Company B", "tipo_cia": "Generales",
         "ramo_nombre_corto": "Automotor", "primas_emitidas": 200_000_000},
        {"periodo": "202404", "cod_cia": "B002", "nombre_corto": "Company B", "tipo_cia": "Generales",
         "ramo_nombre_corto": "Hogar", "primas_emitidas": 50_000_000},
        # Company C — small, similar mix to A
        {"periodo": "202404", "cod_cia": "C003", "nombre_corto": "Company C", "tipo_cia": "Generales",
         "ramo_nombre_corto": "Automotor", "primas_emitidas": 100_000_000},
        {"periodo": "202404", "cod_cia": "C003", "nombre_corto": "Company C", "tipo_cia": "Generales",
         "ramo_nombre_corto": "Hogar", "primas_emitidas": 80_000_000},
    ]
    return pd.DataFrame(rows)


@pytest.fixture()
def mock_loader():
    """Return a MockDataLoader with sample data."""
    return MockDataLoader(_build_sample_df())


@pytest.fixture()
def client(mock_loader):
    """Return a TestClient with get_loader overridden."""
    app.dependency_overrides[get_loader] = lambda: mock_loader
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
