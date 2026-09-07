from datetime import date, timedelta
from sqlalchemy.orm import Session # type: ignore
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.user import User
from app.models.project import Project
from app.models.task import Task, TaskStatus, TaskPriority
from app.core.security import hash_password


def init_db(db: Session) -> None:
    # Ensure all tables are created
    Base.metadata.create_all(bind=engine)

    # 1. Check or seed demo User
    demo_user = db.query(User).filter(User.email == "admin@taskflow.dev").first()
    if not demo_user:
        demo_user = User(
            email="admin@taskflow.dev",
            hashed_password=hash_password("TaskFlowSecure2026!"),
            full_name="Usuario Demo",
            is_active=True,
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        print("[INIT_DB] Seeded initial demo user: admin@taskflow.dev")

    # Check if database is already populated
    existing_projects = db.query(Project).count()
    if existing_projects > 0:
        print("[INIT_DB] Database already initialized with projects. Skipping seed data.")
        return

    print("[INIT_DB] Seeding database with initial sample projects and tasks...")

    # 2. Seed Projects
    p1 = Project(
        title="Rediseño Web Corporativa",
        description="Actualización de la interfaz y experiencia de usuario para la plataforma comercial.",
        color="#3B82F6",  # Blue
        user_id=demo_user.id,
    )
    p2 = Project(
        title="Infraestructura Cloud & DevOps",
        description="Migración a Docker Compose y configuración de pipelines CI/CD para producción.",
        color="#10B981",  # Emerald / Green
        user_id=demo_user.id,
    )

    db.add(p1)
    db.add(p2)
    db.commit()
    db.refresh(p1)
    db.refresh(p2)

    today = date.today()

    # 3. Seed Tasks
    tasks = [
        Task(
            title="Diseñar wireframes en Figma",
            description="Elaborar componentes de alta fidelidad y guías de estilos con componentes shadcn/ui.",
            status=TaskStatus.COMPLETED,
            priority=TaskPriority.HIGH,
            due_date=today - timedelta(days=2),
            project_id=p1.id,
            user_id=demo_user.id,
        ),
        Task(
            title="Maquetar landing page con Next.js",
            description="Implementar vistas con App Router y componentes interactivos consumiendo FastAPI.",
            status=TaskStatus.IN_PROGRESS,
            priority=TaskPriority.MEDIUM,
            due_date=today + timedelta(days=4),
            project_id=p1.id,
            user_id=demo_user.id,
        ),
        Task(
            title="Pruebas de usabilidad responsive",
            description="Validar visualización en dispositivos móviles y tabletas con modo oscuro/claro.",
            status=TaskStatus.PENDING,
            priority=TaskPriority.LOW,
            due_date=today + timedelta(days=10),
            project_id=p1.id,
            user_id=demo_user.id,
        ),
        Task(
            title="Configurar contenedores Docker y Compose",
            description="Escribir Dockerfiles multi-stage y orquestación con healthcheck para MySQL 8.0.",
            status=TaskStatus.COMPLETED,
            priority=TaskPriority.HIGH,
            due_date=today - timedelta(days=1),
            project_id=p2.id,
            user_id=demo_user.id,
        ),
        Task(
            title="Automatizar migraciones y healthchecks en VPS",
            description="Preparar scripts de despliegue continuo y comprobación de base de datos MySQL en producción.",
            status=TaskStatus.IN_PROGRESS,
            priority=TaskPriority.HIGH,
            due_date=today + timedelta(days=3),
            project_id=p2.id,
            user_id=demo_user.id,
        ),
    ]

    for t in tasks:
        db.add(t)

    db.commit()
    print(f"[INIT_DB] Successfully seeded 2 projects and {len(tasks)} tasks.")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
