# Argentine Insurance Market Dashboard

Interactive dashboard for visualizing Argentine insurance market metrics based on historical data from the Superintendencia de Seguros de la Nacion.

## Architecture Overview

| Component | Description | Port |
|-----------|-------------|------|
| **React Frontend** | React 18 + TypeScript + Vite + Tailwind + Nivo charts | 5173 (dev) / 80 (Docker) |
| **FastAPI Backend** | RESTful API with S3/local data support | 8000 |

### Architecture Benefits
- **Decoupled**: Frontend and backend scale independently
- **Modern Stack**: React + TypeScript + TailwindCSS + Nivo charts
- **Dockerized**: Single `docker compose up` to run everything
- **S3 Support**: Load data from local files or AWS S3
- **Tested**: pytest on the backend, vitest + Testing Library on the frontend

## Quick Start

### Option 1: Docker (Recommended)

```bash
docker compose up --build
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

## Dashboard Pages

### Market Overview
- KPI cards with market totals
- Stacked bar chart of top N companies by primas emitidas
- Donut chart of ramo / subramo distribution
- Real-time filtering and view-mode switching (accumulated vs current)

### Company Profile
**Access:** Click any company name in the market overview.

Tabs:
- **Resumen** — financial results (Resultado del Ejercicio), key ratios with market comparison, ramos treemap
- **Operaciones** — time series of ratios, primas/siniestros, technical result, operational alerts
- **Inversiones** — *coming soon*
- **Comparación** — peer comparison (see below)

### Comparación (Company Peer Comparison)
**Access:** Navigate to `/comparar`.

**Flow:**
1. Pick a company using the search picker
2. Toggle between three comparison methods:
   - **Total Percentile** — peers above and below the selected company in its `tipo_cia`
   - **Main Ramo Percentile** — same, but filtered to the company's main ramo
   - **Similaridad por Ramos** — companies with the most similar ramo distribution
3. View the selected company in context, ranked against peers (or sorted by similarity distance)

**Handled states:** loading skeleton, empty (no peers), error with status-specific copy (400/404/422), retry on network/5xx.

## API Endpoints

### Filters
| Endpoint | Description |
|----------|-------------|
| `GET /api/filters` | All filter options |
| `GET /api/filters/years` | Available years |
| `GET /api/filters/quarters` | Available quarters |
| `GET /api/filters/ramos` | Available ramos |
| `GET /api/filters/companies` | Available companies |

### Data
| Endpoint | Description |
|----------|-------------|
| `GET /api/data/kpis` | KPI totals for the current filters |
| `GET /api/data/companies/ranking` | Top N companies by primas_emitidas |
| `GET /api/data/distribution/ramos` | Distribution by ramo |
| `GET /api/data/distribution/subramos` | Distribution by subramo |
| `GET /api/data/companies/{codCia}` | Company profile with full metrics, YoY, market averages, and ramos |
| `GET /api/data/companies/{codCia}/operations` | Time series for the Operaciones tab |
| `GET /api/data/companies/{codCia}/compare` | Peer comparison (query: `method=total_percentile` \| `main_ramo_percentile` \| `ramo_similarity`) |

### Query Parameters

Data endpoints accept:
- `year` — fiscal year (YYYY)
- `quarter` — `01`, `02`, `03`, `04`
- `ramo` — ramo filter
- `companies` — comma-separated company names
- `view_mode` — `accumulated` or `current`
- `top_n` — top N companies (ranking endpoint only)

Example:
```bash
curl "http://localhost:8000/api/data/kpis?year=2025&quarter=01&view_mode=accumulated"
```

## Testing

### Backend (pytest + httpx)

```bash
cd backend && uv sync
uv run pytest tests/ -v
```

Coverage includes the three comparison methods exposed by `/compare`.

### Frontend (vitest + Testing Library)

```bash
cd frontend && npm install
npm run test:run
```

Coverage includes the comparison hook, picker, method toggle, results renderer, and page-level loading/error states.

## Project Structure

```
webapp_visualization/
├── docker-compose.yml          # Docker orchestration
├── frontend/                   # React + TypeScript + Vite
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vitest.config.ts
│   └── src/
│       ├── components/         # Atomic components
│       │   ├── ui/             # Base UI primitives
│       │   ├── filters/
│       │   ├── charts/         # Nivo chart components
│       │   ├── comparison/     # Comparison feature
│       │   ├── kpis/
│       │   └── layout/
│       ├── hooks/              # React Query hooks
│       ├── pages/              # Route-level pages
│       ├── services/           # API client (axios)
│       ├── types/              # TypeScript interfaces
│       ├── test/               # Vitest setup
│       └── lib/                # Utilities & constants
├── backend/                    # FastAPI + uv
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── tests/                  # pytest
│   └── app/
│       ├── main.py             # FastAPI application
│       ├── api/routes/         # API endpoints
│       ├── core/               # Config & data loader
│       ├── logic/              # Business logic (incl. comparisons)
│       └── models/             # Pydantic models
└── data/                       # Parquet/CSV data files
```

## Data Notes

- **Fiscal Year**: Argentine insurance market fiscal year runs July to June
- **Accumulated vs Current Data**:
  - *Accumulated* shows totals from the start of the fiscal year
  - *Current* shows only the selected quarter
- **Amounts**: All monetary values are in millions of Argentine pesos
- **Source**: Superintendencia de Seguros de la Nacion

## Configuration

### Data Source Lookup Order
1. `.parquet` files in `data/`
2. `.csv` files in `data/`
3. `*_sample.csv` files (development)

### Environment Variables

Create a `.env` file in the project root:

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
- `DATA_SOURCE` — `local` (default) or `s3`
- `API_HOST` — API host (default: `0.0.0.0`)
- `API_PORT` — API port (default: `8000`)
- `DEBUG` — `true` or `false`
- `CORS_ORIGINS` — comma-separated allowed origins
