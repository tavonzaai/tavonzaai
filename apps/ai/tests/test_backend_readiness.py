"""
Tests for backend readiness:
1. Tool executor guest table isolation.
2. Fail-closed behavior in production mode.
3. Backend 5xx error handling.
4. Audit sanitization key compatibility.
"""
import os
import sys
from unittest.mock import AsyncMock, patch

import pytest

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

    @pytest.mark.asyncio
    async def test_unauthorized_tool_call_audits_deny(self):
        """Unauthorized tool call audits DENY before raising ToolExecutionError."""
        from src.tools.executor.executor import ToolExecutionError
        client = InternalClient()
        executor = ToolExecutor(client)

        actor = ActorContext(
            actor_type="USER",
            organization_id="org_1",
            branch_id="branch_1",
            permissions=["menu.read"],  # Missing reports.read
        )

        with patch("src.tools.executor.executor.write_tool_audit", new_callable=AsyncMock) as mock_audit:
            with pytest.raises(ToolExecutionError):
                await executor.execute("get_branch_summary", {}, actor)

            mock_audit.assert_called_once()
            _, kwargs = mock_audit.call_args
            assert kwargs["result"]["ok"] is False
            assert "lacks permission" in kwargs["result"]["error"]

        await client.aclose()

    def test_backend_restaurant_id_alias_compatibility(self):
        """ActorContext parses camelCase restaurantId returned by NestJS backend."""
        actor = ActorContext(
            actor_type="USER",
            organization_id="org-123",
            restaurantId="rest-456",
            branch_id="branch-789",
        )
        assert actor.restaurant_id == "rest-456"

    def test_backend_branch_manager_role_normalization(self):
        """Backend enum BRANCH_MANAGER maps to manager with full tool access."""
        from src.policies.roles import get_allowed_tools_for_role, normalize_role
        assert normalize_role("BRANCH_MANAGER") == "manager"
        allowed = get_allowed_tools_for_role("BRANCH_MANAGER")
        assert len(allowed) == 8
        assert "get_branch_summary" in allowed
        assert "get_inventory" in allowed

    def test_backend_kitchen_staff_role_normalization_and_orders_read_perm(self):
        """Backend enum KITCHEN_STAFF maps to kitchen and accepts orders.read capability."""
        from src.policies.roles import get_allowed_tools_for_role, normalize_role
        from src.tools.authorization.auth_gate import authorize_tool_call
        from src.tools.definitions.restaurant_tools import TOOLS

        assert normalize_role("KITCHEN_STAFF") == "kitchen"
        allowed = get_allowed_tools_for_role("KITCHEN_STAFF")
        assert "get_kitchen_queue" in allowed
        assert "get_order_status" in allowed

        actor = ActorContext(
            actor_type="USER",
            role="KITCHEN_STAFF",
            organization_id="org-1",
            branch_id="branch-1",
            permissions=["orders.read", "orders.update"],
        )
        # Authorize should succeed because kitchen staff has orders.read
        authorize_tool_call(TOOLS["get_kitchen_queue"], actor, "get_kitchen_queue")

    @pytest.mark.asyncio
    async def test_backend_actor_role_inference_when_backend_drops_role(self):
        """If backend resolveActor omits role, AI client infers it from permissions or JWT."""
        client = InternalClient()
        inferred_mgr = client._infer_role_from_payload_or_perms("", ["reports.read", "orders.read"], {})
        assert inferred_mgr == "manager"

        inferred_waiter = client._infer_role_from_payload_or_perms("", ["orders.serve", "tables.read"], {})
        assert inferred_waiter == "waiter"

        inferred_kitchen = client._infer_role_from_payload_or_perms("", ["orders.read", "orders.update"], {})
        assert inferred_kitchen == "kitchen"

        inferred_cashier = client._infer_role_from_payload_or_perms("", ["payments.create", "payments.read"], {})
        assert inferred_cashier == "cashier"
        await client.aclose()

