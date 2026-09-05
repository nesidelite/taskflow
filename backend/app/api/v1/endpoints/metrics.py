from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.metrics import DashboardMetrics
from app.crud import crud_task

router = APIRouter()


@router.get("/", response_model=DashboardMetrics)
def read_metrics(db: Session = Depends(get_db)):
    """Retrieve high-level dashboard metrics for projects and tasks."""
    return crud_task.get_dashboard_metrics(db=db)
