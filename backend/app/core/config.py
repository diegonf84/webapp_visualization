import os
from pathlib import Path
from dotenv import load_dotenv

# Project root (backend/)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load root .env first (data source + S3 credentials), then backend .env for
# server-specific settings — first loaded value wins on conflicts.
load_dotenv(BASE_DIR.parent / ".env")
load_dotenv(BASE_DIR / ".env")

# Local data paths - configurable via environment variable for Docker
_default_data_dir = BASE_DIR.parent / "data"
LOCAL_DATA_DIR = Path(os.getenv("LOCAL_DATA_DIR", str(_default_data_dir)))

DATA_SOURCE = os.getenv("DATA_SOURCE", "s3")
SUBRAMOS_FILE = "subramos_historico.parquet"
OTROS_CONCEPTOS_FILE = "otros_conceptos_historico.parquet"

# S3 configuration
S3_BUCKET = os.getenv("S3_BUCKET", "")
S3_PREFIX = os.getenv("S3_PREFIX", "data/")  # Folder prefix in bucket
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

# API configuration
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

# CORS settings - includes React dev (5173), Dash test (8051), and production
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173,http://localhost:8050,http://localhost:8051,http://localhost").split(",")

# Column mappings for consistency
COLUMNS = {
    "periodo": "periodo",
    "quarter": "fiscal_quarter",
    "date": "period_date",
    "company_code": "cod_cia",
    "company_name": "nombre_corto",
    "ramo": "ramo_denominacion",
    "subramo": "subramo_denominacion",
    "ramo_type": "ramo_tipo",
    "company_type": "tipo_cia",
    # Key metrics
    "primas_emitidas": "primas_emitidas",
    "primas_devengadas": "primas_devengadas",
    "siniestros_devengados": "siniestros_devengados",
    "gastos_devengados": "gastos_devengados",
}

# Display labels (Spanish)
LABELS = {
    "periodo": "Período",
    "year": "Año",
    "quarter": "Trimestre",
    "ramo": "Ramo",
    "subramo": "Subramo",
    "company": "Entidad",
    "primas_emitidas": "Primas Emitidas",
    "primas_devengadas": "Primas Devengadas",
    "siniestros_devengados": "Siniestros Devengados",
    "total_production": "Total de Producción",
    "entities_count": "Entidades con Emisión",
}
