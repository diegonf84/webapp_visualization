from dash import html, dcc
import dash_bootstrap_components as dbc

from src.components.filters import create_filters, create_top_n_selector, create_view_mode_toggle
from src.components.kpi_cards import create_kpi_row
from src.data.loader import get_data_loader


def create_market_overview_layout() -> html.Div:
    """Create the Market Overview dashboard layout."""
    loader = get_data_loader()
    filter_options = loader.get_filter_options()

    return html.Div([
        # Header
        dbc.Container([
            dbc.Row([
                dbc.Col([
                    html.H2("Mercado Asegurador Argentino", className="text-primary mb-0"),
                    html.P("Dashboard de Producción", className="text-muted"),
                ], md=6),
                dbc.Col([
                    create_view_mode_toggle(),
                ], md=3, className="d-flex align-items-center justify-content-center"),
                dbc.Col([
                    html.Div(id="header-period-display", className="text-end"),
                    html.Div(id="view-mode-indicator", className="text-end mt-2"),
                ], md=3),
            ], className="py-3 border-bottom mb-4"),
        ], fluid=True),

        # Filters
        dbc.Container([
            create_filters(filter_options),
        ], fluid=True),

        # KPI Cards (will be updated by callback)
        dbc.Container([
            html.Div(id="kpi-cards-container"),
        ], fluid=True),

        # Charts Row
        dbc.Container([
            dbc.Row([
                # Main Bar Chart
                dbc.Col([
                    dbc.Card([
                        dbc.CardHeader([
                            html.H5("TOTAL DEL MERCADO", className="mb-0"),
                        ]),
                        dbc.CardBody([
                            dcc.Loading(
                                dcc.Graph(id="chart-market-bars", style={"height": "500px"}),
                                type="circle",
                            ),
                            create_top_n_selector(),
                        ]),
                    ], className="shadow-sm"),
                ], md=8),

                # Donut Chart
                dbc.Col([
                    dbc.Card([
                        dbc.CardHeader([
                            html.H5("RAMOS", className="mb-0", id="donut-card-header"),
                        ]),
                        dbc.CardBody([
                            dcc.Loading(
                                dcc.Graph(id="chart-ramo-donut", style={"height": "500px"}),
                                type="circle",
                            ),
                        ]),
                    ], className="shadow-sm"),
                ], md=4),
            ], className="mb-4"),
        ], fluid=True),

        # Footer
        dbc.Container([
            html.Hr(),
            html.P(
                "Fuente: Superintendencia de Seguros de la Nación",
                className="text-muted text-center small"
            ),
        ], fluid=True),

    ], className="dashboard-container")
