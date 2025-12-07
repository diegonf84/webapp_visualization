from dash import html
import dash_bootstrap_components as dbc

from src.logic.aggregations import format_currency, format_number


def create_kpi_card(title: str, value: str, icon: str = None) -> dbc.Card:
    """Create a single KPI card."""
    return dbc.Card([
        dbc.CardBody([
            html.P(title, className="kpi-title text-muted mb-1 small text-uppercase"),
            html.H3(value, className="kpi-value mb-0 text-primary fw-bold"),
        ], className="text-center py-3"),
    ], className="kpi-card h-100 shadow-sm")


def create_kpi_row(totals: dict) -> dbc.Row:
    """Create the row of KPI cards."""
    return dbc.Row([
        dbc.Col(
            create_kpi_card(
                "ENTIDADES CON EMISIÓN",
                format_number(totals.get("entities_count", 0))
            ),
            md=3,
        ),
        dbc.Col(
            create_kpi_card(
                "TOTAL DE PRODUCCIÓN",
                format_currency(totals.get("total_primas_emitidas", 0))
            ),
            md=3,
        ),
        dbc.Col(
            create_kpi_card(
                "PRIMAS DEVENGADAS",
                format_currency(totals.get("total_primas_devengadas", 0))
            ),
            md=3,
        ),
        dbc.Col(
            create_kpi_card(
                "SINIESTROS DEVENGADOS",
                format_currency(totals.get("total_siniestros", 0))
            ),
            md=3,
        ),
    ], className="kpi-row mb-4")
