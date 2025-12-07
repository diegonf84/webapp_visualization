# Argentine Insurance Market Dashboard

Interactive dashboard for visualizing Argentine insurance market metrics based on historical data from the Superintendencia de Seguros de la Nacion.

## Architecture Overview

This project implements **two approaches** for the same dashboard:

| Approach | Description | Port | Entry Point |
|----------|-------------|------|-------------|
| **Direct Data** | Plotly Dash app with direct data access | 8050 | `app.py` |
| **API-Based** | Plotly Dash frontend + FastAPI backend | 8051 + 8000 | `app_api.py` + `backend/` |

### Why Two Approaches?

1. **Direct Data (`app.py`)**: Simple, monolithic approach ideal for prototypes and small teams
2. **API-Based (`app_api.py` + FastAPI)**: Decoupled architecture that enables:
   - Independent scaling of frontend and backend
   - Future migration to React/Vue/other frontends
   - API reuse across multiple applications
   - Better separation of concerns

## Quick Start

### Prerequisites

- Python 3.12+
- [uv](https://github.com/astral-sh/uv) package manager

### Installation

```bash
# Clone and navigate to the project
cd webapp_visualization

# Install dependencies (uv handles virtual environment automatically)
uv sync

# For backend dependencies
cd backend && uv sync && cd ..
```

### Running the Applications

#### Option 1: Direct Data Approach (Simple)

```bash
uv run python app.py
```

Dashboard available at: http://localhost:8050

#### Option 2: API-Based Approach (Decoupled)

**Terminal 1 - Start FastAPI Backend:**
```bash
cd backend
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Start Dash Frontend:**
```bash
uv run python app_api.py
```

- Dashboard: http://localhost:8051
- API Docs: http://localhost:8000/docs
- API Health: http://localhost:8000/api/health

#### Option 3: Compare Both (Side by Side)

Run all three commands in separate terminals to compare both approaches:

| Terminal | Command | URL |
|----------|---------|-----|
| 1 | `uv run python app.py` | http://localhost:8050 |
| 2 | `cd backend && uv run uvicorn app.main:app --port 8000 --reload` | http://localhost:8000/docs |
| 3 | `uv run python app_api.py` | http://localhost:8051 |

Both dashboards (8050 and 8051) should display identical data.

## Dashboard Usage

### Available Filters

- **YEAR**: Select the fiscal year to display
- **QUARTER**: Select the fiscal quarter
  - March = Q3 (January-March)
  - June = Q4 (April-June)
  - September = Q1 (July-September)
  - December = Q2 (October-December)
- **RAMO**: Filter by insurance branch (Auto, Life, etc.)
- **ENTITY**: Filter by one or more specific insurance companies

### Data View Mode

- **Accumulated**: Shows values accumulated from the start of the fiscal year
- **Current**: Shows only the selected quarter's values

### Visualization Controls

- **TOP 10/15/20/50**: Limits the bar chart to the top N companies by issued premiums

## Data Displayed

### KPIs (Key Performance Indicators)

- **Total Production**: Sum of issued premiums for all entities in the selected period
- **Earned Premiums**: Premiums corresponding to the accounting period
- **Incurred Claims**: Total claims recorded in the period
- **Entities with Emissions**: Number of insurance companies that issued in the period

### Bar Chart - "Total del Mercado"

Shows the leading insurance companies ordered by issued premium volume:
- **X-axis**: Insurance companies (TOP N selected)
- **Y-axis**: Issued premiums in millions of pesos
- **Colors**:
  - Without ramo filter: colored by ramo
  - With ramo filter: colored by subramo

### Donut Chart - "Ramos" or "Subramos"

Shows the percentage distribution of premiums:
- **Without ramo filter**: Distribution by ramos
- **With ramo filter**: Distribution by subramos of the selected ramo

## API Endpoints

The FastAPI backend exposes the following endpoints:

### Filters
| Endpoint | Description |
|----------|-------------|
| `GET /api/filters` | Get all filter options |
| `GET /api/filters/years` | Available years |
| `GET /api/filters/quarters` | Available quarters |
| `GET /api/filters/ramos` | Available ramos |
| `GET /api/filters/companies` | Available companies |

### Data
| Endpoint | Description |
|----------|-------------|
| `GET /api/data/kpis` | KPI totals based on filters |
| `GET /api/data/companies/ranking` | Top N companies by primas_emitidas |
| `GET /api/data/distribution/ramos` | Distribution by ramos |
| `GET /api/data/distribution/subramos` | Distribution by subramos |

### Query Parameters

All data endpoints accept:
- `year`: Fiscal year (YYYY)
- `quarter`: Quarter (01, 02, 03, 04)
- `ramo`: Ramo filter
- `companies`: Comma-separated company names
- `view_mode`: "accumulated" or "current"
- `top_n`: Number of top companies (ranking endpoint only)

Example:
```bash
curl "http://localhost:8000/api/data/kpis?year=2025&quarter=01&view_mode=accumulated"
```

## Project Structure

```
webapp_visualization/
├── app.py                      # Direct data Dash app (port 8050)
├── app_api.py                  # API-based Dash app (port 8051)
├── config.py                   # Shared configuration
├── pyproject.toml              # Project dependencies
├── src/
│   ├── data/
│   │   └── loader.py           # Data loading utilities
│   ├── logic/
│   │   ├── aggregations.py     # Aggregation functions
│   │   ├── rankings.py         # Entity rankings
│   │   └── ratios.py           # Ratio calculations
│   ├── components/
│   │   ├── filters.py          # Filter components
│   │   ├── kpi_cards.py        # KPI card components
│   │   └── charts.py           # Chart configurations
│   └── layouts/
│       └── market_overview.py  # Dashboard layout
├── assets/
│   └── styles.css              # Custom styles
├── data/                       # Data files (parquet/csv)
└── backend/                    # FastAPI backend
    ├── pyproject.toml          # Backend dependencies
    └── app/
        ├── main.py             # FastAPI application
        ├── api/
        │   ├── routes/
        │   │   ├── filters.py  # Filter endpoints
        │   │   └── data.py     # Data endpoints
        │   └── dependencies.py # Shared dependencies
        ├── core/
        │   ├── config.py       # Backend configuration
        │   └── loader.py       # Data loader
        ├── logic/
        │   ├── aggregations.py # Business logic (reused)
        │   └── rankings.py     # Ranking logic (reused)
        └── models/
            └── responses.py    # Pydantic response models
```

## Data Notes

- **Fiscal Year**: The Argentine insurance market fiscal year runs from July to June
- **Accumulated vs Current Data**:
  - Accumulated data shows the total from the start of the fiscal year
  - Current data shows only the selected quarter's value
- **Amounts**: All monetary values are displayed in millions of Argentine pesos
- **Source**: Superintendencia de Seguros de la Nacion

## Configuration

### Data Source

The application looks for data in the following order:
1. `.parquet` files in the `data/` folder
2. `.csv` files in the `data/` folder
3. `*_sample.csv` files for development

### Environment Variables

**Dash App:**
- `DATA_SOURCE`: "local" (default) or "s3"
- `DASH_DEBUG`: "true" or "false"
- `DASH_HOST`: Server host (default: "0.0.0.0")
- `DASH_PORT`: Server port (default: 8050)

**FastAPI Backend:**
- `API_HOST`: API host (default: "0.0.0.0")
- `API_PORT`: API port (default: 8000)
- `DEBUG`: "true" or "false"
- `CORS_ORIGINS`: Comma-separated allowed origins

## Implementation Plan

See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for the detailed roadmap including:
- Phase 1: Interactive Dashboard Prototype (Completed)
- Phase 2A: Backend API Development (Completed)
- Phase 2B: Additional Dash Dashboards (Planned)
- Phase 2C: React Frontend Migration (Planned)
