# Argentine Insurance Market Dashboard

Interactive dashboard for visualizing Argentine insurance market metrics based on historical data from the Superintendencia de Seguros de la Nacion.

## Architecture Overview

| Component | Description | Port |
|-----------|-------------|------|
| **React Frontend** | Modern React + TypeScript + Nivo charts | 80 (via Docker) |
| **FastAPI Backend** | RESTful API with S3/local data support | 8000 |
| **Dash (Testing)** | Legacy Plotly Dash for quick testing | 8051 |

### Architecture Benefits
- **Decoupled**: Frontend and backend scale independently
- **Modern Stack**: React + TypeScript + TailwindCSS + Nivo charts
- **Dockerized**: Single `docker compose up` to run everything
- **S3 Support**: Load data from local files or AWS S3
- **Render Ready**: Deploy to Render with `render.yaml` blueprint

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Start everything with one command
docker compose up --build

# Access the dashboard
open http://localhost
```

### Option 2: Development Mode

**Prerequisites:**
- Python 3.12+
- Node.js 20+
- [uv](https://github.com/astral-sh/uv) package manager

**Backend:**
```bash
cd backend && uv sync
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend:**
```bash
cd frontend && npm install
npm run dev
```

- React Dashboard: http://localhost:5173
- API Docs: http://localhost:8000/docs

### Option 3: Legacy Dash (Testing Only)

For quick API testing with the legacy Plotly Dash interface:

```bash
# Terminal 1 - Backend
cd backend && uv run uvicorn app.main:app --port 8000 --reload

# Terminal 2 - Dash Frontend
uv run python app_api.py
```

- Dash Dashboard: http://localhost:8051

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
├── docker-compose.yml          # Docker orchestration
├── frontend/                   # React + TypeScript frontend
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── ui/             # Base UI (shadcn/ui)
│   │   │   ├── filters/        # Filter components
│   │   │   ├── charts/         # Nivo chart components
│   │   │   ├── kpis/           # KPI card components
│   │   │   └── layout/         # Layout components
│   │   ├── hooks/              # React Query hooks
│   │   ├── services/           # API client
│   │   ├── types/              # TypeScript interfaces
│   │   └── lib/                # Utilities & constants
│   └── index.html
├── backend/                    # FastAPI backend
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── app/
│       ├── main.py             # FastAPI application
│       ├── api/routes/         # API endpoints
│       ├── core/               # Config & data loader
│       ├── logic/              # Business logic
│       └── models/             # Pydantic models
├── data/                       # Data files (parquet/csv)
├── app_api.py                  # Legacy Dash (testing only)
├── config.py                   # Dash configuration
└── src/                        # Dash components (legacy)
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

Create a `.env` file in the root directory:

```env
# Data Source: "local" or "s3"
DATA_SOURCE=local

# S3 Configuration (only needed if DATA_SOURCE=s3)
S3_BUCKET=your-bucket-name
S3_PREFIX=parquet/
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-2
```

**FastAPI Backend:**
- `DATA_SOURCE`: "local" (default) or "s3"
- `API_HOST`: API host (default: "0.0.0.0")
- `API_PORT`: API port (default: 8000)
- `DEBUG`: "true" or "false"
- `CORS_ORIGINS`: Comma-separated allowed origins

**Dash App (Legacy):**
- `DASH_DEBUG`: "true" or "false"
- `DASH_HOST`: Server host (default: "0.0.0.0")
- `DASH_PORT`: Server port (default: 8050)

## Deployment

### Render (Recommended)

The project includes a `render.yaml` blueprint for easy deployment:

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your repo and set root directory to `webapp_visualization`
4. Set secret environment variables in the dashboard:
   - `S3_BUCKET`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

Two services will be created:
- **insurance-api**: FastAPI backend (Docker)
- **insurance-dashboard**: React frontend (Static Site)

## Implementation Plan

See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for the detailed roadmap:
- Phase 1: Interactive Dashboard Prototype (Completed)
- Phase 2A: Backend API Development (Completed)
- Phase 2C: React Frontend + Docker (Completed)
- Deployment: Render Blueprint (Completed)
