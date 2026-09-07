from typing import Optional
from sqlalchemy.orm import Session # type: ignore
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password, verify_password


def get_user(db: Session, user_id: int) -> Optional[User]:
    """Retrieve user by ID."""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Retrieve user by email address (case-insensitive)."""
    return db.query(User).filter(User.email.ilike(email.strip())).first()


def create_user(db: Session, user_in: UserCreate) -> User:
    """Create a new user with bcrypt-hashed password."""
    db_user = User(
        email=user_in.email.strip().lower(),
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name.strip() if user_in.full_name else None,
        is_active=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate user with email and plain password verification."""
    user = get_user_by_email(db, email=email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    if not user.is_active:
        return None
    return user
