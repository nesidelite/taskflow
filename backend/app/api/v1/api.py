from fastapi import APIRouter
from app.api.v1.endpoints import projects, tasks, metrics

api_router = APIRouter()
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(metrics.router, prefix="/metrics", tags=["metrics"])
