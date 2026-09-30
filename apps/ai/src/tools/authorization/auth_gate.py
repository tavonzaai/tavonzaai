"""
Tool Authorization Gate — Reference: .agent/AI.md Section "Tool Execution" & .agent/AUTHORIZATION.md
Verifies that the resolved ActorContext possesses the capability required for the tool.
"""

from src.models import ActorContext


class ToolAuthorizationError(Exception):
    pass


def authorize_tool_call(tool_def: dict, actor: ActorContext, tool_name: str) -> None:
    required_perm = tool_def.get("required_permission")
    if not required_perm:
        return

    # Check permission
    if required_perm not in actor.permissions and "*" not in actor.permissions:
        actor_id = actor.ai_agent_id or actor.acting_user_id or actor.actor_type
        raise ToolAuthorizationError(
            f"Actor '{actor_id}' lacks permission '{required_perm}' required for tool '{tool_name}'"
        )
