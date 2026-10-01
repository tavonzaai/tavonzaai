"""
Tests for backend readiness:
1. Tool executor guest table isolation.
2. Fail-closed behavior in production mode.
3. Backend 5xx error handling.
4. Audit sanitization key compatibility.
"""
import os
import sys
import pytest
from unittest.mock import AsyncMock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from src.audit.audit_writer import _sanitize_audit_after
from src.internal_client import BackendUnavailableError, InternalClient
from src.models import ActorContext
from src.tools.executor.executor import ToolExecutor


class TestBackendReadiness:
    def test_audit_inventory_supports_items_key(self):
        """Audit sanitizer must handle 'items' key from real backend / fixtures."""
        result = {"ok": True, "data": {"items": [{"name": "Steak"}, {"name": "Burger"}]}}
        sanitized = _sanitize_audit_after("get_inventory", result)
        assert sanitized == {"action": "query_inventory", "count": 2}

    def test_audit_inventory_supports_inventory_key(self):
        """Audit sanitizer remains backwards compatible with 'inventory' key."""
        result = {"ok": True, "data": {"inventory": [{"sku": "SKU1"}]}}
        sanitized = _sanitize_audit_after("get_inventory", result)
        assert sanitized == {"action": "query_inventory", "count": 1}

    @pytest.mark.asyncio
    async def test_table_guest_scope_isolation_in_executor(self):
        """Table guest cannot query another table's bill via prompt injection."""
        client = InternalClient()
        executor = ToolExecutor(client)

        actor = ActorContext(
            actor_type="USER",
            organization_id="org_1",
            branch_id="branch_1",
            permissions=["payments.read"],
            resource_scope={"table_code": "T1"},
        )

        with patch.object(client, "execute_tool", new_callable=AsyncMock) as mock_exec, \
             patch("src.tools.executor.executor.write_tool_audit", new_callable=AsyncMock):
            mock_exec.return_value = {"ok": True, "data": {"total": 10.0}}

            # Guest tries to query T5
            await executor.execute("get_table_bill", {"table_id": "T5"}, actor)

            # Executor must have overridden table_id to T1
            mock_exec.assert_called_once()
            called_args = mock_exec.call_args[0][1]
            assert called_args["table_id"] == "T1"

        await client.aclose()

    @pytest.mark.asyncio
    async def test_execute_tool_fails_closed_when_not_in_mock_mode(self):
        """When dev_mode_mock_backend=False, tool failure does NOT return mock fixtures."""
        with patch("src.internal_client.settings.dev_mode_mock_backend", False):
            client = InternalClient()
            actor = ActorContext(
                actor_type="USER",
                organization_id="org_1",
                branch_id="branch_1",
                permissions=["menu.read"],
            )

            # Simulate network or HTTP error calling real backend
            with patch.object(client._client, "post", side_effect=Exception("Connection refused")):
                res = await client.execute_tool("get_menu", {}, actor)
                assert res["ok"] is False
                assert "Tool execution failed" in res["error"]
                assert "items" not in res  # Must NOT return fake fixture data

            await client.aclose()

    @pytest.mark.asyncio
    async def test_resolve_actor_500_raises_backend_unavailable(self):
        """Backend 500 error raises BackendUnavailableError instead of returning None (which would be 401)."""
        import httpx
        with patch("src.internal_client.settings.dev_mode_mock_backend", False):
            client = InternalClient()
            mock_resp = httpx.Response(500, text="Internal Database Crash")

            with patch.object(client._client, "post", return_value=mock_resp):
                with pytest.raises(BackendUnavailableError):
                    await client.resolve_actor("some-user-token")

            await client.aclose()
