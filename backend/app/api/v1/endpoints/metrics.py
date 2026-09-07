from typing import Optional
from fastapi import APIRouter, Depends # type: ignore
from sqlalchemy.orm import Session # type: ignore
from app.db.session import get_db
from app.schemas.metrics import DashboardMetrics
from app.crud import crud_task
from app.api.deps import get_optional_user
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=DashboardMetrics)
def read_metrics(
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve high-level dashboard metrics:
    - If user is authenticated: calculated strictly for the user's projects and tasks.
    - If unauthenticated: calculated for sample demo filler data.
    """
    user_id = current_user.id if current_user else None
    return crud_task.get_dashboard_metrics(db=db, user_id=user_id)
