"""
Tool Registry — Reference: .agent/AI.md Section "Tool Gateway"
Dynamic tool inventory pruning based on the actor's resolved permissions.
"""


from src.models import ActorContext
from src.tools.definitions.restaurant_tools import TOOLS


def tools_for_actor(actor: ActorContext) -> list[dict]:
    """Dynamic tool pruning: only expose tools this actor's resolved permissions allow."""
    if "*" in actor.permissions:
        return [t["schema"] for t in TOOLS.values()]
    return [t["schema"] for t in TOOLS.values() if t["required_permission"] in actor.permissions]


def get_tool(name: str) -> dict | None:
    return TOOLS.get(name)
