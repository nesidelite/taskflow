from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.task import TaskStatus, TaskPriority
from app.schemas.task import TaskCreate, TaskUpdate, TaskStatusUpdate, TaskRead
from app.crud import crud_task, crud_project

router = APIRouter()


@router.get("/", response_model=List[TaskRead])
def read_tasks(
    project_id: Optional[int] = Query(None, description="Filter by project ID"),
    status: Optional[TaskStatus] = Query(None, description="Filter by task status"),
    priority: Optional[TaskPriority] = Query(None, description="Filter by task priority"),
    search: Optional[str] = Query(None, description="Search query for title and description"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Retrieve tasks with optional filters for project, status, priority, and search keyword."""
    return crud_task.get_tasks(
        db=db,
        project_id=project_id,
        status=status,
        priority=priority,
        search=search,
        skip=skip,
        limit=limit,
    )


@router.post("/", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
):
    """Create a new task associated with an existing project."""
    project = crud_project.get_project(db, project_id=task_in.project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {task_in.project_id} does not exist.",
        )
    return crud_task.create_task(db=db, task_in=task_in)


@router.get("/{task_id}", response_model=TaskRead)
def read_task(
    task_id: int,
    db: Session = Depends(get_db),
):
    """Retrieve single task details by ID."""
    task = crud_task.get_task(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
        )
    return task


@router.put("/{task_id}", response_model=TaskRead)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
):
    """Update task fields."""
    task = crud_task.get_task(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
        )
    if task_in.project_id is not None:
        project = crud_project.get_project(db, project_id=task_in.project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID {task_in.project_id} does not exist.",
            )
    return crud_task.update_task(db=db, db_obj=task, task_in=task_in)


@router.patch("/{task_id}/status", response_model=TaskRead)
def update_task_status(
    task_id: int,
    status_in: TaskStatusUpdate,
    db: Session = Depends(get_db),
):
    """Quick update for task status (for drag-and-drop or status toggle in UI)."""
    task = crud_task.get_task(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
        )
    return crud_task.update_task(db=db, db_obj=task, task_in=status_in)


@router.delete("/{task_id}", status_code=status.HTTP_200_OK)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
):
    """Delete a task."""
    task = crud_task.get_task(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
        )
    crud_task.delete_task(db=db, task_id=task_id)
    return {"message": f"Task {task_id} deleted successfully"}
