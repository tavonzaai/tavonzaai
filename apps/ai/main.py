"""
AI Application Entrypoint — FastAPI
====================================
Architecture: AI → Tool Gateway → Authorization → Application → Domain → Database

AI is an authorized client of the platform. It NEVER accesses the database directly.
All platform capabilities are accessed exclusively through the Tool Gateway API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import tools, health

app = FastAPI(
    title="Tavonza AI Service",
    description="AI agent runtime, context builder, and Tool Gateway client",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(tools.router, prefix="/tools")
