"""
Health check router.
Used by load balancer, Docker, and CI to verify the service is alive.
"""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict:
    return {"status": "ok", "service": "tavonza-ai"}
