# 📋 TaskFlow — Task Tracker & Project Board

> Sistema integral de gestión de tareas y proyectos diseñado con arquitectura moderna, estándares profesionales de desarrollo y contenedorización lista para despliegues locales y en servidores VPS con Docker y Docker Compose.

---

## 🏛️ Arquitectura del Sistema

El proyecto está estructurado como un monorepositorio modular desacoplado:

```text
task-tracker/
├── .env.example               # Configuración global y orquestación Compose
├── .env                       # Variables locales activas
├── .gitignore                 # Exclusiones globales de control de versiones
├── docker-compose.yml         # Orquestador multi-contenedor con healthchecks
├── README.md                  # Manual completo de despliegue y operación
│
├── backend/                   # Microservicio API REST en Python (FastAPI)
│   ├── Dockerfile             # Imagen liviana basada en python:3.11-slim
│   ├── entrypoint.sh          # Script de arranque (espera a DB, migra y siembra)
│   ├── requirements.txt       # Dependencias estrictas de producción
│   ├── alembic.ini            # Configuración de migraciones Alembic
│   ├── alembic/               # Historial de migraciones automáticas
│   └── app/
│       ├── main.py            # Servidor FastAPI, CORS y ciclo de vida (Lifespan)
│       ├── core/config.py     # Carga tipada de configuración con Pydantic Settings
│       ├── db/                # Conexión SQLAlchemy, pooling e inicialización
│       ├── models/            # Modelos relacionales Project y Task
│       ├── schemas/           # Validación estricta con Pydantic v2
│       ├── crud/              # Capa de abstracción y queries a la base de datos
│       └── api/v1/endpoints/  # Endpoints REST (Projects, Tasks, Metrics)
│
├── frontend/                  # Aplicación Web Next.js (App Router)
│   ├── Dockerfile             # Multi-stage build optimizado (standalone + pnpm)
│   ├── package.json           # Dependencias (React, Lucide, Tailwind CSS)
│   ├── tailwind.config.ts     # Configuración de estilos estéticos y limpios
│   └── src/
│       ├── app/               # Páginas y layouts de Next.js App Router
│       ├── components/        # Componentes UI (Board, Modales, Badges, Métricas)
│       ├── lib/api.ts         # Cliente API con tipado TypeScript y control de errores
│       └── types/             # Interfaces de dominio (Project, Task, Metrics)
│
└── database/                  # Recursos de base de datos & compatibilidad ORM
    ├── init.sql               # Esquema DDL inicial de respaldo para MySQL 8.0
    └── sequelize/             # Configuración, migraciones y seeders para Sequelize-CLI
```

---

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de contar con:

1. **Docker Engine**: Versión 24.0 o superior instalada.
2. **Docker Compose**: Plugin `docker compose` v2.20 o superior.
3. *(Opcional para desarrollo local sin Docker)*:
   - Node.js v20+ y pnpm.
   - Python 3.11+ con `pip` y `virtualenv`.
   - Servidor MySQL 8.0 local.

---

## ⚙️ 1. Preparación de Variables de Entorno

El repositorio contiene plantillas `.env.example` sincronizadas para cada servicio. Puedes prepararlas en un solo comando:

```bash
# Copiar variable global de Docker Compose
cp .env.example .env

# Copiar variables del backend
cp backend/.env.example backend/.env

# Copiar variables del frontend
cp frontend/.env.example frontend/.env
```

### Detalle de variables clave:
| Variable | Descripción | Valor por defecto |
| :--- | :--- | :--- |
| `MYSQL_ROOT_PASSWORD` | Contraseña de root de MySQL | `supersecretrootpass` |
| `MYSQL_DATABASE` | Nombre de la base de datos | `task_tracker` |
| `MYSQL_USER` | Usuario de la aplicación | `task_user` |
| `MYSQL_PASSWORD` | Contraseña del usuario | `task_secure_password_123` |
| `MYSQL_PORT` | Puerto expuesto de MySQL en el host | `3306` |
| `BACKEND_PORT` | Puerto expuesto de la API FastAPI | `8000` |
| `FRONTEND_PORT` | Puerto expuesto del frontend Next.js | `3000` |
| `NEXT_PUBLIC_API_URL` | URL pública de consumo de la API | `http://localhost:8000` |

---

## 🐳 2. Construcción y Despliegue en un Solo Paso

Ejecuta el siguiente comando en la raíz del proyecto para construir las imágenes, inicializar los volúmenes, esperar a que MySQL esté saludable, ejecutar las migraciones y sembrar los datos iniciales automáticamente:

```bash
docker compose up --build
```

Si deseas ejecutarlo en segundo plano (modo daemon):

```bash
docker compose up -d --build
```

### ¿Qué sucede durante el arranque?
1. **Contenedor `db`**: Levanta MySQL 8.0 e inicializa el healthcheck cada 5 segundos.
2. **Contenedor `backend`**: Espera a que MySQL responda positivamente al healthcheck (`condition: service_healthy`), ejecuta `alembic upgrade head`, siembra **2 proyectos** y **5 tareas** iniciales de prueba (idempotente), y arranca el servidor `uvicorn`.
3. **Contenedor `frontend`**: Construye el bundle standalone optimizado de Next.js mediante un build multi-stage con `pnpm` y queda listo en el puerto 3000.

---

## 🌐 3. URLs y Puertos de Acceso Local

Una vez iniciados los servicios, accede a los siguientes enlaces:

| Servicio | URL Local | Descripción |
| :--- | :--- | :--- |
| **Frontend Web** | [http://localhost:3000](http://localhost:3000) | Tablero interactivo Kanban, métricas y gestión de tareas |
| **API Docs (Swagger)** | [http://localhost:8000/docs](http://localhost:8000/docs) | Documentación interactiva OpenAPI para pruebas de endpoints |
| **API ReDoc** | [http://localhost:8000/redoc](http://localhost:8000/redoc) | Especificación alternativa de la API |
| **API Healthcheck** | [http://localhost:8000/health](http://localhost:8000/health) | Diagnóstico de salud y conexión con MySQL |
| **Base de Datos MySQL** | `localhost:3306` | Conexión directa para DBeaver, TablePlus, DataGrip o MySQL Workbench |

### Credenciales de acceso a MySQL:
- **Host**: `127.0.0.1` o `localhost`
- **Puerto**: `3306`
- **Base de datos**: `task_tracker`
- **Usuario**: `task_user`
- **Contraseña**: `task_secure_password_123`
- *(Usuario root disponible con password `supersecretrootpass`)*

---

## 🛠️ 4. Comandos Útiles de Operación

### Ver logs en tiempo real:
```bash
# Ver logs combinados de todos los contenedores
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

### Reiniciar un servicio específico:
```bash
docker compose restart backend
docker compose restart frontend
```

### Detener el entorno:
```bash
# Apagar contenedores conservando la base de datos y volumen
docker compose down

# Apagar y remover volúmenes (reiniciar la base de datos desde cero)
docker compose down -v
```

### Ejecutar comandos dentro de los contenedores:
```bash
# Acceder a la terminal interactiva de MySQL
docker compose exec db mysql -u task_user -ptask_secure_password_123 task_tracker

# Crear una nueva migración de Alembic
docker compose exec backend alembic revision --autogenerate -m "nombre_migracion"

# Aplicar migraciones manualmente
docker compose exec backend alembic upgrade head

# Re-ejecutar el script de sembrado manual
docker compose exec backend python -m app.db.init_db
```

---

## 🔄 5. Soporte para Sequelize / Sequelize-CLI

Si tu equipo o pipeline de despliegue prefiere gestionar las migraciones con Sequelize en el ecosistema Node.js, se incluye la carpeta `database/sequelize/` completamente configurada:

```bash
cd database/sequelize
npm install
# Ejecutar migraciones con Sequelize
npx sequelize-cli db:migrate --config config/config.json --env development
# Ejecutar semillas con Sequelize
npx sequelize-cli db:seed:all --config config/config.json --env development
```

---

## 🚀 6. Buenas Prácticas para Producción (VPS)

1. **Proxy Inverso con SSL**: Colocar Nginx o Caddy delante para gestionar certificados SSL automáticos con Let's Encrypt y servir `api.tudominio.com` y `app.tudominio.com`.
2. **Secretos**: Sustituir las contraseñas por defecto en `.env` por cadenas criptográficas seguras (`openssl rand -hex 32`).
3. **Firewall (UFW)**: Cerrar el puerto `3306` al tráfico externo en el VPS, permitiendo únicamente el acceso a través de la red interna de Docker Compose.
