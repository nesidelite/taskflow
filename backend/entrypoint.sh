#!/bin/bash
set -e

echo "[BACKEND ENTRYPOINT] Waiting for MySQL database to become available..."

# Wait until MySQL is ready using Python socket check
python << 'END'
import sys
import time
from urllib.parse import urlparse
from sqlalchemy import create_engine, text
from app.core.config import settings

max_retries = 30
retry_interval = 2

for attempt in range(1, max_retries + 1):
    try:
        engine = create_engine(settings.DATABASE_URL, connect_args={"connect_timeout": 5})
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print(f"[BACKEND ENTRYPOINT] Database connection established successfully! (attempt {attempt})")
        sys.exit(0)
    except Exception as e:
        print(f"[BACKEND ENTRYPOINT] Waiting for DB... ({attempt}/{max_retries}): {e}")
        time.sleep(retry_interval)

print("[BACKEND ENTRYPOINT] ERROR: Could not connect to MySQL database.")
sys.exit(1)
END

echo "[BACKEND ENTRYPOINT] Running Alembic migrations..."
alembic upgrade head

echo "[BACKEND ENTRYPOINT] Seeding initial database projects and tasks..."
python -m app.db.init_db

echo "[BACKEND ENTRYPOINT] Starting FastAPI application server..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --proxy-headers
