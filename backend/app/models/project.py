from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func # type: ignore
from sqlalchemy.orm import relationship # type: ignore
from app.db.base import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(150), nullable=False, index=True)
    description = Column(Text, nullable=True)
    color = Column(String(30), nullable=False, default="#3b82f6")
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan", lazy="selectin")
    user = relationship("User", back_populates="projects", lazy="joined")

    def __repr__(self) -> str:
        return f"<Project id={self.id} title='{self.title}'>"
