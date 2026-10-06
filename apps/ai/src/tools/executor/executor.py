"""
Tool Executor — Reference: .agent/AI.md Section "Tool Execution"
Executes: AI Tool Call -> Resolve Scope -> Check Permission -> Strip Injected Scope -> Execute Backend Tool -> Audit.
AI never accesses the database directly.
"""

from typing import Any

from ...audit.audit_writer import write_tool_audit
from ...internal_client import InternalClient
from ...models import ActorContext
from ..authorization.auth_gate import (
    ToolAuthorizationError,
    authorize_tool_call,
)
from ..registry.registry import get_tool


class ToolExecutionError(Exception):
    pass


class ToolExecutor:
    def __init__(self, internal_client: InternalClient) -> None:
        self._client = internal_client

    async def execute(self, tool_name: str, args: dict[str, Any], actor: ActorContext) -> dict[str, Any]:
        tool = get_tool(tool_name)
        if tool is None:
            raise ToolExecutionError(f"Unknown tool: {tool_name}")

        # Strip any scope fields the LLM might have injected — scope always comes from ActorContext
        safe_args = {k: v for k, v in args.items() if k not in {"organization_id", "branch_id", "scope"}}

        # Enforce table isolation for table guests to prevent prompt injection cross-table inspection
        scoped_table = (actor.resource_scope or {}).get("table_code")
        raw_table_id = None
        if scoped_table and "table_id" in safe_args:
            safe_args["table_id"] = scoped_table
        elif tool_name in ("get_table_status", "get_table_bill"):
            # Normalize table identifiers to match database convention (e.g. "1", "Table 1", "T1" -> "T-01")
            raw_table_id = str(safe_args.get("table_id") or safe_args.get("table_code") or "").strip()
            import re
            m = re.match(r"^(?:table\s*|t)?-?0*(\d+)$", raw_table_id, re.I)
            if m:
                safe_args["table_id"] = f"T-{int(m.group(1)):02d}"

        # Authorization check
        try:
            authorize_tool_call(tool, actor, tool_name)
        except ToolAuthorizationError as exc:
            await write_tool_audit(
                client=self._client,
                actor=actor,
                tool_name=tool_name,
                args=safe_args,
                result={"ok": False, "error": str(exc)},
            )
            raise ToolExecutionError(str(exc)) from exc

        # Execute through backend tool gateway
        result = await self._client.execute_tool(tool_name, safe_args, actor)
        if not result.get("ok") and raw_table_id and safe_args.get("table_id") != raw_table_id:
            fallback_args = dict(safe_args)
            fallback_args["table_id"] = raw_table_id
            fb_res = await self._client.execute_tool(tool_name, fallback_args, actor)
            if fb_res.get("ok"):
                result = fb_res

        # Audit recording
        await write_tool_audit(
            client=self._client,
            actor=actor,
            tool_name=tool_name,
            args=safe_args,
            result=result,
        )

        return result
