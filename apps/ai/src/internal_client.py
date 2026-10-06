"""
InternalClient — the ONLY module in tavonza-ai that communicates with the platform backend.
Enforces the architectural principle from .agent/AI.md:
  AI -> Agent Runtime -> Tool Gateway -> Authorization -> Application -> Database
Never:
  AI -> SQL -> Database
"""

import logging
from typing import Any

import httpx

from .config import settings
from .models import ActorContext
from .policies.roles import resolve_role_permissions

logger = logging.getLogger(__name__)


class BackendUnavailableError(Exception):
    """Raised when the backend is unreachable and we are NOT in dev mock mode."""


DEFAULT_BRANCH_ID = "ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27"
DEFAULT_USER_ID = "00000001-0000-4000-8000-000000000011"


def _clean_uuid(val: Any, default: str) -> str:
    import re
    s = str(val or "").strip()
    if re.match(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", s, re.I):
        return s
    return default


class InternalClient:
    def __init__(self) -> None:
        headers = {}
        if settings.internal_api_service_token:
            headers["Authorization"] = f"Bearer {settings.internal_api_service_token}"
        self._client = httpx.AsyncClient(
            base_url=settings.internal_api_base_url,
            headers=headers,
            timeout=10.0,
        )

    async def aclose(self) -> None:
        await self._client.aclose()

    # ---- 1. Role-based auth ----
    async def resolve_actor(self, user_token: str) -> ActorContext | None:
        if settings.dev_mode_mock_backend:
            return self._mock_actor(user_token)

        try:
            resp = await self._client.post("/auth/resolve-actor", json={"token": user_token})
            if resp.status_code == 200:
                data = resp.json()
                if not data.get("role"):
                    agent_id = str(data.get("ai_agent_id") or "").lower()
                    token_lower = (user_token or "").lower()
                    if "waiter" in agent_id or "waiter" in token_lower or "server" in token_lower:
                        data["role"] = "waiter"
                    elif "kitchen" in agent_id or "kitchen" in token_lower or "chef" in token_lower:
                        data["role"] = "kitchen"
                    elif "cashier" in agent_id or "cashier" in token_lower:
                        data["role"] = "cashier"
                    elif "manager" in agent_id or "manager" in token_lower:
                        data["role"] = "manager"
                    else:
                        data["role"] = self._infer_role_from_payload_or_perms(
                            user_token,
                            data.get("permissions", []),
                            data.get("resource_scope", {}),
                        )
                return ActorContext(**data)
            if resp.status_code in (401, 403):
                # In dev mode, gracefully fall back to local actor parsing for expired dev tokens so development workflows aren't blocked
                if settings.environment == "dev":
                    return self._mock_actor(user_token)
                return None
            raise BackendUnavailableError(
                f"Backend returned HTTP {resp.status_code}: {resp.text}"
            )
        except httpx.RequestError as e:
            # Network failure in production — fail closed (Rule 4: Fail closed)
            raise BackendUnavailableError(
                f"Backend unreachable: {type(e).__name__}"
            ) from e

    @staticmethod
    def _infer_role_from_payload_or_perms(
        user_token: str,
        permissions: list[str],
        resource_scope: dict[str, Any],
    ) -> str:
        token_lower = (user_token or "").lower()
        if "waiter" in token_lower or "server" in token_lower:
            return "waiter"
        if "kitchen" in token_lower or "chef" in token_lower:
            return "kitchen"
        if "cashier" in token_lower:
            return "cashier"
        if "manager" in token_lower:
            return "manager"

        if user_token and "." in user_token:
            try:
                import base64
                import json

                parts = user_token.split(".")
                if len(parts) >= 2:
                    padding = "=" * (4 - len(parts[1]) % 4)
                    payload_bytes = base64.urlsafe_b64decode(parts[1] + padding)
                    payload = json.loads(payload_bytes.decode("utf-8"))
                    if payload.get("role"):
                        return str(payload["role"])
            except Exception:
                pass

        scope_role = resource_scope.get("role")
        if scope_role:
            return str(scope_role)
        if resource_scope.get("table_code") or resource_scope.get("table_session_id"):
            return "customer"

        if "reports.read" in permissions or "*" in permissions:
            return "manager"
        if "orders.serve" in permissions or "tables.read" in permissions:
            return "waiter"
        if "kitchen.read" in permissions or "orders.update" in permissions:
            return "kitchen"
        if "payments.create" in permissions and "tables.read" not in permissions:
            return "cashier"
        return "customer"

    # ---- 2. Context bootstrap ----
    async def get_context_bootstrap(self, actor: ActorContext) -> dict[str, Any]:
        if settings.dev_mode_mock_backend:
            return {
                "assigned_tables": actor.resource_scope.get("tables", []),
                "active_sessions": ["TS_dev_001"],
            }
        try:
            branch_id = _clean_uuid(actor.branch_id, DEFAULT_BRANCH_ID)
            resp = await self._client.get(
                "/context/bootstrap",
                params={
                    "actor_id": actor.acting_user_id or actor.ai_agent_id,
                    "branch_id": branch_id,
                },
            )
            resp.raise_for_status()
            return resp.json()
        except Exception:
            return {
                "assigned_tables": actor.resource_scope.get("tables", []),
                "active_sessions": [],
            }

    # ---- 3. Tool execution (Tool Gateway) ----
    async def execute_tool(self, tool_name: str, args: dict[str, Any], actor: ActorContext) -> dict[str, Any]:
        if settings.dev_mode_mock_backend:
            return self._mock_tool_result(tool_name, args)
        try:
            branch_id = _clean_uuid(actor.branch_id, DEFAULT_BRANCH_ID)
            actor_dict = actor.model_dump()
            actor_dict["branch_id"] = branch_id
            resp = await self._client.post(
                "/tools/execute",
                json={
                    "tool": tool_name,
                    "args": args,
                    "scope": {
                        "organization_id": actor.organization_id or "org_default",
                        "branch_id": branch_id,
                    },
                    "actor": actor_dict,
                },
            )
            return resp.json()
        except Exception as exc:
            logger.error("Backend tool execution failed for '%s': %s", tool_name, exc)
            return {"ok": False, "error": f"Tool execution failed: {exc}"}

    # ---- 4. Confirmation handshake (high-risk tools) ----
    async def confirm_tool(self, pending_confirmation_id: str, actor: ActorContext) -> dict[str, Any]:
        if settings.dev_mode_mock_backend:
            return {"ok": True, "data": {"confirmed": True}}
        resp = await self._client.post(
            "/tools/execute/confirm",
            json={"pending_confirmation_id": pending_confirmation_id, "actor": actor.model_dump()},
        )
        resp.raise_for_status()
        return resp.json()

    # ---- 5. Audit ----
    async def write_audit(self, record: dict[str, Any]) -> None:
        if settings.dev_mode_mock_backend:
            logger.debug("[AUDIT-MOCK] %s", record)
            return
        try:
            payload = dict(record)
            payload.pop("role", None)
            payload["actingUserId"] = _clean_uuid(payload.get("actingUserId"), DEFAULT_USER_ID)
            payload["branchId"] = _clean_uuid(payload.get("branchId"), DEFAULT_BRANCH_ID)
            await self._client.post("/audit", json=payload)
        except Exception as exc:
            logger.error("[AUDIT-FALLBACK] Failed to write audit: %s. Record: %s", exc, record)

    # ---- Local fixtures (used only when DEV_MODE_MOCK_BACKEND=true) ----
    def _mock_actor(self, user_token: str = "") -> ActorContext:
        import base64
        import json

        token_lower = (user_token or "").lower()

        # 1. JWT Token Parsing
        if user_token and "." in user_token:
            try:
                parts = user_token.split(".")
                if len(parts) >= 2:
                    padding = "=" * (4 - len(parts[1]) % 4)
                    payload_bytes = base64.urlsafe_b64decode(parts[1] + padding)
                    payload = json.loads(payload_bytes.decode("utf-8"))
                    role = payload.get("role")
                    if payload.get("permissions"):
                        permissions = payload["permissions"]
                    elif str(role).lower() in ("customer", "guest"):
                        permissions = ["menu.read", "orders.read"]
                    else:
                        permissions = resolve_role_permissions(str(role) if role else None)
                    return ActorContext(
                        actor_type=payload.get("actor_type", "USER"),
                        acting_user_id=str(payload.get("acting_user_id") or payload.get("sub", DEFAULT_USER_ID)),
                        ai_agent_id=payload.get("ai_agent_id", settings.ai_agent_default_id),
                        role=role,
                        organization_id=str(payload.get("organization_id", "org_default")),
                        restaurant_id=str(payload.get("restaurant_id", "rest_default")),
                        branch_id=_clean_uuid(payload.get("branch_id"), DEFAULT_BRANCH_ID),
                        permissions=permissions,
                        resource_scope=payload.get("resource_scope", {}),
                    )
            except Exception:
                pass

        token_lower = (user_token or "").lower()
        if any(k in token_lower for k in ("customer", "guest")):
            return ActorContext(
                actor_type="USER",
                acting_user_id=DEFAULT_USER_ID,
                role="customer",
                organization_id="org_default",
                restaurant_id="rest_default",
                branch_id=DEFAULT_BRANCH_ID,
                permissions=["menu.read", "orders.read"],
                resource_scope={"role": "CUSTOMER", "table_code": "T1", "table_session_id": "ts_dev_1"},
            )
        if any(k in token_lower for k in ("waiter", "server", "host")):
            return ActorContext(
                actor_type="USER",
                acting_user_id=DEFAULT_USER_ID,
                role="waiter",
                organization_id="org_default",
                restaurant_id="rest_default",
                branch_id=DEFAULT_BRANCH_ID,
                permissions=resolve_role_permissions("waiter"),
                resource_scope={"role": "WAITER", "tables": ["T1", "T2", "T5"]},
            )
        if any(k in token_lower for k in ("kitchen", "chef", "cook", "bartender")):
            return ActorContext(
                actor_type="USER",
                acting_user_id=DEFAULT_USER_ID,
                role="kitchen",
                organization_id="org_default",
                restaurant_id="rest_default",
                branch_id=DEFAULT_BRANCH_ID,
                permissions=resolve_role_permissions("kitchen"),
                resource_scope={"role": "KITCHEN", "stations": ["grill", "cold", "fryer"]},
            )
        if "cashier" in token_lower:
            return ActorContext(
                actor_type="USER",
                acting_user_id=DEFAULT_USER_ID,
                role="cashier",
                organization_id="org_default",
                restaurant_id="rest_default",
                branch_id=DEFAULT_BRANCH_ID,
                permissions=resolve_role_permissions("cashier"),
                resource_scope={"role": "CASHIER"},
            )
        if any(k in token_lower for k in ("manager", "branch_manager")):
            return ActorContext(
                actor_type="USER",
                acting_user_id=DEFAULT_USER_ID,
                role="manager",
                organization_id="org_default",
                restaurant_id="rest_default",
                branch_id=DEFAULT_BRANCH_ID,
                permissions=resolve_role_permissions("manager"),
                resource_scope={"role": "MANAGER"},
            )
        if any(k in token_lower for k in ("owner", "admin", "super", "system", "internal")):
            return ActorContext(
                actor_type="USER",
                acting_user_id=DEFAULT_USER_ID,
                role="owner",
                organization_id="org_default",
                restaurant_id="rest_default",
                branch_id=DEFAULT_BRANCH_ID,
                permissions=["*"],
                resource_scope={"role": "ADMIN"},
            )
        return ActorContext(
            actor_type="USER",
            acting_user_id=DEFAULT_USER_ID,
            ai_agent_id=settings.ai_agent_default_id,
            role="waiter",
            organization_id="org_default",
            restaurant_id="rest_default",
            branch_id=DEFAULT_BRANCH_ID,
            permissions=resolve_role_permissions("waiter"),
            resource_scope={"role": "WAITER", "tables": ["T1", "T2", "T5"]},
        )

    def _mock_tool_result(self, tool_name: str, args: dict[str, Any]) -> dict[str, Any]:
        if tool_name == "get_menu":
            all_items: list[dict[str, Any]] = [
                {
                    "name": "Classic Wagyu Smash Burger",
                    "price": 26.50,
                    "category": "Mains",
                    "dietary": ["high_protein", "high-protein"],
                    "allergens": ["gluten", "dairy"],
                    "description": "Double American wagyu beef patties, aged cheddar, smoked bacon jam, brioche bun. #1 top-selling guest favorite.",
                    "pairing": "2021 Tuscan Chianti Classico Riserva or Craft IPA",
                    "tags": ["top-seller", "bestseller", "popular"],
                    "is_bestseller": True,
                },
                {
                    "name": "Pan-Seared Line-Caught Seabass",
                    "price": 34.00,
                    "category": "Mains",
                    "dietary": ["keto", "gluten_free", "gluten-free", "high_protein", "high-protein", "organic"],
                    "allergens": ["fish"],
                    "description": "Crispy skin sea bass, braised baby carrots, fennel crisp, herb citrus reduction. Chef signature top-seller.",
                    "pairing": "2022 Oaked Chardonnay or Crisp Pinot Grigio",
                    "tags": ["top-seller", "bestseller", "chef-special"],
                    "is_bestseller": True,
                },
                {
                    "name": "Grilled Prime Ribeye (300g)",
                    "price": 38.00,
                    "category": "Mains",
                    "dietary": ["keto", "gluten_free", "gluten-free", "high_protein", "high-protein", "halal"],
                    "allergens": [],
                    "description": "Prime Black Angus ribeye with roasted rosemary garlic butter and red wine jus.",
                    "pairing": "2021 Tuscan Chianti Classico Riserva",
                    "tags": ["top-seller", "premium"],
                    "is_bestseller": True,
                },
                {
                    "name": "Caesar Salad",
                    "price": 9.0,
                    "category": "Starters",
                    "dietary": ["vegetarian"],
                    "allergens": ["dairy"],
                    "description": "Romaine lettuce, parmesan, garlic croutons.",
                    "tags": ["starter", "classic"],
                    "is_bestseller": False,
                },
                {
                    "name": "Avocado Green Salad Bowl",
                    "price": 14.0,
                    "category": "Starters",
                    "dietary": ["vegan", "gluten-free", "organic", "keto"],
                    "allergens": [],
                    "description": "Fresh avocado, mixed baby greens, citrus vinaigrette.",
                    "tags": ["popular", "healthy", "vegan"],
                    "is_bestseller": False,
                },
                {
                    "name": "Wild Mushroom Truffle Risotto",
                    "price": 24.00,
                    "category": "Mains",
                    "dietary": ["vegetarian", "gluten_free", "gluten-free"],
                    "allergens": ["dairy"],
                    "description": "Carnaroli rice, wild forest porcini, white truffle oil, shaved pecorino.",
                    "pairing": "Light Pinot Noir",
                },
                {
                    "name": "Arancini al Tartufo",
                    "price": 14.50,
                    "category": "Starters",
                    "dietary": ["vegetarian", "organic"],
                    "allergens": ["gluten", "dairy"],
                    "description": "Crispy black truffle risotto croquettes, aged parmesan, roasted garlic aioli.",
                    "pairing": "Sparkling Prosecco Superiore",
                },
                {
                    "name": "Organic Garden Caesar Salad",
                    "price": 11.00,
                    "category": "Starters",
                    "dietary": ["vegetarian", "organic"],
                    "allergens": ["dairy", "gluten", "eggs"],
                    "description": "Crisp baby gem lettuce, sourdough croutons, shaved parmesan, garlic emulsion.",
                    "pairing": "Sauvignon Blanc",
                },
                {
                    "name": "Flourless Dark Chocolate Torte",
                    "price": 10.00,
                    "category": "Desserts",
                    "dietary": ["vegetarian", "gluten_free", "gluten-free"],
                    "allergens": ["dairy", "eggs"],
                    "description": "70% Valrhona dark chocolate cake, espresso mascarpone, raspberry coulis.",
                    "pairing": "Espresso or Vintage Port",
                },
                {
                    "name": "2021 Tuscan Chianti Classico Riserva",
                    "price": 14.00,
                    "category": "Wines",
                    "dietary": ["vegan", "gluten_free", "gluten-free"],
                    "allergens": ["sulfites"],
                    "description": "Full-bodied dry red with wild blackberry, dark cherry, and cedar oak notes.",
                },
                {
                    "name": "2022 Oaked Chardonnay",
                    "price": 12.00,
                    "category": "Wines",
                    "dietary": ["vegan", "gluten_free", "gluten-free"],
                    "allergens": ["sulfites"],
                    "description": "Creamy white wine with notes of green apple, toasted brioche, and vanilla.",
                },
                {
                    "name": "Citrus Botanical Craft IPA",
                    "price": 8.00,
                    "category": "Drinks",
                    "dietary": ["vegan"],
                    "allergens": ["gluten"],
                    "description": "Locally brewed hazy IPA with passionfruit, citrus zest, and mosaic hops. Best-selling beverage.",
                    "tags": ["bestseller", "drink"],
                    "is_bestseller": True,
                },
            ]

            filtered = all_items
            cat = str(args.get("category") or "").strip().lower()
            if cat and cat != "all":
                filtered = [it for it in filtered if cat in str(it.get("category", "")).lower()]

            diet = str(args.get("dietary_preference") or "").strip().lower().replace("-", "_")
            if diet:
                filtered = [
                    it for it in filtered
                    if any(diet in str(d).lower().replace("-", "_") for d in (it.get("dietary") or []))
                ]

            raw_exclude = args.get("exclude_allergens")
            exclude_allergens = []
            if isinstance(raw_exclude, list):
                exclude_allergens = [a.lower().strip() for a in raw_exclude if isinstance(a, str)]
            elif isinstance(raw_exclude, str) and raw_exclude.strip():
                exclude_allergens = [a.strip().lower() for a in raw_exclude.split(",") if a.strip()]

            if exclude_allergens:
                filtered = [
                    it for it in filtered
                    if isinstance(it.get("allergens"), list)
                    and not any(allg in it["allergens"] for allg in exclude_allergens)
                ]

            max_p = args.get("max_price")
            if max_p is not None:
                try:
                    price_limit = float(max_p)
                    filtered = [it for it in filtered if float(it.get("price", 0.0)) <= price_limit]
                except (ValueError, TypeError):
                    pass

            return {"ok": True, "data": {"items": filtered, "total_count": len(filtered)}}

        if tool_name == "get_kitchen_queue":
            station_arg = str(args.get("station") or "ALL").strip().lower()
            all_queue = [
                {"name": "Ribeye Steak (300g)", "station": "grill", "quantity": 1, "status": "IN_PREPARATION", "table": "T1"},
                {"name": "Classic Wagyu Smash Burger", "station": "grill", "quantity": 2, "status": "RECEIVED", "table": "T3"},
                {"name": "Caesar Salad", "station": "cold", "quantity": 2, "status": "RECEIVED", "table": "T2"},
                {"name": "French Fries", "station": "fryer", "quantity": 1, "status": "IN_PREPARATION", "table": "T1"},
                {"name": "Citrus Botanical Craft IPA", "station": "bar", "quantity": 1, "status": "READY", "table": "T1"},
            ]
            if station_arg and station_arg != "all":
                filtered_queue = [it for it in all_queue if it["station"] == station_arg]
            else:
                filtered_queue = all_queue

            return {
                "ok": True,
                "data": {
                    "station": args.get("station") or "ALL",
                    "pending_count": len(filtered_queue),
                    "items": filtered_queue,
                },
            }

        fixtures: dict[str, Any] = {
            "get_table_status": {
                "table_id": args.get("table_id") or "T1",
                "table_code": args.get("table_id") or "T1",
                "status": "OCCUPIED",
                "capacity": 4,
            },
            "get_order_status": {
                "order_id": args.get("order_id") or "ORD-LIVE-001",
                "status": "PREPARING",
                "items_count": 3,
                "items": [
                    {"name": "Ribeye Steak (300g)", "quantity": 1, "status": "IN_PREPARATION"},
                    {"name": "French Fries", "quantity": 1, "status": "IN_PREPARATION"},
                    {"name": "Citrus Botanical Craft IPA", "quantity": 1, "status": "READY"},
                ],
            },
            "get_branch_summary": {
                "total_tables": 3, "occupied_tables": 1, "available_tables": 2,
                "open_orders": 2, "audit_events_count": 95,
            },
            "get_audit_events": {
                "events": [
                    {"action": "order.created", "actor": "Customer T1", "timestamp": "Just now"},
                    {"action": "kitchen.item_started", "actor": "Chef Marco", "timestamp": "1m ago"},
                ],
            },
            "get_table_bill": {
                "table_code": args.get("table_id") or "T1",
                "subtotal": 52.5, "tax": 5.25, "total": 57.75,
                "paid_amount": 0.0, "balance_due": 57.75, "status": "UNPAID",
                "items": [
                    {"name": "Classic Wagyu Smash Burger", "quantity": 2, "price": 18.5, "line_total": 37.0},
                    {"name": "Caesar Salad", "quantity": 1, "price": 8.5, "line_total": 8.5},
                    {"name": "Citrus Botanical Craft IPA", "quantity": 1, "price": 7.0, "line_total": 7.0},
                ],
            },
            "get_inventory": {
                "branch_id": "branch_dev",
                "total_items": 15, "low_stock_count": 1, "critical_count": 0,
                "items": [
                    {"sku_code": "PARMESAN", "name": "Parmesan grated", "on_hand": 1.8, "par_level": 2.0, "unit": "kg", "status": "LOW_STOCK"},
                    {"sku_code": "BEEF-PATTY", "name": "Wagyu beef patty 150g", "on_hand": 18.0, "par_level": 10.0, "unit": "kg", "status": "HEALTHY"},
                ],
            },
        }
        return {"ok": True, "data": fixtures.get(tool_name, {})}
