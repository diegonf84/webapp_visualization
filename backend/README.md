# Insurance Market Dashboard - Backend API

FastAPI backend for the Argentine insurance market dashboard.

## Quick Start

### Installation

```bash
cd backend
pip install -r requirements.txt
```

### Run the API

```bash
# From the backend directory
python -m app.main

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

### API Documentation

Once the server is running, access the interactive documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Health Check
- `GET /` - Root endpoint
- `GET /api/health` - Health check

### Filters
- `GET /api/filters` - Get all available filter options
- `GET /api/filters/years` - Get available years
- `GET /api/filters/quarters` - Get available quarters
- `GET /api/filters/ramos` - Get available ramos
- `GET /api/filters/companies` - Get available companies

### Data
- `GET /api/data/kpis` - Get KPI totals
- `GET /api/data/companies/ranking` - Get top N companies ranking
- `GET /api/data/distribution/ramos` - Get ramos distribution
- `GET /api/data/distribution/subramos` - Get subramos distribution

### Query Parameters

All data endpoints accept the following filters:
- `year` - Fiscal year (YYYY)
- `quarter` - Quarter (01, 02, 03, 04)
- `ramo` - Ramo filter
- `companies` - Comma-separated company names
- `view_mode` - Data view mode: `accumulated` (default) or `current`

Additional parameters:
- `top_n` - Number of top companies (default: 15, max: 100)

## Configuration

Edit `.env` file to configure:
- `DATA_SOURCE` - Data source: `local` or `s3`
- `API_HOST` - Server host (default: 0.0.0.0)
- `API_PORT` - Server port (default: 8000)
- `DEBUG` - Debug mode (default: true)
- `CORS_ORIGINS` - Allowed CORS origins

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app initialization
│   ├── api/
│   │   ├── routes/
│   │   │   ├── filters.py   # Filter endpoints
│   │   │   └── data.py      # Data endpoints
│   │   └── dependencies.py  # Shared dependencies
│   ├── core/
│   │   ├── config.py        # Configuration
│   │   └── loader.py        # Data loader
│   ├── logic/               # Business logic (reused from Phase 1)
│   │   ├── aggregations.py
│   │   └── rankings.py
│   └── models/
│       └── responses.py     # Pydantic response models
├── requirements.txt
└── .env
```

## Data Location

The API expects data files in the parent `data/` directory:
- `../data/subramos_historico.parquet` (or `.csv`)
- Sample files: `../data/subramos_historico_sample.csv`
