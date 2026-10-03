"""
Tavonza AI - Full Test Suite
All tests use DEV_MODE_MOCK_BACKEND=true - no real network calls.
"""
import json, os, sys
import pytest
from httpx import ASGITransport, AsyncClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
os.environ["DEV_MODE_MOCK_BACKEND"] = "true"
os.environ.setdefault("GROQ_API_KEY", "gsk_test_placeholder")
os.environ.setdefault("ENVIRONMENT", "dev")

# --- 1. CONFIG ---
class TestConfig:
    def test_dev_mock_is_true(self):
        from src.config import settings
        assert settings.dev_mode_mock_backend is True
    def test_service_name(self):
        from src.config import settings
        assert settings.ai_service_name == "tavonza-ai"
    def test_default_port(self):
        from src.config import settings
        assert settings.ai_service_port == 8000

# --- 2. MODELS ---
class TestModels:
    def test_actor_context_valid(self):
        from src.models import ActorContext
        a = ActorContext(actor_type="USER", acting_user_id="u1", organization_id="org1", branch_id="b1", permissions=["menu.read"])
        assert a.actor_type == "USER"
    def test_actor_type_literal_enforced(self):
        from pydantic import ValidationError
        from src.models import ActorContext
        with pytest.raises(ValidationError):
            ActorContext(actor_type="HACKER", organization_id="org1", branch_id="b1")
    def test_chat_request_max_message_length(self):
        from pydantic import ValidationError
        from src.models import ChatRequest
        with pytest.raises(ValidationError):
            ChatRequest(session_id="s1", message="x" * 2001)
    def test_chat_request_session_id_max_length(self):
        from pydantic import ValidationError
        from src.models import ChatRequest
        with pytest.raises(ValidationError):
            ChatRequest(session_id="x" * 129, message="hi")
    def test_voice_request_max_length(self):
        from pydantic import ValidationError
        from src.models import SynthesizeVoiceRequest
        with pytest.raises(ValidationError):
            SynthesizeVoiceRequest(text="x" * 1001)
    def test_chat_request_valid(self):
        from src.models import ChatRequest
        r = ChatRequest(session_id="abc", message="Hello")
        assert r.message == "Hello"

# --- 3. AUTH GATE ---
def _actor(perms):
    from src.models import ActorContext
    return ActorContext(actor_type="USER", organization_id="org1", branch_id="b1", permissions=perms)

class TestAuthGate:
    def test_authorized_passes(self):
        from src.tools.authorization.auth_gate import authorize_tool_call
        authorize_tool_call({"required_permission": "menu.read"}, _actor(["menu.read"]), "get_menu")
    def test_unauthorized_raises(self):
        from src.tools.authorization.auth_gate import ToolAuthorizationError, authorize_tool_call
        with pytest.raises(ToolAuthorizationError):
            authorize_tool_call({"required_permission": "menu.read"}, _actor(["tables.read"]), "get_menu")
    def test_wildcard_passes_all(self):
        from src.tools.authorization.auth_gate import authorize_tool_call
        authorize_tool_call({"required_permission": "reports.read"}, _actor(["*"]), "get_branch_summary")
    def test_no_required_permission_passes(self):
        from src.tools.authorization.auth_gate import authorize_tool_call
        authorize_tool_call({}, _actor([]), "health")
    def test_guest_blocked_from_manager_tool(self):
        from src.tools.authorization.auth_gate import ToolAuthorizationError, authorize_tool_call
        with pytest.raises(ToolAuthorizationError):
            authorize_tool_call({"required_permission": "reports.read"}, _actor(["menu.read"]), "get_branch_summary")
    def test_guest_blocked_from_inventory(self):
        from src.tools.authorization.auth_gate import ToolAuthorizationError, authorize_tool_call
        with pytest.raises(ToolAuthorizationError):
            authorize_tool_call({"required_permission": "inventory.read"}, _actor(["menu.read"]), "get_inventory")

# --- 4. TOOL REGISTRY ---
class TestToolRegistry:
    def test_all_8_tools_defined(self):
        from src.tools.definitions.restaurant_tools import TOOLS
        expected = {"get_menu","get_table_status","get_order_status","get_kitchen_queue","get_branch_summary","get_audit_events","get_table_bill","get_inventory"}
        assert set(TOOLS.keys()) == expected
    def test_all_tools_have_permission(self):
        from src.tools.definitions.restaurant_tools import TOOLS
        for n, t in TOOLS.items():
            assert "required_permission" in t, f"{n} missing required_permission"
    def test_all_tools_read_only(self):
        from src.tools.definitions.restaurant_tools import TOOLS
        for n, t in TOOLS.items():
            assert t["risk_tier"] == "read_only", f"{n} not read_only"
    def test_actor_with_menu_read_gets_menu_tool_only(self):
        from src.tools.registry.registry import tools_for_actor
        a = _actor(["menu.read"])
        names = [t["function"]["name"] for t in tools_for_actor(a)]
        assert "get_menu" in names
        assert "get_branch_summary" not in names
    def test_wildcard_actor_gets_all_8(self):
        from src.tools.registry.registry import tools_for_actor
        assert len(tools_for_actor(_actor(["*"]))) == 8
    def test_get_tool_known(self):
        from src.tools.registry.registry import get_tool
        assert get_tool("get_menu") is not None
    def test_get_tool_unknown_returns_none(self):
        from src.tools.registry.registry import get_tool
        assert get_tool("drop_database") is None
    def test_get_menu_schema_has_optional_filters(self):
        from src.tools.registry.registry import get_tool
        t = get_tool("get_menu")
        params = t["schema"]["function"]["parameters"]
        assert params["required"] == []
        assert "category" in params["properties"]
        assert "dietary_preference" in params["properties"]
        assert "exclude_allergens" in params["properties"]
        assert "max_price" in params["properties"]
    def test_mock_get_menu_dietary_filtering(self):
        from src.internal_client import InternalClient
        c = InternalClient()
        res = c._mock_tool_result("get_menu", {"dietary_preference": "keto"})
        items = res["data"]["items"]
        assert len(items) > 0
        for item in items:
            assert "keto" in [d.lower() for d in item.get("dietary", [])]
    def test_mock_get_menu_exclude_allergens(self):
        from src.internal_client import InternalClient
        c = InternalClient()
        res = c._mock_tool_result("get_menu", {"exclude_allergens": "dairy,gluten"})
        items = res["data"]["items"]
        assert len(items) > 0
        for item in items:
            assert "dairy" not in item.get("allergens", [])
            assert "gluten" not in item.get("allergens", [])

# --- 5. CONVERSATION STORE ---
class TestConversationStore:
    def test_empty_session(self):
        from src.conversations.store import ConversationStore
        s = ConversationStore()
        assert s.get("x") == []
    def test_append_and_get(self):
        from src.conversations.store import ConversationStore
        s = ConversationStore()
        s.append("a", {"role": "user", "content": "hi"})
        assert s.get("a")[0]["content"] == "hi"
    def test_max_turns_bounded(self):
        from src.conversations.store import MAX_TURNS, ConversationStore
        s = ConversationStore()
        for i in range(MAX_TURNS + 5):
            s.append("b", {"role": "user", "content": str(i)})
        assert len(s.get("b")) == MAX_TURNS
    def test_sessions_isolated(self):
        from src.conversations.store import ConversationStore
        s = ConversationStore()
        s.append("t1", {"role": "user", "content": "A"})
        s.append("t2", {"role": "user", "content": "B"})
        assert s.get("t1")[0]["content"] == "A"
        assert s.get("t2")[0]["content"] == "B"
    @pytest.mark.asyncio
    async def test_async_append_and_get(self):
        from src.conversations.store import ConversationStore
        s = ConversationStore()
        await s.append_async("as1", {"role": "assistant", "content": "Hi"})
        r = await s.get_async("as1")
        assert r[0]["content"] == "Hi"

# --- 6. ACTION POLICY ---
class TestActionPolicy:
    def test_unknown_is_read_only(self):
        from src.policies.action_policy import ActionRiskTier, get_action_risk_tier
        assert get_action_risk_tier("get_menu") == ActionRiskTier.READ_ONLY
    def test_high_risk(self):
        from src.policies.action_policy import ActionRiskTier, get_action_risk_tier
        for a in ["refund_payment","apply_large_discount","modify_permissions","cancel_entire_order","delete_menu_item"]:
            assert get_action_risk_tier(a) == ActionRiskTier.HIGH_RISK_MUTATION
    def test_low_risk(self):
        from src.policies.action_policy import ActionRiskTier, get_action_risk_tier
        for a in ["accept_order","complete_order_item","serve_order"]:
            assert get_action_risk_tier(a) == ActionRiskTier.LOW_RISK_MUTATION
    def test_requires_confirmation_true(self):
        from src.policies.action_policy import requires_confirmation
        assert requires_confirmation("refund_payment") is True
    def test_requires_confirmation_false(self):
        from src.policies.action_policy import requires_confirmation
        assert requires_confirmation("get_menu") is False

# --- 7. VOICE HUMANIZER ---
class TestVoiceHumanizer:
    def h(self, t):
        from src.voice.service import humanize_text_for_speech
        return humanize_text_for_speech(t)
    def test_empty(self): assert self.h("") == ""
    def test_strips_headers(self):
        r = self.h("## Menu\nBurger")
        assert "##" not in r and "Burger" in r
    def test_dollar_conversion(self):
        assert "18 dollars and 50 cents" in self.h("$18.50")
    def test_table_code_conversion(self):
        r = self.h("T3 is ready")
        assert "Table 3" in r and "T3" not in r
    def test_strips_bold(self):
        r = self.h("**Wagyu Burger**")
        assert "**" not in r and "Wagyu Burger" in r
    def test_strips_emoji(self):
        assert "\U0001f354" not in self.h("Hello \U0001f354")
    def test_kg_conversion(self):
        assert "2.5 kilograms" in self.h("2.5kg remaining")
    def test_strips_code_blocks(self):
        assert "```" not in self.h("```json\n{}\n```")

# --- 8. AUDIT SANITIZER ---
class TestAuditSanitizer:
    def s(self, tool, result):
        from src.audit.audit_writer import _sanitize_audit_after
        return _sanitize_audit_after(tool, result)
    def test_empty_result_none(self): assert self.s("get_menu", {}) is None
    def test_menu_returns_count(self):
        out = self.s("get_menu", {"data": {"items": [1,2,3]}})
        assert out == {"action": "query_menu", "count": 3}
        assert "items" not in str(out)
    def test_audit_events_count(self):
        out = self.s("get_audit_events", {"data": {"events": [{"a":1},{"b":2}]}})
        assert out["count"] == 2
    def test_inventory_count(self):
        out = self.s("get_inventory", {"data": {"inventory": [{"sku":"X"}]}})
        assert out["count"] == 1
    def test_large_payload_truncated(self):
        out = self.s("get_table_bill", {"data": {"key": "x"*900}})
        assert "truncated" in str(out)

# --- 9. INTERNAL CLIENT MOCK ---
class TestInternalClientMock:
    @pytest.mark.asyncio
    async def test_resolve_actor_returns_actor_context(self):
        from src.internal_client import InternalClient
        from src.models import ActorContext
        c = InternalClient()
        a = await c.resolve_actor("test-token")
        assert isinstance(a, ActorContext)
        await c.aclose()
    @pytest.mark.asyncio
    async def test_resolve_guest_token_has_guest_permissions(self):
        from src.internal_client import InternalClient
        c = InternalClient()
        guest = await c.resolve_actor("dev-guest-token")
        assert guest.permissions == ["menu.read", "orders.read"]
        assert "inventory.read" not in guest.permissions
        assert "reports.read" not in guest.permissions
        await c.aclose()
    @pytest.mark.asyncio
    async def test_resolve_jwt_role_customer(self):
        import base64
        from src.internal_client import InternalClient
        c = InternalClient()
        token = f"hdr.{base64.urlsafe_b64encode(b'{\"role\":\"CUSTOMER\"}').decode()}.sig"
        customer = await c.resolve_actor(token)
        assert customer.permissions == ["menu.read", "orders.read"]
        await c.aclose()
    @pytest.mark.asyncio
    async def test_resolve_admin_token(self):
        from src.internal_client import InternalClient
        c = InternalClient()
        admin = await c.resolve_actor("dev-admin-token")
        assert admin.permissions == ["*"]
        await c.aclose()
    @pytest.mark.asyncio
    async def test_execute_tool_get_menu(self):
        from src.internal_client import InternalClient
        from src.models import ActorContext
        c = InternalClient()
        a = ActorContext(actor_type="USER", organization_id="org1", branch_id="b1")
        r = await c.execute_tool("get_menu", {}, a)
        assert r["ok"] is True and "items" in r["data"]
        await c.aclose()
    @pytest.mark.asyncio
    async def test_execute_tool_get_inventory(self):
        from src.internal_client import InternalClient
        from src.models import ActorContext
        c = InternalClient()
        a = ActorContext(actor_type="USER", organization_id="org1", branch_id="b1")
        r = await c.execute_tool("get_inventory", {}, a)
        assert r["ok"] is True and "items" in r["data"]
        await c.aclose()
    @pytest.mark.asyncio
    async def test_write_audit_no_raise(self):
        from src.internal_client import InternalClient
        c = InternalClient()
        await c.write_audit({"action": "test", "source": "tavonza-ai"})
        await c.aclose()

# --- 10. SCOPE RESOLVER ---
class TestScopeResolver:
    def test_table_scope(self):
        from src.context.scope_resolver import resolve_safe_scope
        from src.models import ActorContext
        a = ActorContext(actor_type="USER", organization_id="o", branch_id="b", resource_scope={"table_code": "T3"})
        assert resolve_safe_scope(a).get("table_code") == "T3"
    def test_empty_scope_is_dict(self):
        from src.context.scope_resolver import resolve_safe_scope
        from src.models import ActorContext
        a = ActorContext(actor_type="USER", organization_id="o", branch_id="b")
        assert isinstance(resolve_safe_scope(a), dict)

# --- 11. API ENDPOINTS ---
@pytest.mark.asyncio
class TestAPIEndpoints:
    async def _c(self):
        from src.main import app
        return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")
    async def test_health(self):
        async with await self._c() as c:
            r = await c.get("/health")
        assert r.status_code == 200 and r.json()["status"] == "ok"
    async def test_root(self):
        async with await self._c() as c:
            r = await c.get("/")
        assert r.status_code == 200
    async def test_chat_no_auth_401(self):
        async with await self._c() as c:
            r = await c.post("/ai/chat", json={"session_id":"s","message":"hi"})
        assert r.status_code == 401
    async def test_stream_no_auth_401(self):
        async with await self._c() as c:
            r = await c.post("/ai/chat/stream", json={"session_id":"s","message":"hi"})
        assert r.status_code == 401
    async def test_transcribe_no_auth_401(self):
        async with await self._c() as c:
            r = await c.post("/ai/voice/transcribe")
        assert r.status_code in (401, 422)  # 422 = missing file field (FastAPI validates before auth)
    async def test_synthesize_post_no_auth_401(self):
        async with await self._c() as c:
            r = await c.post("/ai/voice/synthesize", json={"text":"hi"})
        assert r.status_code == 401
    async def test_synthesize_get_no_auth_401(self):
        async with await self._c() as c:
            r = await c.get("/ai/voice/synthesize", params={"text":"hi"})
        assert r.status_code == 401
    async def test_chat_with_mock_token(self):
        import base64
        payload = base64.urlsafe_b64encode(b'{"sub":"dev","actor_type":"USER"}').decode()
        token = f"hdr.{payload}.sig"
        async with await self._c() as c:
            r = await c.post("/ai/chat", json={"session_id":"t1","message":"menu?"}, headers={"Authorization": f"Bearer {token}"})
        assert r.status_code != 401
    async def test_swagger_docs_in_dev(self):
        async with await self._c() as c:
            r = await c.get("/docs")
        assert r.status_code == 200
