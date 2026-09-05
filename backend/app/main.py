from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.config import settings
from app.db.session import engine, SessionLocal
from app.db.init_db import init_db
from app.api.v1.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-initialize and seed DB on startup
    try:
        db = SessionLocal()
        init_db(db)
        db.close()
    except Exception as e:
        print(f"[STARTUP WARNING] Could not auto-initialize DB on startup: {e}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/api/v1/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["system"])
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": "/docs",
        "version": "1.0.0",
    }


@app.get("/health", tags=["system"], status_code=status.HTTP_200_OK)
def health_check():
    """Healthcheck endpoint verifying app and database connectivity."""
    db_status = "healthy"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
        return {"status": "degraded", "database": db_status}

    return {
        "status": "healthy",
        "database": db_status,
        "environment": settings.ENVIRONMENT,
    }


# Include API v1 routers
app.include_router(api_router, prefix="/api/v1")
