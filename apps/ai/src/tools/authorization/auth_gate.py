"""
Tool Authorization Gate — Reference: .agent/AI.md Section "Tool Execution" & .agent/AUTHORIZATION.md
Verifies that the resolved ActorContext possesses the capability required for the tool.
"""

from src.models import ActorContext
from src.policies.roles import is_tool_allowed_for_role


class ToolAuthorizationError(Exception):
    pass


def authorize_tool_call(tool_def: dict, actor: ActorContext, tool_name: str) -> None:
    required_perm = tool_def.get("required_permission")
    if not required_perm:
        return

    # 1. Explicit role boundary enforcement (defense-in-depth)
    if actor.role and "*" not in actor.permissions:
        if not is_tool_allowed_for_role(tool_name, actor.role):
            raise ToolAuthorizationError(
                f"Role '{actor.role}' is not authorized to use tool '{tool_name}' (requires '{required_perm}')"
            )

    # 2. Capability permission check
    has_perm = (
        required_perm in actor.permissions
        or "*" in actor.permissions
        or (tool_name == "get_kitchen_queue" and "orders.read" in actor.permissions)
    )
    if not has_perm:
        actor_id = actor.ai_agent_id or actor.acting_user_id or actor.actor_type
        role_info = f" (role: '{actor.role}')" if actor.role else ""
        raise ToolAuthorizationError(
            f"Actor '{actor_id}'{role_info} lacks permission '{required_perm}' required for tool '{tool_name}'"
        )
