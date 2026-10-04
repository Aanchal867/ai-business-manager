from contextlib import asynccontextmanager, closing
import logging
import os
from pathlib import Path

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import get_connection

from routes.customer import router as customers_router
from routes.appointment import router as appointments_router
from routes.service import router as services_router
from routes.order import router as orders_router
from routes.invoice import router as invoices_router
from routes.dashboard import router as dashboard_router
from routes.report import router as reports_router
from routes.setting import router as settings_router
from routes.auth import require_admin, router as auth_router
from routes.ai import router as ai_router
from routes.contact import router as contact_router

logger = logging.getLogger(__name__)


def initialize_user_roles():
    migration_path = (
        Path(__file__).resolve().parent
        / "migrations"
        / "001_add_user_roles.sql"
    )

    try:
        migration_sql = migration_path.read_text(encoding="utf-8")

        with closing(get_connection()) as connection:
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(migration_sql)
    except Exception:
        logger.exception("Failed to apply user_roles database migration")
        raise

    logger.info("Ensured the users.role column and admin role are configured")


def initialize_contact_messages_table():
    migration_path = (
        Path(__file__).resolve().parent
        / "migrations"
        / "002_create_contact_messages.sql"
    )

    try:
        migration_sql = migration_path.read_text(encoding="utf-8")

        with closing(get_connection()) as connection:
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(migration_sql)
    except Exception:
        logger.exception("Failed to apply contact_messages database migration")
        raise

    logger.info("Ensured the contact_messages table exists")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    initialize_user_roles()
    initialize_contact_messages_table()
    yield


fastapi_app = FastAPI(
    title="AI Business Manager API",
    description="Backend API for AI Business Manager",
    version="1.0.0",
    lifespan=lifespan
)


# =========================================================
# CORS
# =========================================================

frontend_origins = [
    "https://ai-business-manager-gwcj.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Optional production frontend origin
frontend_origin = os.getenv("FRONTEND_ORIGIN")

if frontend_origin:
    frontend_origins.append(frontend_origin)


# =========================================================
# HOME
# =========================================================

@fastapi_app.get("/")
def home():
    return {
        "message": "AI Business Manager Backend is running!",
        "status": "success"
    }


# =========================================================
# DATABASE HEALTH CHECK
# =========================================================

@fastapi_app.get("/health/db")
def database_health():
    connection = None

    try:
        connection = get_connection()

        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()

            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_name = 'users'
                )
            """)

            users_table_exists = cursor.fetchone()[0]

        return {
            "status": "success",
            "database": "connected",
            "users_table": users_table_exists
        }

    except Exception as error:
        logger.exception("Database health check failed")
        return {
            "status": "error",
            "database": "connection_failed",
            "error_type": type(error).__name__
        }

    finally:
        if connection:
            connection.close()


# =========================================================
# ROUTES
# =========================================================

fastapi_app.include_router(customers_router, dependencies=[Depends(require_admin)])
fastapi_app.include_router(appointments_router, dependencies=[Depends(require_admin)])
fastapi_app.include_router(services_router, dependencies=[Depends(require_admin)])
fastapi_app.include_router(orders_router, dependencies=[Depends(require_admin)])
fastapi_app.include_router(invoices_router, dependencies=[Depends(require_admin)])
fastapi_app.include_router(dashboard_router, dependencies=[Depends(require_admin)])
fastapi_app.include_router(reports_router, dependencies=[Depends(require_admin)])
fastapi_app.include_router(settings_router, dependencies=[Depends(require_admin)])
fastapi_app.include_router(auth_router)
fastapi_app.include_router(ai_router, dependencies=[Depends(require_admin)])
fastapi_app.include_router(contact_router)

app = CORSMiddleware(
    app=fastapi_app,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)