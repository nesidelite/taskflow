from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Union
import bcrypt
import jwt
try:
    from app.core.config import settings
    SECRET_KEY = settings.SECRET_KEY
    ALGORITHM = settings.ALGORITHM
    ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
except ImportError:
    SECRET_KEY = "taskflow_super_secret_jwt_key_2026_change_in_production_environment"
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 1440


def hash_password(password: str) -> str:
    """Hash a plain text password with a secure salt using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain text password against an existing bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def create_access_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[dict] = None,
) -> str:
    """Create a signed JWT access token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {
        "sub": str(subject),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    if extra_claims:
        to_encode.update(extra_claims)

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
        return payload
    except (jwt.PyJWTError, Exception):
        return None
