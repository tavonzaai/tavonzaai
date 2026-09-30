"""
Confirmation Policy — Reference: .agent/AI.md Section "High-risk mutation"
Manages explicit confirmations for sensitive operations.
"""

from typing import Any

from pydantic import BaseModel


class ConfirmationRequest(BaseModel):
    confirmation_id: str
    action_name: str
    summary: str
    actor_id: str
    resource_id: str | None = None
    parameters: dict[str, Any] = {}
    expires_at: str | None = None


class ConfirmationResult(BaseModel):
    confirmed: bool
    confirmation_id: str
    actor_id: str
    error: str | None = None
