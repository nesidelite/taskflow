from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class UserBase(BaseModel):
    email: str = Field(..., max_length=255, description="Correo electrónico del usuario")
    full_name: Optional[str] = Field(None, max_length=150, description="Nombre completo")


class UserCreate(UserBase):
    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="Contraseña segura (mínimo 8 caracteres)",
    )


class UserLogin(BaseModel):
    email: str = Field(..., description="Correo electrónico")
    password: str = Field(..., description="Contraseña")


class UserRead(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class PasswordResetRequest(BaseModel):
    email: str = Field(..., description="Correo electrónico para restablecimiento")


class PasswordResetResponse(BaseModel):
    message: str
