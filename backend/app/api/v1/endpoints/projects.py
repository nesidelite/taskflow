from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectRead
from app.crud import crud_project

router = APIRouter()


@router.get("/", response_model=List[ProjectRead])
def read_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Retrieve all projects with task counts."""
    return crud_project.get_projects(db, skip=skip, limit=limit)


@router.post("/", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
):
    """Create a new project."""
    existing = crud_project.get_project_by_title(db, title=project_in.title)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A project with this title already exists.",
        )
    project = crud_project.create_project(db, project_in)
    return project


@router.get("/{project_id}", response_model=ProjectRead)
def read_project(
    project_id: int,
    db: Session = Depends(get_db),
):
    """Get project details by ID."""
    project = crud_project.get_project(db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )
    return project


@router.put("/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: int,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
):
    """Update an existing project."""
    project = crud_project.get_project(db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )
    return crud_project.update_project(db, db_obj=project, project_in=project_in)


@router.delete("/{project_id}", status_code=status.HTTP_200_OK)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
):
    """Delete a project and cascade delete all its tasks."""
    project = crud_project.get_project(db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )
    crud_project.delete_project(db, project_id=project_id)
    return {"message": f"Project {project_id} deleted successfully"}
