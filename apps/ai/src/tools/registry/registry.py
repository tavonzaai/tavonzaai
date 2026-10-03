"""
Tool Registry — Reference: .agent/AI.md Section "Tool Gateway"
Dynamic tool inventory pruning based on the actor's resolved permissions.
"""


from src.models import ActorContext
from src.policies.roles import is_tool_allowed_for_role
from src.tools.definitions.restaurant_tools import TOOLS


def tools_for_actor(actor: ActorContext) -> list[dict]:
    """Dynamic tool pruning: only expose tools this actor's resolved permissions and role allow."""
    if "*" in actor.permissions:
        return [t["schema"] for t in TOOLS.values()]

    allowed: list[dict] = []
    for tool_name, t in TOOLS.items():
        if t["required_permission"] not in actor.permissions:
            continue
        if actor.role and not is_tool_allowed_for_role(tool_name, actor.role):
            continue
        allowed.append(t["schema"])
    return allowed


def get_tool(name: str) -> dict | None:
    return TOOLS.get(name)
