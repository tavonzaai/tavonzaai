"""
Tool Gateway Client
====================
The ONLY way AI interacts with platform data.
AI never calls the database directly — only through this gateway.

The Tool Gateway forwards calls to apps/api, which enforces:
  Actor → Permission → Scope → Resource → Domain Rules
"""

import httpx
from typing import Any
from config import settings


class ToolGatewayClient:
    """HTTP client for the platform Tool Gateway."""

    def __init__(self) -> None:
        self._base_url = settings.tool_gateway_url
        self._client = httpx.AsyncClient(
            base_url=self._base_url,
            timeout=30.0,
        )

    async def invoke(
        self,
        tool: str,
        actor: dict[str, Any],
        params: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Invoke a platform tool through the Tool Gateway.

        Args:
            tool:   Tool name e.g. "orders.getStatus"
            actor:  Authenticated actor context (organization_id, user_id, role, scopes)
            params: Tool-specific parameters

        Returns:
            Tool response payload

        Raises:
            httpx.HTTPStatusError: If authorization is denied (403) or tool not found (404)
        """
        response = await self._client.post(
            "/tools/invoke",
            json={"tool": tool, "actor": actor, "params": params},
        )
        response.raise_for_status()
        return response.json()

    async def close(self) -> None:
        await self._client.aclose()


# Singleton — import and reuse across the app
tool_gateway = ToolGatewayClient()
