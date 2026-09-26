"""
Tools router — exposes AI-driven tool invocation endpoints.
AI calls platform capabilities through the Tool Gateway only.
"""

from fastapi import APIRouter

router = APIRouter(tags=["tools"])


@router.get("/")
async def list_tools() -> dict:
    """List all registered AI tools. Placeholder — implement in tools/registry/."""
    return {"tools": []}
