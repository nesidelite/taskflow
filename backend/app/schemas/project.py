from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class ProjectBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=150, description="Project title")
    description: Optional[str] = Field(None, description="Detailed project description")
    color: str = Field("#3b82f6", max_length=30, description="Hex color or badge color code")


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=150)
    description: Optional[str] = None
    color: Optional[str] = Field(None, max_length=30)


class ProjectSummary(BaseModel):
    id: int
    title: str
    color: str

    model_config = ConfigDict(from_attributes=True)


class ProjectRead(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime
    task_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


class ProjectWithTasks(ProjectRead):
    # Avoid circular import by referencing TaskRead lazily or as generic dict
    tasks: List[dict] = []

    model_config = ConfigDict(from_attributes=True)
