from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.project import Project
from app.models.task import Task
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectRead


def get_project(db: Session, project_id: int) -> Optional[Project]:
    return db.query(Project).filter(Project.id == project_id).first()


def get_project_by_title(db: Session, title: str) -> Optional[Project]:
    return db.query(Project).filter(Project.title == title).first()


def get_projects(db: Session, skip: int = 0, limit: int = 100) -> List[ProjectRead]:
    projects = db.query(Project).offset(skip).limit(limit).all()
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


def create_project(db: Session, project_in: ProjectCreate) -> Project:
    db_obj = Project(
        title=project_in.title,
        description=project_in.description,
        color=project_in.color,
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


def delete_project(db: Session, project_id: int) -> Optional[Project]:
    obj = db.query(Project).get(project_id)
    if obj:
        db.delete(obj)
        db.commit()
    return obj
