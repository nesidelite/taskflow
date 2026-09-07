from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status # type: ignore
from sqlalchemy.orm import Session # type: ignore
from app.db.session import get_db
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectRead
from app.crud import crud_project
from app.core.rate_limit import mutation_rate_limiter
from app.api.deps import get_optional_user
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[ProjectRead])
def read_projects(
    skip: int = 0,
    limit: int = 100,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve projects:
    - If user is authenticated: Returns their own projects (starts at 0).
    - If guest / unauthenticated: Returns sample filler demo projects.
    """
    user_id = current_user.id if current_user else None
    return crud_project.get_projects(db, user_id=user_id, skip=skip, limit=limit)


@router.post(
    "/",
    response_model=ProjectRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(mutation_rate_limiter)],
)
def create_project(
    project_in: ProjectCreate,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """Create a new project associated with the authenticated user."""
    user_id = current_user.id if current_user else None
    existing = crud_project.get_project_by_title(db, title=project_in.title, user_id=user_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un proyecto con este título en tu cuenta.",
        )
    project = crud_project.create_project(db, project_in, user_id=user_id)
    return project


@router.get("/{project_id}", response_model=ProjectRead)
def read_project(
    project_id: int,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """Get project details by ID."""
    user_id = current_user.id if current_user else None
    project = crud_project.get_project(db, project_id=project_id, user_id=user_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado.",
        )
    return project


@router.put(
    "/{project_id}",
    response_model=ProjectRead,
    dependencies=[Depends(mutation_rate_limiter)],
)
def update_project(
    project_id: int,
    project_in: ProjectUpdate,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """Update an existing project."""
    user_id = current_user.id if current_user else None
    project = crud_project.get_project(db, project_id=project_id, user_id=user_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado o no tienes permisos para editarlo.",
        )
    return crud_project.update_project(db, db_obj=project, project_in=project_in)


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(mutation_rate_limiter)],
)
def delete_project(
    project_id: int,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """Delete a project and cascade delete all its tasks."""
    user_id = current_user.id if current_user else None
    project = crud_project.get_project(db, project_id=project_id, user_id=user_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado o no tienes permisos para eliminarlo.",
        )
    crud_project.delete_project(db, project_id=project_id, user_id=user_id)
    return {"message": f"Project {project_id} deleted successfully"}
