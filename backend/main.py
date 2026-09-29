from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.customer import router as customers_router
from routes.appointment import router as appointments_router
from routes.service import router as services_router
from routes.order import router as orders_router
from routes.invoice import router as invoices_router
from routes.dashboard import router as dashboard_router
from routes.report import router as reports_router
from routes.setting import router as settings_router
from routes.auth import router as auth_router
from routes.ai import router as ai_router


app = FastAPI(
    title="AI Business Manager API",
    description="Backend API for AI Business Manager",
    version="1.0.0"
)


# =========================================================
# CORS
# React frontend ko FastAPI backend access karne ki permission
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        # Current Vite frontend
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "message": "AI Business Manager Backend is running!",
        "status": "success"
    }


# =========================================================
# ROUTES
# =========================================================

app.include_router(customers_router)
app.include_router(appointments_router)
app.include_router(services_router)
app.include_router(orders_router)
app.include_router(invoices_router)
app.include_router(dashboard_router)
app.include_router(reports_router)
app.include_router(settings_router)
app.include_router(auth_router)
app.include_router(ai_router)