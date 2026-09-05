from typing import List, Optional, Union
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.models.task import Task, TaskStatus, TaskPriority
from app.models.project import Project
from app.schemas.task import TaskCreate, TaskUpdate, TaskStatusUpdate
from app.schemas.metrics import DashboardMetrics, StatusMetrics, PriorityMetrics


def get_task(db: Session, task_id: int) -> Optional[Task]:
    return db.query(Task).options(joinedload(Task.project)).filter(Task.id == task_id).first()


def get_tasks(
    db: Session,
    project_id: Optional[int] = None,
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[Task]:
    query = db.query(Task).options(joinedload(Task.project))
    if project_id is not None:
        query = query.filter(Task.project_id == project_id)
    if status is not None:
        query = query.filter(Task.status == status)
    if priority is not None:
        query = query.filter(Task.priority == priority)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Task.title.ilike(search_pattern)) | (Task.description.ilike(search_pattern))
        )
    return (
        query.order_by(Task.due_date.is_(None), Task.due_date.asc(), Task.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_task(db: Session, task_in: TaskCreate) -> Task:
    db_obj = Task(
        title=task_in.title,
        description=task_in.description,
        status=task_in.status,
        priority=task_in.priority,
        due_date=task_in.due_date,
        project_id=task_in.project_id,
    )
    db.add(db_obj)
    db.commit()
    return (
        db.query(Task)
        .options(joinedload(Task.project))
        .filter(Task.id == db_obj.id)
        .first()
    )


def update_task(db: Session, db_obj: Task, task_in: Union[TaskUpdate, TaskStatusUpdate]) -> Task:
    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    return (
        db.query(Task)
        .options(joinedload(Task.project))
        .filter(Task.id == db_obj.id)
        .first()
    )


def delete_task(db: Session, task_id: int) -> Optional[Task]:
    obj = db.query(Task).get(task_id)
    if obj:
        db.delete(obj)
        db.commit()
    return obj


def get_dashboard_metrics(db: Session) -> DashboardMetrics:
    total_projects = db.query(func.count(Project.id)).scalar() or 0
    total_tasks = db.query(func.count(Task.id)).scalar() or 0

    pending_count = db.query(func.count(Task.id)).filter(Task.status == TaskStatus.PENDING).scalar() or 0
    in_progress_count = db.query(func.count(Task.id)).filter(Task.status == TaskStatus.IN_PROGRESS).scalar() or 0
    completed_count = db.query(func.count(Task.id)).filter(Task.status == TaskStatus.COMPLETED).scalar() or 0

    low_count = db.query(func.count(Task.id)).filter(Task.priority == TaskPriority.LOW).scalar() or 0
    medium_count = db.query(func.count(Task.id)).filter(Task.priority == TaskPriority.MEDIUM).scalar() or 0
    high_count = db.query(func.count(Task.id)).filter(Task.priority == TaskPriority.HIGH).scalar() or 0

    completion_rate = (completed_count / total_tasks * 100) if total_tasks > 0 else 0.0

    return DashboardMetrics(
        total_projects=total_projects,
        total_tasks=total_tasks,
        status_counts=StatusMetrics(
            pending=pending_count,
            in_progress=in_progress_count,
            completed=completed_count,
        ),
        priority_counts=PriorityMetrics(
            low=low_count,
            medium=medium_count,
            high=high_count,
        ),
        completion_rate_percentage=round(completion_rate, 1),
    )
