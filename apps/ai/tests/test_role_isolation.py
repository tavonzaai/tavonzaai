"""
Role-Based Access Control & Tool Isolation Tests
Verifies that JARVIS strictly operates in a role-based capability model
and completely blocks unauthorized tools for each actor role:
- Customer (Table Guest)
- Waiter (Floor Staff)
- Kitchen Staff
- Cashier
- Manager
- Owner / Super Admin
"""

from unittest.mock import AsyncMock, patch
import pytest

from src.agents.jarvis_agent import JarvisAgent
from src.conversations.store import ConversationStore
from src.internal_client import InternalClient
from src.models import ActorContext
from src.policies.roles import (
    ALL_RESTRICTED_TOOLS,
    ROLE_ALLOWED_TOOLS,
    RoleLabel,
    get_allowed_tools_for_role,
    get_blocked_tools_for_role,
    is_tool_allowed_for_role,
    resolve_role_permissions,
)
from src.tools.authorization.auth_gate import (
    ToolAuthorizationError,
    authorize_tool_call,
)
from src.tools.definitions.restaurant_tools import TOOLS
from src.tools.executor.executor import ToolExecutionError, ToolExecutor
from src.tools.registry.registry import get_tool, tools_for_actor


def make_actor(role: str, extra_permissions: list[str] | None = None, table_code: str | None = None) -> ActorContext:
    scope = {}
    if table_code:
        scope["table_code"] = table_code
        scope["table_session_id"] = f"ts_{table_code}"
    return ActorContext(
        actor_type="USER",
        acting_user_id=f"user_{role}",
        role=role,
        organization_id="org_test",
        restaurant_id="rest_test",
        branch_id="branch_test",
        permissions=resolve_role_permissions(role, extra_permissions),
        resource_scope=scope,
    )


class TestRolePolicies:
    """Validates the role permission policy engine."""

    def test_all_canonical_roles_defined(self):
        roles = {r.value for r in RoleLabel}
        expected = {"customer", "waiter", "kitchen", "cashier", "manager", "owner", "super_admin"}
        assert roles == expected

    def test_customer_allowed_and_blocked_sets(self):
        allowed = get_allowed_tools_for_role(RoleLabel.CUSTOMER)
        assert allowed == {"get_menu", "get_order_status", "get_table_bill"}
        blocked = get_blocked_tools_for_role(RoleLabel.CUSTOMER)
        assert "get_kitchen_queue" in blocked
        assert "get_table_status" in blocked
        assert "get_inventory" in blocked
        assert "get_branch_summary" in blocked
        assert "get_audit_events" in blocked

    def test_waiter_allowed_and_blocked_sets(self):
        allowed = get_allowed_tools_for_role(RoleLabel.WAITER)
        assert allowed == {"get_menu", "get_table_status", "get_order_status"}
        blocked = get_blocked_tools_for_role(RoleLabel.WAITER)
        assert "get_kitchen_queue" in blocked
        assert "get_table_bill" in blocked
        assert "get_inventory" in blocked
        assert "get_branch_summary" in blocked

    def test_kitchen_allowed_and_blocked_sets(self):
        allowed = get_allowed_tools_for_role(RoleLabel.KITCHEN)
        assert allowed == {"get_order_status", "get_kitchen_queue"}
        blocked = get_blocked_tools_for_role(RoleLabel.KITCHEN)
        assert "get_menu" in blocked
        assert "get_table_status" in blocked
        assert "get_table_bill" in blocked
        assert "get_inventory" in blocked

    def test_cashier_allowed_and_blocked_sets(self):
        allowed = get_allowed_tools_for_role(RoleLabel.CASHIER)
        assert allowed == {"get_order_status", "get_table_bill"}
        blocked = get_blocked_tools_for_role(RoleLabel.CASHIER)
        assert "get_menu" in blocked
        assert "get_table_status" in blocked
        assert "get_kitchen_queue" in blocked
        assert "get_inventory" in blocked

    def test_manager_allowed_all_tools(self):
        allowed = get_allowed_tools_for_role(RoleLabel.MANAGER)
        assert allowed == ALL_RESTRICTED_TOOLS
        assert len(get_blocked_tools_for_role(RoleLabel.MANAGER)) == 0

    def test_unknown_role_fails_closed(self):
        blocked = get_blocked_tools_for_role("unknown_intruder")
        assert blocked == ALL_RESTRICTED_TOOLS
        assert not is_tool_allowed_for_role("get_menu", "unknown_intruder")


class TestDynamicToolPruning:
    """Verifies Level 1 security: AI agent is only passed tools approved for its actor role."""

    def test_customer_receives_only_customer_tools(self):
        actor = make_actor("customer", table_code="T1")
        schemas = tools_for_actor(actor)
        exposed_tools = {s["function"]["name"] for s in schemas}
        assert exposed_tools == {"get_menu", "get_order_status"}
        # Must NOT expose kitchen queue, table status, inventory, etc.
        assert "get_kitchen_queue" not in exposed_tools
        assert "get_table_status" not in exposed_tools
        assert "get_inventory" not in exposed_tools
        assert "get_branch_summary" not in exposed_tools

    def test_customer_with_payments_read_also_receives_bill_tool(self):
        actor = make_actor("customer", extra_permissions=["payments.read"], table_code="T1")
        schemas = tools_for_actor(actor)
        exposed_tools = {s["function"]["name"] for s in schemas}
        assert exposed_tools == {"get_menu", "get_order_status", "get_table_bill"}
        assert "get_kitchen_queue" not in exposed_tools
        assert "get_table_status" not in exposed_tools

    def test_waiter_receives_only_waiter_tools(self):
        actor = make_actor("waiter")
        schemas = tools_for_actor(actor)
        exposed_tools = {s["function"]["name"] for s in schemas}
        assert exposed_tools == {"get_menu", "get_table_status", "get_order_status"}
        assert "get_kitchen_queue" not in exposed_tools
        assert "get_inventory" not in exposed_tools

    def test_kitchen_receives_only_kitchen_tools(self):
        actor = make_actor("kitchen")
        schemas = tools_for_actor(actor)
        exposed_tools = {s["function"]["name"] for s in schemas}
        assert exposed_tools == {"get_order_status", "get_kitchen_queue"}
        assert "get_menu" not in exposed_tools
        assert "get_table_status" not in exposed_tools

    def test_cashier_receives_only_cashier_tools(self):
        actor = make_actor("cashier")
        schemas = tools_for_actor(actor)
        exposed_tools = {s["function"]["name"] for s in schemas}
        assert exposed_tools == {"get_order_status", "get_table_bill"}
        assert "get_menu" not in exposed_tools
        assert "get_kitchen_queue" not in exposed_tools

    def test_manager_receives_all_8_tools(self):
        actor = make_actor("manager")
        schemas = tools_for_actor(actor)
        exposed_tools = {s["function"]["name"] for s in schemas}
        assert exposed_tools == ALL_RESTRICTED_TOOLS

    def test_owner_receives_all_8_tools(self):
        actor = make_actor("owner")
        schemas = tools_for_actor(actor)
        exposed_tools = {s["function"]["name"] for s in schemas}
        assert exposed_tools == ALL_RESTRICTED_TOOLS


class TestToolAuthorizationGate:
    """Verifies Level 2 security: authorization gate blocks unapproved tools."""

    def test_customer_blocked_from_kitchen_queue(self):
        actor = make_actor("customer", table_code="T1")
        tool = get_tool("get_kitchen_queue")
        assert tool is not None
        with pytest.raises(ToolAuthorizationError) as exc_info:
            authorize_tool_call(tool, actor, "get_kitchen_queue")
        assert "kitchen" in str(exc_info.value).lower()

    def test_customer_blocked_from_inventory(self):
        actor = make_actor("customer", table_code="T1")
        tool = get_tool("get_inventory")
        assert tool is not None
        with pytest.raises(ToolAuthorizationError):
            authorize_tool_call(tool, actor, "get_inventory")

    def test_customer_blocked_from_table_status(self):
        actor = make_actor("customer", table_code="T1")
        tool = get_tool("get_table_status")
        assert tool is not None
        with pytest.raises(ToolAuthorizationError):
            authorize_tool_call(tool, actor, "get_table_status")

    def test_waiter_blocked_from_kitchen_queue(self):
        actor = make_actor("waiter")
        tool = get_tool("get_kitchen_queue")
        assert tool is not None
        with pytest.raises(ToolAuthorizationError):
            authorize_tool_call(tool, actor, "get_kitchen_queue")

    def test_kitchen_blocked_from_table_status(self):
        actor = make_actor("kitchen")
        tool = get_tool("get_table_status")
        assert tool is not None
        with pytest.raises(ToolAuthorizationError):
            authorize_tool_call(tool, actor, "get_table_status")

    def test_kitchen_allowed_kitchen_queue(self):
        actor = make_actor("kitchen")
        tool = get_tool("get_kitchen_queue")
        assert tool is not None
        # Should not raise
        authorize_tool_call(tool, actor, "get_kitchen_queue")

    def test_cashier_allowed_table_bill(self):
        actor = make_actor("cashier")
        tool = get_tool("get_table_bill")
        assert tool is not None
        # Should not raise
        authorize_tool_call(tool, actor, "get_table_bill")


class TestToolExecutorRoleEnforcement:
    """Verifies ToolExecutor rejects blocked tools and audits DENY."""

    @pytest.mark.asyncio
    async def test_customer_calling_kitchen_queue_raises_and_audits_deny(self):
        client = InternalClient()
        executor = ToolExecutor(client)
        actor = make_actor("customer", table_code="T2")

        with patch("src.tools.executor.executor.write_tool_audit", new_callable=AsyncMock) as mock_audit:
            with pytest.raises(ToolExecutionError) as exc_info:
                await executor.execute("get_kitchen_queue", {"station": "grill"}, actor)

            assert "not authorized" in str(exc_info.value).lower() or "lacks permission" in str(exc_info.value).lower()
            mock_audit.assert_called_once()
            call_kwargs = mock_audit.call_args[1]
            assert call_kwargs["result"]["ok"] is False

        await client.aclose()

    @pytest.mark.asyncio
    async def test_waiter_calling_inventory_raises_and_audits_deny(self):
        client = InternalClient()
        executor = ToolExecutor(client)
        actor = make_actor("waiter")

        with patch("src.tools.executor.executor.write_tool_audit", new_callable=AsyncMock) as mock_audit:
            with pytest.raises(ToolExecutionError):
                await executor.execute("get_inventory", {"low_stock_only": True}, actor)

            mock_audit.assert_called_once()
            assert mock_audit.call_args[1]["result"]["ok"] is False

        await client.aclose()

    @pytest.mark.asyncio
    async def test_customer_table_scope_override_preserves_table_isolation(self):
        client = InternalClient()
        executor = ToolExecutor(client)
        # Customer granted bill permission, but at Table T1
        actor = make_actor("customer", extra_permissions=["payments.read"], table_code="T1")

        with patch.object(client, "execute_tool", new_callable=AsyncMock) as mock_exec, \
             patch("src.tools.executor.executor.write_tool_audit", new_callable=AsyncMock):
            mock_exec.return_value = {"ok": True, "data": {"balance_due": 35.0}}

            # Guest tries to query T8
            await executor.execute("get_table_bill", {"table_id": "T8"}, actor)

            mock_exec.assert_called_once()
            called_args = mock_exec.call_args[0][1]
            # Must be forced to scoped table T1
            assert called_args["table_id"] == "T1"

        await client.aclose()


class TestSystemPromptRoleContext:
    """Verifies system prompt incorporates role boundaries."""

    @pytest.mark.asyncio
    async def test_customer_prompt_contains_guest_instructions(self):
        from src.agents.jarvis_agent import _build_system_prompt
        actor = make_actor("customer", table_code="T4")
        tools = tools_for_actor(actor)
        prompt = _build_system_prompt(actor, "table active", tools)

        assert "Customer / Dining Guest (Table T4)" in prompt
        assert "STRICT ROLE ISOLATION" in prompt
        assert "get_kitchen_queue" in prompt
        assert "get_menu, get_order_status" in prompt

    @pytest.mark.asyncio
    async def test_waiter_prompt_contains_floor_instructions(self):
        from src.agents.jarvis_agent import _build_system_prompt
        actor = make_actor("waiter")
        tools = tools_for_actor(actor)
        prompt = _build_system_prompt(actor, "shift active", tools)

        assert "Waiter / Floor Staff" in prompt
        assert "get_menu, get_table_status, get_order_status" in prompt

    @pytest.mark.asyncio
    async def test_kitchen_prompt_contains_kitchen_instructions(self):
        from src.agents.jarvis_agent import _build_system_prompt
        actor = make_actor("kitchen")
        tools = tools_for_actor(actor)
        prompt = _build_system_prompt(actor, "rush hour", tools)

        assert "Kitchen Staff / Culinary Team" in prompt
        assert "get_order_status, get_kitchen_queue" in prompt


class TestMockActorRoleResolution:
    """Verifies InternalClient._mock_actor accurately resolves roles in dev mode."""

    def test_mock_actor_resolves_customer(self):
        client = InternalClient()
        actor = client._mock_actor("dev-customer-token")
        assert actor.role == "customer"
        assert "menu.read" in actor.permissions
        assert "kitchen.read" not in actor.permissions
        assert "inventory.read" not in actor.permissions
        assert actor.resource_scope.get("table_code") == "T1"

    def test_mock_actor_resolves_waiter(self):
        client = InternalClient()
        actor = client._mock_actor("dev-waiter-token")
        assert actor.role == "waiter"
        assert "tables.read" in actor.permissions
        assert "kitchen.read" not in actor.permissions

    def test_mock_actor_resolves_kitchen(self):
        client = InternalClient()
        actor = client._mock_actor("dev-kitchen-token")
        assert actor.role == "kitchen"
        assert "kitchen.read" in actor.permissions
        assert "menu.read" not in actor.permissions

    def test_mock_actor_resolves_cashier(self):
        client = InternalClient()
        actor = client._mock_actor("dev-cashier-token")
        assert actor.role == "cashier"
        assert "payments.read" in actor.permissions
        assert "kitchen.read" not in actor.permissions


class TestAgentEndToEndRoleBehavior:
    """Verifies JarvisAgent runtime respects roles and catches blocked tool attempts."""

    @pytest.mark.asyncio
    async def test_agent_handles_unauthorized_tool_attempt(self):
        client = InternalClient()
        store = ConversationStore()
        agent = JarvisAgent(internal_client=client, conversation_store=store)
        actor = make_actor("customer", table_code="T3")

        # Mock Groq provider attempting to call get_kitchen_queue
        mock_tool_call_response = {
            "content": "Checking kitchen queue...",
            "tool_calls": [
                {
                    "id": "call_fake_123",
                    "name": "get_kitchen_queue",
                    "arguments": {"station": "grill"},
                }
            ],
        }
        mock_final_response = {
            "content": "I apologize, but as a dining guest, you cannot view the kitchen queue. How can I help with your order?",
            "tool_calls": [],
        }

        with patch.object(agent._provider, "generate", side_effect=[mock_tool_call_response, mock_final_response]):
            reply = await agent.handle_message(actor, "session_test_role_01", "Can you show me the kitchen queue?")
            assert "kitchen queue" in reply.lower() or "apologize" in reply.lower()

        await client.aclose()
        await store.aclose()

