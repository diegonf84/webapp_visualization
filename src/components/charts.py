import plotly.express as px
import plotly.graph_objects as go
import pandas as pd

import config

# Maximum categories to show before grouping as "Otros"
MAX_CATEGORIES = 10


def _group_top_n(df: pd.DataFrame, group_col: str, value_col: str, n: int = MAX_CATEGORIES) -> pd.DataFrame:
    """
    Keep top N categories by value, group the rest as 'Otros'.

    Args:
        df: DataFrame with category and value columns
        group_col: Column name for categories
        value_col: Column name for values to sum
        n: Number of top categories to keep

    Returns:
        DataFrame with top N + Otros
    """
    # Get totals per category
    totals = df.groupby(group_col)[value_col].sum().sort_values(ascending=False)

    if len(totals) <= n:
        return df

    # Top N categories
    top_categories = totals.head(n).index.tolist()

    # Split data
    top_df = df[df[group_col].isin(top_categories)].copy()
    otros_df = df[~df[group_col].isin(top_categories)].copy()

    if not otros_df.empty:
        # Aggregate "Otros"
        otros_df[group_col] = "Otros"

    return pd.concat([top_df, otros_df], ignore_index=True)


def create_bar_chart(
    df: pd.DataFrame,
    x: str = "nombre_corto",
    y: str = "primas_emitidas",
    color: str = None,
    title: str = "Total del Mercado",
    color_palette: str = "ramos",
) -> go.Figure:
    """
    Create a bar chart (stacked if color is provided).
    Color categories limited to top 10 + Otros.

    Args:
        df: DataFrame with data
        x: Column name for x-axis
        y: Column name for y-axis values
        color: Column name for color grouping
        title: Chart title
        color_palette: Color palette key from config.CHART_COLORS ("ramos" or "subramos")
    """
    if df.empty:
        return create_empty_chart("No hay datos para mostrar")

    df = df.copy()

    # Group color categories to top N + Otros
    if color:
        df = _group_top_n(df, color, y, MAX_CATEGORIES)

    # Convert to millions for display
    y_millions = f"{y}_millions"
    df[y_millions] = df[y] / 1_000_000

    # Sort by total value per company
    if color:
        totals = df.groupby(x)[y_millions].sum().sort_values(ascending=False)
        category_order = totals.index.tolist()

        # Also sort color categories by total (Otros always last)
        color_totals = df.groupby(color)[y_millions].sum().sort_values(ascending=False)
        color_order = [c for c in color_totals.index if c != "Otros"]
        if "Otros" in df[color].values:
            color_order.append("Otros")
    else:
        df = df.sort_values(y_millions, ascending=False)
        category_order = df[x].tolist()
        color_order = None

    fig = px.bar(
        df,
        x=x,
        y=y_millions,
        color=color,
        title=title,
        color_discrete_sequence=config.CHART_COLORS[color_palette],
        category_orders={x: category_order, color: color_order} if color else {x: category_order},
    )

    # Clean hover template - only show value
    fig.update_traces(
        hovertemplate="$ %{y:,.0f} M<extra></extra>"
    )

    fig.update_layout(
        xaxis_title="",
        yaxis_title="Millones $",
        legend_title="",
        legend=dict(
            orientation="v",
            yanchor="top",
            y=1,
            xanchor="left",
            x=1.02,
        ),
        margin=dict(l=80, r=150, t=50, b=100),
        plot_bgcolor="white",
        xaxis=dict(tickangle=-45),
        yaxis=dict(
            gridcolor="lightgray",
            tickformat=",.0f",
            tickprefix="$ ",
        ),
    )

    return fig


def create_donut_chart(
    df: pd.DataFrame,
    values: str = "primas_emitidas",
    names: str = "ramo_nombre_corto",
    title: str = "Distribución por Ramo",
    color_palette: str = "ramos",
) -> go.Figure:
    """
    Create a donut chart for distribution. Limited to top 10 + Otros.

    Args:
        df: DataFrame with data
        values: Column name for values
        names: Column name for segment names
        title: Chart title
        color_palette: Color palette key from config.CHART_COLORS ("ramos" or "subramos")
    """
    if df.empty:
        return create_empty_chart("No hay datos para mostrar")

    # Aggregate by names column
    agg_df = df.groupby(names)[values].sum().reset_index()
    agg_df = agg_df.sort_values(values, ascending=False)

    # Limit to top N + Otros
    if len(agg_df) > MAX_CATEGORIES:
        top_df = agg_df.head(MAX_CATEGORIES).copy()
        otros_sum = agg_df.tail(len(agg_df) - MAX_CATEGORIES)[values].sum()
        otros_row = pd.DataFrame({names: ["Otros"], values: [otros_sum]})
        agg_df = pd.concat([top_df, otros_row], ignore_index=True)

    # Convert to millions for display
    values_millions = f"{values}_millions"
    agg_df[values_millions] = agg_df[values] / 1_000_000

    fig = px.pie(
        agg_df,
        values=values_millions,
        names=names,
        title=title,
        hole=0.4,
        color_discrete_sequence=config.CHART_COLORS[color_palette],
    )

    fig.update_traces(
        textposition="inside",
        textinfo="percent",
        texttemplate="%{percent:.1%}",
        hovertemplate="%{label}: $ %{value:,.0f} M (%{percent:.1%})<extra></extra>",
    )

    fig.update_layout(
        showlegend=True,
        legend=dict(
            orientation="v",
            yanchor="top",
            y=1,
            xanchor="left",
            x=1.02,
        ),
        margin=dict(l=20, r=150, t=50, b=20),
    )

    return fig


def create_empty_chart(message: str = "No hay datos") -> go.Figure:
    """Create an empty chart with a message."""
    fig = go.Figure()
    fig.add_annotation(
        text=message,
        xref="paper",
        yref="paper",
        x=0.5,
        y=0.5,
        showarrow=False,
        font=dict(size=16, color="gray"),
    )
    fig.update_layout(
        xaxis=dict(visible=False),
        yaxis=dict(visible=False),
        plot_bgcolor="white",
    )
    return fig
