from fastapi import APIRouter, Depends, HTTPException, status # type: ignore
from sqlalchemy.orm import Session # type: ignore
from app.db.session import get_db
from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserRead,
    Token,
    PasswordResetRequest,
    PasswordResetResponse,
)
from app.crud import crud_user
from app.core.security import create_access_token
from app.core.rate_limit import auth_rate_limiter, recovery_rate_limiter
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.post(
    "/register",
    response_model=Token,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(auth_rate_limiter)],
    summary="Registro de nuevo usuario",
)
def register(
    user_in: UserCreate,
    db: Session = Depends(get_db),
):
    """
    Registra una nueva cuenta de usuario con hash seguro (bcrypt + salt)
    y retorna un token de acceso JWT.
    Protegido contra abusos mediante limitación de tasa (Rate Limiting).
    """
    existing_user = crud_user.get_user_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una cuenta registrada con este correo electrónico.",
        )

    if len(user_in.password.strip()) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña debe contener al menos 8 caracteres.",
        )

    user = crud_user.create_user(db=db, user_in=user_in)
    access_token = create_access_token(subject=user.id, extra_claims={"email": user.email})

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserRead.model_validate(user),
    )


@router.post(
    "/login",
    response_model=Token,
    dependencies=[Depends(auth_rate_limiter)],
    summary="Inicio de sesión con credenciales",
)
def login(
    credentials: UserLogin,
    db: Session = Depends(get_db),
):
    """
    Autentica al usuario verificando la contraseña con salt y genera
    un token JWT de acceso.
    Protegido contra ataques de fuerza bruta mediante Rate Limiting.
    """
    user = crud_user.authenticate(
        db=db,
        email=credentials.email,
        password=credentials.password,
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas o cuenta inactiva. Verifica correo y contraseña.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=user.id, extra_claims={"email": user.email})

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserRead.model_validate(user),
    )


@router.post(
    "/forgot-password",
    response_model=PasswordResetResponse,
    dependencies=[Depends(recovery_rate_limiter)],
    summary="Solicitud de recuperación de contraseña",
)
def forgot_password(
    data: PasswordResetRequest,
    db: Session = Depends(get_db),
):
    """
    Endpoint de recuperación de contraseñas. Protegido con Rate Limiting
    para prevenir enumeración de correos y abuso de envíos.
    """
    # Verificación silenciosa para proteger la privacidad del usuario
    user = crud_user.get_user_by_email(db, email=data.email)
    # En producción se encolaría el correo con token de restablecimiento firmado
    return PasswordResetResponse(
        message="Si el correo está registrado en la plataforma, recibirás instrucciones para restablecer tu contraseña."
    )


@router.get(
    "/me",
    response_model=UserRead,
    summary="Obtener perfil del usuario autenticado",
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    """Retorna los datos del usuario autenticado a partir del token Bearer."""
    return current_user
