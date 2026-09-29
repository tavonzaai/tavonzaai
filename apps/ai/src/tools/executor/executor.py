"""
Tool Executor — Reference: .agent/AI.md Section "Tool Execution"
Executes: AI Tool Call -> Resolve Scope -> Check Permission -> Strip Injected Scope -> Execute Backend Tool -> Audit.
AI never accesses the database directly.
"""

from typing import Any

from src.audit.audit_writer import write_tool_audit
from src.internal_client import InternalClient
from src.models import ActorContext
from src.tools.authorization.auth_gate import (
    ToolAuthorizationError,
    authorize_tool_call,
)
from src.tools.registry.registry import get_tool


class ToolExecutionError(Exception):
    pass


class ToolExecutor:
    def __init__(self, internal_client: InternalClient) -> None:
        self._client = internal_client

    async def execute(self, tool_name: str, args: dict[str, Any], actor: ActorContext) -> dict[str, Any]:
        tool = get_tool(tool_name)
        if tool is None:
            raise ToolExecutionError(f"Unknown tool: {tool_name}")

        # Authorization check
        try:
            authorize_tool_call(tool, actor, tool_name)
        except ToolAuthorizationError as exc:
            raise ToolExecutionError(str(exc)) from exc

        # Strip any scope fields the LLM might have injected — scope always comes from ActorContext
        safe_args = {k: v for k, v in args.items() if k not in {"organization_id", "branch_id", "scope"}}

        # Execute through backend tool gateway
        result = await self._client.execute_tool(tool_name, safe_args, actor)

        # Audit recording
        await write_tool_audit(
            client=self._client,
            actor=actor,
            tool_name=tool_name,
            args=safe_args,
            result=result,
        )

        return result
