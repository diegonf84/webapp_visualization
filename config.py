import os
from dotenv import load_dotenv

load_dotenv()

# Data source configuration
DATA_SOURCE = os.getenv("DATA_SOURCE", "local")  # "local" or "s3"

# Local data paths
LOCAL_DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
SUBRAMOS_FILE = "subramos_historico.parquet"
OTROS_CONCEPTOS_FILE = "otros_conceptos_historico.parquet"

# S3 configuration (for future use)
S3_BUCKET = os.getenv("S3_BUCKET", "")
S3_PREFIX = os.getenv("S3_PREFIX", "")

# Dash configuration
DEBUG = os.getenv("DASH_DEBUG", "true").lower() == "true"
HOST = os.getenv("DASH_HOST", "0.0.0.0")
PORT = int(os.getenv("DASH_PORT", "8050"))

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

# Chart colors (matching reference design)
CHART_COLORS = {
    "primary": "#1a365d",  # Dark blue
    "secondary": "#4a5568",
    "accent": "#667eea",
    # Ramo colors for stacked charts (broader palette)
    "ramos": [
        "#1a365d",  # Dark blue
        "#2c5282",  # Blue
        "#4299e1",  # Light blue
        "#9f7aea",  # Purple
        "#b794f4",  # Light purple
        "#ed8936",  # Orange
        "#ecc94b",  # Yellow
        "#48bb78",  # Green
        "#38b2ac",  # Teal
        "#fc8181",  # Red
    ],
    # Subramo colors - distinct, high-contrast palette for fewer categories (max 5)
    "subramos": [
        "#e74c3c",  # Vibrant red
        "#3498db",  # Bright blue
        "#2ecc71",  # Emerald green
        "#f39c12",  # Orange
        "#9b59b6",  # Purple
        "#1abc9c",  # Turquoise
        "#e67e22",  # Carrot orange
        "#34495e",  # Dark gray-blue
        "#16a085",  # Dark teal
        "#d35400",  # Pumpkin orange
    ]
}

# Number formatting (Argentine style)
NUMBER_FORMAT = {
    "decimal": ",",
    "thousands": ".",
    "currency_prefix": "$ ",
    "currency_suffix": " M",  # Millions
}
