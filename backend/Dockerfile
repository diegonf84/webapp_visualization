FROM python:3.12-slim

WORKDIR /app

# Install system dependencies and uv
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && curl -LsSf https://astral.sh/uv/install.sh | sh \
    && rm -rf /var/lib/apt/lists/*

# Add uv to PATH
ENV PATH="/root/.local/bin:$PATH"

# Copy all project files
COPY pyproject.toml .
COPY app/ ./app/

# Install dependencies with uv
RUN uv pip install --system .

# Create data directory (will be mounted as volume)
RUN mkdir -p /app/data

# Environment variables
ENV DATA_SOURCE=local
ENV API_HOST=0.0.0.0
ENV API_PORT=8000
ENV DEBUG=false
ENV LOCAL_DATA_DIR=/app/data

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
