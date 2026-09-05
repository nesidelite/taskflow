from typing import Dict
from pydantic import BaseModel


class StatusMetrics(BaseModel):
    pending: int = 0
    in_progress: int = 0
    completed: int = 0


class PriorityMetrics(BaseModel):
    low: int = 0
    medium: int = 0
    high: int = 0


class DashboardMetrics(BaseModel):
    total_projects: int = 0
    total_tasks: int = 0
    status_counts: StatusMetrics
    priority_counts: PriorityMetrics
    completion_rate_percentage: float = 0.0
