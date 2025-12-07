FROM python:3.11-slim

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy lockfile and pyproject for reproducible install
COPY pyproject.toml uv.lock ./

# Install dependencies from lockfile (frozen = exact versions)
RUN uv sync --frozen --no-dev

# Copy application code
COPY . .

# Expose port
EXPOSE 8050

# Run with uv (uses the synced venv)
CMD ["uv", "run", "python", "app.py"]
