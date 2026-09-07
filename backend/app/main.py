from contextlib import asynccontextmanager
from fastapi import FastAPI, status # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from sqlalchemy import text # type: ignore
from app.core.config import settings
from app.core.rate_limit import limiter, RateLimitExceeded, SLOWAPI_AVAILABLE # type: ignore
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

# Wire SlowAPI rate limiter if available
if SLOWAPI_AVAILABLE and limiter:
    try:
        from importlib import import_module

        _rate_limit_exceeded_handler = getattr(
            import_module("slowapi"),
            "_rate_limit_exceeded_handler",
        )
        app.state.limiter = limiter
        app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    except Exception as err:
        print(f"[RATE LIMIT INIT WARNING] {err}")

# CORS Middleware configuration
cors_origins = [str(orig).rstrip("/") for orig in settings.CORS_ORIGINS if str(orig).strip()]

if "*" in cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r".*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
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


@app.api_route("/health", methods=["GET", "HEAD"], tags=["system"], status_code=status.HTTP_200_OK)
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
