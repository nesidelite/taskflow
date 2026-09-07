from typing import List, Optional
from sqlalchemy.orm import Session # type: ignore
from sqlalchemy import func # type: ignore
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectRead


def get_demo_user_id(db: Session) -> Optional[int]:
    """Retrieve demo admin user ID used for public filler content."""
    demo = db.query(User).filter(User.email == "admin@taskflow.dev").first()
    return demo.id if demo else None


def get_project(db: Session, project_id: int, user_id: Optional[int] = None) -> Optional[Project]:
    query = db.query(Project).filter(Project.id == project_id)
    if user_id is not None:
        query = query.filter(Project.user_id == user_id)
    return query.first()


def get_project_by_title(db: Session, title: str, user_id: Optional[int] = None) -> Optional[Project]:
    query = db.query(Project).filter(Project.title == title)
    if user_id is not None:
        query = query.filter(Project.user_id == user_id)
    return query.first()


def get_projects(db: Session, user_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[ProjectRead]:
    query = db.query(Project)
    if user_id is not None:
        # Authenticated user: Return strictly their own projects (starts at 0)
        query = query.filter(Project.user_id == user_id)
    else:
        # Unauthenticated guest: Show public filler/demo projects
        demo_id = get_demo_user_id(db)
        if demo_id:
            query = query.filter((Project.user_id == demo_id) | (Project.user_id.is_(None)))
        else:
            query = query.filter(Project.user_id.is_(None))

    projects = query.offset(skip).limit(limit).all()
    results = []
    for p in projects:
        task_count = db.query(func.count(Task.id)).filter(Task.project_id == p.id).scalar() or 0
        p_read = ProjectRead(
            id=p.id,
            title=p.title,
            description=p.description,
            color=p.color,
            created_at=p.created_at,
            updated_at=p.updated_at,
            task_count=task_count,
        )
        results.append(p_read)
    return results


def create_project(db: Session, project_in: ProjectCreate, user_id: Optional[int] = None) -> Project:
    db_obj = Project(
        title=project_in.title,
        description=project_in.description,
        color=project_in.color,
        user_id=user_id,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update_project(db: Session, db_obj: Project, project_in: ProjectUpdate) -> Project:
    update_data = project_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_project(db: Session, project_id: int, user_id: Optional[int] = None) -> Optional[Project]:
    query = db.query(Project).filter(Project.id == project_id)
    if user_id is not None:
        query = query.filter(Project.user_id == user_id)
    obj = query.first()
    if obj:
        db.delete(obj)
        db.commit()
    return obj
