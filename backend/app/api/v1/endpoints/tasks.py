from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status # type: ignore
from sqlalchemy.orm import Session # type: ignore
from app.db.session import get_db
from app.models.task import TaskStatus, TaskPriority
from app.schemas.task import TaskCreate, TaskUpdate, TaskStatusUpdate, TaskRead
from app.crud import crud_task, crud_project
from app.core.rate_limit import mutation_rate_limiter
from app.api.deps import get_optional_user
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[TaskRead])
def read_tasks(
    project_id: Optional[int] = Query(None, description="Filter by project ID"),
    status: Optional[TaskStatus] = Query(None, description="Filter by task status"),
    priority: Optional[TaskPriority] = Query(None, description="Filter by task priority"),
    search: Optional[str] = Query(None, description="Search query for title and description"),
    skip: int = 0,
    limit: int = 100,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve tasks:
    - If user is authenticated: Returns their own tasks (starts at 0).
    - If guest / unauthenticated: Returns sample filler demo tasks.
    """
    user_id = current_user.id if current_user else None
    return crud_task.get_tasks(
        db=db,
        user_id=user_id,
        project_id=project_id,
        status=status,
        priority=priority,
        search=search,
        skip=skip,
        limit=limit,
    )


@router.post(
    "/",
    response_model=TaskRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(mutation_rate_limiter)],
)
def create_task(
    task_in: TaskCreate,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """Create a new task associated with an existing project and authenticated user."""
    user_id = current_user.id if current_user else None
    project = crud_project.get_project(db, project_id=task_in.project_id, user_id=user_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El proyecto con ID {task_in.project_id} no existe o no te pertenece.",
        )
    return crud_task.create_task(db=db, task_in=task_in, user_id=user_id)


@router.get("/{task_id}", response_model=TaskRead)
def read_task(
    task_id: int,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """Retrieve single task details by ID."""
    user_id = current_user.id if current_user else None
    task = crud_task.get_task(db=db, task_id=task_id, user_id=user_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarea no encontrada.",
        )
    return task


@router.put(
    "/{task_id}",
    response_model=TaskRead,
    dependencies=[Depends(mutation_rate_limiter)],
)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """Update task fields."""
    user_id = current_user.id if current_user else None
    task = crud_task.get_task(db=db, task_id=task_id, user_id=user_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarea no encontrada o no tienes permisos para editarla.",
        )
    if task_in.project_id is not None:
        project = crud_project.get_project(db, project_id=task_in.project_id, user_id=user_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"El proyecto con ID {task_in.project_id} no existe.",
            )
    return crud_task.update_task(db=db, db_obj=task, task_in=task_in)


@router.patch(
    "/{task_id}/status",
    response_model=TaskRead,
    dependencies=[Depends(mutation_rate_limiter)],
)
def update_task_status(
    task_id: int,
    status_in: TaskStatusUpdate,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """Quick update for task status (for drag-and-drop or status toggle in UI)."""
    user_id = current_user.id if current_user else None
    task = crud_task.get_task(db=db, task_id=task_id, user_id=user_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarea no encontrada o no tienes permisos para actualizarla.",
        )
    return crud_task.update_task(db=db, db_obj=task, task_in=status_in)


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(mutation_rate_limiter)],
)
def delete_task(
    task_id: int,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """Delete a task."""
    user_id = current_user.id if current_user else None
    task = crud_task.get_task(db=db, task_id=task_id, user_id=user_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarea no encontrada o no tienes permisos para eliminarla.",
        )
    crud_task.delete_task(db=db, task_id=task_id, user_id=user_id)
    return {"message": f"Task {task_id} deleted successfully"}
