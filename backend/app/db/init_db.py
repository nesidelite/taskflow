from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.project import Project
from app.models.task import Task, TaskStatus, TaskPriority


def init_db(db: Session) -> None:
    # Ensure all tables are created
    Base.metadata.create_all(bind=engine)

    # Check if database is already populated
    existing_projects = db.query(Project).count()
    if existing_projects > 0:
        print("[INIT_DB] Database already initialized. Skipping seed data.")
        return

    print("[INIT_DB] Seeding database with initial sample projects and tasks...")

    # 1. Seed Projects
    p1 = Project(
        title="Rediseño Web Corporativa",
        description="Actualización de la interfaz y experiencia de usuario para la plataforma comercial.",
        color="#3B82F6",  # Blue
    )
    p2 = Project(
        title="Infraestructura Cloud & DevOps",
        description="Migración a Docker Compose y configuración de pipelines CI/CD para producción.",
        color="#10B981",  # Emerald / Green
    )

    db.add(p1)
    db.add(p2)
    db.commit()
    db.refresh(p1)
    db.refresh(p2)

    today = date.today()

    # 2. Seed Tasks
    tasks = [
        Task(
            title="Diseñar wireframes en Figma",
            description="Elaborar componentes de alta fidelidad y guías de estilos con componentes shadcn/ui.",
            status=TaskStatus.COMPLETED,
            priority=TaskPriority.HIGH,
            due_date=today - timedelta(days=2),
            project_id=p1.id,
        ),
        Task(
            title="Maquetar landing page con Next.js",
            description="Implementar vistas con App Router y componentes interactivos consumiendo FastAPI.",
            status=TaskStatus.IN_PROGRESS,
            priority=TaskPriority.MEDIUM,
            due_date=today + timedelta(days=4),
            project_id=p1.id,
        ),
        Task(
            title="Pruebas de usabilidad responsive",
            description="Validar visualización en dispositivos móviles y tabletas con modo oscuro/claro.",
            status=TaskStatus.PENDING,
            priority=TaskPriority.LOW,
            due_date=today + timedelta(days=10),
            project_id=p1.id,
        ),
        Task(
            title="Configurar contenedores Docker y Compose",
            description="Escribir Dockerfiles multi-stage y orquestación con healthcheck para MySQL 8.0.",
            status=TaskStatus.COMPLETED,
            priority=TaskPriority.HIGH,
            due_date=today - timedelta(days=1),
            project_id=p2.id,
        ),
        Task(
            title="Automatizar migraciones y healthchecks en VPS",
            description="Preparar scripts de despliegue continuo y comprobación de base de datos MySQL en producción.",
            status=TaskStatus.IN_PROGRESS,
            priority=TaskPriority.HIGH,
            due_date=today + timedelta(days=3),
            project_id=p2.id,
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
