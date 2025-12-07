"""
Dash app that uses the FastAPI backend instead of direct data access.
Use this to test that the API returns identical results to the original app.

Run the backend first:   cd backend && uvicorn app.main:app --reload --port 8000
Run this app:            python app_api.py  (runs on port 8051)
Compare with original:   python app.py      (runs on port 8050)
"""

import os
import requests
import pandas as pd
from dash import Dash, html, dcc, callback, Output, Input, State, ctx
import dash_bootstrap_components as dbc

import config
from src.components.charts import create_bar_chart, create_donut_chart
from src.components.kpi_cards import create_kpi_row
from src.components.filters import get_trimestre_q_label
from src.layouts.market_overview import create_market_overview_layout


# API Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
API_TIMEOUT = 10  # seconds


def api_get(endpoint: str, params: dict = None) -> dict:
    """Make a GET request to the API."""
    url = f"{API_BASE_URL}{endpoint}"
    try:
        response = requests.get(url, params=params, timeout=API_TIMEOUT)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"API Error: {e}")
        return None


# Initialize Dash app with Bootstrap theme
app = Dash(
    __name__,
    external_stylesheets=[dbc.themes.BOOTSTRAP],
    suppress_callback_exceptions=True,
    title="Mercado Asegurador Argentina (API)",
)

server = app.server  # For deployment

# App layout (same as original)
app.layout = create_market_overview_layout()


# ============================================================================
# CALLBACKS (UI callbacks are identical to original)
# ============================================================================

@callback(
    Output("store-top-n", "data"),
    Input("btn-top-10", "n_clicks"),
    Input("btn-top-15", "n_clicks"),
    Input("btn-top-20", "n_clicks"),
    Input("btn-top-50", "n_clicks"),
    prevent_initial_call=True,
)
def update_top_n(n10, n15, n20, n50):
    """Update TOP-N selection from button clicks."""
    triggered = ctx.triggered_id
    if triggered == "btn-top-10":
        return 10
    elif triggered == "btn-top-15":
        return 15
    elif triggered == "btn-top-20":
        return 20
    elif triggered == "btn-top-50":
        return 50
    return 15  # Default


@callback(
    Output("btn-top-10", "outline"),
    Output("btn-top-15", "outline"),
    Output("btn-top-20", "outline"),
    Output("btn-top-50", "outline"),
    Input("store-top-n", "data"),
)
def update_button_styles(top_n):
    """Update button styles to show active selection."""
    return (
        top_n != 10,  # outline=False when selected (filled)
        top_n != 15,
        top_n != 20,
        top_n != 50,
    )


@callback(
    Output("store-view-mode", "data"),
    Input("btn-view-accumulated", "n_clicks"),
    Input("btn-view-current", "n_clicks"),
    prevent_initial_call=True,
)
def update_view_mode(n_accumulated, n_current):
    """Update view mode selection from button clicks."""
    triggered = ctx.triggered_id
    if triggered == "btn-view-accumulated":
        return "accumulated"
    elif triggered == "btn-view-current":
        return "current"
    return "accumulated"  # Default


@callback(
    Output("btn-view-accumulated", "outline"),
    Output("btn-view-current", "outline"),
    Input("store-view-mode", "data"),
)
def update_view_mode_button_styles(view_mode):
    """Update view mode button styles to show active selection."""
    return (
        view_mode != "accumulated",  # outline=False when selected (filled)
        view_mode != "current",
    )


@callback(
    Output("kpi-cards-container", "children"),
    Output("chart-market-bars", "figure"),
    Output("chart-ramo-donut", "figure"),
    Output("header-period-display", "children"),
    Output("donut-card-header", "children"),
    Output("view-mode-indicator", "children"),
    Input("filter-year", "value"),
    Input("filter-trimestre", "value"),
    Input("filter-ramo", "value"),
    Input("filter-company", "value"),
    Input("store-top-n", "data"),
    Input("store-view-mode", "data"),
)
def update_dashboard(year, trimestre, ramo, companies, top_n, view_mode):
    """Main callback to update all dashboard components using API."""

    # Build common query params
    params = {
        "year": year,
        "quarter": trimestre,
        "view_mode": view_mode,
    }
    if ramo:
        params["ramo"] = ramo
    if companies:
        params["companies"] = ",".join(companies) if isinstance(companies, list) else companies

    # --- Fetch KPIs from API ---
    kpis_response = api_get("/api/data/kpis", params)
    if kpis_response:
        # Map API response keys to keys expected by create_kpi_row()
        totals = {
            "total_primas_emitidas": kpis_response.get("primas_emitidas", 0),
            "total_primas_devengadas": kpis_response.get("primas_devengadas", 0),
            "total_siniestros": kpis_response.get("siniestros_devengados", 0),
            "entities_count": kpis_response.get("entities_count", 0),
        }
    else:
        totals = {
            "total_primas_emitidas": 0,
            "total_primas_devengadas": 0,
            "total_siniestros": 0,
            "entities_count": 0,
        }
    kpi_cards = create_kpi_row(totals)

    # Determine if we're viewing by ramo or subramo
    ramo_selected = ramo is not None and ramo != ""

    # --- Fetch Company Ranking from API ---
    ranking_params = {**params, "top_n": top_n}
    ranking_response = api_get("/api/data/companies/ranking", ranking_params)

    if ranking_response and ranking_response.get("companies"):
        # Convert API response to DataFrame for chart
        companies_data = ranking_response["companies"]
        bar_data = pd.DataFrame(companies_data)

        if ramo_selected:
            color_column = "subramo_nombre_corto"
            legend_title = "Subramos"
            color_palette = "subramos"
        else:
            color_column = "ramo_nombre_corto"
            legend_title = "Ramos"
            color_palette = "ramos"

        # Create bar chart
        bar_fig = create_bar_chart(
            bar_data,
            x="nombre_corto",
            y="primas_emitidas",
            color=color_column,
            title="",
            color_palette=color_palette,
        )
        bar_fig.update_layout(legend_title=legend_title)
    else:
        # Empty chart on error
        bar_fig = create_bar_chart(
            pd.DataFrame(columns=["nombre_corto", "primas_emitidas", "ramo_nombre_corto"]),
            x="nombre_corto",
            y="primas_emitidas",
            color="ramo_nombre_corto",
            title="",
            color_palette="ramos",
        )

    # --- Fetch Distribution from API ---
    if ramo_selected:
        dist_response = api_get("/api/data/distribution/subramos", params)
        name_column = "subramo_nombre_corto"
        donut_palette = "subramos"
        donut_header = html.H5("SUBRAMOS", className="mb-0")
    else:
        dist_response = api_get("/api/data/distribution/ramos", params)
        name_column = "ramo_nombre_corto"
        donut_palette = "ramos"
        donut_header = html.H5("RAMOS", className="mb-0")

    if dist_response and dist_response.get("items"):
        # Convert API response to DataFrame for chart
        items_data = dist_response["items"]
        donut_data = pd.DataFrame(items_data)
        # Rename 'name' to the expected column name
        donut_data = donut_data.rename(columns={"name": name_column, "value": "primas_emitidas"})

        donut_fig = create_donut_chart(
            donut_data,
            values="primas_emitidas",
            names=name_column,
            title="",
            color_palette=donut_palette,
        )
    else:
        # Empty chart on error
        donut_fig = create_donut_chart(
            pd.DataFrame(columns=[name_column, "primas_emitidas"]),
            values="primas_emitidas",
            names=name_column,
            title="",
            color_palette=donut_palette,
        )

    # Period display with Q format (Q1, Q2, Q3, Q4)
    q_label = get_trimestre_q_label(trimestre) if trimestre else ""
    period_text = f"{year} - {q_label}" if year and trimestre else "Todos los períodos"
    period_display = html.Div([
        html.Span("Período: ", className="text-muted"),
        html.Strong(period_text, className="text-primary"),
    ])

    # View mode indicator
    view_mode_text = "Datos Acumulados" if view_mode == "accumulated" else "Datos del Período Corriente"
    view_mode_indicator = html.Div([
        html.Span(view_mode_text, className="badge bg-info text-dark"),
    ])

    return kpi_cards, bar_fig, donut_fig, period_display, donut_header, view_mode_indicator


# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == "__main__":
    # Run on different port than original app (8051 vs 8050)
    port = int(os.getenv("DASH_API_PORT", "8051"))
    print(f"")
    print(f"=== Dash App (API Backend) ===")
    print(f"Starting on http://{config.HOST}:{port}")
    print(f"API Backend URL: {API_BASE_URL}")
    print(f"")
    print(f"Make sure the FastAPI backend is running:")
    print(f"  cd backend && uvicorn app.main:app --reload --port 8000")
    print(f"")
    app.run(
        host=config.HOST,
        port=port,
        debug=config.DEBUG,
    )
