from sqlalchemy import Column, Integer, String, Boolean, DateTime, func # type: ignore
from sqlalchemy.orm import relationship # type: ignore
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan", lazy="selectin")

    def __repr__(self) -> str:
        return f"<User id={self.id} email='{self.email}'>"
