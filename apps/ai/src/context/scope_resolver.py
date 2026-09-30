"""
Scope Resolver — Reference: .agent/AI.md Section "Context" & "Scope"
Ensures the AI agent only receives minimal and safely scoped data:
Raw Domain Data / Events -> Context Builder -> Scope Resolver -> Safe Context -> AI
"Do not provide an AI agent with an entire organization's data when it only needs one branch or table."
"""

from typing import Any

from src.models import ActorContext


def resolve_safe_scope(actor: ActorContext) -> dict[str, Any]:
    """Derives a strictly safe resource scope for the actor."""
    raw_scope = actor.resource_scope or {}

    safe = {
        "organization_id": actor.organization_id,
        "branch_id": actor.branch_id,
    }

    if actor.restaurant_id:
        safe["restaurant_id"] = actor.restaurant_id

    # Table guest isolation
    if "table_code" in raw_scope:
        safe["table_code"] = raw_scope["table_code"]
        safe["table_session_id"] = raw_scope.get("table_session_id", "active")
        return safe

    # Staff table assignment isolation
    if "tables" in raw_scope:
        safe["tables"] = raw_scope["tables"]

    # Kitchen station isolation
    if "station" in raw_scope:
        safe["station"] = raw_scope["station"]

    return safe
