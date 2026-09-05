from datetime import datetime, date
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.models.task import TaskStatus, TaskPriority
from app.schemas.project import ProjectSummary


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Task title")
    description: Optional[str] = Field(None, description="Task description and notes")
    status: TaskStatus = Field(TaskStatus.PENDING, description="Task status: PENDING | IN_PROGRESS | COMPLETED")
    priority: TaskPriority = Field(TaskPriority.MEDIUM, description="Task priority: LOW | MEDIUM | HIGH")
    due_date: Optional[date] = Field(None, description="Due date (YYYY-MM-DD)")
    project_id: int = Field(..., description="Foreign key referencing Project ID")

    @field_validator("due_date", mode="before")
    @classmethod
    def parse_due_date(cls, v: Any) -> Optional[date]:
        if v == "" or v is None:
            return None
        return v


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[date] = None
    project_id: Optional[int] = None

    @field_validator("due_date", mode="before")
    @classmethod
    def parse_due_date(cls, v: Any) -> Optional[date]:
        if v == "" or v is None:
            return None
        return v


class TaskStatusUpdate(BaseModel):
    status: TaskStatus = Field(..., description="Updated status: PENDING | IN_PROGRESS | COMPLETED")


class TaskRead(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime
    project: Optional[ProjectSummary] = None

    model_config = ConfigDict(from_attributes=True)
