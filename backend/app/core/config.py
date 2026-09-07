from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Task Tracker & Project Board API"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    DATABASE_URL: str = "mysql+pymysql://task_user:task_secure_password_123@localhost:3306/task_tracker?charset=utf8mb4"
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:3000,http://127.0.0.1:3000"
    SECRET_KEY: str = "taskflow_super_secret_jwt_key_2026_change_in_production_environment"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    RATE_LIMIT_AUTH: str = "5/minute"
    RATE_LIMIT_RECOVERY: str = "3/minute"
    RATE_LIMIT_MUTATION: str = "60/minute"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
