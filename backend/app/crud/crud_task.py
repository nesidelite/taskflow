from typing import List, Optional, Union
from sqlalchemy.orm import Session, joinedload # type: ignore
from sqlalchemy import func # type: ignore
from app.models.task import Task, TaskStatus, TaskPriority
from app.models.project import Project
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskStatusUpdate
from app.schemas.metrics import DashboardMetrics, StatusMetrics, PriorityMetrics


def get_demo_user_id(db: Session) -> Optional[int]:
    """Retrieve demo admin user ID used for public filler content."""
    demo = db.query(User).filter(User.email == "admin@taskflow.dev").first()
    return demo.id if demo else None


def get_task(db: Session, task_id: int, user_id: Optional[int] = None) -> Optional[Task]:
    query = db.query(Task).options(joinedload(Task.project)).filter(Task.id == task_id)
    if user_id is not None:
        query = query.filter(Task.user_id == user_id)
    return query.first()


def get_tasks(
    db: Session,
    user_id: Optional[int] = None,
    project_id: Optional[int] = None,
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[Task]:
    query = db.query(Task).options(joinedload(Task.project))

    if user_id is not None:
        # Authenticated user: Return strictly their own tasks (starts at 0)
        query = query.filter(Task.user_id == user_id)
    else:
        # Unauthenticated guest: Show public filler/demo tasks
        demo_id = get_demo_user_id(db)
        if demo_id:
            query = query.filter((Task.user_id == demo_id) | (Task.user_id.is_(None)))
        else:
            query = query.filter(Task.user_id.is_(None))

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


def create_task(db: Session, task_in: TaskCreate, user_id: Optional[int] = None) -> Task:
    db_obj = Task(
        title=task_in.title,
        description=task_in.description,
        status=task_in.status,
        priority=task_in.priority,
        due_date=task_in.due_date,
        project_id=task_in.project_id,
        user_id=user_id,
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


def delete_task(db: Session, task_id: int, user_id: Optional[int] = None) -> Optional[Task]:
    query = db.query(Task).filter(Task.id == task_id)
    if user_id is not None:
        query = query.filter(Task.user_id == user_id)
    obj = query.first()
    if obj:
        db.delete(obj)
        db.commit()
    return obj


def get_dashboard_metrics(db: Session, user_id: Optional[int] = None) -> DashboardMetrics:
    proj_query = db.query(func.count(Project.id))
    task_query = db.query(func.count(Task.id))

    if user_id is not None:
        proj_query = proj_query.filter(Project.user_id == user_id)
        task_query = task_query.filter(Task.user_id == user_id)
        filter_base = (Task.user_id == user_id,)
    else:
        demo_id = get_demo_user_id(db)
        if demo_id:
            proj_query = proj_query.filter((Project.user_id == demo_id) | (Project.user_id.is_(None)))
            task_query = task_query.filter((Task.user_id == demo_id) | (Task.user_id.is_(None)))
            filter_base = ((Task.user_id == demo_id) | (Task.user_id.is_(None)),)
        else:
            proj_query = proj_query.filter(Project.user_id.is_(None))
            task_query = task_query.filter(Task.user_id.is_(None))
            filter_base = (Task.user_id.is_(None),)

    total_projects = proj_query.scalar() or 0
    total_tasks = task_query.scalar() or 0

    pending_count = (
        db.query(func.count(Task.id))
        .filter(*filter_base, Task.status == TaskStatus.PENDING)
        .scalar()
        or 0
    )
    in_progress_count = (
        db.query(func.count(Task.id))
        .filter(*filter_base, Task.status == TaskStatus.IN_PROGRESS)
        .scalar()
        or 0
    )
    completed_count = (
        db.query(func.count(Task.id))
        .filter(*filter_base, Task.status == TaskStatus.COMPLETED)
        .scalar()
        or 0
    )

    low_count = (
        db.query(func.count(Task.id))
        .filter(*filter_base, Task.priority == TaskPriority.LOW)
        .scalar()
        or 0
    )
    medium_count = (
        db.query(func.count(Task.id))
        .filter(*filter_base, Task.priority == TaskPriority.MEDIUM)
        .scalar()
        or 0
    )
    high_count = (
        db.query(func.count(Task.id))
        .filter(*filter_base, Task.priority == TaskPriority.HIGH)
        .scalar()
        or 0
    )

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
