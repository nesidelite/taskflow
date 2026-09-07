import enum
import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey, Enum, func # type: ignore
from sqlalchemy.orm import relationship # type: ignore
from app.db.base import Base


class TaskStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


class TaskPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(
        Enum(TaskStatus, name="task_status_enum", native_enum=False),
        nullable=False,
        default=TaskStatus.PENDING,
        index=True,
    )
    priority = Column(
        Enum(TaskPriority, name="task_priority_enum", native_enum=False),
        nullable=False,
        default=TaskPriority.MEDIUM,
        index=True,
    )
    due_date = Column(Date, nullable=True)
    project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    project = relationship("Project", back_populates="tasks", lazy="joined")
    user = relationship("User", back_populates="tasks", lazy="joined")

    def __repr__(self) -> str:
        return f"<Task id={self.id} title='{self.title}' status='{self.status}'>"
