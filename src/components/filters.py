from dash import html, dcc
import dash_bootstrap_components as dbc

import config


# Periodo ending to Spanish month mapping
# periodo ending 01 = March, 02 = June, 03 = September, 04 = December
TRIMESTRE_LABELS = {
    "01": "Marzo",
    "02": "Junio",
    "03": "Septiembre",
    "04": "Diciembre",
}

# Periodo ending to Q format (for display)
# Fiscal year starts in July: Q1=Jul-Sep, Q2=Oct-Dec, Q3=Jan-Mar, Q4=Apr-Jun
TRIMESTRE_TO_Q = {
    "01": "Q3",  # March (end of Q3)
    "02": "Q4",  # June (end of Q4)
    "03": "Q1",  # September (end of Q1)
    "04": "Q2",  # December (end of Q2)
}


def create_filters(filter_options: dict) -> dbc.Row:
    """Create the main filter row for the dashboard."""
    # Create trimestre options with Spanish month labels
    # Values are periodo endings: 01, 02, 03, 04
    trimestre_options = [
        {"label": TRIMESTRE_LABELS.get(t, t), "value": t}
        for t in filter_options["trimestres"]
    ]

    return dbc.Row([
        # Year filter
        dbc.Col([
            html.Label("AÑO", className="filter-label text-muted small mb-1"),
            dcc.Dropdown(
                id="filter-year",
                options=[{"label": str(y), "value": y} for y in filter_options["years"]],
                value=filter_options["years"][0] if filter_options["years"] else None,
                clearable=False,
                className="filter-dropdown",
            ),
        ], md=2, className="mb-2"),

        # Trimestre filter (Spanish months, values are 01, 02, 03, 04)
        dbc.Col([
            html.Label("TRIMESTRE", className="filter-label text-muted small mb-1"),
            dcc.Dropdown(
                id="filter-trimestre",
                options=trimestre_options,
                value=filter_options["trimestres"][0] if filter_options["trimestres"] else None,
                clearable=False,
                className="filter-dropdown",
            ),
        ], md=2, className="mb-2"),

        # Ramo filter (single select)
        dbc.Col([
            html.Label("RAMO", className="filter-label text-muted small mb-1"),
            dcc.Dropdown(
                id="filter-ramo",
                options=[{"label": r, "value": r} for r in filter_options["ramos"]],
                value=None,
                multi=False,
                placeholder="Todos los ramos",
                className="filter-dropdown",
                clearable=True,
            ),
        ], md=3, className="mb-2"),

        # Company filter (multi select)
        dbc.Col([
            html.Label("ENTIDAD", className="filter-label text-muted small mb-1"),
            dcc.Dropdown(
                id="filter-company",
                options=[{"label": c, "value": c} for c in filter_options["companies"]],
                value=None,
                multi=True,
                placeholder="Todas las entidades",
                className="filter-dropdown",
            ),
        ], md=3, className="mb-2"),

    ], className="filters-row mb-4 p-3 bg-light rounded")


def create_top_n_selector() -> html.Div:
    """Create the TOP N selector buttons."""
    return html.Div([
        dbc.ButtonGroup([
            dbc.Button("TOP 10", id="btn-top-10", color="primary", outline=True, className="top-n-btn"),
            dbc.Button("TOP 15", id="btn-top-15", color="primary", outline=True, className="top-n-btn"),
            dbc.Button("TOP 20", id="btn-top-20", color="primary", outline=True, className="top-n-btn"),
            dbc.Button("TOP 50", id="btn-top-50", color="primary", outline=True, className="top-n-btn"),
        ]),
        dcc.Store(id="store-top-n", data=15),  # Default to TOP 15
    ], className="top-n-selector text-center mt-3")


def get_trimestre_q_label(trimestre_value: str) -> str:
    """Get Q format label for a trimestre value (01, 02, 03, 04)."""
    return TRIMESTRE_TO_Q.get(trimestre_value, trimestre_value)


def create_view_mode_toggle() -> html.Div:
    """Create toggle to switch between accumulated and current data view."""
    return html.Div([
        html.Div([
            html.Label("TIPO DE DATO:", className="text-muted small mb-2 d-block"),
            dbc.ButtonGroup([
                dbc.Button(
                    "Acumulado",
                    id="btn-view-accumulated",
                    color="primary",
                    outline=False,
                    className="view-mode-btn"
                ),
                dbc.Button(
                    "Corriente",
                    id="btn-view-current",
                    color="primary",
                    outline=True,
                    className="view-mode-btn"
                ),
            ]),
        ], className="text-center"),
        dcc.Store(id="store-view-mode", data="accumulated"),  # Default to accumulated
    ], className="view-mode-toggle mb-3")
