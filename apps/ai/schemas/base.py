"""
Base schema for all Tool Gateway requests and responses.
All AI tool schemas must use Pydantic v2. No raw dicts.
"""

from pydantic import BaseModel
from typing import Any


class ActorContext(BaseModel):
    """
    Represents the authenticated user/session making the AI request.
    This is passed on every Tool Gateway call — AI never acts without context.
    """

    user_id: str
    organization_id: str
    branch_id: str | None = None
    role: str
    scopes: list[str] = []


class ToolInvokeRequest(BaseModel):
    """Request body for invoking a platform tool."""

    tool: str                        # e.g. "orders.getStatus"
    actor: ActorContext
    params: dict[str, Any] = {}


class ToolInvokeResponse(BaseModel):
    """Response from a platform tool invocation."""

    success: bool
    data: dict[str, Any] | None = None
    error: str | None = None
