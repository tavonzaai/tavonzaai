"""
Audit Writer — Reference: .agent/AI.md Section "AI Audit" & .agent/AUTHORIZATION.md Section "Audit"
Ensures all AI actions and tool calls are traceable with the exact platform audit schema:
- actorType
- actingUserId
- aiAgentId
- organizationId
- restaurantId
- branchId
- action
- resource
- before
- after
- authorizationResult
- timestamp
- source
"""

import json
from datetime import UTC, datetime
from typing import Any

from ..internal_client import InternalClient
from ..models import ActorContext


def _sanitize_audit_after(tool_name: str, result: dict[str, Any]) -> Any:
    """Sanitizes audit payload to prevent token explosion or sensitive leaks."""
    if not result:
        return None
    data = result.get("data")
    if data is None:
        return {"ok": result.get("ok", True)}

    if tool_name == "get_audit_events":
        events = data.get("events", []) if isinstance(data, dict) else []
        return {"action": "query_audit_logs", "count": len(events)}

    if tool_name == "get_menu":
        items = data.get("items", []) if isinstance(data, dict) else []
        return {"action": "query_menu", "count": len(items)}

    if tool_name == "get_inventory":
        inv = (data.get("items") or data.get("inventory") or []) if isinstance(data, dict) else []
        return {"action": "query_inventory", "count": len(inv) if isinstance(inv, list) else 0}

    if isinstance(data, dict):
        try:
            dumped = json.dumps(data)
            if len(dumped) > 800:
                return {"summary": dumped[:400] + "... [truncated]"}
        except Exception:
            return {"summary": str(data)[:400]}
        return data

    return str(data)[:400]


async def write_tool_audit(
    client: InternalClient,
    actor: ActorContext,
    tool_name: str,
    args: dict[str, Any],
    result: dict[str, Any],
) -> None:
    """Writes an audit record for every AI tool call — same schema as human actions."""
    record = {
        "actorType": actor.actor_type,
        "actingUserId": actor.acting_user_id,
        "aiAgentId": actor.ai_agent_id,
        "role": actor.role,
        "organizationId": actor.organization_id,
        "restaurantId": actor.restaurant_id,
        "branchId": actor.branch_id,
        "action": tool_name,
        "resource": args,
        "before": None,
        "after": _sanitize_audit_after(tool_name, result),
        "authorizationResult": "ALLOW" if result.get("ok", True) else "DENY",
        "timestamp": datetime.now(UTC).isoformat(),
        "source": "tavonza-ai",
    }
    await client.write_audit(record)
