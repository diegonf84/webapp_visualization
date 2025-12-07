from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import CORS_ORIGINS, DEBUG
from app.api.routes import filters, data
from app.models.responses import HealthResponse

# Initialize FastAPI app
app = FastAPI(
    title="Insurance Market Dashboard API",
    description="RESTful API for Argentine insurance market data visualization",
    version="1.0.0",
    debug=DEBUG,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(filters.router, prefix="/api/filters", tags=["Filters"])
app.include_router(data.router, prefix="/api/data", tags=["Data"])


@app.get("/api/health", response_model=HealthResponse)
async def health():
    """Health check endpoint."""
    return HealthResponse(status="ok", version="1.0.0")


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "message": "Insurance Market Dashboard API",
        "docs": "/docs",
        "health": "/api/health",
    }


if __name__ == "__main__":
    import uvicorn
    from app.core.config import API_HOST, API_PORT

    uvicorn.run(
        "app.main:app",
        host=API_HOST,
        port=API_PORT,
        reload=DEBUG,
    )
