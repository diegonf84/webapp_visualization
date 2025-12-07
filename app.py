from dash import Dash, html, dcc, callback, Output, Input, State, ctx
import dash_bootstrap_components as dbc

import config
from src.data.loader import get_data_loader
from src.logic.aggregations import (
    filter_data,
    aggregate_by_company,
    aggregate_by_company_ramo,
    aggregate_by_company_subramo,
    aggregate_by_ramo,
    aggregate_by_subramo,
    get_totals,
)
from src.logic.rankings import get_top_n
from src.components.charts import create_bar_chart, create_donut_chart
from src.components.kpi_cards import create_kpi_row
from src.components.filters import get_trimestre_q_label
from src.layouts.market_overview import create_market_overview_layout


# Initialize Dash app with Bootstrap theme
app = Dash(
    __name__,
    external_stylesheets=[dbc.themes.BOOTSTRAP],
    suppress_callback_exceptions=True,
    title="Mercado Asegurador Argentina",
)

server = app.server  # For deployment

# Load data on startup
loader = get_data_loader()

# App layout
app.layout = create_market_overview_layout()


# ============================================================================
# CALLBACKS
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
    """Main callback to update all dashboard components."""
    # Load and filter data
    df = loader.load_subramos()

    filtered_df = filter_data(
        df,
        year=year,
        trimestre=trimestre,
        ramo=ramo,  # Single value now
        companies=companies,
    )

    # Calculate totals for KPIs
    totals = get_totals(filtered_df, view_mode=view_mode)
    kpi_cards = create_kpi_row(totals)

    # Determine if we're viewing by ramo or subramo
    ramo_selected = ramo is not None and ramo != ""

    if ramo_selected:
        # When a ramo is selected: bar chart colored by subramo
        bar_data = aggregate_by_company_subramo(filtered_df, view_mode=view_mode)
        color_column = "subramo_nombre_corto"
        legend_title = "Subramos"
        color_palette = "subramos"  # Use distinct subramo palette
    else:
        # Default: bar chart colored by ramo
        bar_data = aggregate_by_company_ramo(filtered_df, view_mode=view_mode)
        color_column = "ramo_nombre_corto"
        legend_title = "Ramos"
        color_palette = "ramos"  # Use ramo palette

    # Get company totals for TOP-N selection
    company_totals = aggregate_by_company(filtered_df, view_mode=view_mode)
    top_companies = get_top_n(company_totals, n=top_n)
    top_company_names = top_companies["nombre_corto"].tolist()

    # Filter bar data to only include top N companies
    bar_data_filtered = bar_data[bar_data["nombre_corto"].isin(top_company_names)]

    # Create bar chart with appropriate color palette
    bar_fig = create_bar_chart(
        bar_data_filtered,
        x="nombre_corto",
        y="primas_emitidas",
        color=color_column,
        title="",
        color_palette=color_palette,
    )
    # Update legend title
    bar_fig.update_layout(legend_title=legend_title)

    # Donut chart: show subramos when ramo selected, otherwise show ramos
    if ramo_selected:
        donut_data = aggregate_by_subramo(filtered_df, view_mode=view_mode)
        donut_fig = create_donut_chart(
            donut_data,
            values="primas_emitidas",
            names="subramo_nombre_corto",
            title="",
            color_palette="subramos",  # Use subramo palette
        )
        donut_header = html.H5("SUBRAMOS", className="mb-0")
    else:
        donut_data = aggregate_by_ramo(filtered_df, view_mode=view_mode)
        donut_fig = create_donut_chart(
            donut_data,
            values="primas_emitidas",
            names="ramo_nombre_corto",
            title="",
            color_palette="ramos",  # Use ramo palette
        )
        donut_header = html.H5("RAMOS", className="mb-0")

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
    print(f"Starting dashboard server on http://{config.HOST}:{config.PORT}")
    app.run(
        host=config.HOST,
        port=config.PORT,
        debug=config.DEBUG,
    )
